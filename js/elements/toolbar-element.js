import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class ToolbarElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
        }

        :host {
            --dialog-margin-top--dont-mess-with-this: 40px;
        }
        
        .toolbar {
            position: fixed;
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            filter: var(--drop-shadow);
            padding: var(--padding-w1);
            gap: 4px;
            z-index: 100;
            display: none;
            width: max-content;
        }

        .toolbar.visible {
            display: flex;
        }

        .toolbar button {
            background: var(--bg-1);
            border: none;
            width: 28px;
            height: 26px;
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-1);
            transition: background 0.2s ease-in-out;
            gap: var(--gap-2);
        }

        .toolbar button[data-wide] {
            padding: 2px 6px;
            width: auto;
        }

        .toolbar button:hover {
            background: var(--bg-3);
        }

        .separator {
            background: var(--border-1);
            height: auto;
            width: 1px;
        }

        img {
            filter: var(--themed-svg);
            height: 18px;
        }

        .dialog-container {
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: var(--dialog-margin-top--dont-mess-with-this, 40px);
            width: 100%;
            max-height: 500px;
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius-large);
            filter: var(--drop-shadow);
            padding: var(--padding-3);
            display: flex;
        }

        .dialog {
            z-index: 1001;
            width: 100%;
            min-width: 200px;
        }

        .dialog input {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-1);
            color: var(--text-1);
        }

        .dialog-buttons {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            margin-top: 8px;
        }

        .dialog button {
            padding: 8px 16px;
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
            color: var(--text-1);
            width: auto;
            height: auto;
        }

        .dialog button.cancel {
            background: var(--bg-2);
        }

        .ai-commands {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .ai-commands button {
            width: 100%;
            text-align: left;
            padding: 8px;
            background: var(--bg-1);
            justify-content: flex-start;
        }

        .source-item {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;  border-bottom: 1px solid var(--border-1);
            padding: var(--padding-3) 0;
        }

        .source-item:last-child {
            border-bottom: none;
            margin-bottom: 8px;
        }

        .source-item h3 {
            font-size: 14px;
            margin-bottom: 4px;
        }

        .source-item p {
            font-size: 12px;
            color: var(--text-2);
        }

        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius);
        }

        .loading-indicator {
            width: 24px;
            height: 24px;
            border: 2px solid var(--bg-3);
            border-top: 2px solid var(--text-1);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 99;
        }
        
        .source-item * {
            margin: 0;
            padding: 0;
            word-wrap: break-word;
        }

        .url {
            color: var(--text-2);
            font-size: 12px;
        }

        *::-webkit-scrollbar { width: 15px; }
        *::-webkit-scrollbar-track { background: var(--bg-1); }
        *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
    `;

    static properties = {
        mode: { type: String },
        dialogName: { type: String },
        selectedText: { type: String },
        elementId: { type: String },
        elementText: { type: String },
        visible: { type: Boolean },
        linkUrl: { type: String, state: true },
        sources: { type: Array },
        loading: { type: Boolean }
    };

    constructor() {
        super();
        this.mode = 'simple';
        this.dialogName = '';
        this.selectedText = '';
        this.elementId = '';
        this.elementText = '';
        this.visible = false;
        this.linkUrl = '';
        this.sources = [];
        this.loading = false;

        const editor = document.querySelector('.editor');
        if (editor) {
            editor.addEventListener('scroll', () => { this.updateToolbarPosition(); });
            window.addEventListener('resize', () => { this.updateToolbarPosition(); });
        }
    }

    updateToolbarPosition() {
        if (!this.visible || !this.elementId) return;

        const element = document.getElementById(this.elementId);
        if (!element?.getSelectionPosition) return;

        const position = element.getSelectionPosition();
        if (!position || !position.selectedText.trim()) {
            this.hideToolbar();
            return;
        }

        const toolbar = this.shadowRoot.querySelector('.toolbar');
        this.style.setProperty('--dialog-margin-top--dont-mess-with-this', `${ (position.height > 200 ? 200 : position.height) + 20}px`);

        toolbar.style.left = `${Math.max(10, Math.min(position.x - (toolbar.offsetWidth / 2), window.innerWidth - toolbar.offsetWidth - 10))}px`;
        toolbar.style.top = `${Math.max(10, position.y - 45)}px`;
    }


    async handleToolbarAction(action) {
        switch(action) {
            case 'link':
                this.mode = 'dialog';
                this.dialogName = 'link';
                break;
            case 'ai-improve':
                this.mode = 'dialog';
                this.dialogName = 'ai-chat';
                break;
            case 'find-source':
                this.mode = 'dialog';
                this.dialogName = 'sources';
                this.fetchSources();
                break;
            case 'make-longer':
            case 'make-shorter':
            case 'fix-spelling-grammar':
            case 'improve-writing':
            case 'summarize':
                await this.handleAIOperation(action);
                break;
            default:
                this.dispatchEvent(new CustomEvent('toolbar-action', {
                    detail: { action, elementId: this.elementId, selectedText: this.selectedText },
                    bubbles: true,
                    composed: true
                }));
        }
    }

    handleLinkKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent newline insertion
            this.handleLinkSubmit();
        }
    }

    async handleAIOperation(operation) {

        window.showToast('Processing...', 3000);

        this.loading = true;
        this.requestUpdate();

        try {
            const auth = await document.getElementById("auth").getUserInfo();
            const response = await fetch("https://cloud.wisk.cc/v1/ai/tools", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + auth.token,
                },
                body: JSON.stringify({
                    ops: operation,
                    selectedText: this.selectedText,
                    document: this.elementText,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Dispatch event with improved text
                this.dispatchEvent(new CustomEvent('ai-operation-complete', {
                    detail: {
                        elementId: this.elementId,
                        newText: data.content
                    },
                    bubbles: true,
                    composed: true
                }));

                this.closeDialog();
            } else {
                throw new Error('AI operation failed');
            }
        } catch (error) {
            console.error('AI operation error:', error);
            window.showToast('AI operation failed', 3000);
        } finally {
            this.loading = false;
            this.requestUpdate();
        }
    }

    async handleCreateReference(source) {

        window.wisk.utils.showLoading('Adding source...')

        var user = await document.getElementById("auth").getUserInfo();
        var response = await fetch('https://cloud.wisk.cc/v1/source', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + user.token
            },
            body: JSON.stringify({ ops: 'get-url', url: source.url })
        });

        window.wisk.utils.hideLoading();
        
        var data = {};
        if (response.ok) {
            data = await response.json();
            data = data[0];
            console.log(data);
        } else {
            window.showToast('Failed to load sources', 3000);
            return;
        }

        // Save selection before opening dialog
        this.dispatchEvent(new CustomEvent('save-selection', {
            detail: { elementId: this.elementId },
            bubbles: true,
            composed: true
        }));

        // Dispatch create-reference event with source details
        this.dispatchEvent(new CustomEvent('create-reference', {
            detail: {
                elementId: this.elementId,
                title: source.title,
                authors: data.authors || [],
                date: data.publish_date || "",
                publisher: data.meta_site_name || "",
                url: source.url
            },
            bubbles: true,
            composed: true
        }));

        // Close the dialog after creating reference
        this.closeDialog();
    }


    async fetchSources() {
        this.mode = 'loading';
        try {
            const auth = await document.getElementById("auth").getUserInfo();
            const response = await fetch('https://cloud.wisk.cc/v1/source', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + auth.token
                },
                body: JSON.stringify({ ops: 'find-source', selectedText: this.selectedText })
            });

            if (response.ok) {
                const data = await response.json();
                this.sources = data.results;
                this.mode = 'dialog';
                this.dialogName = 'sources';
            } else {
                throw new Error('Failed to fetch sources');
            }
        } catch (error) {
            console.error('Error:', error);
            window.showToast('Failed to load sources', 3000);
            this.mode = 'simple';
        }
    }

    handleLinkSubmit(e) {
        e?.preventDefault();
        
        let url = this.linkUrl;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        this.dispatchEvent(new CustomEvent('create-link', {
            detail: { url, elementId: this.elementId },
            bubbles: true,
            composed: true
        }));

        this.mode = 'simple';
        this.linkUrl = '';
    }

    closeDialog() {
        this.mode = 'simple';
        this.dialogName = '';
    }

    showToolbar(x, y, elementId, selectedText, elementText) {
        document.querySelector('ai-chat').setSelection(elementId, selectedText);

        this.selectedText = selectedText;
        this.elementId = elementId;
        this.elementText = elementText;
        this.visible = true;
        
        setTimeout(() => {
            this.updateToolbarPosition();
        }, 0);
    }

    hideToolbar() {
        this.visible = false;
        this.mode = 'simple';
        this.dialogName = '';
    }

    render() {
        return html`
            ${this.mode === 'dialog' ? html`<div class="backdrop" @click=${this.closeDialog}></div>` : ''}
            
            <div class="toolbar ${this.visible ? 'visible' : ''}" style="">
                <button @click=${() => this.handleToolbarAction('ai-improve')} title="Improve with AI" data-wide>
                    <img src="/a7/forget/ai.svg" alt="AI" /> AI Commands</button>
                <div class="separator"></div>
                <button @click=${() => this.handleToolbarAction('find-source')} title="Find Source" data-wide>
                    <img src="/a7/forget/source.svg" alt="Source" /> Find Source</button>
                <div class="separator"></div>
                <button @click=${() => this.handleToolbarAction('bold')} title="Bold">
                    <img src="/a7/forget/bold.svg" alt="Bold" />
                </button>
                <button @click=${() => this.handleToolbarAction('italic')} title="Italic">
                    <img src="/a7/forget/italics.svg" alt="Italic" />
                </button>
                <button @click=${() => this.handleToolbarAction('underline')} title="Underline">
                    <img src="/a7/forget/underline.svg" alt="Underline"/>
                </button>
                <button @click=${() => this.handleToolbarAction('strikeThrough')} title="Strikethrough">
                    <img src="/a7/forget/strikethrough.svg" alt="Strikethrough" />
                </button>
                <button @click=${() => this.handleToolbarAction('link')} title="Add Link">
                    <img src="/a7/forget/link.svg" alt="Link" />
                </button>

                ${this.mode === 'loading' ? html`
                    <div class="loading-overlay">
                        <div class="loading-indicator"></div>
                    </div>
                ` : ''}

                ${this.mode === 'dialog' ? html`
                    <div class="dialog-container">
                        <div style="overflow: auto; width: 100%;">
                        ${this.renderDialog()}
                        <div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    async updateSearch() {

        window.showToast('Searching for sources...', 3000);
        this.loading = true;
        this.sources = [];
        this.requestUpdate();

        var user = await document.getElementById("auth").getUserInfo();
        var search = this.shadowRoot.getElementById('source-search').value;

        var response = await fetch('https://cloud.wisk.cc/v1/source', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + user.token
            },
            body: JSON.stringify({ ops: 'find-source', selectedText: search })
        });

        if (response.ok) {
            var data = await response.json();
            this.sources = data.results;
        } else {
            window.showToast('Failed to load sources', 3000);
        }

        this.loading = false;
        this.requestUpdate();
        console.log(this.sources);
    }

    openAIChat() {
        window.wisk.editor.toggleRightSidebar('ai-chat', "AI Chat");
    }

    renderDialog() {
        switch(this.dialogName) {
            case 'link':
                return html`
                    <div class="dialog">
                        <input type="text" 
                            placeholder="Enter URL" 
                            .value=${this.linkUrl}
                            @input=${(e) => this.linkUrl = e.target.value}
                            @keydown=${this.handleLinkKeyDown} />
                        <div class="dialog-buttons">
                            <button class="cancel" @click=${this.closeDialog}>Cancel</button>
                            <button @click=${this.handleLinkSubmit}>Save</button>
                        </div>
                    </div>
                `;
            case 'ai-chat':
                return html`
                    <div class="dialog">
                        <div class="ai-commands">
                            <button @click=${() => this.handleToolbarAction('make-longer')}>Make Longer</button>
                            <button @click=${() => this.handleToolbarAction('make-shorter')}>Make Shorter</button>
                            <button @click=${() => this.handleToolbarAction('fix-spelling-grammar')}>Fix Grammar</button>
                            <button @click=${() => this.handleToolbarAction('improve-writing')}>Improve Writing</button>
                            <button @click=${() => this.handleToolbarAction('summarize')}>Summarize</button>
                            <button @click=${() => this.openAIChat()}>Toggle AI Chat</button>
                        </div>
                        <div class="dialog-buttons">
                            <button class="cancel" @click=${this.closeDialog}>Close</button>
                        </div>
                    </div>
                `;
            case 'sources':
                return html`
                    <div class="dialog">
                        <div style="display: flex; gap: 8px; margin-bottom: 8px">
                            <input type="text" placeholder="Search sources" id="source-search" value=${this.selectedText} />
                            <button style="border: 1px solid var(--border-1); font-size: 12px" @click=${this.updateSearch}>Search</button>
                        </div>
                        ${this.sources.map(source => html`
                            <div class="source-item">
                                <h3>${source.title}</h3>
                                <p>${source.content}</p>
                                <a class="url" href=${source.url} target="_blank">${source.url.length > 40 ? source.url.slice(0, 40) + '...' : source.url}</a>
                                <button @click=${() => this.handleCreateReference(source)} style="border: 1px solid var(--border-1);">Add Source</button>
                            </div>
                        `)}
                        <div class="dialog-buttons">
                            <button class="cancel" @click=${this.closeDialog}>Close</button>
                        </div>
                    </div>
                `;
            default:
                return null;
        }
    }
}

customElements.define("toolbar-element", ToolbarElement);
