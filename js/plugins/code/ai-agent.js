import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class AiAgent extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
        }
    `;

    static properties = {};

    constructor() {
        super();
    }

    render() {
        return html`

        `;
    }
}

customElements.define("ai-agent", AiAgent);
