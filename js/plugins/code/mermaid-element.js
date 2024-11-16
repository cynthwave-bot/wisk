import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

var mermaidReady = new Promise((resolve) => {
    if (window.mermaid) {
        resolve();
        return;
    }
    if (!document.querySelector('script[src*="mermaid"]')) {
        const mermaidScript = document.createElement('script');
        mermaidScript.src = '/a7/cdn/mermaid.min-11.4.0.js';
        mermaidScript.onload = () => {
            window.mermaid.initialize({ 
                startOnLoad: false,
                suppressErrors: true,
                suppressErrorRendering: true
            });
            resolve();
        };
        document.head.appendChild(mermaidScript);
    }
});

class MermaidElement extends LitElement {
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
        .mermaid-container {
            border: none;
            padding: var(--padding-4);
            font-size: 16px;
        }
        .mermaid-container:hover {
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
            min-height: 150px;
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
            margin-top: 8px;
        }
        button {
            background: var(--bg-2);
            color: var(--text-1);
            border: none;
            padding: var(--padding-w1);
            border-radius: var(--radius);
            cursor: pointer;
        }
        .mermaid-display {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;

    static properties = {
        _mermaid: { type: String, state: true },
        error: { type: String },
        _showDialog: { type: Boolean, state: true },
        _theme: { type: Object, state: true }
    };

    constructor() {
        super();
        this._mermaid = `graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]`;
        this.backup = '';
        this.error = '';
        this._showDialog = false;
        this._theme = window.wisk.theme.getThemeData(window.wisk.theme.getTheme());
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('themechange', (event) => {
            this._theme = event.detail.theme;
            this.requestUpdate();
            this.renderMermaid();
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('themechange', this.handleThemeChange);
    }

    getMermaidConfig() {
        if (!this._theme) return {};
        
        // TODO - Add more theme color variables
        return {
            theme: 'base',
            themeVariables: {
                primaryColor: this._theme['--button-bg-blue'],
                primaryTextColor: this._theme['--text-1'],
                primaryBorderColor: this._theme['--border-1'],
                lineColor: this._theme['--text-2'],
                secondaryColor: this._theme['--button-bg-normal'],
                tertiaryColor: this._theme['--button-bg-red'],
                fontFamily: this._theme['--font'].replace(/'/g, ''),
                fontSize: '16px',
                background: this._theme['--bg-2'],
                mainBkg: this._theme['--bg-2'],
                nodeBorder: this._theme['--border-1'],
                clusterBkg: this._theme['--bg-3'],
                clusterBorder: this._theme['--border-1'],
                titleColor: this._theme['--text-1'],
                edgeLabelBackground: this._theme['--bg-3'],
                textColor: this._theme['--text-1']
            }
        };
    }

    async renderMermaid() {
        const container = this.shadowRoot.querySelector('.mermaid-display');
        if (!container) return;

        try {
            await mermaidReady;
            
            window.mermaid.initialize({
                ...this.getMermaidConfig(),
                startOnLoad: false,
                suppressErrors: true,
                suppressErrorRendering: true
            });
            
            // Generate unique ID for this render
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
            
            // Use mermaid's render method to get SVG
            const { svg } = await window.mermaid.render(id, this._mermaid);
            
            // Insert the SVG into our container
            container.innerHTML = svg;
            
            this.error = '';
        } catch (e) {
            console.error('Mermaid Error:', e);
            this.error = `Mermaid Error: ${e.message}`;
            container.innerHTML = '';
        }
    }

    setValue(identifier, value) {
        if (!value || typeof value !== 'object') return;

        if (value.mermaid !== undefined) {
            this._mermaid = value.mermaid;
            this.backup = value.mermaid;
        }

        this._theme = window.wisk.theme.getThemeData(window.wisk.theme.getTheme());

        this.requestUpdate();
        this.updateMermaid();
    }

    getValue() {
        return {
            mermaid: this._mermaid,
        };
    }

    getTextContent() {
        return {
            html: "",
            text: "",
            markdown: '```mermaid\n' + this._mermaid + '\n```'
        }
    }

    sendUpdates() {
        setTimeout(() => {
            window.wisk.editor.justUpdates(this.id);
        }, 0);
    }

    handleEdit() {
        this._showDialog = true;
    }

    handleSave() {
        const textarea = this.shadowRoot.querySelector('textarea');
        this._mermaid = textarea.value;
        this._showDialog = false;
        this.sendUpdates();
        this.requestUpdate();
        this.renderMermaid();
    }

    handleCancel() {
        this._showDialog = false;
    }

    handleReset() {
        this._mermaid = this.backup;
        this.requestUpdate();
        this.renderMermaid();
    }

    updated() {
        this.renderMermaid();
    }

    updateMermaid() {
        if (!this.shadowRoot.querySelector('textarea')) return;
        this._mermaid = this.shadowRoot.querySelector('textarea').value;
        this.renderMermaid();
        this.requestUpdate();
    }

    render() {
        return html`
            <div class="mermaid-container">
                <div class="mermaid-display"></div>
                ${this.error ? html`<div class="error">${this.error}</div>` : ''}
                <button class="edit-button" @click=${this.handleEdit}>Edit</button>
            </div>

            ${this._showDialog ? html`
                <div class="dialog">
                    <textarea .value=${this._mermaid} @input=${this.updateMermaid}></textarea>
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

customElements.define("mermaid-element", MermaidElement);
