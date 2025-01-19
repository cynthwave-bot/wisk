import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class TweaksElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        .bgs {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            margin-top: 1rem;
        }
        .bg {
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
            display: block;
            overflow: hidden;
        }
        img {
            object-fit: cover;
            width: 200px;
            height: 120px;
        }
        a {
            color: var(--fg-blue);
            padding: var(--padding-w2);
            display: block;
        }
        input[type='file'] {
            display: none;
        }
        .upload-tile {
            width: 200px;
            height: 120px;
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        }
        .upload-tile:hover {
            background: var(--bg-2);
        }
        .plus-icon {
            width: 40px;
            height: 40px;
            border: 2px solid var(--fg-1);
            position: relative;
            margin-bottom: 8px;
        }
        .plus-icon::before,
        .plus-icon::after {
            content: '';
            position: absolute;
            background-color: var(--fg-1);
        }
        .plus-icon::before {
            width: 2px;
            height: 24px;
            left: 17px;
            top: 6px;
        }
        .plus-icon::after {
            width: 24px;
            height: 2px;
            top: 17px;
            left: 6px;
        }
        .upload-text {
            color: var(--fg-1);
            font-size: 0.9em;
        }
    `;

    static properties = {
        images: { type: Array },
        uploadedImages: { type: Array },
    };

    constructor() {
        super();
        this.images = [
            {
                src: '/a7/plugins/tweaks/pexels-codioful-7130469.jpg',
                text: 'Photo by Codioful (formerly Gradienta)',
                link: 'https://www.pexels.com/photo/multicolor-photo-7130469/',
            },
            {
                src: '/a7/plugins/tweaks/pexels-fotios-photos-1414573.jpg',
                text: 'Photo by Lisa Fotios',
                link: 'https://www.pexels.com/photo/gray-cloudy-sky-with-gray-clouds-1414573/',
            },
        ];
        this.uploadedImages = [];
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = e => {
                const newImage = {
                    src: e.target.result,
                    text: file.name,
                    link: null,
                    isUploaded: true,
                };
                this.uploadedImages = [...this.uploadedImages, newImage];
                this.requestUpdate();
            };
            reader.readAsDataURL(file);
        }
    }

    changeBackground(image) {
        document.body.style.backgroundColor = 'transparent';
        document.body.style.background = `url(${image.src}) no-repeat center center fixed`;
        document.body.style.backgroundSize = 'cover';
    }

    render() {
        const allImages = [...this.images, ...this.uploadedImages];

        return html`
            <div>
                <label for="tweaks">Background Image</label>
                <div class="bgs">
                    ${allImages.map(
                        image => html`
                            <button class="bg" @click="${() => this.changeBackground(image)}">
                                <img src="${image.src}" alt="${image.text}" />
                                ${image.link ? html`<a href="${image.link}" target="_blank">${image.text}</a>` : html`<a>${image.text}</a>`}
                            </button>
                        `
                    )}
                    <input type="file" id="imageUpload" accept="image/*" @change="${this.handleFileUpload}" />
                    <label for="imageUpload" class="bg upload-tile">
                        <div class="plus-icon"></div>
                        <span class="upload-text">Upload Image</span>
                    </label>
                </div>
            </div>
        `;
    }
}

customElements.define('tweaks-element', TweaksElement);
