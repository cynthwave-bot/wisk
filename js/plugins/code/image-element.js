class ImageElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.render();
        this.isVirtualKeyboard = this.checkIfVirtualKeyboard();
        this.imageUrl = null;
        this.MAX_WIDTH = 1920;
        this.MAX_HEIGHT = 1080;
        this.loading = false;
        this.savedRange = null;
    }

    checkIfVirtualKeyboard() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    async onPluginLoad() {
        // Removed pica loading
    }

    connectedCallback() {
        this.editable = this.shadowRoot.querySelector("#editable");
        this.imageElement = this.shadowRoot.querySelector("#img-editable");
        this.fileInput = this.shadowRoot.querySelector("#file");
        this.uploadArea = this.shadowRoot.querySelector(".upload-img");
        this.uploadButton = this.shadowRoot.querySelector("#upload-button");
        this.bindEvents();
    }

    setValue(path, value) {
        if (path === "value.append") {
            this.editable.innerHTML += value.textContent;
        } else {
            this.editable.innerHTML = value.textContent;
            if (value.imageUrl) {
                this.imageUrl = value.imageUrl;
                this.updateImage();
            }
        }
    }

    getValue() {
        return {
            textContent: this.editable.innerHTML,
            imageUrl: this.imageUrl
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
                    'Authorization': 'Bearer ' + user.token
                }
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

    focus(identifier) {
        if (typeof identifier.x !== "number") {
            identifier.x = 0;
        }

        const textLength = this.editable.innerText.length;
        identifier.x = Math.max(0, Math.min(identifier.x, textLength));

        if (textLength === 0) {
            this.editable.focus();
            return;
        }

        const selection = this.shadowRoot.getSelection();
        const range = document.createRange();
        const node = this.editable.childNodes[0] || this.editable;
        range.setStart(node, identifier.x);
        range.setEnd(node, identifier.x);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    getFocus() {
        const sel = this.shadowRoot.getSelection();
        if (!sel.rangeCount) return 0;
        const range = sel.getRangeAt(0).cloneRange();
        range.setStart(this.editable, 0);
        return range.toString().length;
    }

    handleBeforeInput(event) {
        if (event.inputType === 'insertText' && event.data === '/') {
            event.preventDefault();
            window.wisk.editor.showSelector(this.id);
        }
    }

    handleKeyDown(event) {
        const keyHandlers = {
            'Enter': () => this.handleEnterKey(event),
            'Backspace': () => this.handleBackspace(event),
            'Tab': () => this.handleTab(event),
            'ArrowLeft': () => this.handleArrowKey(event, 'next-up', 0),
            'ArrowRight': () => this.handleArrowKey(event, 'next-down', this.editable.innerText.length),
            'ArrowUp': () => this.handleVerticalArrow(event, 'next-up'),
            'ArrowDown': () => this.handleVerticalArrow(event, 'next-down')
        };

        const handler = keyHandlers[event.key];
        if (handler) {
            handler();
        }
    }

    handleEnterKey(event) {
        event.preventDefault();
        window.wisk.editor.createNewBlock(this.id, "text-element", { textContent: "" }, { x: 0 });
    }

    handleBackspace(event) {
        if (this.getFocus() === 0 && this.editable.innerText.length === 0) {
            event.preventDefault();
            window.wisk.editor.deleteBlock(this.id);
        }
    }

    handleTab(event) {
        event.preventDefault();
        document.execCommand("insertText", false, "    ");
    }

    handleArrowKey(event, direction, targetOffset) {
        const pos = this.getFocus();
        if (pos === targetOffset) {
            event.preventDefault();
            const adjacentElement = direction === 'next-up' 
                ? window.wisk.editor.prevElement(this.id)
                : window.wisk.editor.nextElement(this.id);

            if (adjacentElement) {
                const componentDetail = window.wisk.plugins.getPluginDetail(adjacentElement.component);
                if (componentDetail.textual) {
                    const focusPos = direction === 'next-up' 
                        ? adjacentElement.value.textContent.length 
                        : 0;
                    window.wisk.editor.focusBlock(adjacentElement.id, { x: focusPos });
                }
            }
        }
    }

    handleVerticalArrow(event, direction) {
        const pos = this.getFocus();
        setTimeout(() => {
            const newPos = this.getFocus();
            if ((direction === 'next-up' && newPos === 0) || 
                (direction === 'next-down' && newPos === this.editable.innerText.length)) {
                const adjacentElement = direction === 'next-up'
                    ? window.wisk.editor.prevElement(this.id)
                    : window.wisk.editor.nextElement(this.id);

                if (adjacentElement) {
                    const componentDetail = window.wisk.plugins.getPluginDetail(adjacentElement.component);
                    if (componentDetail.textual) {
                        window.wisk.editor.focusBlock(adjacentElement.id, { x: pos });
                    }
                }
            }
        }, 0);
    }

    onValueUpdated() {
        this.sendUpdates();
    }

    sendUpdates() {
        setTimeout(() => {
            window.wisk.editor.justUpdates(this.id);
        }, 0);
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

        this.shadowRoot.querySelector("#upload-button").innerText = "Uploading...";

        try {
            // Create a blob URL for the file
            const blobUrl = URL.createObjectURL(file);
            
            // Resize the image before uploading
            const resizedBlob = await this.resizeImage(blobUrl, file.type);
            
            // Upload the resized image
            const url = await this.uploadToServer(resizedBlob);
            this.imageUrl = url;
            this.updateImage();
            this.sendUpdates();
            
            // Clean up the blob URL
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Failed to process image:', error);
            this.shadowRoot.querySelector("#upload-button").innerText = "Upload failed";
        } finally {
            this.loading = false;
            this.shadowRoot.querySelector("#upload-button").innerText = "Upload Image";
        }
    }

    resizeImage(src, fileType) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions considering both max width and height
                const widthRatio = width / this.MAX_WIDTH;
                const heightRatio = height / this.MAX_HEIGHT;

                if (widthRatio > 1 || heightRatio > 1) {
                    if (widthRatio > heightRatio) {
                        // Width is the constraining dimension
                        height = Math.round(height * (this.MAX_WIDTH / width));
                        width = this.MAX_WIDTH;
                    } else {
                        // Height is the constraining dimension
                        width = Math.round(width * (this.MAX_HEIGHT / height));
                        height = this.MAX_HEIGHT;
                    }
                }

                // Create temporary canvases for multi-step downsampling
                const steps = Math.ceil(Math.log2(Math.max(img.width / width, img.height / height)));
                let currentWidth = img.width;
                let currentHeight = img.height;
                let currentCanvas = document.createElement('canvas');
                let currentContext = currentCanvas.getContext('2d');

                // Initial canvas setup
                currentCanvas.width = img.width;
                currentCanvas.height = img.height;

                // Enable image smoothing
                currentContext.imageSmoothingEnabled = true;
                currentContext.imageSmoothingQuality = 'high';

                // Draw original image
                currentContext.drawImage(img, 0, 0);

                // Perform stepped downsampling for better quality
                for (let i = 0; i < steps; i++) {
                    const targetWidth = Math.max(width, Math.floor(currentWidth / 2));
                    const targetHeight = Math.max(height, Math.floor(currentHeight / 2));

                    const nextCanvas = document.createElement('canvas');
                    nextCanvas.width = targetWidth;
                    nextCanvas.height = targetHeight;

                    const nextContext = nextCanvas.getContext('2d');
                    nextContext.imageSmoothingEnabled = true;
                    nextContext.imageSmoothingQuality = 'high';

                    // Draw previous stage at new size
                    nextContext.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

                    // Update current values
                    currentCanvas = nextCanvas;
                    currentContext = nextContext;
                    currentWidth = targetWidth;
                    currentHeight = targetHeight;
                }

                // Final resize to exact dimensions if needed
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

                // Convert to blob
                currentCanvas.toBlob(
                    (blob) => resolve(blob),
                    fileType,
                    0.90
                );
            };

            img.onerror = reject;
            img.src = src;
        });
    }

    updateImage() {
        if (this.imageUrl) {
            this.imageElement.src = this.imageUrl;
            this.imageElement.style.display = "block";
            this.uploadArea.style.background = "none";
            this.fileInput.style.display = "none";
            this.uploadButton.style.display = "none";
        }
    }

    bindEvents() {
        this.editable.addEventListener('beforeinput', this.handleBeforeInput.bind(this));
        this.editable.addEventListener('input', this.onValueUpdated.bind(this));
        this.editable.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.fileInput.addEventListener("change", this.onImageSelected.bind(this));
        this.uploadArea.addEventListener("click", () => this.fileInput.click());
        this.uploadButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.fileInput.click();
        });
        this.editable.addEventListener("focus", () => {
            if (this.editable.innerText.trim() === "") {
                this.editable.classList.add("empty");
            }
        });
        this.editable.addEventListener("blur", () => {
            this.editable.classList.toggle('empty', this.editable.innerText.trim() === '');
        });

        // Handle drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.style.background = 'rgba(0, 123, 255, 0.1)';
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.style.background = 'repeating-linear-gradient(-45deg, #ddd, #ddd 5px, white 5px, white 10px)';
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.style.background = 'repeating-linear-gradient(-45deg, #ddd, #ddd 5px, white 5px, white 10px)';
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
                padding: 20px 0;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                gap: 10px;
                background: repeating-linear-gradient(-45deg, var(--bg-1), var(--bg-1) 5px, var(--bg-3) 5px, var(--bg-3) 10px);
                border-radius: var(--radius);
                cursor: pointer;
                position: relative;
            }
            #editable {
                outline: none;
                text-align: center;
                color: var(--text-2);
                font-size: 14px;
                text-align: left;
                line-height: 1.5;
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
            }
            </style>
        `;

        const content = `
            <div class="upload-img">
                ${window.wisk.editor.wiskSite ? `
                    <img src="" id="img-editable" alt="Uploaded image" />
                `:`
                    <input type="file" id="file" accept="image/*" />
                    <img src="" id="img-editable" alt="Uploaded image" />
                    <button id="upload-button">Upload Image</button>
                `}
            </div>
            <p id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false"></p>
        `;
        this.shadowRoot.innerHTML = style + content;
    }

    getTextContent() {
        const caption = this.editable.innerHTML.trim();
        const imageUrl = this.imageUrl || '';

        return {
            html: `<img src="${imageUrl}" alt="${caption}"/><p>${caption}</p>`,
            text: caption,
            markdown: `![${caption}](${imageUrl})${caption ? '\n\n' + caption : ''}`
        };
    }
}

customElements.define("image-element", ImageElement);
