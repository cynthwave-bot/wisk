class CalloutElement extends BaseTextElement {
    constructor() {
        const initialEmoji = '📌';
        super();

        this.value = {
            textContent: '',
            emoji: initialEmoji,
        };

        // Bind the emoji selection handler
        this.handleEmojiSelection = this.handleEmojiSelection.bind(this);

        this.render();
    }

    connectedCallback() {
        super.connectedCallback();
        // Add event listener for emoji selection
        window.addEventListener('emoji-selector', this.handleEmojiSelection);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        // Clean up event listener
        window.removeEventListener('emoji-selector', this.handleEmojiSelection);
    }

    handleEmojiSelection(event) {
        // Only handle events meant for this instance
        if (event.detail.id === this.id) {
            this.value.emoji = event.detail.emoji;
            this.emojiButton.textContent = event.detail.emoji;
            this.sendUpdates();
        }
    }

    getValue() {
        if (!this.editable) {
            return {
                textContent: '',
                references: [],
                emoji: this.value?.emoji || '📌',
            };
        }
        return {
            textContent: this.editable.innerHTML,
            references: this.references,
            emoji: this.value?.emoji || '📌',
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

        if (value.references && value.references.length) {
            if (path == 'value.append') {
                this.references = this.references.concat(value.references);
            } else {
                this.references = value.references;
            }
        }

        if (value.emoji) {
            this.value = this.value || {};
            this.value.emoji = value.emoji;
            if (this.emojiButton) {
                this.emojiButton.textContent = value.emoji;
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
            .container {
                display: flex;
                align-items: flex-start;
                gap: var(--padding-4);
                background-color: var(--accent-bg);
                border-radius: var(--radius);
                padding: var(--padding-4);
                align-items: center;
                position: relative;
            }
            .emoji-button {
                font-size: 20px;
                background: none;
                border: none;
                cursor: pointer;
                padding: var(--padding-2);
                border-radius: var(--radius);
                transition: background-color 0.2s;
                line-height: 1;
                z-index: 1;
            }
            .emoji-button:hover {
                background-color: var(--bg-2);
            }
            #editable {
                flex: 1;
                font-size: 16px;
                line-height: 1.5;
                border: none;
                border-radius: var(--radius);
                background-color: transparent;
                outline: none;
                line-height: 1.5;
                padding: 0;
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
            *::-webkit-scrollbar { width: 15px; }
            *::-webkit-scrollbar-track { background: var(--bg-1); }
            *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
            *::-webkit-scrollbar-thumb:hover { background-color: var(--text-1); }
            </style>
        `;
        const content = `
            <div class="container">
                <button class="emoji-button">${this.value?.emoji || '📌'}</button>
                <div id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder}"></div>
                <div class="emoji-suggestions"></div>
            </div>
        `;
        this.shadowRoot.innerHTML = style + content;

        this.emojiButton = this.shadowRoot.querySelector('.emoji-button');
        this.emojiButton.addEventListener('click', e => {
            if (window.wisk.editor.wiskSite) return;

            e.stopPropagation();
            // Get the emoji selector component and show it
            const emojiSelector = document.querySelector('emoji-selector');
            if (emojiSelector) {
                emojiSelector.show(this.id);
            }
        });

        this.editable = this.shadowRoot.querySelector('#editable');
    }

    getTextContent() {
        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: '> ' + window.wisk.editor.htmlToMarkdown(this.editable.innerHTML),
        };
    }
}

customElements.define('callout-element', CalloutElement);
