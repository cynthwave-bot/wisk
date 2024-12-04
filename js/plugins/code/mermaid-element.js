import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

var mermaidReady = new Promise((resolve) => {
    if (window.mermaid) {
        resolve();
        return;
    }
    if (!document.querySelector('script[src*="mermaid"]')) {
        const mermaidScript = document.createElement('script');
        mermaidScript.src = '/a7/cdn/mermaid-11.4.0.min.js';
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
            color: var(--fg-red);
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
        this.backup = this._mermaid;
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
                // Primary elements
                primaryColor: this._theme['--fg-blue'],
                primaryTextColor: this._theme['--text-1'],
                primaryBorderColor: this._theme['--border-1'],

                // Lines and secondary elements
                lineColor: this._theme['--text-2'],
                secondaryColor: this._theme['--fg-green'],
                tertiaryColor: this._theme['--fg-red'],

                // Additional state colors
                successColor: this._theme['--fg-green'],
                successTextColor: this._theme['--text-1'],
                successBorderColor: this._theme['--border-1'],

                errorColor: this._theme['--fg-red'],
                errorTextColor: this._theme['--text-1'],
                errorBorderColor: this._theme['--border-1'],

                warningColor: this._theme['--fg-yellow'],
                warningTextColor: this._theme['--text-1'],
                warningBorderColor: this._theme['--border-1'],

                // Node colors
                purple: this._theme['--fg-purple'],
                orange: this._theme['--fg-orange'],
                cyan: this._theme['--fg-cyan'],

                // Background variations
                primaryBkg: this._theme['--bg-blue'],
                secondaryBkg: this._theme['--bg-green'],
                tertiaryBkg: this._theme['--bg-red'],

                // Special backgrounds
                highlightBackground: this._theme['--bg-yellow'],
                activeBackground: this._theme['--bg-blue'],

                // Font settings
                fontFamily: this._theme['--font'].replace(/'/g, ''),
                fontSize: '16px',

                // Main backgrounds
                background: this._theme['--bg-2'],
                mainBkg: this._theme['--bg-2'],

                // Borders and clusters
                nodeBorder: this._theme['--border-1'],
                clusterBkg: this._theme['--bg-3'],
                clusterBorder: this._theme['--border-1'],

                // Text elements
                titleColor: this._theme['--text-1'],
                edgeLabelBackground: this._theme['--bg-3'],
                textColor: this._theme['--text-1'],

                // Node types
                classText: this._theme['--text-1'],
                relationColor: this._theme['--fg-purple'],

                // Git graph colors
                git0: this._theme['--fg-green'],
                git1: this._theme['--fg-blue'],
                git2: this._theme['--fg-red'],
                git3: this._theme['--fg-purple'],
                git4: this._theme['--fg-orange'],
                git5: this._theme['--fg-cyan'],
                git6: this._theme['--fg-yellow'],
                git7: this._theme['--fg-black'],

                gitInv0: this._theme['--text-1'],
                gitInv1: this._theme['--text-1'],
                gitInv2: this._theme['--text-1'],
                gitInv3: this._theme['--text-1'],
                gitInv4: this._theme['--text-1'],
                gitInv5: this._theme['--text-1'],
                gitInv6: this._theme['--text-1'],
                gitInv7: this._theme['--text-1'],

                // Sequence diagram
                actorBorder: this._theme['--fg-blue'],
                actorBkg: this._theme['--bg-blue'],
                actorTextColor: this._theme['--text-1'],
                actorLineColor: this._theme['--fg-grey'],

                noteBkgColor: this._theme['--bg-yellow'],
                noteBorderColor: this._theme['--fg-yellow'],
                noteTextColor: this._theme['--text-1'],

                activationBorderColor: this._theme['--fg-red'],
                activationBkgColor: this._theme['--bg-red'],

                sequenceNumberColor: this._theme['--text-2'],

                // State diagram
                labelColor: this._theme['--text-1'],
                altBackground: this._theme['--bg-3'],

                // Journey diagram
                fillType0: this._theme['--bg-green'],
                fillType1: this._theme['--bg-blue'],
                fillType2: this._theme['--bg-red'],
                fillType3: this._theme['--bg-purple'],
                fillType4: this._theme['--bg-yellow'],
                fillType5: this._theme['--bg-cyan'],
                fillType6: this._theme['--bg-orange'],
                fillType7: this._theme['--bg-black'],

                // Mindmap specific
                nodeBackgroundColor: this._theme['--bg-2'],
                nodeBorderColor: this._theme['--border-1'],
                mindmapBackground: this._theme['--bg-1'],

                // Section colors for mindmap
                section0: this._theme['--bg-blue'],
                section1: this._theme['--bg-green'],
                section2: this._theme['--bg-red'],
                section3: this._theme['--bg-purple'],
                section4: this._theme['--bg-yellow'],
                section5: this._theme['--bg-cyan'],
                section6: this._theme['--bg-orange'],
                section7: this._theme['--bg-black'],

                // Quadrant colors
                quadrant1Fill: this._theme['--bg-green'],
                quadrant2Fill: this._theme['--bg-red'],
                quadrant3Fill: this._theme['--bg-yellow'],
                quadrant4Fill: this._theme['--bg-blue'],
                quadrantPointFill: this._theme['--bg-3'],

                quadrant1TextFill: this._theme['--text-1'],
                quadrant2TextFill: this._theme['--text-1'],
                quadrant3TextFill: this._theme['--text-1'],
                quadrant4TextFill: this._theme['--text-1'],
                quadrantPointTextFill: this._theme['--text-1'],

                // Mindmap fixes
                // TODO mindmap colors needs some fixing
                mindmapNodeBackgroundColor: this._theme['--bg-2'],
                mindmapNodeBorderColor: this._theme['--border-1'],
                mindmapNodeTextColor: this._theme['--bg-1'],
                mindmapLinkColor: this._theme['--bg-2'],
                mindmapTitleBackgroundColor: this._theme['--bg-3'],
                mindmapTitleTextColor: this._theme['--bg-1'],

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
                <button class="edit-button" style="${window.wisk.editor.wiskSite ? 'display: none;' : ''}}" @click=${this.handleEdit}>Edit</button>
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
