class MainElement extends BaseTextElement {
    constructor() {
        super();
        this.placeholder = this.getAttribute("placeholder") || "edit me";
        this.emoji = this.getAttribute("emoji") || '';
        this.backgroundUrl = null;
        this.MAX_WIDTH = 1920;
        this.MAX_HEIGHT = 1080;
        this.loading = false;
        
        // Bind the emoji selection handler
        this.handleEmojiSelection = this.handleEmojiSelection.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        this.emojiElement = this.shadowRoot.querySelector("#emoji");
        this.fileInput = this.shadowRoot.querySelector("#background-file");
        this.backgroundUploadButton = this.shadowRoot.querySelector("#background-upload-button");
        this.headerContainer = this.shadowRoot.querySelector(".header-container");
        this.bindHeaderEvents();
        
        // Add event listener for emoji selection
        window.addEventListener("emoji-selector", this.handleEmojiSelection);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        // Clean up event listener
        window.removeEventListener("emoji-selector", this.handleEmojiSelection);
    }

    handleEmojiSelection(event) {
        // Only handle events meant for this instance
        if (event.detail.id === this.givenId) {
            this.emoji = event.detail.emoji;
            this.updateEmoji();
            this.sendUpdates();
        }
    }

    setValue(path, value) {
        if (path === "value.append") {
            this.editable.innerHTML += value.textContent;
        } else {
            this.editable.innerHTML = value.textContent;
            if (value.emoji) {
                this.emoji = value.emoji;
                this.updateEmoji();
            }
            if (value.backgroundUrl) {
                this.backgroundUrl = value.backgroundUrl;
                this.updateBackground();
            }
        }
        this.updatePlaceholder();
    }

    getValue() {
        return {
            textContent: this.editable.innerHTML,
            emoji: this.emoji,
            backgroundUrl: this.backgroundUrl
        };
    }

    bindHeaderEvents() {
        // Emoji picker click handler
        this.emojiElement.addEventListener("click", () => {
            if (window.wisk.editor.wiskSite) return;
            
            // Get the emoji selector component and show it
            const emojiSelector = document.querySelector('emoji-selector');
            if (emojiSelector) {
                emojiSelector.show(this.givenId);
            }
        });

        // Background image upload handlers
        if (!window.wisk.editor.wiskSite) {
            this.fileInput.addEventListener("change", this.onBackgroundSelected.bind(this));
            this.backgroundUploadButton.addEventListener("click", (e) => {
                e.stopPropagation();
                this.fileInput.click();
            });

            // Drag and drop for background
            this.headerContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.headerContainer.style.opacity = '0.7';
            });

            this.headerContainer.addEventListener('dragleave', () => {
                this.headerContainer.style.opacity = '1';
            });

