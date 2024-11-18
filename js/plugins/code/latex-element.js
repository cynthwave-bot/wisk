import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

var katexReady = new Promise((resolve) => {
    if (window.katex) {
        resolve();
        return;
    }
    if (!document.querySelector('link[href*="katex"]')) {
        const katexCSS = document.createElement('link');
        katexCSS.rel = 'stylesheet';
        katexCSS.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
        document.head.appendChild(katexCSS);
    }
    if (!document.querySelector('script[src*="katex"]')) {
        const katexScript = document.createElement('script');
        katexScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
        katexScript.onload = () => resolve();
        document.head.appendChild(katexScript);
    }
});

class LatexElement extends LitElement {

    static styles = css`
        * {
            box-sizing: border-box;
            margin: 0px;
            padding: 0px;
            user-select: text;
            transition: background 0.2s, color 0.2s;
        }
        :host {
            display: block;
            position: relative;
        }
        .latex-container {
            border: none;
            padding: var(--padding-4);
            font-size: 21px;
        }
        .latex-container:hover {
            background: var(--bg-2);
            border-radius: var(--radius);
        }
        .error {
            color: var(--button-bg-red);
        }
        .edit-button {
            position: absolute;
            top: 8px;
            right: 8px;
            opacity: 0;
            transition: opacity 0.2s;
            background: var(--text-1);
            color: var(--bg-1);
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            ${window.wisk.editor.wiskSite ? css`display: none;` : ''}
        }
        :host(:hover) .edit-button {
            opacity: 1;
        }
        .dialog {
            background: var(--bg-3);
            padding: var(--padding-3);
            border-radius: var(--radius);
        }
        .dialog textarea {
            width: 100%;
            min-height: 100px;
            padding: var(--padding-3);
            color: var(--text-1);
            background: var(--bg-1);
            border-radius: var(--radius);
            font-family: var(--font-mono);
            font-size: 16px;
            resize: vertical;
            border: none;
            outline: none;
        }
        .dialog-buttons {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        .katex-html {
            display: none;
        }
        button {
            background: var(--bg-2);
            color: var(--text-1);
            border: none;
            padding: var(--padding-w1);
            border-radius: var(--radius);
            cursor: pointer;
        }
    `;

    static properties = {
        _latex: { type: String, state: true },
        error: { type: String },
        _showDialog: { type: Boolean, state: true },
    };

    constructor() {
        super();
        this._latex = '\\sum_{i=1}^n i = \\frac{n(n+1)}{2}';

        // if (new Date().getSeconds() % 2 === 1) {
        //     this._latex = '\\begin{gather*} x^n + y^n = z^n \\\\ n^i + c = e^{69} \\end{gather*}';
        // }

        this.backup = '';
        this.error = '';
        this._showDialog = false;
    }

    setValue(identifier, value) {
        if (!value || typeof value !== 'object') return;
        
        if (value.latex !== undefined) {
            this._latex = value.latex;
            this.backup = value.latex;
        }

        this.requestUpdate();
        this.updateLatex();
    }

    getValue() {
        var value = {
            latex: this._latex,
        };
        return value;
    }

    getTextContent() {
        return {
            html: "",
            text: "",
            markdown: '$$\n' + this._latex + '\n$$'
        }
    }

    sendUpdates() {
        setTimeout(() => {
            window.wisk.editor.justUpdates(this.id);
        }, 0);
    }

    async renderLatex() {
        const container = this.shadowRoot.querySelector('.latex-display');
        if (!container) return;
        try {
            await LatexElement.katexReady;
            container.innerHTML = '';
            window.katex.render(this._latex, container, {
                throwOnError: false,
                displayMode: true
            });
            this.error = '';
        } catch (e) {
            console.error('LaTeX Error:', e);
            this.error = `LaTeX Error: ${e.message}`;
        }
    }

    handleEdit() {
        this._showDialog = true;
    }

    handleSave() {
        const textarea = this.shadowRoot.querySelector('textarea');
        this._latex = textarea.value;
        this._showDialog = false;
        this.sendUpdates();
        this.requestUpdate();
        this.renderLatex();
    }

    handleCancel() {
        this._showDialog = false;
    }

    updated() {
        this.renderLatex();
    }

    updateLatex() {
        if (!this.shadowRoot.querySelector('textarea')) return;
        this._latex = this.shadowRoot.querySelector('textarea').value;
        this.renderLatex();
        this.requestUpdate();
    }

    handleReset() {
        this._latex = this.backup;
        this.requestUpdate();
        this.renderLatex();
    }

    render() {
        return html`
            <div class="latex-container">
                <div class="latex-display"></div>
                ${this.error ? html`<div class="error">${this.error}</div>` : ''}
                <button class="edit-button" @click=${this.handleEdit}>Edit</button>
            </div>

            ${this._showDialog ? html`
                <div class="dialog">
                    <textarea .value=${this._latex} @input=${this.updateLatex}></textarea>
                    <div class="dialog-buttons">
                        <button @click=${this.handleReset}>Reset</button>
                        <button @click=${this.handleCancel}>Cancel</button>
                        <button @click=${this.handleSave}>Save</button>
                    </div>
                </div>
            ` : ''}
        `;
    }
}

customElements.define("latex-element", LatexElement);
