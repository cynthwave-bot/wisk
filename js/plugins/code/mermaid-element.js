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
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        :host {
            display: block;
            position: relative;
        }
        .mermaid-container {
            border: none;
            padding: var(--padding-4);
            font-size: 16px;
            border-radius: var(--radius);
        }
        .mermaid-container:hover {
            background: var(--bg-2);
        }
        .error {
            color: var(--fg-red);
            margin-top: var(--padding-2);
            font-size: 14px;
        }
        .edit-button {
            position: absolute;
            top: var(--padding-3);
            right: var(--padding-3);
            opacity: 0;
            transition: opacity 0.15s ease;
            background: var(--bg-2);
            color: var(--text-1);
            border: 1px solid var(--bg-3);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }
        :host(:hover) .edit-button {
            opacity: 1;
        }
        .dialog {
            background: var(--bg-1);
            padding: var(--padding-4);
            border-radius: var(--radius-large);
            border: 1px solid var(--bg-3);
            margin-top: var(--padding-3);
            filter: var(--drop-shadow);
            padding-bottom: calc(var(--padding-4) - var(--padding-3));
        }
        textarea {
            width: 100%;
            padding: var(--padding-3);
            color: var(--text-1);
            background: var(--bg-2);
            border-radius: var(--radius);
            font-family: var(--font-mono);
            font-size: 14px;
            resize: vertical;
            border: 1px solid var(--bg-3);
            transition: border-color 0.15s ease;
            outline: none;
        }
        textarea:focus {
            border-color: var(--bg-3);
        }
        .dialog-buttons {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            margin-top: var(--padding-3);
        }
        .ai-input-container {
            display: flex;
            flex-direction: column;
            gap: var(--padding-3);
        }
        .loading-spinner {
            width: 24px;
            height: 24px;
            border: 3px solid var(--accent-text);
            border-radius: 50%;
            border-top-color: var(--accent-bg);
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .button {
            background: transparent;
            color: var(--text-1);
            border: none;
            padding: var(--padding-2);
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.15s ease;
        }
        .primary-button {
            background: transparent;
            color: var(--accent-text);
            border: none;
            font-weight: 600;
        }
        .primary-button:hover {
            background: var(--accent-bg);
            border: none;
        }
        .inner-buttons {
            padding: var(--padding-3);
        }
        .inner-buttons:hover {
            background-color: var(--bg-2);
        }
        .inner-buttons img {
            width: 22px;
            height: 22px;
            filter: var(--themed-svg);
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
        _theme: { type: Object, state: true },
        readOnly: { type: Boolean, reflect: true, attribute: 'read-only' },
        _showAiInput: { type: Boolean, state: true },
        _showCodeEditor: { type: Boolean, state: true },
        _isLoading: { type: Boolean, state: true },
        _aiSuggestion: { type: String, state: true },
        _showAiSuggestion: { type: Boolean, state: true }
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
        this.readOnly = false;
        this._showAiInput = false;
        this._showCodeEditor = false;
        this._isLoading = false;
        this._aiSuggestion = '';
        this._showAiSuggestion = false;
        this.temp1 = true; // dont ask cuz i dont know
    }

    async handleEdit() {
        this._showAiInput = true;
        this._showCodeEditor = false;
        await this.requestUpdate();
        const textarea = this.shadowRoot.querySelector('.ai-input');
        if (textarea) {
            textarea.focus();
        }
    }

    async handleAiUpdate() {
        try {
            var user = await document.querySelector("auth-component").getUserInfo();
            var token = user.token;
            
            this._isLoading = true;
            this.requestUpdate();

            const aiPrompt = this.shadowRoot.querySelector('.ai-input').value;
            
            var response = await fetch("https://cloud.wisk.cc/v2/plugins/mermaid", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    command: aiPrompt,
                    mermaid: this._mermaid
                }),
            });

            this._isLoading = false;
            
            if (response.status !== 200) {
                window.showToast("Error updating diagram", 5000);
                return;
            }

            var mermaidContent = await response.text();
            
            let inCodeBlock = false;
            const lines = mermaidContent.split('\n');
            const contentLines = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('```')) {
                    inCodeBlock = !inCodeBlock;
                    continue;
                }
                if (inCodeBlock) {
                    contentLines.push(line);
                }
            }

            mermaidContent = contentLines.join('\n');
            mermaidContent = mermaidContent.replace(/```/g, '');
            
            await this.updateComplete;
            this._aiSuggestion = mermaidContent;
            this._showAiSuggestion = true;
        } catch (error) {
            console.error('Error:', error);
            window.showToast("Error updating diagram", 5000);
            this._isLoading = false;
            this.requestUpdate();
        }
    }

    handleShowCodeEditor() {
        this._showCodeEditor = true;
        this._showAiInput = false;
    }

    handleAcceptAiChanges() {
        this._mermaid = this._aiSuggestion;
        this.backup = this._aiSuggestion;
        this._showAiSuggestion = false;
        this._showAiInput = false;
        this.sendUpdates();
        this.requestUpdate();
        this.renderMermaid();
    }

    handleRejectAiChanges() {
        this._showAiSuggestion = false;
        this._aiSuggestion = '';
        this.renderMermaid();
    }

    handleCancel() {
        this._showAiInput = false;
        this._showCodeEditor = false;
        this._showAiSuggestion = false;
        this._aiSuggestion = '';
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

    setReadOnlyMermaidData(mermaidCode) {
        if (this.readOnly) {
            this._mermaid = mermaidCode;
            this.requestUpdate();
            this.renderMermaid();
        }
    }

    getMermaidConfig() {
        if (!this._theme) return {};
        
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
            console.log('Rendering Mermaid:', id);
            
            // Use mermaid's render method to get SVG
            const { svg } = await window.mermaid.render(id, this._showAiSuggestion ? this._aiSuggestion : this._mermaid);
            
            // Insert the SVG into our container
            container.innerHTML = svg;
            
            this.error = '';
            console.log('Mermaid Rendered:', id);
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

    handleSave() {
        const textarea = this.shadowRoot.querySelector('.code-editor');
        if (textarea) {
            this._mermaid = textarea.value;
        }
        this._showDialog = false;
        this._showCodeEditor = false;
        this.sendUpdates();
        this.requestUpdate();
        this.renderMermaid();
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
        const codeEditor = this.shadowRoot.querySelector('.code-editor');
        if (codeEditor) {
            this._mermaid = codeEditor.value;
            this.renderMermaid();
            this.requestUpdate();
        }
    }

    render() {
        return html`
            <div class="mermaid-container">
                <div class="mermaid-display">
                    ${this._showAiSuggestion ? 
                        html`<div class="preview"></div>` :
                        ''}
                </div>
                ${this.error ? html`<div class="error">${this.error}</div>` : ''}
                ${!this.readOnly && !window.wisk.editor.wiskSite ? html`
                    <button class="button edit-button" @click=${this.handleEdit}>
                        <img src="/a7/plugins/latex-element/pencil.svg" alt="Edit" style="filter: var(--themed-svg);" />
                    </button>
                ` : ''}
            </div>

            ${this._showAiInput ? html`
                <div class="dialog">
                    <div class="ai-input-container">
                        <textarea class="ai-input" placeholder="Ask AI for any changes ..." ?disabled=${this._isLoading || this._showAiSuggestion} ></textarea>
                        <div class="dialog-buttons">
                            ${this._isLoading ? 
                                html`<div class="loading-spinner"></div>` :
                                this._showAiSuggestion ? html`
                                    <button @click=${this.handleRejectAiChanges} class="button inner-buttons">
                                        <img src="/a7/plugins/latex-element/discard.svg" alt="Discard" />
                                        Discard
                                    </button>
                                    <button class="primary-button button inner-buttons" @click=${this.handleAcceptAiChanges}>
                                        <img src="/a7/plugins/latex-element/accept.svg" alt="Accept" style="filter: var(--accent-svg);" />
                                        Accept
                                    </button>
                                ` : html`
                                    <button class="button" @click=${this.handleCancel}>Cancel</button>
                                    <div style="flex: 1"></div>
                                    <button class="button inner-buttons" @click=${this.handleShowCodeEditor}>
                                        <img src="/a7/plugins/latex-element/code.svg" alt="Code" />
                                    </button>
                                    <button class="button primary-button inner-buttons" @click=${this.handleAiUpdate}>
                                        <img src="/a7/plugins/latex-element/up.svg" alt="AI"/>
                                    </button>
                                `
                            }
                        </div>
                    </div>
                </div>
            ` : ''}

            ${this._showCodeEditor ? html`
                <div class="dialog">
                    <textarea 
                        class="code-editor" 
                        .value=${this._mermaid} 
                        @input=${this.updateMermaid}
                    ></textarea>
                    <div class="dialog-buttons">
                        <button class="button inner-buttons" @click=${this.handleReset}>Reset</button>
                        <button class="button inner-buttons" @click=${this.handleCancel}>Cancel</button>
                        <button class="button inner-buttons primary-button" @click=${this.handleSave}>Save</button>
                    </div>
                </div>
            ` : ''}
        `;
    }
}

customElements.define("mermaid-element", MermaidElement);
