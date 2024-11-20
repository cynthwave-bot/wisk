import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class TweaksElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
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
    `;

    static properties = {};

    constructor() {
        super();
        this.images = [
            {
                src: "/a7/plugins/tweaks/pexels-codioful-7130469.jpg",
                text: "Photo by Codioful (formerly Gradienta)",
                link: "https://www.pexels.com/photo/multicolor-photo-7130469/",
            },
            {
                src: "/a7/plugins/tweaks/pexels-fotios-photos-1414573.jpg",
                text: "Photo by Lisa Fotios",
                link: "https://www.pexels.com/photo/gray-cloudy-sky-with-gray-clouds-1414573/",

            }
        ]
    }

    changeBackground(index) {
        document.body.style.backgroundColor = "transparent";
        document.body.style.background = `url(${this.images[index].src}) no-repeat center center fixed`;
        document.body.style.backgroundSize = "cover";
    }

    render() {
        return html`
            <div>
                <label for="tweaks">Background Image</label>

                <div class="bgs">
                    ${this.images.map((image, index) => html`
                        <button class="bg" @click="${() => this.changeBackground(index)}">
                            <img src="${image.src}" alt="${image.alt}" />
                            <a href="${image.link}" target="_blank"> ${image.text} </a>
                        </button>
                    `)}
                </div>
            </div>
        `;
    }
}

customElements.define("tweaks-element", TweaksElement);
