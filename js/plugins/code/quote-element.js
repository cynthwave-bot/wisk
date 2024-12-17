class QuoteElement extends BaseTextElement {
    render() {
        const style = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font-cursive);
            }
            #editable {
                outline: none;
                font-size: 1.5rem;
                line-height: 1.5;
                border: none;
                border-left: 5px solid var(--fg-red);
                padding: var(--padding-4);
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
            </style>
        `;
        const content = `<div id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder}"></div>`;
        this.shadowRoot.innerHTML = style + content;
    }
}

customElements.define("quote-element", QuoteElement);
