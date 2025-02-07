import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class ShareComponent extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        .tabs {
            display: flex;
            gap: var(--gap-2);
            margin-bottom: var(--gap-3);
        }
        .tab {
            padding: var(--padding-w2);
            color: var(--text-2);
            cursor: pointer;
            position: relative;
            user-select: none;
            border-radius: var(--radius);
        }
        .tab.active {
            color: var(--accent-text);
            background: var(--accent-bg);
            font-weight: 500;
        }
        .option-section {
            display: flex;
            flex-direction: column;
            color: var(--text-1);
            opacity: 1;
            transform: translateY(0px);
            transition:
                opacity 0.3s,
                transform 0.3s;
            gap: var(--gap-3);
            overflow: auto;
            height: 100%;
        }
        button {
            padding: var(--padding-w2);
            background-color: var(--text-1);
            color: var(--bg-1);
            border: 1px solid var(--text-1);
            border-radius: var(--radius);
            cursor: pointer;
            outline: none;
            font-weight: 500;
            filter: var(--drop-shadow);
            transition: background-color 0.2s ease;
        }
        .secondary-button {
            background-color: var(--bg-2);
            color: var(--text-1);
            border: 1px solid var(--border-1);
        }
        button:hover:not(:disabled) {
            filter: brightness(1.1);
            background-color: var(--bg-1);
            color: var(--text-1);
        }
        .od {
            padding: var(--padding-2);
            color: var(--text-1);
            background-color: var(--bg-2);
            border-radius: var(--radius);
            outline: none;
            border: 1px solid var(--bg-3);
            transition: all 0.2s ease;
            width: 100%;
        }
        .email {
            outline: none;
            border: none;
            flex: 1;
            background-color: transparent;
            color: var(--text-1);
            font-size: 16px;
            font-weight: 500;
        }
        .od:has(.email:focus) {
            border-color: var(--border-2);
            background-color: var(--bg-1);
            box-shadow: 0 0 0 2px var(--bg-3);
        }
        .user {
            padding: var(--padding-w1);
            background-color: var(--bg-3);
            color: var(--text-1);
            border-radius: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9em;
            gap: var(--gap-1);
        }
        .ox {
            display: flex;
            gap: var(--gap-1);
            align-items: center;
            width: 100%;
            background-color: transparent;
            border: none;
            flex-wrap: wrap;
        }
        .url-container {
            display: flex;
            gap: var(--gap-2);
            align-items: center;
        }
        .note {
            color: var(--text-2);
            font-size: 0.9em;
        }
        select {
            padding: var(--padding-w2);
            color: var(--text-1);
            border: 1px solid var(--border-1);
            background-color: var(--bg-2);
            outline: none;
            border-radius: var(--radius);
            transition:
                border-color 0.2s ease,
                background-color 0.2s ease;
        }
        select:hover {
            border-color: var(--border-2);
            background-color: var(--bg-3);
        }
        .download {
            background-color: var(--fg-blue);
            color: var(--bg-blue);
            font-weight: bold;
            border: 1px solid var(--fg-blue);
        }
        .download:hover:not(:disabled) {
            filter: brightness(1.1);
            background-color: var(--bg-blue);
            color: var(--fg-blue);
        }
        .download:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: var(--gap-2);
            padding: var(--padding-2);
        }
        .template-option {
            border: 3px solid var(--border-1);
            border-radius: var(--radius);
            padding: var(--padding-3);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        .template-option:hover {
            border-color: var(--border-2);
            background-color: var(--bg-2);
        }
        .template-option.selected {
            border-color: var(--accent-text);
            background-color: var(--accent-bg);
        }
        .template-preview {
            width: 100%;
            aspect-ratio: 1/1.414;
            background-color: var(--bg-2);
            border-radius: var(--radius);
            margin-bottom: var(--gap-2);
            position: relative;
        }
        .view-btn {
            position: absolute;
            right: var(--padding-2);
            top: var(--padding-2);
            background-color: black;
            border: none;
            border-radius: var(--radius);
            padding: var(--padding-2);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            opacity: 0.6;
        }
        .view-btn:hover {
            opacity: 1;
        }
        @media (hover: hover) {
            *::-webkit-scrollbar {
                width: 15px;
            }
            *::-webkit-scrollbar-track {
                background: var(--bg-1);
            }
            *::-webkit-scrollbar-thumb {
                background-color: var(--bg-3);
                border-radius: 20px;
                border: 4px solid var(--bg-1);
            }
            *::-webkit-scrollbar-thumb:hover {
                background-color: var(--text-1);
            }
        }
    `;

    static properties = {
        activeTab: { type: String },
        users: { type: Array },
        isPublished: { type: Boolean },
        selectedTemplate: { type: String },
    };

    constructor() {
        super();
        this.activeTab = 'download';
        this.users = [];
        this.isPublished = false;
        this.url = '';
        this.selectedTemplate = 'default';

        wisk.editor.registerCommand(
            'Download as PDF',
            '',
            'Plugin',
            () => {
                this.shadowRoot.querySelector('select').value = 'pdf';
                this.download();
            },
            ''
        );
        wisk.editor.registerCommand(
            'Download as DOCX',
            '',
            'Plugin',
            () => {
                this.shadowRoot.querySelector('select').value = 'docx';
                this.download();
            },
            ''
        );
    }

    async liveUrl() {
        var user = await document.querySelector('auth-component').getUserInfo();
        var response = await fetch(wisk.editor.backendUrl + '/v1/user', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        });

        if (response.status !== 200) {
            window.showToast('Error downloading file', 5000);
            return;
        }
        var data = await response.json();

        return 'https://' + data.username + '.wisk.site/' + wisk.editor.pageId;
    }

    async opened() {
        this.isPublished = wisk.editor.data.config.public;

        if (this.isPublished) {
            this.url = await this.liveUrl();
        }

        this.users = wisk.editor.data.config.access || [];
        await this.requestUpdate();
        if (this.activeTab === 'share') {
            this.shadowRoot.querySelector('.email')?.focus();
        }
    }

    async addUser() {
        const email = this.shadowRoot.querySelector('.email').value;

        if (!email.match(/.+@.+\..+/)) {
            window.showToast('Invalid email', 3000);
            return;
        }

        await wisk.editor.addConfigChange([{ path: 'document.config.access.add', values: { email: email } }]);

        this.shadowRoot.querySelector('.email').value = '';
        this.users = [...this.users, email];
        wisk.editor.data.config.access = this.users;
        this.requestUpdate();
    }

    async removeUser(user) {
        window.showToast('Removing user...', 3000);
        await wisk.editor.addConfigChange([{ path: 'document.config.access.remove', values: { email: user } }]);
        window.showToast('User removed!', 3000);

        this.users = this.users.filter(u => u !== user);
        this.requestUpdate();
    }

    async togglePublish() {
        this.isPublished = !this.isPublished;

        await wisk.editor.addConfigChange([{ path: 'document.config.access.public', values: { public: this.isPublished } }]);
        wisk.editor.data.config.public = this.isPublished;

        if (this.isPublished) {
            this.url = await this.liveUrl();
        }

        window.showToast(this.isPublished ? 'Document published!' : 'Document unpublished', 3000);
        await this.requestUpdate();
    }

    async copyUrl() {
        navigator.clipboard.writeText(this.url);
        window.showToast('URL copied to clipboard!', 3000);
    }

    selectTemplate(template) {
        this.selectedTemplate = template;
    }

    async download() {
        try {
            var user = await document.querySelector('auth-component').getUserInfo();
            var token = user.token;
            wisk.utils.showLoading('Downloading file...');

            // Array to store base64 images and their IDs
            const imageData = [];
            let markdownContent = '';

            for (var i = 0; i < wisk.editor.elements.length; i++) {
                var element = wisk.editor.elements[i];
                var e = document.getElementById(element.id);

                if (!('getTextContent' in e)) continue;

                // Handle main text elements that support markdown
                var normalElms = [
                    'main-element',
                    'text-element',
                    'heading1-element',
                    'heading2-element',
                    'heading3-element',
                    'heading4-element',
                    'heading5-element',
                    'divider-element',
                ];
                if (normalElms.includes(element.component)) {
                    const content = e.getTextContent().markdown;
                    markdownContent += content + '\n\n';
                    continue;
                }

                // Handle special elements
                if (element.component === 'image-element') {
                    const valueContent = e.getValue();
                    const imgUrl = valueContent.imageUrl;
                    markdownContent += `![${valueContent.altText || ''}](${imgUrl})\n\n`;
                }

                if (element.component === 'list-element') {
                    const valueContent = e.getValue();
                    const content = e.getTextContent().markdown;
                    const indent = valueContent.indent || 0;
                    const indentStr = '  '.repeat(indent);
                    markdownContent +=
                        content
                            .split('\n')
                            .map(line => indentStr + line)
                            .join('\n') + '\n\n';
                }

                if (element.component === 'numbered-list-element') {
                    const valueContent = e.getValue();
                    const content = e.getTextContent().markdown;
                    const indent = valueContent.indent || 0;
                    const indentStr = '  '.repeat(indent);
                    markdownContent +=
                        content
                            .split('\n')
                            .map(line => indentStr + line)
                            .join('\n') + '\n\n';
                }

                if (element.component === 'checkbox-element') {
                    const valueContent = e.getValue();
                    const content = e.getTextContent().markdown;
                    const indent = valueContent.indent || 0;
                    const indentStr = '  '.repeat(indent);
                    markdownContent += `${indentStr}${content}\n\n`;
                }

                if (element.component === 'latex-element') {
                    const valueContent = e.getValue();
                    markdownContent += `$$\n${valueContent.latex}\n$$\n\n`;
                }

                if (element.component === 'code-element') {
                    var cval = e.getTextContent().markdown;
                    markdownContent += cval + '\n\n';
                }

                if (element.component === 'chart-element') {
                    var base64Data = await e.getBase64Png();
                    base64Data = base64Data.replace(/^data:image\/png;base64,/, '');

                    const imageId = Array(15)
                        .fill(null)
                        .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
                        .join('');

                    imageData.push({
                        id: imageId,
                        base64: base64Data,
                    });

                    markdownContent += `--id--image--${imageId}--end--\n\n`;
                }

                if (element.component === 'table-element') {
                    const valueContent = e.getTextContent().markdown;
                    markdownContent += valueContent + '\n\n';
                }

                if (element.component === 'mermaid-element') {
                    var base64Data = await e.getPNGBase64();
                    base64Data = base64Data.replace(/^data:image\/jpeg;base64,/, '');

                    const imageId = Array(15)
                        .fill(null)
                        .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
                        .join('');

                    imageData.push({
                        id: imageId,
                        base64: base64Data,
                    });

                    markdownContent += `--id--image--${imageId}--end--\n\n`;
                }
            }

            var refs = document.querySelector('manage-citations').getCitations();

            var refNum = 1;
            var refsAdded = [];

            refs.forEach(ref => {
                const citationPattern = new RegExp(`--citation-element--${ref.id}--`, 'g');
                if (markdownContent.match(citationPattern)) {
                    markdownContent = markdownContent.replace(citationPattern, `[${refNum}]`);
                    refsAdded.push(ref.id);
                    refNum++;
                }
            });

            if (refsAdded.length != 0) {
                markdownContent += '\n\n---\n\n## References\n\n';
            }

            // add a list of references at the end of the document
            for (var i = 0; i < refsAdded.length; i++) {
                var ref = refs.find(r => r.id === refsAdded[i]);
                markdownContent += `[${i + 1}] ${document.querySelector('manage-citations').getFormattedCitation(refsAdded[i])}\n\n`;
            }

            const response = await fetch(wisk.editor.backendUrl + '/v2/download', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    markdown: markdownContent,
                    filetype: this.shadowRoot.querySelector('select').value,
                    template: this.selectedTemplate,
                    ids: imageData,
                }),
            });

            if (response.status !== 200) {
                window.showToast('Error downloading file', 5000);
                wisk.utils.hideLoading();
                return;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const sel = this.shadowRoot.querySelector('select');
            a.download = sel.value === 'pdf' ? 'file.pdf' : 'file.docx';

            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            window.showToast('Error downloading file', 5000);
        } finally {
            wisk.utils.hideLoading();
        }
    }

    renderShareTab() {
        return html`
            <div class="option-section">
                <div style="display: flex; gap: var(--gap-2); align-items: stretch; width: 100%; flex-wrap: wrap" class="od">
                    <img src="/a7/plugins/share-component/plus.svg" alt="plus" style="filter: var(--themed-svg); padding-left: var(--padding-3)" />
                    <input
                        type="text"
                        placeholder="Add people or groups"
                        class="email"
                        @keydown=${e => {
                            if (e.key === 'Enter') this.addUser();
                        }}
                    />
                    <button @click=${this.addUser}>Invite</button>
                </div>

                <div class="od ox">
                    <p>People with access ${this.users.length ? '' : '(none yet)'}</p>
                    ${this.users.map(
                        user => html`
                            <span class="user">
                                ${user}
                                <img
                                    src="/a7/plugins/share-component/x.svg"
                                    alt="x"
                                    style="filter: var(--themed-svg); cursor: pointer;"
                                    @click=${() => this.removeUser(user)}
                                />
                            </span>
                        `
                    )}
                </div>
            </div>
        `;
    }

    renderDownloadTab() {
        const templates = [{ id: 'default', name: 'Default', description: 'Clean and simple layout' }];

        return html`
            <div class="option-section">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 var(--padding-3)">
                    <label>Download</label>
                    <div style="display: flex; gap: var(--gap-2); align-items: stretch">
                        <select>
                            <option value="pdf" selected>PDF</option>
                            <option value="docx">DOCX</option>
                        </select>
                        <button class="download" @click=${this.download}>Download</button>
                    </div>
                </div>

                <div style="height: 100%; overflow: auto;">
                    <label style="padding: 0 var(--padding-3); padding-bottom: var(--padding-4); display: block">Templates</label>
                    <div class="template-grid">
                        ${templates.map(
                            template => html`
                                <div
                                    class="template-option ${this.selectedTemplate === template.id ? 'selected' : ''}"
                                    @click=${() => this.selectTemplate(template.id)}
                                >
                                    <div class="template-preview">
                                        <img
                                            src="/a7/export-templates/smol/${template.id}.jpg"
                                            style="width: 100%; height: 100%; object-fit: cover;"
                                            loading="lazy"
                                        />
                                        <button
                                            class="view-btn"
                                            @click=${() => window.open(`/a7/export-templates/${template.id}.jpg`)}
                                            style="background-color: black; filter: none"
                                        >
                                            <img src="/a7/forget/open1.svg" style="width: 20px; height: 20px;" />
                                        </button>
                                    </div>

                                    <strong>${template.name}</strong>
                                    <small style="color: var(--text-2)">${template.description}</small>
                                </div>
                            `
                        )}
                    </div>
                </div>
            </div>
        `;
    }

    renderPublishTab() {
        return html`
            <div class="option-section">
                <div
                    class="od"
                    style="display: flex; flex-direction: column; gap: var(--gap-3); background-color: transparent; padding: 0; border: none; box-shadow: none;"
                >
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; gap: var(--gap-1); flex-direction: column">
                            <div>${this.isPublished ? 'Published' : 'Not published'}</div>
                            <div class="note">
                                ${this.isPublished ? 'Anyone with the link can view this document' : 'Only invited people can access'}
                            </div>
                        </div>
                        <button class=${this.isPublished ? 'secondary-button' : ''} @click=${this.togglePublish}>
                            ${this.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                    </div>

                    ${this.isPublished
                        ? html`
                              <div class="url-container">
                                  <input type="text" class="od" .value=${this.url} readonly />
                                  <button @click=${this.copyUrl}>Copy</button>
                              </div>
                          `
                        : ''}
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div style="height: 100%; overflow: hidden;">
                <div class="tabs">
                    <div class="tab ${this.activeTab === 'download' ? 'active' : ''}" @click=${() => (this.activeTab = 'download')}>Download</div>
                    <div class="tab ${this.activeTab === 'share' ? 'active' : ''}" @click=${() => (this.activeTab = 'share')}>Share</div>
                    <div class="tab ${this.activeTab === 'publish' ? 'active' : ''}" @click=${() => (this.activeTab = 'publish')}>Publish</div>
                </div>

                ${this.activeTab === 'share'
                    ? this.renderShareTab()
                    : this.activeTab === 'publish'
                      ? this.renderPublishTab()
                      : this.renderDownloadTab()}
            </div>
        `;
    }
}

customElements.define('share-component', ShareComponent);
