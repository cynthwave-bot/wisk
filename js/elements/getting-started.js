import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class GettingStarted extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
        }
        #getting-started {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }
        .gs-button {
            padding: var(--padding-w2);
            border-radius: 100px;
            background-color: var(--accent-bg);
            border: none;
            color: var(--accent-text);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--gap-2);
            outline: none;
            font-size: 15px;
        }
        .gs-button img {
            width: 20px;
            filter: var(--accent-svg);
        }
        .gs-button:hover {
            background-color: var(--bg-2);
        }
        #tip {
            color: var(--text-2); 
            pointer-events: none;
            font-size: 0.9rem;
            margin-top: 20px;
        }
        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 999;
        }
        .dialog-content {
            background: var(--bg-1);
            padding: var(--padding-4);
            border-radius: var(--radius-large);
            border: 1px solid var(--border-1);
            filter: var(--drop-shadow) var(--drop-shadow);
            max-width: 1200px;
            max-height: 700px;
            height: 80%;
            width: 80%;
            overflow-y: auto;
            position: relative;
            z-index: 1000;
        }
        .dialog-close {
            position: absolute;
            top: var(--padding-3);
            right: var(--padding-3);
            display: flex;
            width: 24px;
            height: 24px;
            background: none;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            color: var(--text-1);
            font-size: 1.5rem;
            align-items: center;
            justify-content: center;
        }
        .dialog-close:hover {
            background: var(--bg-3);
        }
        .dialog-title {
            font-size: 1.5rem;
            margin-bottom: var(--gap-3);
            color: var(--text-1);
        }
    `;

    static properties = {
        activeDialog: { type: String }
    };

    constructor() {
        super();
        this.tips = [
            "You can use the command palette by pressing Ctrl+e or Cmd+e",
            "You can create and install plugins to extend the functionality of your editor",
            "You can create and use custom themes to personalize your editor",
            "When AI Chat gets too long, clear the chat by clicking the Clear Chat button, that'll improve the results",
        ];
        this.activeDialog = null;
    }

    updated() {
        this.shadowRoot.getElementById("tip").innerText = "Tip: " + this.tips[Math.floor(Math.random() * this.tips.length)];
    }

    showDialog(type) {
        this.activeDialog = type;
        this.requestUpdate();
    }

    closeDialog() {
        this.activeDialog = null;
        this.requestUpdate();
    }

    renderDraftAnythingDialog() {
        return html`
            <div class="dialog-content">
                <button class="dialog-close" @click=${this.closeDialog}>&times;</button>
                <h2 class="dialog-title">Draft Anything</h2>
                <!-- Content will go here -->
            </div>
        `;
    }

    renderOutlineDialog() {
        return html`
            <div class="dialog-content">
                <button class="dialog-close" @click=${this.closeDialog}>&times;</button>
                <h2 class="dialog-title">Draft an Outline</h2>
                <!-- Content will go here -->
            </div>
        `;
    }

    renderBrainstormDialog() {
        return html`
            <div class="dialog-content">
                <button class="dialog-close" @click=${this.closeDialog}>&times;</button>
                <h2 class="dialog-title">Brainstorm Ideas</h2>
                <!-- Content will go here -->
            </div>
        `;
    }

    renderTopicsDialog() {
        return html`
            <div class="dialog-content">
                <button class="dialog-close" @click=${this.closeDialog}>&times;</button>
                <h2 class="dialog-title">Topics to Cover</h2>
                <!-- Content will go here -->
            </div>
        `;
    }

    renderImportDialog() {
        return html`
            <div class="dialog-content">
                <button class="dialog-close" @click=${this.closeDialog}>&times;</button>
                <h2 class="dialog-title">Import from File</h2>
                <!-- Content will go here -->
            </div>
        `;
    }

    renderHelpDialog() {
        return html`
            <div class="dialog-content">
                <button class="dialog-close" @click=${this.closeDialog}>&times;</button>
                <h2 class="dialog-title">Help</h2>
                <!-- Content will go here -->
            </div>
        `;
    }

    render() {
        return html`
            <div id="getting-started">
                <div style="display: flex; gap: var(--gap-3); flex-wrap: wrap; align-items: center;">
                    Get started with 
                    <div style="display: flex; gap: var(--gap-2); flex-wrap: wrap">
                        <button class="gs-button" @click=${() => this.showDialog('draft')}> 
                            <img src="/a7/forget/gs-draft-anything.svg" alt=""/> Draft anything 
                        </button>
                        <button class="gs-button" @click=${() => this.showDialog('outline')}> 
                            <img src="/a7/forget/gs-draft-outline.svg" alt=""/> Draft an outline 
                        </button>
                        <button class="gs-button" @click=${() => this.showDialog('brainstorm')}> 
                            <img src="/a7/forget/gs-brainstorm.svg" alt=""/> Brainstorm Ideas 
                        </button>
                        <button class="gs-button" @click=${() => this.showDialog('topics')}> 
                            <img src="/a7/forget/gs-cover.svg" alt=""/> Topics to cover 
                        </button>
                        <button class="gs-button" @click=${() => this.showDialog('import')}> 
                            <img src="/a7/forget/gs-import.svg" alt=""/> Import from file 
                        </button>
                        <button class="gs-button" @click=${() => this.showDialog('help')}> 
                            <img src="/a7/forget/gs-help.svg" alt=""/> Help 
                        </button>
                    </div>
                </div>
                <p id="tip"></p>

                <div class="dialog-overlay" style="display: ${this.activeDialog ? 'flex' : 'none'}">
                    ${this.activeDialog === 'draft' ? this.renderDraftAnythingDialog() : ''}
                    ${this.activeDialog === 'outline' ? this.renderOutlineDialog() : ''}
                    ${this.activeDialog === 'brainstorm' ? this.renderBrainstormDialog() : ''}
                    ${this.activeDialog === 'topics' ? this.renderTopicsDialog() : ''}
                    ${this.activeDialog === 'import' ? this.renderImportDialog() : ''}
                    ${this.activeDialog === 'help' ? this.renderHelpDialog() : ''}
                </div>
            </div>
        `;
    }
}

customElements.define("getting-started", GettingStarted);
