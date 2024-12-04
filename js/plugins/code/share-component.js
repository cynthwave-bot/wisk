import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

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
            border-bottom: 1px solid var(--border-1);
            margin-bottom: var(--gap-3);
            padding: 0 var(--padding-3);
        }
        .tab {
            padding: var(--padding-2) var(--padding-3);
            color: var(--text-2);
            cursor: pointer;
            position: relative;
            user-select: none;
        }
        .tab.active {
            color: var(--text-1);
        }
        .tab.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: var(--text-1);
            border-radius: 2px 2px 0 0;
        }
        .option-section {
            display: flex;
            flex-direction: column;
            color: var(--text-1);
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.3s ease, transform 0.3s ease;
            padding: 0 var(--padding-3) var(--padding-3);
            gap: var(--gap-3);
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
            filter: var(--drop-shadow);
        }
        .secondary-button {
            background-color: var(--bg-2);
            color: var(--text-1);
            border: 1px solid var(--border-1);
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
    `;

    static properties = {
        activeTab: { type: String },
        users: { type: Array },
        isPublished: { type: Boolean },
    };

    constructor() {
        super();
        this.activeTab = 'share';
        this.users = [];
        this.isPublished = false;
        this.url = "";
    }

    async liveUrl() {
        var user = await document.querySelector("auth-component").getUserInfo();
        var response = await fetch("https://cloud.wisk.cc/v1/user", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        });

        if (response.status !== 200) {
            window.showToast("Error downloading file", 5000);
            return;
        }
        var data = await response.json();

        return "https://" + data.username + ".wisk.site/" + window.wisk.editor.pageId;
    }

    async opened() {
        this.isPublished = window.wisk.editor.data.config.public;

        if (this.isPublished) {
            this.url = await this.liveUrl();
        }

        this.users = window.wisk.editor.data.config.access || [];
        await this.requestUpdate();
        if (this.activeTab === 'share') {
            this.shadowRoot.querySelector(".email")?.focus();
        }
    }

    async addUser() {
        const email = this.shadowRoot.querySelector(".email").value;

        if (!email.match(/.+@.+\..+/)) {
            window.showToast("Invalid email", 3000);
            return;
        }

        await window.wisk.editor.addConfigChange([{path: "document.config.access.add", values: { email: email }}]);

        this.shadowRoot.querySelector(".email").value = "";
        this.users = [...this.users, email];
        window.wisk.editor.data.config.access = this.users;
        this.requestUpdate();
    }

    async removeUser(user) {
        window.showToast("Removing user...", 3000);
        await window.wisk.editor.addConfigChange([{path: "document.config.access.remove", values: { email: user }}]);
        window.showToast("User removed!", 3000);

        this.users = this.users.filter((u) => u !== user);
        this.requestUpdate();
    }

    async togglePublish() {
        this.isPublished = !this.isPublished;

        await window.wisk.editor.addConfigChange([{path: "document.config.access.public", values: { public: this.isPublished }}]);
        
        if (this.isPublished) {
            this.url = await this.liveUrl();
        }

        window.showToast(this.isPublished ? "Document published!" : "Document unpublished", 3000);
        await this.requestUpdate();
    }

    async copyUrl() {
        navigator.clipboard.writeText(this.url);
        window.showToast("URL copied to clipboard!", 3000);
    }

    renderShareTab() {
        return html`
            <div class="option-section">
                <div style="display: flex; gap: var(--gap-2); align-items: stretch; width: 100%; flex-wrap: wrap" class="od">
                    <img src="/a7/plugins/share-component/plus.svg" alt="plus" style="filter: var(--themed-svg); padding-left: var(--padding-3)" />
                    <input type="text" placeholder="Add people or groups" class="email" @keydown=${(e) => {if (e.key === "Enter") this.addUser()}} />
                    <button @click=${this.addUser}>Invite</button>
                </div>

                <div class="od ox">
                    <p>People with access ${this.users.length ? "" : "(none yet)"}</p> 
                    ${this.users.map((user) => html`
                        <span class="user">
                            ${user}
                            <img src="/a7/plugins/share-component/x.svg" alt="x" style="filter: var(--themed-svg); cursor: pointer;" @click=${() => this.removeUser(user)} />
                        </span>
                    `)}
                </div>
            </div>
        `;
    }

    renderPublishTab() {
        return html`
            <div class="option-section">
                <div class="od" style="display: flex; flex-direction: column; gap: var(--gap-3); background-color: transparent; padding: 0; border: none; box-shadow: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; gap: var(--gap-1); flex-direction: column">
                            <div>${this.isPublished ? 'Published' : 'Not published'}</div>
                            <div class="note">${this.isPublished ? 'Anyone with the link can view this document' : 'Only invited people can access'}</div>
                        </div>
                        <button 
                            class=${this.isPublished ? 'secondary-button' : ''} 
                            @click=${this.togglePublish}
                        >
                            ${this.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                    </div>

                    ${this.isPublished ? html`
                        <div class="url-container">
                            <input type="text" class="od" .value=${this.url} readonly />
                            <button @click=${this.copyUrl}>Copy</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div>
                <div class="tabs">
                    <div class="tab ${this.activeTab === 'share' ? 'active' : ''}" 
                         @click=${() => this.activeTab = 'share'}>
                        Share
                    </div>
                    <div class="tab ${this.activeTab === 'publish' ? 'active' : ''}"
                         @click=${() => this.activeTab = 'publish'}>
                        Publish
                    </div>
                </div>

                ${this.activeTab === 'share' ? this.renderShareTab() : this.renderPublishTab()}
            </div>
        `;
    }
}

customElements.define('share-component', ShareComponent);
