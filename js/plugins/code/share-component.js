import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class ShareComponent extends LitElement {
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
            flex-direction: column;
            justify-content: space-between;
            color: var(--text-1);
            align-items: center;
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.3s ease, transform 0.3s ease;
            padding: var(--padding-3);
            gap: var(--gap-3);
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
        .od {
            padding: var(--padding-2);
            color: var(--text-1);
            background-color: var(--bg-2);
            border-radius: var(--radius);
            outline: none;
            border: 1px solid var(--bg-3);
            transition: all 0.2s ease;
            width: 100%;
            margin-right: 2px;
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
        input[type="checkbox"] {
            accent-color: var(--button-bg-blue);
            background-color: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
            outline: none;
            transition: all 0.2s ease;
        }
    `;

    static properties = {};

    constructor() {
        super();
        this.users = ["soham@gmail.com", "example@hello.com"];
    }

    async opened() {
        this.users = window.wisk.editor.data.config.access;
        await this.requestUpdate();
        this.shadowRoot.querySelector(".email").focus();
    }

    async addUser() {
        const email = this.shadowRoot.querySelector(".email").value;

        if (!email.match(/.+@.+\..+/)) {
            window.showToast("Invalid email", 3000);
            return;
        }

        var usermail = document.querySelector('auth-component').user.email;

        await window.wisk.editor.addConfigChange([{path: "document.config.access.add", values: { email: email }}]);

        this.shadowRoot.querySelector(".email").value = "";
        this.users.push(email);
        this.requestUpdate();
    }

    async removeUser(user) {
        window.showToast("Removing user...", 3000);
        await window.wisk.editor.addConfigChange([{path: "document.config.access.remove", values: { email: user }}]);
        window.showToast("User removed!", 3000);

        return () => {
            this.users = this.users.filter((u) => u !== user);
            this.requestUpdate();
        }
    }

    render() {
        return html`
            <div class="option-section">
                <div style="display: flex; gap: var(--gap-2); align-items: stretch; width: 100%; flex-wrap: wrap" class="od">
                    <img src="/a7/plugins/share-component/plus.svg" alt="plus" style="filter: var(--themed-svg); padding-left: var(--padding-3)" />
                    <input type="text" placeholder="Share" class="email" @keydown=${(e) => {if (e.key === "Enter") this.addUser()}} />
                    <button @click=${this.addUser}>Add em!</button>
                </div>

                <div class="od ox">
                    <p>Shared with (these have editor access): ${this.users.length? "": "No one yet!"}</p> 
                    ${this.users.map((user) => html`
                        <span class="user">${user}
                            <img src="/a7/plugins/share-component/x.svg" alt="x" style="filter: var(--themed-svg)" @click=${() => this.removeUser(user)} />
                        </span>
                    `)}
                </div>

                <div class="od ox" style="display: none">
                    <label for="perm" style="flex: 1">Share publicly</label>
                    <input type="checkbox" id="perm" style="width: 20px; height: 20px;"/>
                </div>
            </div>
        `;
    }
}

customElements.define('share-component', ShareComponent);
