import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class NeoAI extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            scroll-behavior: smooth;
        }
        :host {
        }
        .i-container, .c-container {
            display: none;
            position: fixed;
            width: 100%;
            height: 100%;
            max-width: min(500px, calc(100% - calc(var(--padding-4) * 4)));
            max-height: min(800px, calc(100% - calc(var(--padding-4) * 8)));
            bottom: calc(var(--padding-4) * 2);
            right: calc(var(--padding-4) * 2);
            z-index: 1000;
            background-color: var(--bg-1);
            border-radius: var(--radius-large);
            filter: var(--drop-shadow);
            border: 1px solid var(--border-1);
            flex-direction: column;
            overflow: hidden;
            z-index: 1000;
            transition: all 0.3s;
        }

        @starting-style {
            .i-container {
                opacity: 0;
                padding: 0;
                bottom: 0;
            }
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
            transition: transform 0.3s;
            border: 1px solid var(--border-1);
        }
        .logo:hover {
            transform: rotate(90deg) scale(1.1);
        }

        .active {
            display: flex;
        }
        .i-header, .c-header {
            display: flex;
            justify-content: flex-end;
            padding: var(--padding-4);
            align-items: center;
        }
        .i-content, .c-content {
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

        .c-hx {
            font-size: 18px;
            font-weight: 500;
            color: var(--text-2);
            flex: 1;
            display: flex;
            align-items: center;
        }
        .i-buttons, .c-buttons {
            display: flex;
            flex-direction: column;
            padding-top: var(--padding-2);
            padding-bottom: var(--padding-3);
        }
        .i-action-button, .c-action-button {
            display: flex;
            padding: var(--padding-w2);
            border: none;
            outline: none;
            background-color: transparent;
            gap: var(--gap-2);
            cursor: pointer;
            border-radius: 100px;
            opacity: 0.8;
            color: var(--text-1);
        }
        .i-action-button:hover, .c-action-button:hover {
            opacity: 1;
            color: var(--accent-text);
            background-color: var(--accent-bg);
        }
        .i-action-icon, .c-action-icon {
            filter: var(--themed-svg);
        }
        .i-action-button:hover .i-action-icon, .c-action-button:hover .c-action-icon {
            filter: var(--accent-svg);
        }
        .i-input, .c-input {
            display: flex;
            justify-content: center;
            padding: var(--padding-w2);
            margin: var(--padding-4);
            border-radius: 100px;
            border: 2px solid var(--border-1);
        }
        .i-inp, .c-inp {
            flex: 1;
            padding: var(--padding-2);
            border: none;
            outline: none;
            background-color: transparent;
            border-radius: var(--radius);
            flex: 1;
            color: var(--text-1);
        }
        .i-btn, .c-btn {
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
        .i-btn img, .c-btn img {
            filter: var(--themed-svg);
        }
        .i-btn:hover, .c-btn:hover {
        }

        .i-input:has(.i-inp:focus), .c-input:has(.c-inp:focus) {
            border: 2px solid var(--accent-text);
            background-color: var(--accent-bg);
        }

        .i-input:has(.i-inp:focus) .i-btn, .c-input:has(.c-inp:focus) .c-btn {
            filter: var(--accent-svg);
        }
        .close, .expand {
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
        .close img, .expand img {
            filter: var(--themed-svg);
        }
        .close:hover, .expand:hover {
            opacity: 1;
        }
        .message-container {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            padding: var(--padding-4);
            font-size: 15px;
        }

        .message {
            display: flex;
            gap: var(--gap-2);
            max-width: 85%;
        }

        .message.user {
            flex-direction: row-reverse;
            align-self: flex-end;
        }

        .message-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: var(--accent-bg);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .message.user .message-avatar {
            background-color: var(--bg-2);
        }

        .message-content {
            display: flex;
            flex-direction: column;
            gap: var(--gap-1);
        }

        .message-bubble {
            background-color: var(--bg-2);
            padding: var(--padding-3);
            border-radius: var(--radius);
            color: var(--text-1);
        }

        .message.user .message-bubble {
            background-color: var(--accent-bg);
            color: var(--accent-text);
        }

        .message.info .message-bubble {
            background-color: var(--bg-1);
            border: 1px solid var(--border-1);
            color: var(--text-2);
        }

        .message-time {
            font-size: 12px;
            color: var(--text-2);
            align-self: flex-end;
        }

        *::-webkit-scrollbar { width: 15px; }
        *::-webkit-scrollbar-track { background: var(--bg-1); }
        *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
        *::-webkit-scrollbar-thumb:hover { background-color: var(--text-1); }

        ::-webkit-input-placeholder { color: var(--text-2); }

        @media (max-width: 500px) {
            .message-container {
                padding: 0;
            }
            .i-container, .c-container {
                bottom: var(--padding-4);
                right: var(--padding-4);
                max-width: calc(100% - var(--padding-4) * 2);
                max-height: calc(100% - var(--padding-4) * 2);
            }
        }

        .expanded-container {
            max-width: 100%;
            max-height: 100%;
            bottom: 0;
            right: 0;
            border-radius: 0;
            border: none;
            padding: 0 calc((100% - 1000px) / 2);
        }

        .logo-bubble {
            display: flex;
            flex-direction: row-reverse;
            position: fixed;
            bottom: calc(var(--padding-4)* 2 + 69px); /* nice */
            right: calc(var(--padding-4)* 2);
            background-color: var(--bg-3);
            padding: var(--padding-3);
            border-radius: var(--radius-large);
            border: 3px solid var(--bg-3);
            filter: var(--drop-shadow);
            animation: 0.3s ease-in-out 0s 1 normal none running fadeIn;
            z-index: 999;
            color: white;
            align-items: center;
            animation: borderFlicker 62s infinite;
            transition: all 0.3s;
        }

        .logo-bubble::after {
            content: '';
            position: absolute;
            bottom: -12px;
            right: 13px;
            width: 0;
            height: 0;
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            border-top: 12px solid var(--bg-3);
        }

        @keyframes borderFlicker {
            0%, 96.77% {
                filter: invert(0);
            }
            97%, 100% {
                filter: invert(1);
            }
        }

        .logo-bubble-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo-bubble-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            opacity: 0.5;
            display: flex;
            align-items: center;
        }

        .logo-bubble-close:hover {
            opacity: 1;
        }

        .logo-bubble-close img {
            width: 18px;
            height: 18px;
            filter: var(--themed-svg);
        }

        .logo-bubble-content {
            color: var(--text-1);
            font-weight: 500;
            cursor: pointer;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

    `;

    static properties = {
        view: { type: String },
        expanded: { type: Boolean },
        selectedElementId: { type: String },
        selectedText: { type: String },
        showLogoBubble: { type: Boolean },
    };




    constructor() {
        super();
        this.expanded = false;

        this.selectedElementId = "";
        this.selectedText = "";

        this.view = "logo";
        this.path = "/a7/plugins/neo-ai/"; // add .svg to the end of the path
        this.iContent = [
            {  "category": "Talk", "image": "summarize", "text": "Summarize", "text-2": "this page", "arg": "summarize" },
            {  "category": "Talk", "image": "ask", "text": "Ask about", "text-2": "this page", "arg": "ask-about" },
            {  "category": "Talk", "image": "translate", "text": "Translate page", "text-2": "", "arg": "translate" },
            {  "category": "More", "image": "more", "text": "What can Neo do?", "text-2": "", "arg": "more" },
            {  "category": "More", "image": "help", "text": "Help", "text-2": "", "arg": "help" },
            {  "category": "More", "image": "support", "text": "Get support", "text-2": "", "arg": "support" },
        ];
        this.messages = {
            chat: [
                { from: "bot", text: "Hello! I am Neo. How can I help you today?", type: "text" },
                { from: "user", text: "Summarize this page", type: "text" },
                { from: "bot", text: "Reading the page...", type: "info" },
                { from: "bot", text: "Sure! Here is the summary of this page...", type: "text" },
            ],
        }
        this.showLogoBubble = true;
    }

    setSelection(elementId, text) {
        this.selectedElementId = elementId;
        this.selectedText = text;
    }

    runArg(arg) {
        console.log(arg);
    }

    setView(view) {
        this.view = view;
    }

    expandDialog() {
        this.view = "i-container";
    }
    
    sendClicked() {
        console.log("Send clicked", this.shadowRoot.querySelector(".i-inp").value);
        this.setView("c-container");
    }

    closeLogoBubble() {
        this.showLogoBubble = false;
    }

    async addUserMessage(message) {
        if (!message.trim()) return;
        
        this.messages.chat.push({ from: "user", text: message, type: "text" });
        this.shadowRoot.querySelector(".c-inp").value = "";
        
        await this.requestUpdate()

        const container = this.shadowRoot.querySelector(".c-content");
        const messageContainer = this.shadowRoot.querySelector(".message-container");
        if (container && messageContainer) {
            container.scrollTop = messageContainer.scrollHeight;
        }
    }

    expandClicked() {
        this.expanded = !this.expanded;
    }

    render() {
        if (wisk.editor.wiskSite) {
            return html``;
        }

        return html`
            ${this.showLogoBubble && this.view === 'logo' ? html`
                <div class="logo-bubble">
                    <div class="logo-bubble-header">
                        <button class="logo-bubble-close" @click=${() => this.closeLogoBubble()}>
                            <img src="${this.path}close.svg" draggable="false" />
                        </button>
                    </div>
                    <div class="logo-bubble-content" @click=${() => this.setView("i-container")}>
                        Hello! I'm Neo. How can I help you?
                    </div>
                </div>
            ` : ''}


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

            <div class="i-container ${this.view === 'i-container' ? 'active' : ''} ${this.expanded ? 'expanded-container' : ''}">
                <div class="i-header">
                    <button class="expand" @click=${() => this.expandClicked()}> <img src="${this.path}${this.expanded ? 'collapse' : 'expand'}.svg" draggable="false" /> </button>
                    <button class="close" @click=${() => this.setView("logo")}> <img src="${this.path}close.svg" draggable="false" /> </button>
                </div>
                <div class="i-content">
                    <div style="display: flex; flex-direction: column; gap: var(--gap-2); padding: var(--padding-4);">
                        <div style="width: 52px; border-radius: 100px; height: 52px; background-color: var(--text-1);"></div>
                        <p class="text">
                            Hello! I am Neo. How can I help you today?
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
                        <button class="i-btn"> <img src="${this.path}up.svg" draggable="false" @click=${() => this.sendClicked()} /> </button>
                    </div>
                </div>
            </div>

            <div class="c-container ${this.view === 'c-container' ? 'active' : ''} ${this.expanded ? 'expanded-container' : ''}">
                <div class="c-header">
                    <p class="c-hx"><span style="color: var(--text-1); height: 24px; width: 24px; display: inline-block; background-color: var(--text-1); border-radius: 100px; margin-right: var(--gap-2);"></span> Neo</p>
                    <button class="expand" @click=${() => this.expandClicked()}> <img src="${this.path}${this.expanded ? 'collapse' : 'expand'}.svg" draggable="false" /> </button>
                    <button class="close" @click=${() => this.setView("logo")}> <img src="${this.path}close.svg" draggable="false" /> </button>
                </div>
                <div class="c-content">
                    <div class="message-container">
                        ${this.messages.chat.map(message => html`
                            <div class="message ${message.from} ${message.type}">
                                
                                ${message.from === 'bot' 
                                    ? html`<div class="message-avatar">
                                               <img src="${this.path}ai.svg" style="filter: var(--themed-svg); width: 24px; height: 24px;" draggable="false" />
                                           </div>
                                    ` : html``
                                }
                                
                                <div class="message-content">
                                    <div class="message-bubble">
                                        ${message.text}
                                    </div>
                                </div>
                            </div>
                        `)}
                    </div>

                </div>
                <div class="c-footer">
                    <div class="c-input">
                        <input class="c-inp" type="text" 
                            placeholder="Ask anything or give a command..." @keyup=${e => e.key === "Enter" ? this.addUserMessage(e.target.value) : null} />
                        <button class="c-btn" style="display: none"> Attach </button>
                        <button class="c-btn"> 
                            <img src="${this.path}up.svg" draggable="false" 
                                @click=${async () => this.addUserMessage(this.shadowRoot.querySelector(".c-inp").value)} /> 
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define("neo-ai", NeoAI);

document.querySelector(".editor").appendChild(document.createElement("neo-ai"));
