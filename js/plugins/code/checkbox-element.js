class CheckboxElement extends BaseTextElement {
    constructor() {
        super();
        this.indent = 0;
        this.checked = false;
        this.render();
        
        this.checkbox = this.shadowRoot.querySelector("#checkbox");
        this.updateIndent();
        this.updateCheckbox();
        
        this.updatePlaceholder();
    }

    connectedCallback() {
        super.connectedCallback();
        this.checkbox = this.shadowRoot.querySelector("#checkbox");
        this.updateIndent();
        this.updateCheckbox();
        this.updatePlaceholder();

        this.checkbox.addEventListener("change", this.onCheckboxChange.bind(this));
    }

    updatePlaceholder() {
        if (this.editable) {
            const isEmpty = !this.editable.innerHTML.trim();
            this.editable.classList.toggle('empty', isEmpty);
            this.editable.dataset.placeholder = this.getAttribute("placeholder") || this.placeholder;
        }
    }

    updateIndent() {
        const indentWidth = 20;
        this.shadowRoot.querySelectorAll('.indent').forEach(el => el.remove());
        const container = this.shadowRoot.querySelector("#list-outer");
        for (let i = 0; i < this.indent; i++) {
            const indentSpan = document.createElement('span');
            indentSpan.className = 'indent';
            container.insertBefore(indentSpan, container.firstChild);
        }
    }

    updateCheckbox() {
        if (this.checkbox) {
            this.checkbox.checked = this.checked;
        }
    }

    onCheckboxChange(event) {
        if (window.wisk.editor.wiskSite) return;

        this.checked = event.target.checked;
        this.sendUpdates();
    }

    getValue() {
        return {
            textContent: this.editable?.innerHTML || "",
            indent: this.indent,
            checked: this.checked,
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
            this.checked = value.checked || false;
            this.references = value.references || [];
        }
        
        this.updateIndent();
        this.updateCheckbox();
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
                "checkbox-element", 
                { 
                    textContent: afterContainer.innerHTML,
                    indent: this.indent,
                    checked: false 
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
                flex: 1;
                line-height: 1.5;
                position: relative; /* Added for placeholder positioning */
                min-height: 24px; /* Added to ensure consistent height */
            }
            #list-outer {
                width: 100%;
                border: none;
                display: flex;
                flex-direction: row;
                gap: 8px;
                align-items: flex-start; /* Changed from center to flex-start */
                position: relative; /* Added for positioning context */
            }
            .indent {
                width: 20px;
            }
            #checkbox {
                display: inline-block;
                vertical-align: top; /* Changed from middle to top */
                height: 16px;
                width: 16px;
                accent-color: var(--fg-blue);
                background-color: var(--bg-1);
                margin-top: 4px; /* Added to align with text */
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
            #editable.empty:empty:before {
                content: attr(data-placeholder);
                color: var(--text-3);
                pointer-events: none;
                position: absolute;
                opacity: 0.6;
                top: 0;
                left: 0;
            }
            </style>
        `;
        const content = `
            <div id="list-outer">
                <input type="checkbox" id="checkbox" name="checkbox" value="checkbox" ${window.wisk.editor.wiskSite ? 'onclick="return false"' : ''} />
                <div id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder || 'Add a task...'}"></div>
            </div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }

    getTextContent() {
        const indentation = '  '.repeat(this.indent); // Two spaces per indent level
        const checkboxMarker = this.checked ? '[x]' : '[ ]';
        const markdown = indentation + `- ${checkboxMarker} ` + window.wisk.editor.htmlToMarkdown(this.editable.innerHTML);

        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: markdown
        }
    }
}

customElements.define("checkbox-element", CheckboxElement);
