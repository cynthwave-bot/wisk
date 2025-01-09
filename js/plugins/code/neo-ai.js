import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class NeoAI extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
        }
        .i-container, .c-container {
            display: none;
            position: fixed;
            width: 100%;
            height: 100%;
            max-width: 500px;
            max-height: 700px;
            bottom: calc(var(--padding-4) * 2);
            right: calc(var(--padding-4) * 2);
            z-index: 1000;
            background-color: var(--bg-1);
            border-radius: var(--radius-large);
            filter: var(--drop-shadow);
            border: 1px solid var(--border-1);
            flex-direction: column;
            overflow: hidden;
        }
        .logo {
            background-color: var(--accent-bg);
            color: var(--accent-fg);
            border: 1px solid var(--accent-fg);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            outline: none;
            padding: var(--padding-3);

            position: fixed;
            bottom: calc(var(--padding-4) * 2);
            right: calc(var(--padding-4) * 2);
            font-size: 24px;
            cursor: pointer;

            display: none;
        }

        .active {
            display: flex;
        }
        .i-header {
            display: flex;
            justify-content: flex-end;
            padding: var(--padding-4);
            align-items: flex-end;
        }
        .i-content {
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow: auto;
            padding: var(--padding-4);
            gap: var(--gap-3);
        }
        .i-hx {
            font-size: 12px;
            font-weight: 500;
            color: var(--text-2);
        }
        .i-buttons {
            display: flex;
            flex-direction: column;
            padding-top: var(--padding-2);
            padding-bottom: var(--padding-3);
        }
        .i-action-button {
            display: flex;
            padding: var(--padding-w2);
            border: none;
            outline: none;
            background-color: transparent;
            gap: var(--gap-2);
            cursor: pointer;
            border-radius: 100px;
            opacity: 0.8;
        }
        .i-action-button:hover {
            opacity: 1;
            color: var(--accent-text);
            background-color: var(--accent-bg);
        }
        .i-action-button:hover .i-action-icon {
            filter: var(--accent-svg);
        }
        .i-input {
            display: flex;
            justify-content: center;
            padding: var(--padding-w2);
            margin: var(--padding-4);
            border-radius: 100px;
            border: 2px solid var(--border-1);
        }
        .i-inp {
            flex: 1;
            padding: var(--padding-2);
            border: none;
            outline: none;
            background-color: transparent;
            border-radius: var(--radius);
            flex: 1;
        }
        .i-btn {
            padding: var(--padding-2);
            border: none;
            outline: none;
            background-color: transparent;
            border-radius: 100px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .i-btn img {
            filter: var(--accent-svg);
        }
        .i-btn:hover {
            background-color: var(--accent-bg);
            color: var(--accent-text);
        }

        .i-input:has(.i-inp:focus) {
            border: 2px solid var(--accent-text);
            background-color: var(--accent-bg);
        }
        .close {
            padding: var(--padding-2);
            border: none;
            outline: none;
            background-color: transparent;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0.5;
        }
        .close img {
            filter: var(--themed-svg);
        }
        .close:hover {
            opacity: 1;
        }
    `;

    static properties = {
        view: { type: String },
    };

    constructor() {
        super();
        this.view = "logo";
        this.path = "/a7/plugins/neo-ai/"; // add .svg to the end of the path
        this.iContent = [
            {  "category": "Talk", "image": "summarize", "text": "Summarize", "text-2": "this page", "arg": "summarize" },
            {  "category": "Talk", "image": "ask", "text": "Ask about", "text-2": "this page", "arg": "ask-about" },
            {  "category": "Talk", "image": "translate", "text": "Translate page", "text-2": "", "arg": "translate" },
            {  "category": "More", "image": "help", "text": "What can Neo AI do?", "text-2": "", "arg": "help" },
            {  "category": "More", "image": "support", "text": "Get support", "text-2": "", "arg": "support" },
        ]
    }

    runArg(arg) {
        console.log(arg);
    }

    setView(view) {
        this.view = view;
    }

    render() {
        return html`
            <button class="logo ${this.view === 'logo' ? 'active' : ''}" @click=${() => this.setView("i-container")}>
                <img src="/a7/plugins/neo-ai/ai.svg" style="filter: var(--themed-svg);" draggable="false" />
            </button>

            <div class="logo-footer" style="display: none;">
                <div class="logo-input">
                    <input type="text" placeholder="Ask anything or give a command..." />
                    <button> Attach </button>
                    <button> Send </button>
                </div>
            </div>

            <div class="i-container ${this.view === 'i-container' ? 'active' : ''}">
                <div class="i-header">
                    <button class="close" @click=${() => this.setView("logo")}> <img src="${this.path}close.svg" draggable="false" /> </button>
                </div>
                <div class="i-content">
                    <div style="display: flex; flex-direction: column; gap: var(--gap-2); padding: var(--padding-4);">
                        <div style="width: 52px; border-radius: 100px; height: 52px; background-color: black;"></div>
                        <p class="text">
                            Hello! I am Neo AI. How can I help you today?
                        </p>
                    </div>

                    ${[...new Set(this.iContent.map(item => item.category))].map(category => html`
                        <div class="i-category">
                            <div class="i-hx">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                            <div class="i-buttons">
                                ${this.iContent
                                    .filter(item => item.category === category)
                                    .map(item => html`
                                        <button @click=${() => this.runArg(item.arg)} class="i-action-button">
                                            <img src="${this.path}${item.image}.svg" draggable="false" class="i-action-icon" />
                                            <span class="i-action-text">${item.text}</span>
                                        </button>
                                    `)
                                }
                            </div>
                        </div>
                    `)}

                </div>
                <div class="i-footer">
                    <div class="i-input">
                        <input class="i-inp" type="text" placeholder="Ask anything or give a command..." />
                        <button class="i-btn" style="display: none"> Attach </button>
                        <button class="i-btn"> <img src="${this.path}up.svg" draggable="false" /> </button>
                    </div>
                </div>
            </div>

            <div class="c-container ${this.view === 'c-container' ? 'active' : ''}">
                <div class="header">
                    <div class="title">
                        CHat
                    </div>
                    <div class="subtitle">
                        Artificial Intelligence
                    </div>
                    <button class="close" @click=${() => this.setView("logo")}> <img src="${this.path}close.svg" draggable="false" /> </button>
                </div>
                <div class="content">
                    <div class="input">
                        <input type="text" placeholder="Type your question here..." />
                    </div>
                    <div class="output">
                        <div class="response">
                            Response
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define("neo-ai", NeoAI);

document.querySelector(".editor").appendChild(document.createElement("neo-ai"));
