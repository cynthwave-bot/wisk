class CalloutElement extends BaseTextElement {
    constructor() {
        const initialEmoji = "📌";
        super();
        
        this.value = {
            textContent: "",
            references: [],
            emoji: initialEmoji
        };

        this.render();
        this.setupEmojiPicker();
    }

    setupEmojiPicker() {
        const commonEmojis = [
            "📝", "📌", "💡", "⭐", "❗", "❓", "💭", "📢", "🎯", "🔍",
            "⚠️", "💪", "🎉", "🚀", "💻", "📊", "📈", "🎨", "🔧", "📚"
        ];

        const emojiMenu = document.createElement('div');
        emojiMenu.className = 'emoji-menu';
        
        commonEmojis.forEach(emoji => {
            const emojiOption = document.createElement('span');
            emojiOption.textContent = emoji;
            emojiOption.className = 'emoji-option';
            emojiOption.addEventListener('click', (e) => {
                e.stopPropagation();
                this.value.emoji = emoji;
                this.emojiButton.textContent = emoji;
                emojiMenu.style.display = 'none';
                this.sendUpdates();
            });
            emojiMenu.appendChild(emojiOption);
        });

        // Add the menu inside the container next to the button
        const container = this.shadowRoot.querySelector('.container');
        container.insertBefore(emojiMenu, container.firstChild.nextSibling);
    }

    getValue() {
        if (!this.editable) {
            return {
                textContent: "",
                references: [],
                emoji: this.value?.emoji || "📌"
            };
        }
        return {
            textContent: this.editable.innerHTML,
            references: this.references,
            emoji: this.value?.emoji || "📌"
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
            .emoji-menu {
                display: none;
                left: var(--padding-4);
                top: calc(100% - var(--padding-2));
                background: var(--bg-1);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: var(--padding-2);
                grid-template-columns: repeat(5, 1fr);
                gap: var(--padding-2);
                z-index: 1000;
                box-shadow: var(--shadow-lg);
            }
            .emoji-option {
                cursor: pointer;
                padding: var(--padding-1);
                border-radius: var(--radius);
                transition: background-color 0.2s;
                text-align: center;
                user-select: none;
            }
            .emoji-option:hover {
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
            </style>
        `;
        const content = `
            <div class="container">
                <button class="emoji-button">${this.value?.emoji || "📌"}</button>
                <div id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder}"></div>
            </div>
        `;
        this.shadowRoot.innerHTML = style + content;

        this.emojiButton = this.shadowRoot.querySelector('.emoji-button');
        this.emojiButton.addEventListener('click', (e) => {
            if (window.wisk.editor.wiskSite) return;

            e.stopPropagation();
            const emojiMenu = this.shadowRoot.querySelector('.emoji-menu');
            if (emojiMenu.style.display === 'none' || !emojiMenu.style.display) {
                emojiMenu.style.display = 'grid';
            } else {
                emojiMenu.style.display = 'none';
            }
        });

        // Close emoji menu when clicking outside
        document.addEventListener('click', () => {
            const emojiMenu = this.shadowRoot.querySelector('.emoji-menu');
            if (emojiMenu) {
                emojiMenu.style.display = 'none';
            }
        });

        this.editable = this.shadowRoot.querySelector("#editable");
    }

    getTextContent() {
        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: "> " + window.wisk.editor.htmlToMarkdown(this.editable.innerHTML)
        }
    }
}

customElements.define("callout-element", CalloutElement);
