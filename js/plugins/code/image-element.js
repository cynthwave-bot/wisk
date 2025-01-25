class ImageElement extends BaseTextElement {
    constructor() {
        super();
        this.imageUrl = null;
        this.MAX_WIDTH = 1920;
        this.MAX_HEIGHT = 1080;
        this.loading = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this.imageElement = this.shadowRoot.querySelector('#img-editable');
        this.fileInput = this.shadowRoot.querySelector('#file');
        this.uploadArea = this.shadowRoot.querySelector('.upload-img');
        this.uploadButton = this.shadowRoot.querySelector('#upload-button');
        this.optionsButton = this.shadowRoot.querySelector('#options-button');
        this.optionsDialog = this.shadowRoot.querySelector('#options-dialog');
        this.bindImageEvents();
        this.bindOptionEvents();
    }

    setValue(path, value) {
        if (path === 'value.append') {
            this.editable.innerHTML += value.textContent;
        } else {
            this.editable.innerHTML = value.textContent;
            if (value.imageUrl) {
                this.imageUrl = value.imageUrl;
                this.updateImage();
            }
            if (value.showBorder !== undefined) {
                const borderToggle = this.shadowRoot.querySelector('#border-toggle');
                if (borderToggle) {
                    borderToggle.checked = value.showBorder;
                    const img = this.shadowRoot.querySelector('#img-editable');
                    img.style.border = value.showBorder ? '1px solid var(--border-1)' : 'none';
                }
            }
        }
    }

    getValue() {
        return {
            textContent: this.editable.innerHTML,
            imageUrl: this.imageUrl,
            showBorder: this.shadowRoot.querySelector('#border-toggle')?.checked || false,
        };
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
                    Authorization: 'Bearer ' + user.token,
                },
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    bindOptionEvents() {
        const optionsButton = this.shadowRoot.querySelector('#options-button');
        const optionsDialog = this.shadowRoot.querySelector('#options-dialog');
        const changeImageBtn = this.shadowRoot.querySelector('#change-image');
        const fullscreenBtn = this.shadowRoot.querySelector('#fullscreen');
        const borderToggle = this.shadowRoot.querySelector('#border-toggle');
        
        optionsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            optionsDialog.style.display = optionsDialog.style.display != 'flex' ? 'flex' : 'none';
        });

        document.addEventListener('click', (e) => {
            if (!optionsDialog.contains(e.target) && e.target !== optionsButton) {
                optionsDialog.style.display = 'none';
            }
        });

        changeImageBtn.addEventListener('click', () => {
            this.fileInput.click();
            optionsDialog.style.display = 'none';
        });

        fullscreenBtn.addEventListener('click', () => {
            if (this.imageUrl) {
                window.open(this.imageUrl, '_blank');
            }
            optionsDialog.style.display = 'none';
        });

        borderToggle.addEventListener('change', (e) => {
            const img = this.shadowRoot.querySelector('#img-editable');
            if (e.target.checked) {
                img.style.border = '1px solid var(--border-1)';
            } else {
                img.style.border = 'none';
            }
            this.sendUpdates();
        });
    }

    onImageSelected(event) {
        const file = event.target.files[0];
        if (file) {
            this.processSelectedFile(file);
        }
    }

    async processSelectedFile(file) {
        if (!this.loading) {
            this.loading = true;
        } else {
            return;
        }

        this.shadowRoot.querySelector('#upload-button').innerText = 'Uploading...';

        try {
            const blobUrl = URL.createObjectURL(file);
            const resizedBlob = await this.resizeImage(blobUrl, file.type);
            const url = await this.uploadToServer(resizedBlob);
            this.imageUrl = url;
            this.updateImage();
            this.sendUpdates();
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Failed to process image:', error);
            this.shadowRoot.querySelector('#upload-button').innerText = 'Upload failed';
        } finally {
            this.loading = false;
            this.shadowRoot.querySelector('#upload-button').innerText = 'Upload Image';
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

                const steps = Math.ceil(Math.log2(Math.max(img.width / width, img.height / height)));
                let currentWidth = img.width;
                let currentHeight = img.height;
                let currentCanvas = document.createElement('canvas');
                let currentContext = currentCanvas.getContext('2d');

                currentCanvas.width = img.width;
                currentCanvas.height = img.height;
                currentContext.imageSmoothingEnabled = true;
                currentContext.imageSmoothingQuality = 'high';
                currentContext.drawImage(img, 0, 0);

                for (let i = 0; i < steps; i++) {
                    const targetWidth = Math.max(width, Math.floor(currentWidth / 2));
                    const targetHeight = Math.max(height, Math.floor(currentHeight / 2));

                    const nextCanvas = document.createElement('canvas');
                    nextCanvas.width = targetWidth;
                    nextCanvas.height = targetHeight;

                    const nextContext = nextCanvas.getContext('2d');
                    nextContext.imageSmoothingEnabled = true;
                    nextContext.imageSmoothingQuality = 'high';
                    nextContext.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

                    currentCanvas = nextCanvas;
                    currentContext = nextContext;
                    currentWidth = targetWidth;
                    currentHeight = targetHeight;
                }

                if (currentWidth !== width || currentHeight !== height) {
                    const finalCanvas = document.createElement('canvas');
                    finalCanvas.width = width;
                    finalCanvas.height = height;

                    const finalContext = finalCanvas.getContext('2d');
                    finalContext.imageSmoothingEnabled = true;
                    finalContext.imageSmoothingQuality = 'high';

                    finalContext.drawImage(currentCanvas, 0, 0, width, height);
                    currentCanvas = finalCanvas;
                }

                currentCanvas.toBlob(blob => resolve(blob), fileType, 0.9);
            };

            img.onerror = reject;
            img.src = src;
        });
    }

    updateImage() {
        if (this.imageUrl) {
            this.imageElement.src = this.imageUrl;
            this.imageElement.style.display = 'block';
            this.uploadArea.classList.remove('empty');
            this.uploadArea.classList.add('has-image');
            this.fileInput.style.display = 'none';
            this.uploadButton.style.display = 'none';
            this.optionsButton.style.display = 'block';
        } else {
            this.uploadArea.classList.add('empty');
            this.uploadArea.classList.remove('has-image');
            this.optionsButton.style.display = 'none';
        }
    }

    bindImageEvents() {
        this.fileInput.addEventListener('change', this.onImageSelected.bind(this));
        this.uploadButton.addEventListener('click', e => {
            e.stopPropagation();
            this.fileInput.click();
        });

        // Handle drag and drop
        this.uploadArea.addEventListener('dragover', e => {
            e.preventDefault();
            this.uploadArea.style.background = 'rgba(0, 123, 255, 0.1)';
        });

        this.uploadArea.addEventListener('dragleave', () => {
            if (!this.imageUrl) {
                this.uploadArea.style.background = 'var(--bg-2)';
            }
        });

        this.uploadArea.addEventListener('drop', e => {
            e.preventDefault();
            if (!this.imageUrl) {
                this.uploadArea.style.background = 'var(--bg-2)';
            }
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.processSelectedFile(file);
            }
        });
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
            .upload-img {
                width: 100%;
                position: relative;
                border-radius: var(--radius);
                min-height: 100px;
            }
            .upload-img.empty {
                padding: var(--padding-4);
                border: 2px dashed var(--border-1);
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                gap: 10px;
                background: var(--bg-2);
                cursor: pointer;
            }
            .upload-img.has-image {
                padding: 0;
                border: none;
            }
            .upload-img.has-image:hover #options-button {
                opacity: 1;
            }
            #options-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: 100px;
                padding: var(--padding-2);
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.2s;
                z-index: 2;
            }
            #options-dialog {
                position: absolute;
                top: 50px;
                right: 10px;
                background: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius-large);
                padding: var(--padding-3);
                box-shadow: var(--drop-shadow);
                z-index: 3;
                display: none;
                flex-direction: column;
                gap: var(--gap-1);
            }
            .dialog-option {
                padding: var(--padding-w1);
                display: block;
                width: 100%;
                text-align: left;
                background: none;
                border: none;
                border-radius: var(--radius);
                cursor: pointer;
                color: var(--text-1);
            }
            .dialog-option:hover {
                background: var(--bg-2);
            }
            .border-toggle {
                display: flex;
                align-items: center;
                font-size: smaller;
            }
            .border-toggle input[type="checkbox"] {
                margin: 0;
            }
            .border-toggle label {
                cursor: pointer;
                padding-right: var(--gap-2);
            }
            #editable {
                outline: none;
                color: var(--text-2);
                font-size: 14px;
                text-align: left;
                line-height: 1.5;
                margin-top: var(--padding-3);
            }
            #file {
                display: none;
            }
            #upload-button {
                padding: var(--padding-w2);
                background-color: var(--bg-1);
                color: var(--text-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius);
                cursor: pointer;
            }
            img {
                max-width: 100%;
                border-radius: var(--radius);
                display: block;
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
            <div class="upload-img empty">
                ${
                    window.wisk.editor.wiskSite
                        ? `
                    <img src="" id="img-editable" alt="Uploaded image" />
                `
                        : `
                    <input type="file" id="file" accept="image/*" />
                    <img src="" id="img-editable" alt="Uploaded image" style="display: none;" />
                    <button id="upload-button">Upload Image</button>
                    <button id="options-button" style="display: none;">
                        <img src="/a7/forget/morex.svg" width="22" height="22" style="filter: var(--themed-svg);">
                    </button>
                    <div id="options-dialog">
                        <button class="dialog-option" id="change-image">Change Image</button>
                        <button class="dialog-option" id="fullscreen">View Full Size</button>
                        <div class="dialog-option border-toggle">
                            <label for="border-toggle">Show Border</label>
                            <input type="checkbox" id="border-toggle" />
                        </div>
                    </div>
                `
                }
            </div>
            <p id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder}"></p>
            <div class="emoji-suggestions"></div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }

    getTextContent() {
        const caption = this.editable.innerHTML.trim();
        const imageUrl = this.imageUrl || '';

        return {
            html: `<img src="${imageUrl}" alt="${caption}"/><p>${caption}</p>`,
            text: caption,
            markdown: `![${caption}](${imageUrl})${caption ? '\n\n' + caption : ''}`,
        };
    }
}

customElements.define('image-element', ImageElement);
