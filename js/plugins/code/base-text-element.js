class BaseTextElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.render();
        this.updatePlaceholder();
        this.isVirtualKeyboard = this.checkIfVirtualKeyboard();
        this.savedRange = null;
        this.savedSelection = null;
        this.placeholder = this.getAttribute("placeholder") || "Write something or press '/' for commands";
        this.toolbar = document.getElementById("formatting-toolbar");
        this.toolbar.addEventListener("toolbar-action", (e) => {
            if (e.detail.elementId === this.id) {
                console.log("Toolbar action received", e.detail);
                this.handleToolbarAction(e.detail);
            }
        });
        this.toolbar.addEventListener("save-selection", (e) => {
            if (e.detail.elementId === this.id) {
                this.saveSelection();
            }
        });
        this.toolbar.addEventListener("create-link", (e) => {
            if (e.detail.elementId === this.id) {
                this.handleCreateLink(e.detail.url);
            }
        });
        this.toolbar.addEventListener("create-reference", (e) => {
            if (e.detail.elementId === this.id) {
                this.handleCreateReference(e.detail);
            }
        });
        this.toolbar.addEventListener("ai-operation-complete", (e) => {
            if (e.detail.elementId === this.id) {
                this.handleAIOperationComplete(e.detail);
            }
        });
        this.references = [];
    }

    getSelectionPosition() {
        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return null;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        return {
            x: rect.left + (rect.width / 2),
            y: rect.top,
            width: rect.width,
            height: rect.height,
            selectedText: selection.toString()
        };
    }

    handleAIOperationComplete(detail) {
        if (!this.restoreSelection()) {
            console.warn('No saved selection for AI operation');
            return;
        }

        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        try {
            // Replace the selected content with the AI-improved text
            const textNode = document.createTextNode(detail.newText);
            range.deleteContents();
            range.insertNode(textNode);
            
            // Clean up selection
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Clear the saved selection
            this.clearSelection();
            
            // Update the content
            this.sendUpdates();
        } catch (error) {
            console.error('Error applying AI operation:', error);
            this.handleAIOperationFallback(detail.newText, selection);
        }
    }

    handleAIOperationFallback(newText, selection) {
        try {
            // Fallback method using execCommand
            document.execCommand('insertText', false, newText);
            this.sendUpdates();
        } catch (fallbackError) {
            console.error('AI operation fallback failed:', fallbackError);
        }
    }

// In BaseTextElement class
handleCreateReference(detail) {
    if (!this.restoreSelection()) {
        console.warn('No saved selection for citation');
        return;
    }

    const selection = this.shadowRoot.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    
    try {
        // Create a space node to separate text and citation
        const spaceNode = document.createTextNode(' ');
        
        // Create citation span
        //
        const citationsManager = document.querySelector('manage-citations');
        const citationSpan = document.createElement('span');
        citationSpan.contentEditable = 'false';
        citationSpan.className = 'reference-number';
        citationSpan.dataset.referenceId = detail.citation.id;
        citationSpan.textContent = detail.inlineCitation;
        citationSpan.onclick = () => {
            citationsManager.highlight(detail.citation.id);
        }
        
        // Instead of deleting content, just collapse range to end
        range.collapse(false);
        
        // Insert space and citation after the selected text
        range.insertNode(citationSpan);
        range.insertNode(spaceNode);
        
        // Move cursor after citation
        range.setStartAfter(citationSpan);
        range.setEndAfter(citationSpan);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update content
        this.sendUpdates();
    } catch (error) {
        console.error('Error creating citation:', error);
        this.handleReferenceFallback(detail, selection);
    }
}

handleInsertCitation(citation) {
    const citationsManager = document.querySelector('manage-citations');
    const inlineCitation = citationsManager.formatInlineCitation(citation);
    
    this.dispatchEvent(
        new CustomEvent("insert-citation", {
            detail: { 
                elementId: this.elementId, 
                citation: citation,
                selectedText: this.selectedText,
                inlineCitation: inlineCitation
            },
            bubbles: true,
            composed: true,
        })
    );
    this.closeDialog();
}


