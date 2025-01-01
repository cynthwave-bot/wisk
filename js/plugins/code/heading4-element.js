class Heading4Element extends BaseTextElement {
    constructor() {
        super();
        this.placeholder = this.getAttribute("placeholder") || "edit me";
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
            </style>
        `;
        const content = `<h4 id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder}"></h4>`
        this.shadowRoot.innerHTML = style + content;
    }
}

customElements.define("heading4-element", Heading4Element);
