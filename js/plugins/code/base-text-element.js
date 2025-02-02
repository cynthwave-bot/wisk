class BaseTextElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
        this.updatePlaceholder();
        this.isMouseOverSuggestions = false;
        this.isVirtualKeyboard = this.checkIfVirtualKeyboard();
        this.savedRange = null;
        this.savedSelection = null;
        this.placeholder = this.getAttribute('placeholder') || wisk.editor.wiskSite ? '' : "Write something or press '/' for commands";
        this.toolbar = document.getElementById('formatting-toolbar');
        this.toolbar.addEventListener('toolbar-action', e => {
            if (e.detail.elementId === this.id) {
                console.log('Toolbar action received', e.detail);
                this.handleToolbarAction(e.detail);
            }
        });
        this.toolbar.addEventListener('save-selection', e => {
            if (e.detail.elementId === this.id) {
                this.saveSelection();
            }
        });
        this.toolbar.addEventListener('create-link', e => {
            if (e.detail.elementId === this.id) {
                this.handleCreateLink(e.detail.url);
            }
        });
        this.toolbar.addEventListener('create-reference', e => {
            if (e.detail.elementId === this.id) {
                this.handleCreateReference(e.detail);
            }
        });
        this.toolbar.addEventListener('ai-operation-complete', e => {
            if (e.detail.elementId === this.id) {
                this.handleAIOperationComplete(e.detail);
            }
        });
        this.references = [];

        // emoji support if its not obvious by name
        this.emojiSuggestions = [];
        this.showingEmojiSuggestions = false;
        this.selectedEmojiIndex = 0;
        this.currentEmojiQuery = '';
    }

    getSelectionPosition() {
        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return null;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            selectedText: selection.toString(),
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

            // Create citation element with attributes
            const citeElement = document.createElement('cite-element');
            citeElement.contentEditable = 'false';
            citeElement.setAttribute('reference-id', detail.citation.id);
            citeElement.setAttribute('citation', detail.inlineCitation);

            // Instead of deleting content, just collapse range to end
            range.collapse(false);

            // Insert space and citation after the selected text
            range.insertNode(citeElement);
            range.insertNode(spaceNode);

            // Move cursor after citation
            range.setStartAfter(citeElement);
            range.setEndAfter(citeElement);
            selection.removeAllRanges();
            selection.addRange(range);

            // Update content
            this.sendUpdates();
        } catch (error) {
            console.error('Error creating citation:', error);
            this.handleReferenceFallback(detail, selection);
        }
    }

    // Update the fallback handler as well
    handleReferenceFallback(detail, selection) {
        try {
            // Fallback method using execCommand
            const text = selection.toString();
            document.execCommand('insertText', false, text);

            const range = selection.getRangeAt(0);
            const citeElement = document.createElement('cite-element');
            citeElement.contentEditable = 'false';
            citeElement.setAttribute('reference-id', detail.citation.id);
            citeElement.setAttribute('citation', detail.inlineCitation);

            range.insertNode(citeElement);

            this.references.push(detail.citation);
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
        this.editable = this.shadowRoot.querySelector('#editable');
        this.emojiSuggestionsContainer = this.shadowRoot.querySelector('.emoji-suggestions');

        this.updatePlaceholder();
        this.bindEvents();
    }

    saveSelection() {
        const selection = this.shadowRoot.getSelection();
        if (selection.rangeCount > 0) {
            this.savedSelection = {
                range: selection.getRangeAt(0).cloneRange(),
                text: selection.toString(),
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
            if (node.tagName === 'A') {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    createLink(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
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
            const link = document.createElement('a');
            link.href = url;
            link.contentEditable = 'false';
            link.target = '_blank';

            link.appendChild(textNode);
            range.insertNode(link);
            range.collapse(false);
        } catch (error) {
            console.error('Error creating link:', error);
            try {
                document.execCommand('insertText', false, selection.toString());
                const newRange = document.createRange();
                newRange.setStartBefore(range.startContainer);
                newRange.setEndAfter(range.startContainer);
                const link = document.createElement('a');
                link.href = url;
                link.contentEditable = 'false';
                link.target = '_blank';
                newRange.surroundContents(link);
            } catch (fallbackError) {
                console.error('Fallback link creation failed:', fallbackError);
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
        this.editable.addEventListener('beforeinput', this.handleBeforeInput.bind(this));
        this.editable.addEventListener('input', this.onValueUpdated.bind(this));
        this.editable.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.editable.addEventListener('focus', () => {
            if (this.editable.innerText.trim() === '') {
                this.editable.classList.add('empty');
            }
        });
        this.editable.addEventListener('blur', () => {
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
        this.shadowRoot.addEventListener('selectionchange', handleSelectionChange);

        // Keep existing mouse and keyboard event listeners as fallbacks
        this.editable.addEventListener('mouseup', handleSelectionChange);
        this.editable.addEventListener('keyup', e => {
            if (e.key === 'Shift' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a')) {
                handleSelectionChange();
            }
        });

        // Handle keyboard shortcuts
        this.editable.addEventListener('keydown', e => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.applyFormat('bold');
                        break;
                    case 'd':
                        e.preventDefault();
                        this.applyFormat('strikeThrough');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.applyFormat('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.applyFormat('underline');
                        break;
                    case 'a':
                        // Allow the selection to happen, then update toolbar
                        setTimeout(handleSelectionChange, 0);
                        break;
                }
            }
        });

        this.editable.addEventListener('keydown', e => {
            this.handleMarkdown(e);
        });

        // Clean up the observer when the element is disconnected
        this.disconnectedCallback = () => {
            observer.disconnect();
            this.shadowRoot.removeEventListener('selectionchange', handleSelectionChange);
        };

        document.addEventListener('click', e => {
            if (!this.editable.contains(e.target) && !this.emojiSuggestionsContainer.contains(e.target)) {
                this.hideEmojiSuggestions();
            }
        });

        this.editable.addEventListener('blur', () => {
            setTimeout(() => {
                if (!this.emojiSuggestionsContainer.contains(document.activeElement) && !this.emojiSuggestionsContainer.matches(':hover')) {
                    this.hideEmojiSuggestions();
                }
            }, 0);
            this.updatePlaceholder();
        });

        this.emojiSuggestionsContainer.addEventListener('mouseenter', () => {
            this.isMouseOverSuggestions = true;
        });

        this.emojiSuggestionsContainer.addEventListener('mouseleave', () => {
            this.isMouseOverSuggestions = false;
        });
    }

    handleMarkdown(event) {
        if (this.editable.innerText == '``' && event.key == '`') {
            console.log('Changing to code element');
            wisk.editor.changeBlockType(this.id, { textContent: '' }, 'code-element');
            return;
        }

        if (event.key != ' ') return;

        var newType = 'uwu';
        switch (this.editable.innerText.trim()) {
            case '#':
                newType = 'heading1-element';
                break;
            case '##':
                newType = 'heading2-element';
                break;
            case '###':
                newType = 'heading3-element';
                break;
            case '####':
                newType = 'heading4-element';
                break;
            case '#####':
                newType = 'heading5-element';
                break;
            case '-':
                newType = 'list-element';
                break;
            case '+':
                newType = 'list-element';
                break;
            case '*':
                newType = 'list-element';
                break;
            case '1.':
                newType = 'numbered-list-element';
                break;
            case '1)':
                newType = 'numbered-list-element';
                break;
            case '>':
                newType = 'quote-element';
                break;
            case '```':
                newType = 'code-element';
                break;
            case '---':
                newType = 'divider-element';
                break;
            case '***':
                newType = 'divider-element';
                break;
            case '___':
                newType = 'divider-element';
                break;
            case '- [ ]':
                newType = 'checkbox-element';
                break;
            case '- [x]':
                newType = 'checkbox-element';
                break;
        }

        if (newType != 'uwu') {
            var val = { textContent: '' };
            if (this.editable.innerText.trim() === '- [x]') {
                val.checked = true;
            }

            wisk.editor.changeBlockType(this.id, val, newType);
        }
    }

    getValue() {
        if (!this.editable) {
            return { textContent: '', references: [] };
        }
        return {
            textContent: this.editable.innerHTML,
        };
    }

    setValue(path, value) {
        if (!this.editable) {
            return;
        }

        if (path == 'value.append') {
            this.editable.innerHTML += value.textContent;
        } else {
            this.editable.innerHTML = value.textContent;
        }

        this.updatePlaceholder();
    }

    getTextContent() {
        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: '# ' + wisk.editor.htmlToMarkdown(this.editable.innerHTML),
        };
    }

    setTextContent(content) {
        const newText = content.text;
        const editable = this.editable;
        const currentText = editable.innerText;
        let cutIndex = currentText.length;

        const cutText = () => {
            if (cutIndex > 0) {
                editable.innerHTML = currentText.slice(0, cutIndex - 1);
                this.updatePlaceholder();
                cutIndex--;
                setTimeout(cutText, 10);
            } else {
                typeText();
            }
        };

        let typeIndex = 0;

        const typeText = () => {
            if (typeIndex < newText.length) {
                editable.innerHTML += newText[typeIndex];
                typeIndex++;
                setTimeout(typeText, 10);
            } else {
                this.updatePlaceholder();
                this.sendUpdates();
            }
        };

        cutText();
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
            .suggestion {
                opacity: 0.6;
                font-style: italic;
            }
            .emoji-suggestions {
                position: absolute;
                background: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius);
                padding: var(--padding-2);
                box-shadow: var(--shadow-1);
                display: none;
                z-index: 1000;
                max-height: 200px;
                overflow-y: auto;
                width: max-content;
                min-width: 200px;
            }
            .emoji-suggestion {
                padding: var(--padding-2);
                display: flex;
                align-items: center;
                gap: var(--gap-2);
                cursor: pointer;
                border-radius: var(--radius);
            }
            .emoji-suggestion.selected {
                background: var(--bg-3);
            }
            .emoji-suggestion:hover {
                background: var(--bg-3);
            }
            .emoji-name {
                color: var(--text-2);
                font-size: 0.9em;
            }
            .emoji {
                width: 30px;
                text-align: center;
            }
            *::-webkit-scrollbar { width: 15px; }
            *::-webkit-scrollbar-track { background: var(--bg-1); }
            *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
            *::-webkit-scrollbar-thumb:hover { background-color: var(--text-1); }
            </style>
        `;
        const content = `<div id="editable" contenteditable="${!wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder}"></div><div class="emoji-suggestions"></div>`;
        this.shadowRoot.innerHTML = style + content;
    }

    handleBeforeInput(event) {
        if (event.inputType === 'insertText' && event.data === '/' && this.editable.innerText.trim() === '') {
            event.preventDefault();
            wisk.editor.showSelector(this.id);
        }
    }

    checkIfVirtualKeyboard() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    navigateEmojiSuggestions(direction) {
        if (direction === 'up') {
            this.selectedEmojiIndex = Math.max(0, this.selectedEmojiIndex - 1);
        } else {
            this.selectedEmojiIndex = Math.min(this.emojiSuggestions.length - 1, this.selectedEmojiIndex + 1);
        }
        this.renderEmojiSuggestions();
    }

    insertSelectedEmoji() {
        if (!this.showingEmojiSuggestions || !this.emojiSuggestions.length) return;

        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedEmoji = this.emojiSuggestions[this.selectedEmojiIndex];

        try {
            // Find the text node and offset where the ':' character starts
            const findColonPosition = (node, targetOffset) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const colonIndex = text.lastIndexOf(':', targetOffset);
                    if (colonIndex !== -1) {
                        return { node, offset: colonIndex };
                    }
                }

                if (!node.childNodes) return null;

                for (let i = node.childNodes.length - 1; i >= 0; i--) {
                    const child = node.childNodes[i];
                    const result = findColonPosition(child, child.textContent.length);
                    if (result) return result;
                }

                return null;
            };

            const colonPos = findColonPosition(this.editable, range.startOffset);
            if (!colonPos) return;

            // Create a range from the colon to the current cursor position
            const replaceRange = document.createRange();
            replaceRange.setStart(colonPos.node, colonPos.offset);
            replaceRange.setEnd(range.endContainer, range.endOffset);

            // Replace the content with the emoji
            replaceRange.deleteContents();
            const emojiNode = document.createTextNode(selectedEmoji.emoji);
            replaceRange.insertNode(emojiNode);

            // Set cursor position after the emoji
            const newRange = document.createRange();
            newRange.setStartAfter(emojiNode);
            newRange.setEndAfter(emojiNode);
            selection.removeAllRanges();
            selection.addRange(newRange);

            this.hideEmojiSuggestions();
            this.sendUpdates();
        } catch (error) {
            console.error('Error inserting emoji:', error);
            // Fallback: just insert the emoji at cursor position
            document.execCommand('insertText', false, selectedEmoji.emoji);
            this.hideEmojiSuggestions();
            this.sendUpdates();
        }
    }

    handleKeyDown(event) {
        if (this.showingEmojiSuggestions) {
            switch (event.key) {
                case 'Enter':
                    event.preventDefault();
                    this.insertSelectedEmoji();
                    return;
                case 'ArrowUp':
                    event.preventDefault();
                    this.navigateEmojiSuggestions('up');
                    return;
                case 'ArrowDown':
                    event.preventDefault();
                    this.navigateEmojiSuggestions('down');
                    return;
                case 'Escape':
                    this.hideEmojiSuggestions();
                    return;
            }
        }

        const keyHandlers = {
            Enter: () => this.handleEnterKey(event),
            Backspace: () => this.handleBackspace(event),
            Tab: () => this.handleTab(event),
            ArrowLeft: () => this.handleArrowKey(event, 'next-up', 0),
            ArrowRight: () => this.handleArrowKey(event, 'next-down', this.editable.innerText.length),
            ArrowUp: () => this.handleVerticalArrow(event, 'next-up'),
            ArrowDown: () => this.handleVerticalArrow(event, 'next-down'),
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

        this.toolbar.showToolbar(Math.max(20, x), y, this.id, selectedText, this.editable.innerText);

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
                case 'bold':
                case 'italic':
                case 'underline':
                case 'strikeThrough':
                case 'subscript':
                case 'superscript':
                    document.execCommand(action, false, null);
                    break;
                case 'foreColor':
                    document.execCommand('styleWithCSS', false, true);
                    document.execCommand('foreColor', false, formatValue);
                    document.execCommand('styleWithCSS', false, false);
                    break;
                case 'backColor':
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
                case 'make-longer':
                case 'make-shorter':
                case 'fix-spelling-grammar':
                case 'improve-writing':
                case 'summarize':
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
                    case 'foreColor':
                        span.style.color = formatValue;
                        break;
                    case 'subscript':
                        span.style.verticalAlign = 'sub';
                        span.style.fontSize = '0.8em';
                        break;
                    case 'superscript':
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

        wisk.editor.createNewBlock(this.id, 'text-element', { textContent: afterContainer.innerHTML }, { x: 0 });
    }

    handleBackspace(event) {
        if (this.getFocus() === 0) {
            event.preventDefault();
            const prevElement = wisk.editor.prevElement(this.id);
            const prevDomElement = document.getElementById(prevElement.id);
            if (!prevElement) return;

            const prevComponentDetail = wisk.plugins.getPluginDetail(prevElement.component);
            if (prevComponentDetail.textual) {
                const len = prevDomElement.getTextContent().text.length;
                wisk.editor.updateBlock(prevElement.id, 'value.append', { textContent: this.editable.innerHTML, references: this.references });
                wisk.editor.focusBlock(prevElement.id, { x: len });
            }
            wisk.editor.deleteBlock(this.id);
        }
    }

    handleTab(event) {
        event.preventDefault();
        document.execCommand('insertText', false, '    ');
        wisk.editor.justUpdates(this.id);
    }

    handleArrowKey(event, direction, targetOffset) {
        const pos = this.getFocus();
        if (pos === targetOffset) {
            event.preventDefault();
            const adjacentElement = direction === 'next-up' ? wisk.editor.prevElement(this.id) : wisk.editor.nextElement(this.id);

            if (adjacentElement) {
                const componentDetail = wisk.plugins.getPluginDetail(adjacentElement.component);
                if (componentDetail.textual) {
                    const focusPos = direction === 'next-up' ? adjacentElement.value.textContent.length : 0;
                    wisk.editor.focusBlock(adjacentElement.id, { x: focusPos });
                }
            }
        }
    }

    focus(identifier) {
        console.log('Focus called with identifier', identifier, this.id);
        if (typeof identifier.x != 'number') {
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
            const findFirstTextNode = node => {
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

        const findPosition = node => {
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

    handleVerticalArrow(event, direction) {
        console.log('Vertical arrow key pressed', direction);
        const pos = this.getFocus();
        setTimeout(() => {
            const newPos = this.getFocus();
            if ((direction === 'next-up' && newPos === 0) || (direction === 'next-down' && newPos === this.editable.innerText.length)) {
                console.log('Moving to adjacent element');
                const adjacentElement = direction === 'next-up' ? wisk.editor.prevElement(this.id) : wisk.editor.nextElement(this.id);

                if (adjacentElement) {
                    const componentDetail = wisk.plugins.getPluginDetail(adjacentElement.component);
                    if (componentDetail.textual) {
                        wisk.editor.focusBlock(adjacentElement.id, { x: pos });
                    }
                }
            }
        }, 0);
    }

    onValueUpdated(event) {
        const selection = this.shadowRoot.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const text = this.editable.textContent;
            const cursorPosition = this.getFocus();

            // Find the last ':' before cursor
            const beforeCursor = text.substring(0, cursorPosition);
            const colonIndex = beforeCursor.lastIndexOf(':');

            if (colonIndex !== -1) {
                const query = beforeCursor.substring(colonIndex + 1);

                // If there's no space in the query, it's potentially an emoji shortcut
                if (!query.includes(' ') && query.length > 0) {
                    this.currentEmojiQuery = query;
                    this.showEmojiSuggestions(query, range);
                    return;
                }
            }
        }

        // Hide suggestions if we're not in an emoji query
        this.hideEmojiSuggestions();

        // Keep existing update logic
        this.updatePlaceholder();
        this.sendUpdates();
    }

    updatePlaceholder() {
        if (this.editable) {
            const isEmpty = this.editable.innerText.trim() === '';
            this.editable.classList.toggle('empty', isEmpty);
            // Update placeholder text if attribute changes
            this.editable.dataset.placeholder = this.getAttribute('placeholder') || this.placeholder;
        }
    }

    sendUpdates() {
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }

    static get observedAttributes() {
        return ['placeholder'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'placeholder' && oldValue !== newValue) {
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

    showEmojiSuggestions(query, range) {
        const emojiSelector = document.querySelector('emoji-selector');
        if (!emojiSelector) return;

        this.emojiSuggestions = emojiSelector.searchDiscordEmojis(query);

        if (this.emojiSuggestions.length > 0) {
            const editableRect = this.editable.getBoundingClientRect();
            const rangeRect = range.getBoundingClientRect();

            this.emojiSuggestionsContainer.style.display = 'block';

            this.emojiSuggestionsContainer.style.left = `0px`;
            this.emojiSuggestionsContainer.style.bottom = `100%`;
            this.emojiSuggestionsContainer.style.width = `100%`;

            this.renderEmojiSuggestions();
            this.showingEmojiSuggestions = true;
            this.selectedEmojiIndex = 0;
        } else {
            this.hideEmojiSuggestions();
        }
    }

    hideEmojiSuggestions() {
        this.emojiSuggestionsContainer.style.display = 'none';
        this.showingEmojiSuggestions = false;
        this.emojiSuggestions = [];
        this.currentEmojiQuery = '';
    }

    renderEmojiSuggestions() {
        this.emojiSuggestionsContainer.innerHTML = this.emojiSuggestions
            .map(
                (emoji, index) => `
            <div class="emoji-suggestion ${index === this.selectedEmojiIndex ? 'selected' : ''}"
                 data-index="${index}">
                <span class="emoji">${emoji.emoji}</span>
                <span class="emoji-name">${emoji.name}</span>
            </div>
        `
            )
            .join('');

        // Add click handlers
        this.emojiSuggestionsContainer.querySelectorAll('.emoji-suggestion').forEach(suggestion => {
            suggestion.addEventListener('mousedown', e => {
                e.preventDefault(); // Prevent blur
                this.selectedEmojiIndex = parseInt(suggestion.dataset.index);
                this.insertSelectedEmoji();
            });
        });
    }

    navigateEmojiSuggestions(direction) {
        if (direction === 'up') {
            this.selectedEmojiIndex = Math.max(0, this.selectedEmojiIndex - 1);
        } else {
            this.selectedEmojiIndex = Math.min(this.emojiSuggestions.length - 1, this.selectedEmojiIndex + 1);
        }
        this.renderEmojiSuggestions();
        // scroll to selected emoji
        const selectedEmoji = this.emojiSuggestionsContainer.querySelector('.emoji-suggestion.selected');
        if (selectedEmoji) {
            selectedEmoji.scrollIntoView({ block: 'nearest' });
        }
    }

    insertSelectedEmoji() {
        if (!this.showingEmojiSuggestions || !this.emojiSuggestions.length) return;

        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedEmoji = this.emojiSuggestions[this.selectedEmojiIndex];

        try {
            // Find the text node and offset where the ':' character starts
            const findColonPosition = (node, targetOffset) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const colonIndex = text.lastIndexOf(':', targetOffset);
                    if (colonIndex !== -1) {
                        return { node, offset: colonIndex };
                    }
                }

                if (!node.childNodes) return null;

                for (let i = node.childNodes.length - 1; i >= 0; i--) {
                    const child = node.childNodes[i];
                    const result = findColonPosition(child, child.textContent.length);
                    if (result) return result;
                }

                return null;
            };

            const colonPos = findColonPosition(this.editable, range.startOffset);
            if (!colonPos) return;

            // Create a range from the colon to the current cursor position
            const replaceRange = document.createRange();
            replaceRange.setStart(colonPos.node, colonPos.offset);
            replaceRange.setEnd(range.endContainer, range.endOffset);

            // Replace the content with the emoji
            replaceRange.deleteContents();
            const emojiNode = document.createTextNode(selectedEmoji.emoji);
            replaceRange.insertNode(emojiNode);

            // Set cursor position after the emoji
            const newRange = document.createRange();
            newRange.setStartAfter(emojiNode);
            newRange.setEndAfter(emojiNode);
            selection.removeAllRanges();
            selection.addRange(newRange);

            this.hideEmojiSuggestions();
            this.sendUpdates();
        } catch (error) {
            console.error('Error inserting emoji:', error);
            // Fallback: just insert the emoji at cursor position
            document.execCommand('insertText', false, selectedEmoji.emoji);
            this.hideEmojiSuggestions();
            this.sendUpdates();
        }
    }
}

customElements.define('base-text-element', BaseTextElement);