formatInlineCitation(citation) {
    if (!citation.authors || !citation.authors.length) {
        return '[Unknown]';
    }

    const year = citation.publish_date ? new Date(citation.publish_date).getFullYear() : 'n.d.';
    
    if (citation.authors.length === 1) {
        const lastName = citation.authors[0].split(' ').pop();
        return `[${lastName}, ${year}]`;
    } else if (citation.authors.length === 2) {
        const lastName1 = citation.authors[0].split(' ').pop();
        const lastName2 = citation.authors[1].split(' ').pop();
        return `[${lastName1} & ${lastName2}, ${year}]`;
    } else {
        const firstAuthorLastName = citation.authors[0].split(' ').pop();
        return `[${firstAuthorLastName} et al., ${year}]`;
    }
}


    handleReferenceFallback(detail, selection) {
        try {
            // Fallback method using execCommand
            const text = selection.toString();
            document.execCommand('insertText', false, text);
            
            const referenceData = {
                id: detail.citation.id,
                title: detail.title,
                authors: detail.authors,
                date: detail.date,
                publisher: detail.publisher,
                url: detail.url
            };
            
            const range = selection.getRangeAt(0);
            const refSpan = document.createElement('span');
            refSpan.contentEditable = 'false';
            refSpan.className = 'reference-number';
            refSpan.dataset.referenceId = detail.citation.id;
            refSpan.textContent = detail.inlineCitation;

            const citationsManager = document.querySelector('manage-citations');
            refSpan.onclick = () => {
                citationsManager.highlight(detail.citation.id);
            }
            
            range.insertNode(refSpan);

            this.references.push(referenceData);
            this.sendUpdates();
        } catch (fallbackError) {
            console.error('Reference fallback failed:', fallbackError);
        }
    }

    handleCreateLink(url) {
        // First restore the saved selection
        if (!this.restoreSelection()) {
            console.warn('No saved selection to create link from');
            return;
        }

        const selection = this.shadowRoot.getSelection();
        const range = selection.getRangeAt(0);

        // Ensure the selection is within our editable div
        if (!this.editable.contains(range.commonAncestorContainer)) {
            console.warn('Selection is outside the editable area');
            return;
        }

        try {
            // Create and insert the link
            const link = document.createElement('a');
            link.href = this.normalizeUrl(url);
            link.target = '_blank';
            link.contentEditable = 'false';

            // Extract the selected content and preserve formatting
            const fragment = range.extractContents();
            link.appendChild(fragment);
            
            // Insert the link
            range.insertNode(link);
            
            // Clean up selection
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Clear the saved selection
            this.clearSelection();
            
            // Update the content
            this.sendUpdates();
        } catch (error) {
            console.error('Error creating link:', error);
            this.handleLinkFallback(url, selection);
        }
    }

    handleLinkFallback(url, selection) {
        try {
            // Fallback method using execCommand
            const text = selection.toString();
            document.execCommand('insertText', false, text);
            
            const range = selection.getRangeAt(0);
            const link = document.createElement('a');
            link.href = this.normalizeUrl(url);
            link.target = '_blank';
            link.contentEditable = 'false';
            
            // Create a new range for the just-inserted text
            const newRange = document.createRange();
            newRange.setStart(range.startContainer, range.startOffset - text.length);
            newRange.setEnd(range.startContainer, range.startOffset);
            
            // Wrap the text in a link
            newRange.surroundContents(link);
            
            this.sendUpdates();
        } catch (fallbackError) {
            console.error('Link fallback failed:', fallbackError);
        }
    }

    connectedCallback() {
        this.editable = this.shadowRoot.querySelector("#editable");

        this.updatePlaceholder();
        this.bindEvents();
    }

    saveSelection() {
        const selection = this.shadowRoot.getSelection();
        if (selection.rangeCount > 0) {
            this.savedSelection = {
                range: selection.getRangeAt(0).cloneRange(),
                text: selection.toString()
            };
        }
    }

    restoreSelection() {
        if (this.savedSelection) {
            const selection = this.shadowRoot.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.savedSelection.range);
            return true;
        }
        return false;
    }

    clearSelection() {
        this.savedSelection = null;
    }

    normalizeUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
    }

    findParentLink(node) {
        while (node && node !== this.editable) {
            if (node.tagName === "A") {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    createLink(url) {

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }

        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        
        try {
            const fragment = range.extractContents();
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(fragment);
            const plainText = tempDiv.textContent;
            const textNode = document.createTextNode(plainText);
            const link = document.createElement("a");
            link.href = url;
            link.contentEditable = "false";
            link.target = "_blank";
            
            link.appendChild(textNode);
            range.insertNode(link);
            range.collapse(false);
            
        } catch (error) {
            console.error("Error creating link:", error);
            try {
                document.execCommand('insertText', false, selection.toString());
                const newRange = document.createRange();
                newRange.setStartBefore(range.startContainer);
                newRange.setEndAfter(range.startContainer);
                const link = document.createElement("a");
                link.href = url;
                link.contentEditable = "false";
                link.target = "_blank";
                newRange.surroundContents(link);
            } catch (fallbackError) {
                console.error("Fallback link creation failed:", fallbackError);
            }
        }

        this.sendUpdates();
    }


    applyFormat(format) {
        document.execCommand(format, false, null);
        this.sendUpdates();
    }

    bindEvents() {
        // Existing event listeners
        this.editable.addEventListener("beforeinput", this.handleBeforeInput.bind(this));
        this.editable.addEventListener("input", this.onValueUpdated.bind(this));
        this.editable.addEventListener("keydown", this.handleKeyDown.bind(this));
        this.editable.addEventListener("focus", () => {
            if (this.editable.innerText.trim() === "") {
                this.editable.classList.add("empty");
            }
        });
        this.editable.addEventListener("blur", () => {
            this.updatePlaceholder();
        });

        // Enhanced selection change detection
        const handleSelectionChange = () => {
            // Check if the selection is within our shadow root
            const selection = this.shadowRoot.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const container = range.commonAncestorContainer;
                if (this.shadowRoot.contains(container)) {
                    this.updateToolbarPosition();
                }
            }
        };

        // Create a MutationObserver to watch for DOM changes that might affect selection
        const observer = new MutationObserver(() => {
            handleSelectionChange();
        });

        // Observe changes to the editable content
        observer.observe(this.editable, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        // Listen for any selection changes in the shadow root
        this.shadowRoot.addEventListener("selectionchange", handleSelectionChange);

        // Keep existing mouse and keyboard event listeners as fallbacks
        this.editable.addEventListener("mouseup", handleSelectionChange);
        this.editable.addEventListener("keyup", (e) => {
            if (e.key === "Shift" || e.key === "ArrowLeft" || e.key === "ArrowRight" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a")) {
                handleSelectionChange();
            }
        });

        // Handle keyboard shortcuts
        this.editable.addEventListener("keydown", (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case "b":
                        e.preventDefault();
                        this.applyFormat("bold");
                        break;
                    case "d":
                        e.preventDefault();
                        this.applyFormat("strikeThrough");
                        break;
                    case "i":
                        e.preventDefault();
                        this.applyFormat("italic");
                        break;
                    case "u":
                        e.preventDefault();
                        this.applyFormat("underline");
                        break;
                    case "a":
                        // Allow the selection to happen, then update toolbar
                        setTimeout(handleSelectionChange, 0);
                        break;
                }
            }
        });

        this.editable.addEventListener("keydown", (e) => {
            this.handleMarkdown(e);
        });

        // Clean up the observer when the element is disconnected
        this.disconnectedCallback = () => {
            observer.disconnect();
            this.shadowRoot.removeEventListener("selectionchange", handleSelectionChange);
        };
    }

    handleMarkdown(event) {
        console.log("Markdown handling", this.editable.innerText, event.key);
        if (this.editable.innerText == "``" && event.key == "`") {
            console.log("Changing to code element");
            wisk.editor.changeBlockType(this.id, {textContent: ""}, "code-element");
            return;
        } 

        if (event.key != " ") return

        var newType = "uwu";
        switch (this.editable.innerText.trim()) {
            case "#":
                newType = "heading1-element";
                break;
            case "##":
                newType = "heading2-element";
                break;
            case "###":
                newType = "heading3-element";
                break;
            case "####":
                newType = "heading4-element";
                break;
            case "#####":
                newType = "heading5-element";
                break;
            case "-":
                newType = "list-element";
                break;
            case "+":
                newType = "list-element";
                break;
            case "*":
                newType = "list-element";
                break;
            case "1.":
                newType = "numbered-list-element";
                break;
            case "1)":
                newType = "numbered-list-element";
                break;
            case ">":
                newType = "quote-element";
                break;
            case "```":
                newType = "code-element";
                break;
            case "---" || "***" || "___":
                newType = "divider-element";
                break;
            case "- [ ]" || "- [x]":
                newType = "checkbox-element";
                break;
        }

        if (newType != "uwu") {
            var val = {textContent: ""};
            if (this.editable.innerText.trim() === "- [x]") {
                val.checked = true;
            }
            
            wisk.editor.changeBlockType(this.id, val, newType);
        }
    }

    getValue() {
        if (!this.editable) {
            return {textContent: "", references: []};
        }
        return {
            textContent: this.editable.innerHTML, // Changed from innerText to preserve formatting
            references: this.references
        };
    }

    setValue(path, value) {
        if (!this.editable) {
            return;
        }

        if (path == "value.append") {
            this.editable.innerHTML += value.textContent;
        } else {
            this.editable.innerHTML = value.textContent;
        }

        if (value.references && value.references.length) {
            if (path == "value.append") {
                this.references = this.references.concat(value.references);
            } else {
                this.references = value.references;
            }
        } 

        this.updatePlaceholder();
    }

    render() {
        const style = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font);
            }
            #editable {
                outline: none;
                position: relative;
                line-height: 1.5;
            }
            #editable.empty:before {
                content: attr(data-placeholder);
                color: var(--text-3);
                pointer-events: none;
                position: absolute;
                opacity: 0.6;
            }
            a {
                color: var(--fg-blue);
                text-decoration: underline;
            }
            .reference-number {
                color: var(--fg-blue);
                cursor: pointer;
                text-decoration: none;
                margin: 0 1px;
                font-family: var(--font-mono);
            }
            ::placeholder {
                color: var(--text-3);
            }
            h1 {
            }
            .suggestion {
                opacity: 0.6;
                font-style: italic;
            }
            </style>
        `;
        const content = `<div id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder}"></div>`
        this.shadowRoot.innerHTML = style + content;
    }

    handleBeforeInput(event) {
        if (event.inputType === "insertText" && event.data === "/" && this.editable.innerText.trim() === "") {
            event.preventDefault();
            window.wisk.editor.showSelector(this.id);
        }
    }

    checkIfVirtualKeyboard() {
        return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }

    handleKeyDown(event) {
        const keyHandlers = {
            Enter: () => this.handleEnterKey(event),
            Backspace: () => this.handleBackspace(event),
            Tab: () => this.handleTab(event),
            ArrowLeft: () => this.handleArrowKey(event, "next-up", 0),
            ArrowRight: () => this.handleArrowKey(event, "next-down", this.editable.innerText.length),
            ArrowUp: () => this.handleVerticalArrow(event, "next-up"),
            ArrowDown: () => this.handleVerticalArrow(event, "next-down"),
        };

        const handler = keyHandlers[event.key];
        if (handler) {
            handler();
        }
    }

    updateToolbarPosition() {
        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) {
            this.toolbar.hideToolbar();
            return;
        }

        const selectedText = selection.toString();
        if (selectedText.trim() === '') {
            this.toolbar.hideToolbar();
            return;
        }

        // Save the selection when showing the toolbar
        this.saveSelection();

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top - 45;

        this.toolbar.showToolbar(
            Math.max(20, x), 
            y, 
            this.id, 
            selectedText, 
            this.editable.innerText
        );

        // Check if selection is still valid after a short delay
        setTimeout(() => {
            const newSelection = this.shadowRoot.getSelection();
            if (newSelection.toString().trim() === '') {
                this.toolbar.hideToolbar();
                this.clearSelection();
            }
        }, 0);
    }

    handleToolbarAction(detail) {
        if (!this.restoreSelection()) {
            console.warn('No saved selection for toolbar action');
            return;
        }

        const { action, formatValue } = detail;

        try {
            // Add debug logging
            console.log(`Applying format: ${action} with value: ${formatValue}`);

            switch (action) {
                case "bold":
                case "italic":
                case "underline":
                case "strikeThrough":
                case "subscript":
                case "superscript":
                    document.execCommand(action, false, null);
                    break;
                case "foreColor":
                    document.execCommand('styleWithCSS', false, true);
                    document.execCommand('foreColor', false, formatValue);
                    document.execCommand('styleWithCSS', false, false);
                    break;
                case "backColor":
                    // Try direct background-color application using a span
                    const selection = this.shadowRoot.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const span = document.createElement('span');
                        span.style.backgroundColor = formatValue;

                        // Preserve existing content
                        const content = range.extractContents();
                        span.appendChild(content);
                        range.insertNode(span);

                        // Update selection
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                    break;
                case "make-longer":
                case "make-shorter":
                case "fix-spelling-grammar":
                case "improve-writing":
                case "summarize":
                    // These are handled by the toolbar's AI operations
                    break;
            }
        } catch (error) {
            console.error('Error applying format:', error, error.stack);
            this.handleFormatFallback(action, formatValue);
        }

        // Clear selection and update content
        this.clearSelection();
        this.sendUpdates();
    }

    // Also update the fallback handler for background color
    handleFormatFallback(action, formatValue) {
        try {
            const selection = this.shadowRoot.getSelection();
            const range = selection.getRangeAt(0);

            if (action === 'backColor') {
                const span = document.createElement('span');
                span.style.backgroundColor = formatValue;

                // Get selected content
                const fragment = range.extractContents();
                span.appendChild(fragment);
                range.insertNode(span);

                // Cleanup any nested empty spans
                const emptySpans = span.querySelectorAll('span:empty');
                emptySpans.forEach(emptySpan => emptySpan.remove());

                // Update selection
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                // Original fallback code for other formats
                const span = document.createElement('span');
                switch (action) {
                    case "foreColor":
                        span.style.color = formatValue;
                        break;
                    case "subscript":
                        span.style.verticalAlign = 'sub';
                        span.style.fontSize = '0.8em';
                        break;
                    case "superscript":
                        span.style.verticalAlign = 'super';
                        span.style.fontSize = '0.8em';
                        break;
                }
                range.surroundContents(span);
            }
        } catch (fallbackError) {
            console.error('Format fallback failed:', fallbackError);
            // Last resort fallback
            try {
                const selection = this.shadowRoot.getSelection();
                if (selection.toString()) {
                    const text = selection.toString();
                    const span = document.createElement('span');
                    if (action === 'backColor') {
                        span.style.backgroundColor = formatValue;
                    }
                    span.textContent = text;
                    range.deleteContents();
                    range.insertNode(span);
                }
            } catch (e) {
                console.error('Ultimate fallback failed:', e);
            }
        }
    }

    handleEnterKey(event) {
        event.preventDefault();
        const selection = this.shadowRoot.getSelection();
        const range = selection.getRangeAt(0);
        
        const beforeRange = document.createRange();
        beforeRange.setStart(this.editable, 0);
        beforeRange.setEnd(range.startContainer, range.startOffset);
        
        const afterRange = document.createRange();
        afterRange.setStart(range.endContainer, range.endOffset);
        afterRange.setEnd(this.editable, this.editable.childNodes.length);
        
        const beforeContainer = document.createElement('div');
        const afterContainer = document.createElement('div');
        
        beforeContainer.appendChild(beforeRange.cloneContents());
        afterContainer.appendChild(afterRange.cloneContents());
        
        this.editable.innerHTML = beforeContainer.innerHTML;
        this.sendUpdates();
        
        window.wisk.editor.createNewBlock(
            this.id, 
            "text-element", 
            {textContent: afterContainer.innerHTML}, 
            {x: 0}
        );
    }


    handleBackspace(event) {
        if (this.getFocus() === 0) {
            event.preventDefault();
            const prevElement = window.wisk.editor.prevElement(this.id);
            const prevDomElement = document.getElementById(prevElement.id);
            if (!prevElement) return;

            const prevComponentDetail = window.wisk.plugins.getPluginDetail(prevElement.component);
            if (prevComponentDetail.textual) {
                const len = prevDomElement.getTextContent().text.length;
                window.wisk.editor.updateBlock(prevElement.id, "value.append", {textContent: this.editable.innerHTML, references: this.references});
                window.wisk.editor.focusBlock(prevElement.id, {x: len});
            }
            window.wisk.editor.deleteBlock(this.id);
        }
    }

    getTextContent() {
        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: "# " + window.wisk.editor.htmlToMarkdown(this.editable.innerHTML)
        }
    }

    handleTab(event) {
        event.preventDefault();
        document.execCommand("insertText", false, "    ");
        window.wisk.editor.justUpdates(this.id);
    }

    handleArrowKey(event, direction, targetOffset) {
        const pos = this.getFocus();
        if (pos === targetOffset) {
            event.preventDefault();
            const adjacentElement = direction === "next-up" ? window.wisk.editor.prevElement(this.id) : window.wisk.editor.nextElement(this.id);

            if (adjacentElement) {
                const componentDetail = window.wisk.plugins.getPluginDetail(adjacentElement.component);
                if (componentDetail.textual) {
                    const focusPos = direction === "next-up" ? adjacentElement.value.textContent.length : 0;
                    window.wisk.editor.focusBlock(adjacentElement.id, {x: focusPos});
                }
            }
        }
    }

    focus(identifier) {
        console.log("Focus called with identifier", identifier, this.id);
        if (typeof identifier.x != "number") {
            identifier.x = 0;
        }

        this.editable.focus();

        // Special handling for zero index - place cursor at the very beginning
        if (identifier.x === 0) {
            const selection = this.shadowRoot.getSelection();
            const range = document.createRange();

            // Find the first valid position for cursor
            let firstNode = this.editable;
            let offset = 0;

            // Find the first text node if it exists
            const findFirstTextNode = (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    return node;
                }
                for (const child of node.childNodes) {
                    const result = findFirstTextNode(child);
                    if (result) return result;
                }
                return null;
            };

            const firstTextNode = findFirstTextNode(this.editable);
            if (firstTextNode) {
                firstNode = firstTextNode;
                offset = 0;
            }

            try {
                range.setStart(firstNode, offset);
                range.setEnd(firstNode, offset);
                selection.removeAllRanges();
                selection.addRange(range);
                return;
            } catch (e) {
                console.warn("Failed to set cursor at beginning:", e);
            }
        }

        // Rest of the focus logic for non-zero positions
        if (!this.editable.childNodes.length) {
            return;
        }

        const selection = this.shadowRoot.getSelection();
        const range = document.createRange();

        let currentOffset = 0;
        let targetNode = null;
        let nodeOffset = 0;
        let skipToNext = false;

        const findPosition = (node) => {
            if (currentOffset >= identifier.x) {
                return true;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                if (currentOffset + node.length >= identifier.x) {
                    targetNode = node;
                    nodeOffset = identifier.x - currentOffset;
                    return true;
                }
                currentOffset += node.length;
            } else if (node.nodeType === Node.ELEMENT_NODE && node.contentEditable === "false") {
                const length = node.textContent.length;
                if (currentOffset <= identifier.x && currentOffset + length >= identifier.x) {
                    targetNode = node.parentNode;
                    nodeOffset = Array.from(node.parentNode.childNodes).indexOf(node) + 1;
                    skipToNext = true;
                    return true;
                }
                currentOffset += length;
            } else if (node.childNodes) {
                for (const child of node.childNodes) {
                    if (findPosition(child)) {
                        return true;
                    }
                }
            }
            return false;
        };

        findPosition(this.editable);

        if (!targetNode) {
            const lastChild = this.editable.lastChild;
            if (lastChild) {
                if (lastChild.nodeType === Node.TEXT_NODE) {
                    targetNode = lastChild;
                    nodeOffset = lastChild.length;
                } else {
                    targetNode = this.editable;
                    nodeOffset = this.editable.childNodes.length;
                }
            } else {
                targetNode = this.editable;
                nodeOffset = 0;
            }
        }

        try {
            range.setStart(targetNode, nodeOffset);
            range.setEnd(targetNode, nodeOffset);
            selection.removeAllRanges();
            selection.addRange(range);

            if (skipToNext) {
                this.editable.scrollIntoView({block: "nearest"});
            }
        } catch (e) {
            console.warn("Failed to set cursor position:", e);
            range.selectNodeContents(this.editable);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    handleVerticalArrow(event, direction) {
        console.log("Vertical arrow key pressed");
        const pos = this.getFocus();
        setTimeout(() => {
            const newPos = this.getFocus();
            if ((direction === "next-up" && newPos === 0) || (direction === "next-down" && newPos === this.editable.innerText.length)) {
                const adjacentElement = direction === "next-up" ? window.wisk.editor.prevElement(this.id) : window.wisk.editor.nextElement(this.id);

                if (adjacentElement) {
                    const componentDetail = window.wisk.plugins.getPluginDetail(adjacentElement.component);
                    if (componentDetail.textual) {
                        window.wisk.editor.focusBlock(adjacentElement.id, {x: pos});
                    }
                }
            }
        }, 0);
    }

    onValueUpdated(event) {
        this.updatePlaceholder();
        this.sendUpdates();
    }

    updatePlaceholder() {
        if (this.editable) {
            const isEmpty = this.editable.innerText.trim() === "";
            this.editable.classList.toggle("empty", isEmpty);
            // Update placeholder text if attribute changes
            this.editable.dataset.placeholder = this.getAttribute("placeholder") || this.placeholder;
        }
    }

    sendUpdates() {
        setTimeout(() => {
            window.wisk.editor.justUpdates(this.id);
        }, 0);
    }

    static get observedAttributes() {
        return ["placeholder"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "placeholder" && oldValue !== newValue) {
            this.placeholder = newValue;
            if (this.editable) {
                this.editable.dataset.placeholder = newValue;
            }
        }
    }

    getFocus() {
        const sel = this.shadowRoot.getSelection();
        if (!sel.rangeCount) return 0;
        const range = sel.getRangeAt(0).cloneRange();
        range.setStart(this.editable, 0);
        return range.toString().length;
    }
}

customElements.define("base-text-element", BaseTextElement);
