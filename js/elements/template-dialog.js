import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class TemplateDialog extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            transition: all 0.3s ease;
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
            padding: calc(var(--padding-4) * 2);
            border-radius: var(--radius-large);
            border: 1px solid var(--border-1);
            filter: var(--drop-shadow) var(--drop-shadow);
            max-width: 1400px;
            max-height: 700px;
            height: 90%;
            width: 90%;
            position: relative;
            z-index: 1000;
            transform: translateZ(0);
        }

        @media (max-width: 768px) {
            .dialog-content {
                padding: var(--padding-4);
                height: 90%;
                width: 100%;
                border-radius: 0;
                border-top-left-radius: var(--radius-large);
                border-top-right-radius: var(--radius-large);
                top: 5%;
                left: 0;
            }

            @starting-style {
                .dialog-content {
                    top: 30%;
                    opacity: 0;
                }
            }
        }

        @starting-style {
            .dialog-content {
                opacity: 0;
            }
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

        .input-description {
            color: var(--text-2);
        }

        *::-webkit-scrollbar { width: 15px; }
        *::-webkit-scrollbar-track { background: var(--bg-1); }
        *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
        *::-webkit-scrollbar-thumb:hover { background-color: var(--text-1); }
    `;

    static properties = {
        visible: { type: Boolean }
    };

    constructor() {
        super();
        this.visible = false;
    }

    show() {
        this.visible = true;
        this.requestUpdate();
    }

    hide() {
        this.visible = false;
        this.requestUpdate();
    }

    render() {
        return html`
            <div class="dialog-overlay" style="display: ${this.visible ? "flex" : "none"}">
                <div class="dialog-content">
                    <button class="dialog-close" @click=${this.hide}>
                        <img src="/a7/forget/x.svg" alt="Close" style="filter: var(--themed-svg)" />
                    </button>
                    <h2 class="dialog-title">Templates</h2>
                    <p class="input-description">uwu ~~</p>
                </div>
            </div>
        `;
    }
}

customElements.define("template-dialog", TemplateDialog);