            this.headerContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                this.headerContainer.style.opacity = '1';
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.processBackgroundFile(file);
                }
            });
        }
    }

    async onBackgroundSelected(event) {
        const file = event.target.files[0];
        if (file) {
            await this.processBackgroundFile(file);
        }
    }

    async processBackgroundFile(file) {
        if (this.loading) return;
        this.loading = true;
        this.backgroundUploadButton.innerText = "Uploading...";

        try {
            const blobUrl = URL.createObjectURL(file);
            const resizedBlob = await this.resizeImage(blobUrl, file.type);
            const url = await this.uploadToServer(resizedBlob);
            this.backgroundUrl = url;
            this.updateBackground();
            this.sendUpdates();
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Failed to process background:', error);
            this.backgroundUploadButton.innerText = "Upload failed";
        } finally {
            this.loading = false;
            this.backgroundUploadButton.innerText = "Add Cover";
        }
    }

    resizeImage(src, fileType) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                const widthRatio = width / this.MAX_WIDTH;
                const heightRatio = height / this.MAX_HEIGHT;

                if (widthRatio > 1 || heightRatio > 1) {
                    if (widthRatio > heightRatio) {
                        height = Math.round(height * (this.MAX_WIDTH / width));
                        width = this.MAX_WIDTH;
                    } else {
                        width = Math.round(width * (this.MAX_HEIGHT / height));
                        height = this.MAX_HEIGHT;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => resolve(blob),
                    fileType,
                    0.90
                );
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    async uploadToServer(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            var user = await document.querySelector('auth-component').getUserInfo();
            const response = await fetch('https://cloud.wisk.cc/v1/files', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': 'Bearer ' + user.token
                }
            });

            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    updateEmoji() {
        if (this.emojiElement) {
            if (this.emoji && this.emoji.trim()) {
                this.emojiElement.innerHTML = this.emoji;
                this.emojiElement.classList.remove('empty-emoji');
            } else {
                this.emojiElement.innerHTML = '<span class="add-emoji-text">add emoji</span>';
                this.emojiElement.classList.add('empty-emoji');
            }
        }
    }

    updateBackground() {
        if (this.backgroundUrl) {
            this.headerContainer.style.backgroundImage = `url(${this.backgroundUrl})`;
            this.headerContainer.classList.add('has-background');
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
            .header-container {
                padding: 0 max(calc((100% - 850px) / 2), var(--padding-4));
                padding-top: 99px;
                background-size: cover;
                background-position: center;
                border-radius: var(--radius);
                transition: opacity 0.3s;
            }
            @media (max-width: 1150px) {
                .header-container {
                    margin-top: 59px;
                    padding-top: 69px;
                }
            }
            .has-background {
                margin-bottom: 20px;
            }
            .header-content {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                flex-direction: column;
                min-height: 100px;
                position: relative;
            }
            #emoji {
                font-size: 49px;
                cursor: pointer;
                user-select: none;
                background: transparent;
                border-radius: var(--radius);
                transition: background-color 0.2s;
                position: absolute;
                bottom: -27px;
                min-width: 60px;
                min-height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .add-emoji-text {
                font-size: 16px;
                color: var(--text-3);
                opacity: 0.8;
            }
            .empty-emoji {
                background: var(--bg-2) !important;
                padding: 8px 12px;
            }
            #emoji:hover {
                background: var(--bg-2);
            }
            #editable {
                outline: none;
                position: relative;
                line-height: 1.5;
                font-size: 2.5em;
                font-weight: 700;
                flex-grow: 1;
                background: transparent;
                padding: 8px 12px;
                border-radius: var(--radius);
                padding: 0 max(calc((100% - 850px) / 2), var(--padding-4));
                margin-top: 36px;
            }
            #editable.empty:before {
                content: attr(data-placeholder);
                color: var(--text-3);
                pointer-events: none;
                position: absolute;
                opacity: 0.6;
            }
            #background-upload-button {
                position: absolute;
                bottom: 12px;
                right: 12px;
                padding: var(--padding-w2);
                background-color: var(--bg-1);
                color: var(--text-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius);
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.3s;
            }
            .header-container:hover #background-upload-button {
                opacity: 1;
            }
            #background-file {
                display: none;
            }
            a {
                color: var(--fg-blue);
                text-decoration: underline;
            }
            .add-emoji-text {
                visibility: hidden;
            }
            .header-container:hover .add-emoji-text {
                visibility: visible;
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
            <div class="header-container">
                ${!window.wisk.editor.wiskSite ? `
                    <input type="file" id="background-file" accept="image/*" />
                ` : ''}
                <div class="header-content">
                    <div id="emoji">${this.emoji && this.emoji.trim() ? this.emoji : '<span class="add-emoji-text">add emoji</span>'}</div>
                    ${!window.wisk.editor.wiskSite ? `
                        <button id="background-upload-button">Add Cover</button>
                    ` : ''}
                </div>
            </div>
            <h1 id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder}"></h1>
            <div class="emoji-suggestions"></div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }

    getTextContent() {
        return {
            html: `<h1>${this.emoji} ${this.editable.innerHTML}</h1>`,
            text: `${this.emoji} ${this.editable.innerText}`,
            markdown: `# ${this.emoji} ${this.editable.innerText}`
        };
    }
}

customElements.define("main-element", MainElement);
