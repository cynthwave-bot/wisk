import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class ExportComponent extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        .option-section {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            color: var(--text-1);
            align-items: center;
            opacity: 1;
            transform: translateY(0);
            transition:
                opacity 0.3s ease,
                transform 0.3s ease;
            padding: var(--padding-3);
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
            padding: var(--padding-w2);
            background-color: var(--text-1);
            color: var(--bg-1);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            outline: none;
            font-weight: 500;
            transition: background-color 0.2s ease;
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
            grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
            gap: var(--gap-2);
            padding: var(--padding-2);
        }

        .template-option {
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: var(--padding-3);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            align-items: center;
            text-align: center;
        }

        .template-option img {
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
    `;

    static properties = {
        selectedTemplate: { type: String },
    };

    constructor() {
        super();
        this.selectedTemplate = 'default';

        window.wisk.editor.registerCommand(
            'Download as PDF',
            '',
            'Plugin',
            () => {
                this.shadowRoot.querySelector('select').value = 'pdf';
                this.download();
            },
            ''
        );
        window.wisk.editor.registerCommand(
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

    selectTemplate(template) {
        this.selectedTemplate = template;
    }

    async download() {
        var user = await document.querySelector('auth-component').getUserInfo();
        var token = user.token;

        window.wisk.utils.showLoading('Downloading file...');

        var elms = [];

        for (var i = 0; i < window.wisk.editor.elements.length; i++) {
            var element = window.wisk.editor.elements[i];
            var e = document.getElementById(element.id);
            if ('getTextContent' in e) {
                var textContent = e.getTextContent();
                var valueContent = e.getValue();
                var elm = {
                    type: element.component,
                    value: {
                        text: textContent.html,
                    },
                };
                if (element.component === 'image-element') {
                    elm.value.url = textContent.url;
                }
                if (
                    element.component === 'list-element' ||
                    element.component === 'numbered-list-element' ||
                    element.component === 'checkbox-element'
                ) {
                    elm.value.indent = valueContent.indent;
                }
                if (element.component === 'checkbox-element') {
                    elm.value.language = valueContent.checked;
                }
                if (element.component === 'image-element') {
                    elm.value.url = valueContent.imageUrl;
                }
                elms.push(elm);
            }
        }

        var response = await fetch('https://cloud.wisk.cc/v2/download', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                template: this.selectedTemplate,
                elements: elms,
            }),
        });

        if (response.status !== 200) {
            window.showToast('Error downloading file', 5000);
            window.wisk.utils.hideLoading();
            return;
        }

        var blob = await response.blob();
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        var sel = this.shadowRoot.querySelector('select');
        if (sel.value === 'pdf') {
            a.download = 'file.pdf';
        } else {
            a.download = 'file.docx';
        }
        a.click();

        URL.revokeObjectURL(url);
        window.wisk.utils.hideLoading();
    }

    render() {
        const templates = [
            { id: 'default', name: 'Default', description: 'Clean and simple layout' },
            { id: 'academic', name: 'Academic', description: 'Perfect for research papers' },
            { id: 'business', name: 'Business', description: 'Professional business documents' },
            { id: 'newsletter', name: 'Newsletter', description: 'Engaging newsletter format' },
            { id: 'compact', name: 'Two Column', description: 'Two column layout for articles and reports' },
            { id: 'minimalist', name: 'Minimalist', description: 'Simple and clean design' },
        ];

        return html`
            <div class="option-section">
                <label>Download</label>

                <div style="display: flex; gap: var(--gap-2); align-items: stretch">
                    <select>
                        <option value="pdf" selected>PDF</option>
                        <option value="docx" disabled>DOCX</option>
                    </select>
                    <button class="download" @click=${this.download}>Download</button>
                </div>
            </div>

            <div class="option-section" style="flex-direction: column; align-items: normal; gap: var(--gap-3);">
                <label>Templates</label>
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
                                    <button class="view-btn" @click=${() => window.open(`/a7/export-templates/${template.id}.jpg`)}>
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
        `;
    }
}

customElements.define('export-component', ExportComponent);
