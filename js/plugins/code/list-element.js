class ListElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.render();
        this.isVirtualKeyboard = this.checkIfVirtualKeyboard();
        this.indent = 0;
        // Add toolbar initialization
        this.savedSelection = null;
        this.toolbar = document.getElementById("formatting-toolbar");
        this.toolbar.addEventListener("toolbar-action", (e) => {
            if (e.detail.elementId === this.id) {
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

    checkIfVirtualKeyboard() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    connectedCallback() {
        this.editable = this.shadowRoot.querySelector("#editable");
        this.dotElement = this.shadowRoot.querySelector("#dot");
        this.bindEvents();
        this.updateIndent();
    }

    getValue() {
        return {
            textContent: this.editable.innerHTML,
            indent: this.indent,
            references: this.references
        };
    }

    setValue(path, value) {
        if (path === "value.append") {
            this.editable.innerHTML += value.textContent;
            if (value.references && value.references.length) {
                this.references = this.references.concat(value.references);
            }
        } else {
            this.editable.innerHTML = value.textContent;
            this.indent = value.indent || 0;
            this.references = value.references || [];
        }
        this.updateIndent();
    }

    onValueUpdated() {
        this.sendUpdates();
    }

    sendUpdates() {
        setTimeout(() => {
            window.wisk.editor.justUpdates(this.id);
        }, 0);
    }

    focus(identifier) {
        console.log('Focus called with identifier', identifier, this.id);
        if (typeof identifier.x != "number") {
            identifier.x = 0;
        }

        this.editable.focus();

        if (identifier.x === 0) {
            const selection = this.shadowRoot.getSelection();
            const range = document.createRange();

            let firstNode = this.editable;
            let offset = 0;

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
                console.warn('Failed to set cursor at beginning:', e);
            }
        }

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
            } else if (node.nodeType === Node.ELEMENT_NODE && node.contentEditable === 'false') {
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
                this.editable.scrollIntoView({ block: 'nearest' });
            }
        } catch (e) {
            console.warn('Failed to set cursor position:', e);
            range.selectNodeContents(this.editable);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
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

    updateIndent() {
        const indentWidth = 24;
        const dotWidth = 20;
        this.dotElement.style.left = `${this.indent * indentWidth}px`;
        this.editable.style.paddingLeft = `${(this.indent * indentWidth) + dotWidth}px`;
    }

    getFocus() {
        const sel = this.shadowRoot.getSelection();
        if (!sel.rangeCount) return 0;
        const range = sel.getRangeAt(0).cloneRange();
        range.setStart(this.editable, 0);
        return range.toString().length;
    }

    handleBeforeInput(event) {
        if (event.inputType === 'insertText' && event.data === '/') {
            event.preventDefault();
            window.wisk.editor.showSelector(this.id);
        } else if (event.inputType === 'insertText' && event.data === ' ' && this.getFocus() === 0) {
            event.preventDefault();
            this.indent++;
            this.updateIndent();
            this.sendUpdates();
        }
    }

    handleKeyDown(event) {
        const keyHandlers = {
            'Enter': () => this.handleEnterKey(event),
            'Backspace': () => this.handleBackspace(event),
            'Tab': () => this.handleTab(event),
            'ArrowLeft': () => this.handleArrowKey(event, 'next-up', 0),
            'ArrowRight': () => this.handleArrowKey(event, 'next-down', this.editable.innerText.length),
            'ArrowUp': () => this.handleVerticalArrow(event, 'next-up'),
            'ArrowDown': () => this.handleVerticalArrow(event, 'next-down')
        };

        const handler = keyHandlers[event.key];
        if (handler) {
            handler();
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

        if (this.editable.innerText.trim().length === 0) {
            window.wisk.editor.changeBlockType(this.id, { textContent: afterContainer.innerHTML }, "text-element");
        } else {
            window.wisk.editor.createNewBlock(
                this.id, 
                "list-element", 
                { 
                    textContent: afterContainer.innerHTML,
                    indent: this.indent
                }, 
                { x: 0 }
            );
        }
    }

    handleBackspace(event) {
        if (this.getFocus() === 0) {
            event.preventDefault();

            if (this.indent > 0) {
                this.indent--;
                this.updateIndent();
                this.sendUpdates();
            } else {
                const prevElement = window.wisk.editor.prevElement(this.id);
                const prevDomElement = document.getElementById(prevElement.id);
                if (prevElement) {
                    const prevComponentDetail = window.wisk.plugins.getPluginDetail(prevElement.component);
                    if (prevComponentDetail.textual) {
                        const len = prevDomElement.getTextContent().text.length;
                        window.wisk.editor.updateBlock(prevElement.id, "value.append", {textContent: this.editable.innerHTML, references: this.references});
                        window.wisk.editor.focusBlock(prevElement.id, {x: len});
                    }
                    window.wisk.editor.deleteBlock(this.id);
                }
            }
        }
    }

    handleTab(event) {
        event.preventDefault();
        if (this.getFocus() === 0) {
            this.indent++;
            this.updateIndent();
            this.sendUpdates();
        } else {
            document.execCommand("insertText", false, "    ");
        }
    }

    handleArrowKey(event, direction, targetOffset) {
        const pos = this.getFocus();
        if (pos === targetOffset) {
            event.preventDefault();
            const adjacentElement = direction === 'next-up' 
                ? window.wisk.editor.prevElement(this.id)
                : window.wisk.editor.nextElement(this.id);

            if (adjacentElement) {
                const componentDetail = window.wisk.plugins.getPluginDetail(adjacentElement.component);
                if (componentDetail.textual) {
                    const focusPos = direction === 'next-up' 
                        ? adjacentElement.value.textContent.length 
                        : 0;
                    window.wisk.editor.focusBlock(adjacentElement.id, { x: focusPos });
                }
            }
        }
    }

    handleVerticalArrow(event, direction) {
        const pos = this.getFocus();
        setTimeout(() => {
            const newPos = this.getFocus();
            if ((direction === 'next-up' && newPos === 0) || 
                (direction === 'next-down' && newPos === this.editable.innerText.length)) {
                const adjacentElement = direction === 'next-up'
                    ? window.wisk.editor.prevElement(this.id)
                    : window.wisk.editor.nextElement(this.id);

                if (adjacentElement) {
                    const componentDetail = window.wisk.plugins.getPluginDetail(adjacentElement.component);
                    if (componentDetail.textual) {
                        window.wisk.editor.focusBlock(adjacentElement.id, { x: pos });
                    }
                }
            }
        }, 0);
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

    handleToolbarAction(detail) {
        const {action, selectedText} = detail;
        switch (action) {
            case "bold":
            case "italic":
            case "underline":
            case "strikeThrough":
                this.applyFormat(action);
                break;
            case "make-longer":
            case "make-shorter":
            case "fix-spelling-grammar":
            case "improve-writing":
            case "summarize":
                // The toolbar will handle the API call and send back results
                break;
        }
    }

    applyFormat(format) {
        document.execCommand(format, false, null);
        this.sendUpdates();
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
            const textNode = document.createTextNode(detail.newText);
            range.deleteContents();
            range.insertNode(textNode);
            
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            
            this.clearSelection();
            this.sendUpdates();
        } catch (error) {
            console.error('Error applying AI operation:', error);
            this.handleAIOperationFallback(detail.newText, selection);
        }
    }

    handleAIOperationFallback(newText, selection) {
        try {
            document.execCommand('insertText', false, newText);
            this.sendUpdates();
        } catch (fallbackError) {
            console.error('AI operation fallback failed:', fallbackError);
        }
    }

    handleCreateReference(detail) {
        if (!this.restoreSelection()) {
            console.warn('No saved selection to create reference from');
            return;
        }

        const selection = this.shadowRoot.getSelection();
        const range = selection.getRangeAt(0);

        if (!this.editable.contains(range.commonAncestorContainer)) {
            console.warn('Selection is outside the editable area');
            return;
        }

        try {
            const referenceData = {
                title: detail.title,
                authors: detail.authors,
                date: detail.date,
                publisher: detail.publisher,
                url: detail.url
            };
            
            let referenceNumber;
            const existingRefIndex = window.wisk.plugins.references.findIndex(ref => 
                ref.url === detail.url && 
                ref.title === detail.title
            );

            if (existingRefIndex !== -1) {
                referenceNumber = existingRefIndex + 1;
            } else {
                window.wisk.plugins.references.push(referenceData);
                referenceNumber = window.wisk.plugins.references.length;
            }

            referenceData.number = referenceNumber;

            const refSpan = document.createElement('span');
            refSpan.contentEditable = 'false';
            refSpan.className = 'reference-number';
            refSpan.textContent = `[${referenceNumber}]`;
            
            const fragment = range.extractContents();
            const wrapper = document.createElement('span');
            wrapper.appendChild(fragment);
            wrapper.appendChild(refSpan);
            
            range.insertNode(wrapper);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            
            this.clearSelection();
            this.references.push(referenceData);
            this.sendUpdates();
        } catch (error) {
            console.error('Error creating reference:', error);
            this.handleReferenceFallback(detail, selection);
        }
    }

    handleCreateLink(url) {
        if (!this.restoreSelection()) {
            console.warn('No saved selection to create link from');
            return;
        }

        const selection = this.shadowRoot.getSelection();
        const range = selection.getRangeAt(0);

        if (!this.editable.contains(range.commonAncestorContainer)) {
            console.warn('Selection is outside the editable area');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = this.normalizeUrl(url);
            link.target = '_blank';
            link.contentEditable = 'false';

            const fragment = range.extractContents();
            link.appendChild(fragment);
            
            range.insertNode(link);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            
            this.clearSelection();
            this.sendUpdates();
        } catch (error) {
            console.error('Error creating link:', error);
            this.handleLinkFallback(url, selection);
        }
    }

    normalizeUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
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

        setTimeout(() => {
            const newSelection = this.shadowRoot.getSelection();
            if (newSelection.toString().trim() === '') {
                this.toolbar.hideToolbar();
                this.clearSelection();
            }
        }, 0);
    }

    // Modify the existing bindEvents method to include toolbar-related events
    bindEvents() {
        this.editable.addEventListener('beforeinput', this.handleBeforeInput.bind(this));
        this.editable.addEventListener('input', this.onValueUpdated.bind(this));
        this.editable.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.editable.addEventListener("focus", () => {
            if (this.editable.innerText.trim() === "") {
                this.editable.classList.add("empty");
            }
        });
        this.editable.addEventListener("blur", () => {
            this.editable.classList.toggle('empty', this.editable.innerText.trim() === '');
        });

        // Add selection change handling
        const handleSelectionChange = () => {
            const selection = this.shadowRoot.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const container = range.commonAncestorContainer;
                if (this.shadowRoot.contains(container)) {
                    this.updateToolbarPosition();
                }
            }
        };

        const observer = new MutationObserver(() => {
            handleSelectionChange();
        });

        observer.observe(this.editable, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        this.shadowRoot.addEventListener("selectionchange", handleSelectionChange);
        this.editable.addEventListener("mouseup", handleSelectionChange);
        this.editable.addEventListener("keyup", (e) => {
            if (e.key === "Shift" || e.key === "ArrowLeft" || e.key === "ArrowRight" || 
                ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a")) {
                handleSelectionChange();
            }
        });

        // Add keyboard shortcuts
        this.editable.addEventListener("keydown", (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case "b":
                        e.preventDefault();
                        this.applyFormat("bold");
                        break;
                    case "i":
                        e.preventDefault();
                        this.applyFormat("italic");
                        break;
                    case "u":
                        e.preventDefault();
                        this.applyFormat("underline");
                        break;
                    case "d":
                        e.preventDefault();
                        this.applyFormat("strikeThrough");
                        break;
                }
            }
        });

        // Add cleanup for observer
        this.disconnectedCallback = () => {
            observer.disconnect();
            this.shadowRoot.removeEventListener("selectionchange", handleSelectionChange);
        };
    }

    // Update the render method to include styles for links and references
    render() {
        const style = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font);
            }
            #container {
                position: relative;
            }
            #dot {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 6px;
                height: 6px;
                background-color: var(--text-1);
                border-radius: 50%;
            }
            #editable {
                line-height: 1.5;
                outline: none;
                transition: padding-left 0.1s ease-in-out;
            }
            a {
                color: var(--button-bg-blue);
                text-decoration: underline;
            }
            .reference-number {
                color: var(--button-bg-blue);
                cursor: pointer;
                text-decoration: none;
                margin: 0 1px;
                font-family: var(--font-mono);
            }
            </style>
        `;
        const content = `
            <div id="container">
                <div id="dot"></div>
                <div id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" ></div>
            </div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }

    getTextContent() {
        const indentation = '  '.repeat(this.indent);
        const markdown = indentation + '- ' + window.wisk.editor.htmlToMarkdown(this.editable.innerHTML);
        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: markdown
        }
    }
}

customElements.define("list-element", ListElement);
