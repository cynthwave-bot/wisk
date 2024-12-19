import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class OptionsComponent extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
        }
        :host {
            display: block;
        }
        .plugins-toggle {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            cursor: pointer;
        }
        .plugins-manager {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .options-icon-button {
            cursor: pointer;
        }
        .plugins-header {
            display: flex;
            flex-direction: row;
            color: var(--text-1);
            gap: var(--gap-2);
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }
        .plugin-list {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            overflow: auto;
            flex: 1;
            margin-top: var(--gap-3);
        }
        .plugin-item {
            display: flex;
            align-items: center;
            padding: var(--gap-2);
            background-color: var(--bg-2);
            border-radius: var(--radius);
            gap: var(--gap-2);
        }
        .plugin-item:hover {
            background-color: var(--bg-3);
        }
        .plugin-info {
            display: flex;
            flex-direction: column;
            flex: 1;
            cursor: pointer;
            gap: 2px;
            overflow: hidden;
        }
        .plugin-icon {
            padding: var(--padding-3);
            border-radius: var(--radius);
            width: 60px;
            height: 60px;
        }
        .plugin-title {
            font-weight: bold;
        }
        .plugin-description {
            font-size: 14px;
            color: var(--text-2);
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .toggle-switch {
            outline: none;
            border: none;
            cursor: pointer;
            padding: var(--padding-w3);
            border-radius: var(--radius);
            background-color: var(--bg-3);
            color: var(--text-1);
        }
        .plugin-search {
            padding: var(--padding-w2);
            color: var(--text-1);
            background-color: var(--bg-2);
            border-radius: var(--radius);
            outline: none;
            border: 1px solid var(--bg-3);
        }
        .installer-confirm {
            background-color: var(--bg-1);
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            z-index: 100;
        }
        .installer-confirm__header {
            background-color: var(--bg-2);
            padding: var(--padding-3);
            border-radius: var(--radius-large);
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }
        .icon {
            cursor: pointer;
            padding: var(--padding-3);
        }
        .hidden {
            display: none;
        }
        .resp-img {
            mix-blend-mode: difference;
            filter: invert(100%) contrast(1000%) brightness(1000%);
        }
        img {
            filter: var(--themed-svg);
        }
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
        }
        :host {
            display: block;
            position: relative;
            height: 100%;
            overflow: hidden;
        }
        .view-container {
            position: relative;
            height: 100%;
            width: 100%;
        }

        .developer-options {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            padding: var(--padding-3);
        }

        .developer-section {
            background-color: var(--bg-2);
            border-radius: var(--radius);
            padding: var(--padding-3);
        }

        .section-title {
            color: var(--text-1);
            font-weight: bold;
            margin-bottom: var(--gap-2);
        }

        .view {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 0;
            overflow-y: auto;
            display: none;
            flex-direction: column;
            transition: opacity 0.3s ease;
            opacity: 0;
        }

        .view.active {
            display: flex;
            opacity: 1;
        }


        .options-container {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            height: 100%;
        }
        .options-section {
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
        .options-section--column {
            gap: var(--gap-3);
            flex-direction: column;
            align-items: flex-start;
        }
        .options-section--right-aligned {
            flex: 1;
            justify-content: flex-end;
            gap: var(--gap-3);
            align-items: flex-end;
        }
        .options-select {
            padding: 5px;
            color: var(--text-1);
            border: 1px solid var(--border-1);
            background-color: var(--bg-2);
            outline: none;
            border-radius: var(--radius);
            transition: border-color 0.2s ease, background-color 0.2s ease;

            scrollbar-width: thin;
            scrollbar-color: var(--text-2) var(--bg-3);
        }
        .options-select:hover {
            border-color: var(--border-2);
            background-color: var(--bg-3);
        }
        .plugins-toggle {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            cursor: pointer;
            padding: var(--padding-3);
            border-radius: var(--radius);
            transition: background-color 0.2s ease;
            width: 100%;
        }
        .plugins-toggle:hover {
            background-color: var(--bg-2);
        }
        .plugins-manager {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .plugins-header {
            display: flex;
            flex-direction: row;
            color: var(--text-1);
            gap: var(--gap-2);
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }
        .plugin-list {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            overflow: auto;
            flex: 1;
            margin-top: var(--gap-3);
        }
        .plugin-item {
            display: flex;
            align-items: center;
            padding: var(--gap-2);
            background-color: var(--bg-2);
            border-radius: var(--radius);
            gap: var(--gap-2);
            transition: all 0.2s ease;
            transform: translateX(0);
        }
        .plugin-item:hover {
            background-color: var(--bg-3);
        }
        .plugin-info {
            display: flex;
            flex-direction: column;
            flex: 1;
            cursor: pointer;
            gap: 2px;
            overflow: hidden;
        }
        .plugin-icon {
            padding: var(--padding-3);
            border-radius: var(--radius);
            transition: transform 0.2s ease;
        }
        .plugin-item:hover .plugin-icon {
        }
        .plugin-title {
            font-weight: bold;
        }
        .plugin-description {
            font-size: 14px;
            color: var(--text-2);
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .plugin-search {
            padding: var(--padding-w2);
            color: var(--text-1);
            background-color: var(--bg-2);
            border-radius: var(--radius);
            outline: none;
            border: 1px solid var(--bg-3);
            transition: all 0.2s ease;
            width: 100%;
            max-width: 300px;
            margin-right: 2px;
        }
        .plugin-search:focus {
            border-color: var(--border-2);
            background-color: var(--bg-1);
            box-shadow: 0 0 0 2px var(--bg-3);
        }
        .toggle-switch {
            outline: none;
            border: none;
            cursor: pointer;
            padding: var(--padding-w3);
            border-radius: var(--radius);
            background-color: var(--bg-3);
            color: var(--text-1);
            transition: all 0.2s ease;
        }
        .btn-primary {
            background-color: var(--fg-blue);
            color: var(--bg-blue);
            font-weight: bold;
        }
        .btn-primary:hover:not(:disabled) {
            filter: brightness(1.1);
        }
        .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        .installer-confirm {
            background-color: var(--bg-1);
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }
        .installer-confirm__header {
            background-color: var(--bg-2);
            padding: var(--padding-3);
            border-radius: var(--radius-large);
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }
        .icon {
            cursor: pointer;
            padding: var(--padding-3);
            transition: transform 0.2s ease;
        }
        .icon:hover {
        }
        .hidden {
            display: none;
        }
        .resp-img {
            mix-blend-mode: difference;
            filter: invert(100%) contrast(1000%) brightness(1000%);
        }
        img {
            filter: var(--themed-svg);
        }
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
        .vgap {
            gap: var(--gap-3);
        }
        .link-blue {
            color: var(--fg-blue);
        }
        li {
            padding-left: 10px;
            color: var(--text-2);
        }
        .tags {
            color: var(--text-1);
            font-size: 14px;
            padding: var(--padding-w1);
            background-color: var(--bg-3);
            border-radius: var(--radius);
            margin-right: 5px;
        }
        .btn-primary {
            background-color: var(--fg-blue);
            color: var(--bg-blue);
        }
        .btn-danger {
            background-color: var(--fg-red);
            color: var(--bg-red);
        }
        .btn-primary, .btn-danger {
            font-weight: 600;
            padding: var(--padding-w2);
            cursor: pointer;
            border: 1px solid transparent;
            border-radius: var(--radius);
            outline: none;
        }
        .btn-primary:hover {
            background-color: var(--bg-blue);
            color: var(--fg-blue);
            border: 1px solid var(--fg-blue);
        }
        .btn-danger:hover {
            background-color: var(--bg-red);
            color: var(--fg-red);
            border: 1px solid var(--fg-red);
        }
        .options-select::-webkit-scrollbar {
            width: 15px;
        }
        .options-select::-webkit-scrollbar-track {
            background: var(--bg-3);
            border-radius: var(--radius);
        }
        .options-select::-webkit-scrollbar-thumb {
            background-color: var(--text-2);
            border-radius: 20px;
            border: 4px solid var(--bg-3);
        }
        .options-select:hover {
            border-color: var(--border-2);
            background-color: var(--bg-3);
        }
        *::marker {
            color: var(--bg-1);
        }
    `;

    static properties = {
        plugins: { type: Array },
        searchTerm: { type: String },
        currentView: { type: String },
        selectedPlugin: { type: Object }
    };

    constructor() {
        super();
        this.plugins = [];
        this.searchTerm = '';
        this.currentView = 'main';
        this.selectedPlugin = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadPlugins();
    }

    showAboutView() {
        this.currentView = 'about';
    }

    showSettingsView() {
        this.currentView = 'settings';
    }

    loadPlugins() {
        if (window.wisk.plugins.pluginData && window.wisk.plugins.pluginData.list) {
            this.plugins = Object.values(window.wisk.plugins.pluginData.list)
                .filter(plugin => !window.wisk.plugins.defaultPlugins.includes(plugin.name));
        }
    }

    handleSearch(e) {
        this.searchTerm = e.target.value.toLowerCase();
    }

    showPluginsManager() {
        this.currentView = 'plugins';
    }

    showMainView() {
        this.currentView = 'main';
    }

    togglePlugin(plugin) {
        this.selectedPlugin = plugin;
        this.currentView = 'plugin-details';
    }

    async handlePluginInstall(plugin) {
        await window.wisk.plugins.loadPlugin(plugin.name);
        await window.wisk.editor.addConfigChange([{path: "document.config.plugins.add", values: { plugin: plugin.name }}]);
        this.requestUpdate();
    }

    isPluginInstalled(pluginName) {
        return window.wisk.plugins.loadedPlugins.includes(pluginName);
    }

    opened() {
        // TODO reset window;
        this.currentView = 'main';
        this.shadowRoot.querySelector('.plugin-search').value = '';
        this.handleSearch({ target: { value: '' } });
        this.requestUpdate();
    }

    async changeTheme(e) {
        window.wisk.theme.setTheme(e.target.value);
        await window.wisk.editor.addConfigChange([{path: "document.config.theme", values: { theme: e.target.value }}]);
    }

    setTheme(theme) {
        window.wisk.theme.setTheme(theme);
    }

    showDeveloperView() {
        this.currentView = 'developer';
    }

    render() {
        const filteredPlugins = this.plugins.filter(plugin => 
            plugin.title.toLowerCase().includes(this.searchTerm) || 
            plugin.description.toLowerCase().includes(this.searchTerm) ||
            plugin.tags.some(tag => tag.toLowerCase().includes(this.searchTerm)) ||
            plugin.author.toLowerCase().includes(this.searchTerm)
        );

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        var parts = [];
        if (this.currentView === 'plugin-details') {
            parts = this.selectedPlugin.description.split(urlRegex);
        }

        return html`
            <div class="view-container" data-view="${this.currentView}">
                <!-- Main View -->
                <div class="view ${this.currentView === 'main' ? 'active' : ''}">

                    <div class="options-section options-section--animated">
                        <label for="themeDropdown">Theme</label>
                        <select id="themeDropdown" class="options-select" @change="${(e) => this.changeTheme(e)}">
                            ${window.wisk.theme.getThemes().map(theme => html`
                                <option value="${theme.name}" ?selected="${theme.name === window.wisk.theme.getTheme()}"> ${theme.name} </option>
                            `)}
                        </select>
                    </div>

                    <div class="plugins-toggle options-section" @click="${this.showPluginsManager}">
                        <label>Plugins</label>
                        <img src="/a7/iconoir/right.svg" alt="Plugins" class="icon" draggable="false"/>
                    </div>

                    <div class="plugins-toggle options-section" @click="${this.showSettingsView}">
                        <label>Settings</label>
                        <img src="/a7/iconoir/right.svg" alt="About" class="icon" draggable="false"/>
                    </div>

                    <div style="flex: 1"></div>
                    <p style="color: var(--text-2); padding: 10px 0">
                        btw you can also create your own plugins and themes, check out the 
                        <a href="https://wisk.cc/docs" target="_blank" style="color: var(--fg-blue)">docs</a>
                    </p>
                </div>

                <!-- Plugins View -->
                <div class="view ${this.currentView === 'plugins' ? 'active' : ''}">
                    <div class="plugins-header" style="margin-bottom: 10px">
                        <div class="plugins-header">
                            <img src="/a7/iconoir/left.svg" alt="Back" @click="${this.showMainView}" class="icon" draggable="false"/>
                            <label for="pluginSearch">Plugins</label>
                        </div>

                        <input id="pluginSearch" type="text" placeholder="Search plugins" class="plugin-search" @input="${this.handleSearch}" style="flex: 1"/>
                    </div>

                    <div class="plugin-list">
                        ${filteredPlugins.sort((a, b) => a.title.localeCompare(b.title)).map(plugin => html`
                            <div class="plugin-item" @click="${() => this.togglePlugin(plugin)}" style="cursor: pointer;">
                                <img src="${SERVER + window.wisk.plugins.pluginData["icon-path"] + plugin.icon}" alt="${plugin.title}" class="plugin-icon"
                                    draggable="false"/>
                                <div class="plugin-info">
                                    <span class="plugin-title">${plugin.title} </span> 
                                    <span class="plugin-description">${plugin.description}</span>
                                </div>
                            </div>
                        `)}
                    </div>
                </div>

                <!-- Plugin Details View -->
                <div class="view vgap ${this.currentView === 'plugin-details' ? 'active' : ''}">
                    ${this.selectedPlugin ? html`
                        <div class="plugins-header" style="margin-bottom: 10px">
                            <div class="plugins-header">
                                <img src="/a7/iconoir/left.svg" alt="Back" @click="${() => this.currentView = 'plugins'}" class="icon" draggable="false"/>
                                <label>Plugin Details</label>
                            </div>
                        </div>

                        <div class="installer-confirm__header">
                            <img src="${SERVER + window.wisk.plugins.pluginData["icon-path"] + this.selectedPlugin.icon}" class="plugin-icon" draggable="false"/>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <h4>${this.selectedPlugin.title}</h4>
                                <p style="font-size: 14px">
                                    made by 
                                    <a href="${this.selectedPlugin.contact}" target="_blank" style="color: var(--text-2)" > ${this.selectedPlugin.author} </a>
                                </p>
                            </div>
                            <div style="flex: 1"></div>
                            <div style="padding: var(--padding-3); display: flex; align-items: center; justify-content: center;">
                                <button class="toggle-switch btn-primary" @click="${() => this.handlePluginInstall(this.selectedPlugin)}"
                                    ?disabled="${this.isPluginInstalled(this.selectedPlugin.name)}">
                                    ${this.isPluginInstalled(this.selectedPlugin.name) ? 'Installed' : 'Install'}
                                </button>
                            </div>
                        </div>

                        <div class="options-section options-section--column">
                            <div>
                                <span class="tags">${ this.selectedPlugin.contents.map(content => content.category).join(', ') }</span>
                                ${this.selectedPlugin.contents.some(content => content.nav) ? html`<span class="tags">navigation</span>` : ''}
                                ${this.selectedPlugin.contents.some(content => content.experimental) ? html`<span class="tags">experimental</span>` : ''}
                            </div>
                            <p>
                                ${parts.map((part, index) => {
                                    if (part.match(urlRegex)) {
                                        return html`<a href="${part}" class="link-blue" target="_blank">${part.replace(/(^\w+:|^)\/\//, '')}</a>`;
                                    }
                                    return part;
                                })}
                            </p>
                        </div>
                    ` : ''}
                </div>

                <!-- Developer View -->
                <div class="view ${this.currentView === 'developer' ? 'active' : ''}">
                    <div class="plugins-header" style="margin-bottom: 10px">
                        <div class="plugins-header">
                            <img src="/a7/iconoir/left.svg" alt="Back" @click="${this.showSettingsView}" class="icon" draggable="false"/>
                            <label>Developer Mode</label>
                        </div>
                    </div>

                    <div class="developer-options">
                        <div class="developer-section">
                            <p style="color: var(--text-2)">Coming soon...</p>
                        </div>
                    </div>
                </div>

                <!-- Settings View -->
                <div class="view ${this.currentView === 'settings' ? 'active' : ''}">
                    <div class="plugins-header" style="margin-bottom: 10px">
                        <div class="plugins-header">
                            <img src="/a7/iconoir/left.svg" alt="Back" @click="${this.showMainView}" class="icon" draggable="false"/>
                            <label>Settings</label>
                        </div>
                    </div>

                    <div class="options-section options-section--animated">
                        <label>Sign Out</label>
                        <button id="signOut" class="btn-danger" @click="${() => window.wisk.auth.logOut()}">Sign Out</button>
                    </div>

                    <div class="plugins-toggle options-section" @click="${this.showAboutView}">
                        <label>About</label>
                        <img src="/a7/iconoir/right.svg" alt="About" class="icon" draggable="false"/>
                    </div>

                    <div class="plugins-toggle options-section" @click="${this.showDeveloperView}">
                        <label>Developer Mode</label>
                        <img src="/a7/iconoir/right.svg" alt="Developer" class="icon" draggable="false"/>
                    </div>

                </div>


                <!-- About View -->
                <div class="view ${this.currentView === 'about' ? 'active' : ''}">
                    <div class="plugins-header" style="margin-bottom: 10px">
                        <div class="plugins-header">
                            <img src="/a7/iconoir/left.svg" alt="Back" @click="${this.showSettingsView}" class="icon" draggable="false"/>
                            <label>About</label>
                        </div>
                    </div>

                    <div style="flex: 1; overflow-y: auto">
                        <div class="options-section options-section--column">
                            <h1 style="color: var(--text-1); display: flex; width: 100%; align-items: center; justify-content: center; gap: 12px;">
                                <img src="/a7/wisk-logo.svg" alt="Wisk" class="resp-img" style="width: 38px; filter: var(--themed-svg)" draggable="false"/> Wisk
                            </h1>
                            <h3 style="color: var(--text-1); width: 100%; text-align: center;">Your Workspace, Built Your Way.</h3>
                            <p style="color: var(--text-2); text-align: center; width: 100%">
                                Notes, reports, tasks, and collaboration — offline and customizable. (yes we have AI too!)
                            </p>
                        </div>

                        <hr style="border: 1px solid var(--border-1); margin: 20px 10px"/>

                        <div class="options-section options-section--column">
                            <h3 style="color: var(--text-2)">License</h3>
                            <div style="display: flex; flex-direction: column; gap: var(--gap-1)">
                                <p style="color: var(--text-2)">
                                    Licensed under the Functional Source License (FSL), Version 1.1, with Apache License Version 2.0 as the Future License.
                                    See the <a href="https://app.wisk.cc/LICENSE.md" target="_blank" class="link-blue">LICENSE.md</a> for more details.

                                </p>
                            </div>
                        </div>

                        <hr style="border: 1px solid var(--border-1); margin: 20px 10px"/>

                        <div class="options-section options-section--column">
                            <h3 style="color: var(--text-2)">Credits</h3>
                            <div style="display: flex; flex-direction: column; gap: var(--gap-1)">
                                <p style="color: var(--text-2)">
                                    All icons in the webapp are from
                                    <ul>
                                        <li> • <a href="https://iconoir.com/" target="_blank" class="link-blue">Iconoir</a>, An open source icons library with 1500+ icons. </li>
                                        <li> • <a href="https://www.svgrepo.com/collection/zest-interface-icons/" target="_blank" class="link-blue">Zest Interface Icons</a>, A collection of 1000+ free SVG icons. </li>
                                        <li> • <a href="https://heroicons.com/" target="_blank" class="link-blue">Heroicons</a>, Beautiful hand-crafted SVG icons, by the makers of Tailwind CSS. </li>
                                        <li> • <a href="https://github.com/sohzm" target="_blank" class="link-blue">Me</a>, I made some too!</li>
                                    </ul>
                                </p>
                                <p style="color: var(--text-2)">
                                    Fonts are provided by <a href="https://fonts.google.com/" target="_blank" class="link-blue">Google Fonts</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define("options-component", OptionsComponent);
