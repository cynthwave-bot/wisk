import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class ExportComponent extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
        }
        .option-section {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            color: var(--text-1);
            align-items: center;
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.3s ease, transform 0.3s ease;
            padding: var(--padding-3);
        }
        select {
            padding: var(--padding-w2);
            color: var(--text-1);
            border: 1px solid var(--border-1);
            background-color: var(--bg-2);
            outline: none;
            border-radius: var(--radius);
            transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        select:hover {
            border-color: var(--border-2);
            background-color: var(--bg-3);
        }
        button {
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
        button {
            background-color: var(--fg-blue);
            color: var(--bg-blue);
            font-weight: bold;
            border: 1px solid var(--fg-blue);
        }
        button:hover:not(:disabled) {
            filter: brightness(1.1);
            background-color: var(--bg-blue);
            color: var(--fg-blue);
        }
        button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .placeholder-div {
            display: flex;
            flex-wrap: wrap;
            gap: var(--gap-2);
        }
        .placeholder {
            width: 100px;
            height: 100px;
            border: 1px solid var(--bg-3);
            border-radius: var(--radius);
        }
    `;

    static properties = {};

    constructor() {
        super();

        window.wisk.editor.registerCommand("Download as PDF", "", "Plugin", () => { 
            this.shadowRoot.querySelector("select").value = "pdf";
            this.download(); 
        }, "");
        window.wisk.editor.registerCommand("Download as DOCX", "", "Plugin", () => { 
            this.shadowRoot.querySelector("select").value = "docx";
            this.download(); 
        }, "");
    }

    async download() {
        var user = await document.querySelector("auth-component").getUserInfo();
        var token = user.token;

        window.wisk.utils.showLoading("Downloading file...");

        var md = "";
        var references = [];

        for (var i = 0; i < window.wisk.editor.elements.length; i++) {
            var element = window.wisk.editor.elements[i];
            var e = document.getElementById(element.id);
            if ('getTextContent' in e) {
                var textContent = e.getTextContent();
                md += textContent.markdown + "\n\n";
            }
            if ('getValue' in e) {
                var value = e.getValue();
                if (value.references) {
                    references.push(...value.references);
                }
            }
        }

        var response = await fetch("https://cloud.wisk.cc/v1/download", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                format: this.shadowRoot.querySelector("select").value,
                markdown: md,
                title: document.getElementById(window.wisk.editor.elements[0].id).getTextContent().text.replace(/[^a-zA-Z0-9 ]/g, ""),
                references: references,
                author: "",
                date: "",
            }),
        });

        if (response.status !== 200) {
            window.showToast("Error downloading file", 5000);
            window.wisk.utils.hideLoading();
            return;
        }

        var blob = await response.blob();
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        var sel = this.shadowRoot.querySelector("select");
        if (sel.value === "pdf") {
            a.download = "file.pdf";
        } else {
            a.download = "file.docx";
        }
        a.click();

        URL.revokeObjectURL(url);
        window.wisk.utils.hideLoading();
    }

    render() {
        return html`
            <div class="option-section">
                <label>Download</label>

                <div style="display: flex; gap: var(--gap-2); align-items: stretch">
                    <select>
                        <option value="pdf" selected>PDF</option>
                        <option value="docx">DOCX</option>
                    </select>
                    <button @click=${this.download}>Download</button>
                </div>
            </div>

            <div class="option-section" style="flex-direction: column; align-items: normal; gap: var(--gap-3); color: var(--bg-3);">
                <label>Templates (Coming soon)</label>
                <div class="placeholder-div">
                    <div class="placeholder"></div>
                    <div class="placeholder"></div>
                    <div class="placeholder"></div>
                </div>
            </div>
        `;
    }
}

customElements.define('export-component', ExportComponent);
