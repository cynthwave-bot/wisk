class ListElement extends BaseTextElement {
    constructor() {
        super();
        this.indent = 0;
        this.render();
        
        this.dotElement = this.shadowRoot.querySelector("#dot");
        this.updateIndent();
    }

    connectedCallback() {
        super.connectedCallback();
        this.dotElement = this.shadowRoot.querySelector("#dot");
        this.updateIndent();
    }

    getValue() {
        return {
            textContent: this.editable?.innerHTML || "",
            indent: this.indent,
            references: this.references || []
        };
    }

    setValue(path, value) {
        if (!this.editable) {
            return;
        }

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

    updateIndent() {
        const indentWidth = 24;
        const dotWidth = 20;
        if (this.dotElement && this.editable) {
            this.dotElement.style.left = `${this.indent * indentWidth}px`;
            this.editable.style.paddingLeft = `${(this.indent * indentWidth) + dotWidth}px`;
        }
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
                min-height: 24px;
            }
            #editable.empty:empty:before {
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
            </style>
        `;
        const content = `
            <div id="container">
                <div id="dot"></div>
                <div id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder || 'Add a list item...'}" ></div>
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
