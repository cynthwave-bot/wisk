class NumberedListElement extends BaseTextElement {
    constructor() {
        super();
        this.indent = 0;
        this.number = 1;
        this.render();

        this.numberElement = this.shadowRoot.querySelector("#number");
        this.updateIndent();
        this.updateNumber();
    }

    connectedCallback() {
        super.connectedCallback();
        this.numberElement = this.shadowRoot.querySelector("#number");
        this.updateIndent();
        this.updateNumber();
    }

    getNumberStyle(num, level) {
        const styles = [
            // Level 0: 1, 2, 3...
            (n) => n,
            // Level 1: i, ii, iii...
            (n) => this.toRoman(n).toLowerCase(),
            // Level 2: a, b, c...
            (n) => String.fromCharCode(96 + n),
            // Level 3: 1, 2, 3... (repeat)
            (n) => n,
            // Level 4: i, ii, iii... (repeat)
            (n) => this.toRoman(n).toLowerCase()
        ];

        return styles[level % styles.length](num);
    }

    // Convert number to Roman numerals
    toRoman(num) {
        const romanNumerals = [
            { value: 1000, symbol: 'M' },
            { value: 900, symbol: 'CM' },
            { value: 500, symbol: 'D' },
            { value: 400, symbol: 'CD' },
            { value: 100, symbol: 'C' },
            { value: 90, symbol: 'XC' },
            { value: 50, symbol: 'L' },
            { value: 40, symbol: 'XL' },
            { value: 10, symbol: 'X' },
            { value: 9, symbol: 'IX' },
            { value: 5, symbol: 'V' },
            { value: 4, symbol: 'IV' },
            { value: 1, symbol: 'I' }
        ];

        let result = '';
        for (let numeral of romanNumerals) {
            while (num >= numeral.value) {
                result += numeral.symbol;
                num -= numeral.value;
            }
        }
        return result;
    }

    getValue() {
        return {
            textContent: this.editable?.innerHTML || "",
            indent: this.indent,
            number: this.number,
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
            this.number = value.number || 1;
            this.references = value.references || [];
        }
        
        this.updateIndent();
        this.updateNumber();
    }

    updateIndent() {
        const indentWidth = 24;
        const numberWidth = 24;
        if (this.numberElement && this.editable) {
            this.numberElement.style.left = `${this.indent * indentWidth}px`;
            this.editable.style.paddingLeft = `${(this.indent * indentWidth) + numberWidth + 8}px`;
            this.updateNumber(); // Update number style when indent changes
        }
    }

    updateNumber() {
        if (this.numberElement) {
            const formattedNumber = this.getNumberStyle(this.number, this.indent);
            this.numberElement.textContent = formattedNumber + '.';
        }
    }

    handleBeforeInput(event) {
        if (event.inputType === 'insertText' && event.data === '/' && this.editable.innerText.trim() === "") {
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
                "numbered-list-element", 
                { 
                    textContent: afterContainer.innerHTML,
                    indent: this.indent,
                    number: this.number + 1
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
            #number {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-1);
                font-size: 14px;
                min-width: 20px;
                text-align: right;
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
                <div id="number">1.</div>
                <div id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder || 'Add a list item...'}" ></div>
            </div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }

    getTextContent() {
        const indentation = '  '.repeat(this.indent);
        const formattedNumber = this.getNumberStyle(this.number, this.indent);
        const markdown = indentation + `${formattedNumber}. ` + window.wisk.editor.htmlToMarkdown(this.editable.innerHTML);
        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: markdown
        }
    }
}

customElements.define("numbered-list-element", NumberedListElement);
