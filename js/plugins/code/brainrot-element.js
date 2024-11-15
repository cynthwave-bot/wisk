import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class BrainrotElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
        }
        * {
            position: fixed;
            bottom: 20px;
            right: 20px;
            max-width: calc(100vw - 40px);
            border-radius: var(--radius);
            filter: var(--drop-shadow);
            border: 1px solid var(--border-1);
            z-index: 30;
        }
        video {
            width: 420px;
        }
        button {
            padding: var(--padding-w2);
            background-color: var(--text-1);
            color: var(--bg-1);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            outline: none;
            font-weight: 500;
            filter: var(--drop-shadow);
        }
    `;

    static properties = {};

    constructor() {
        super();
        this.show = true;
    }

    toggleShow() {
        this.show = !this.show;
        this.requestUpdate();
    }

    render() {
        return html`
            ${this.show ? html`<video src="/a7/plugins/brainrot/subwaysurferspcgameplay.mp4" autoplay loop muted
                @click=${() => this.toggleShow()}></video>` :
                html`<button @click=${() => this.toggleShow()}>Show Brainrot</button>`
            }
        `;
    }
}

customElements.define("brainrot-element", BrainrotElement);

// add brainrot-element to dom using appendChild
document.body.appendChild(document.createElement("brainrot-element"));
