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

            @media (hover: hover) {
                *::-webkit-scrollbar { width: 15px; }
                *::-webkit-scrollbar-track { background: var(--bg-1); }
                *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
                *::-webkit-scrollbar-thumb:hover { background-color: var(--text-1); }
            }
            </style>
        `;
        const content = `
            <div id="editable" contenteditable="${!wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder}"></div>
            <div class="emoji-suggestions"></div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }
}

customElements.define('quote-element', QuoteElement);
