import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class OptionsComponent extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
            user-select: none;
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
        .tags-div {
            display: flex;
            flex-wrap: wrap;
            gap: var(--gap-1);
            flex-direction: row;
            display: none; /* hidden for now */
        }
        .tags-div-inner {
            color: var(--fg-blue);
            font-size: 14px;
            padding: var(--padding-w1);
            background-color: var(--bg-blue);
            border-radius: var(--radius);
            margin-right: 5px;
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
            transition:
                opacity 0.3s ease,
                transform 0.3s ease;
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
            transition:
                border-color 0.2s ease,
                background-color 0.2s ease;

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
        .plugins-toggle-nohover {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: var(--padding-3);
            border-radius: var(--radius);
            transition: background-color 0.2s ease;
            width: 100%;
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
        *::-webkit-scrollbar-thumb:hover {
            background-color: var(--text-1);
        }

        .vgap {
            gap: var(--gap-2);
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
        .btn-primary,
        .btn-danger {
            font-weight: 600;
            padding: var(--padding-w2);
            cursor: pointer;
            border: 2px solid transparent;
            border-radius: var(--radius);
            outline: none;
        }
        .btn-primary:hover {
            background-color: var(--bg-blue);
            color: var(--fg-blue);
            border: 2px solid var(--fg-blue);
        }
        .btn-danger:hover {
            background-color: var(--bg-red);
            color: var(--fg-red);
            border: 2px solid var(--fg-red);
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

        .themes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 10px;
            overflow: auto;
        }

        .theme-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            background-color: var(--bg-2);
            border-radius: var(--radius);
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .theme-card:hover {
            background-color: var(--bg-3);
        }

        .theme-card.selected {
            border: 2px solid var(--fg-blue);
        }

        .theme-preview {
            width: 100%;
            height: 100px;
            background-color: var(--bg-1);
            border-radius: var(--radius);
            margin-bottom: 7px;
            font-family: var(--font);
            color: var(--text-1);
            font-size: 14px;
            display: flex;
            align-items: flex-end;
            overflow: hidden;
        }

        .theme-name {
            font-weight: bold;
            color: var(--text-1);
            height: 27px;
        }

        .apply-button {
            margin-top: 20px;
            padding: 8px 16px;
            background-color: var(--fg-blue);
            color: var(--bg-blue);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            font-weight: bold;
        }
        .apply-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        .options-section-inside {
            margin-top: var(--gap-2);
            width: 100%;
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: 8px 4px;
            margin-top: var(--gap-2);
            width: 100%;
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: 8px 4px;
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            padding: var(--padding-3);
        }
        .devops {
            background-color: var(--text-1);
            color: var(--bg-1);
            border: 2px solid var(--text-1);
        }
        .devops:hover {
            background-color: var(--bg-1);
            color: var(--text-1);
            border: 2px solid var(--text-1);
        }
    `;

    static properties = {
        plugins: { type: Array },
        searchTerm: { type: String },
        currentView: { type: String },
        selectedPlugin: { type: Object },
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

    showThemesView() {
        this.currentView = 'themes';
    }

    loadPlugins() {
        if (wisk.plugins.pluginData && wisk.plugins.pluginData.list) {
            this.plugins = Object.values(wisk.plugins.pluginData.list).filter(plugin => !wisk.plugins.defaultPlugins.includes(plugin.name));
        }
    }

    handleSearch(e) {
        this.searchTerm = e.target.value.toLowerCase();
    }

    // TODO: unhardcode the server url, also should have a better way to detect electron
    async checkForUpdatesX() {
        const response = await fetch('http://localhost:30007/app-nav/check-update');
        const data = await response.json();
        if (data.updateAvailable) {
            wisk.utils.showToast('Update available, Click to update', 3000);
            this.shadowRoot.querySelector('#update-available').style.display = 'flex';
            this.shadowRoot.querySelector('#check-update').style.display = 'none';
        }
    }

    // fuckkkkkkkkkkk me performUpdate is a lit element method ig.....
    // so added X at the end, wasted a lot of time on this
    async performUpdateX() {
        const response = await fetch('http://localhost:30007/app-nav/update');
        const data = await response.json();
        if (data.success) {
            alert('Update completed. Please restart the app.');
        }
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
        await wisk.plugins.loadPlugin(plugin.name);
        await wisk.editor.addConfigChange([{ path: 'document.config.plugins.add', values: { plugin: plugin.name } }]);
        this.requestUpdate();
    }

    isPluginInstalled(pluginName) {
        return wisk.plugins.loadedPlugins.includes(pluginName);
    }

    opened() {
        // TODO reset window;
        this.currentView = 'main';
        this.shadowRoot.querySelector('.plugin-search').value = '';
        this.handleSearch({ target: { value: '' } });
        this.requestUpdate();
    }

    async changeTheme(theme) {
        this.selectedTheme = theme;
        wisk.theme.setTheme(theme);
        await wisk.editor.addConfigChange([{ path: 'document.config.theme', values: { theme: theme } }]);
        this.requestUpdate();
    }

    setTheme(theme) {
        wisk.theme.setTheme(theme);
    }

    showDeveloperView() {
        this.currentView = 'developer';
    }

    render() {
        var filteredPlugins = this.plugins.filter(
            plugin =>
                plugin.title.toLowerCase().includes(this.searchTerm) ||
                plugin.description.toLowerCase().includes(this.searchTerm) ||
                plugin.tags.some(tag => tag.toLowerCase().includes(this.searchTerm)) ||
                plugin.author.toLowerCase().includes(this.searchTerm) ||
                plugin.contents.some(content => content.experimental && 'experimental'.includes(this.searchTerm))
        );

        // if plugin.hide is true, don't show it
        filteredPlugins = filteredPlugins.filter(plugin => !plugin.hide);

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        var parts = [];
        if (this.currentView === 'plugin-details') {
            parts = this.selectedPlugin.description.split(urlRegex);
        }

        return html`
            <div class="view-container" data-view="${this.currentView}">
                <!-- Main View -->
                <div class="view ${this.currentView === 'main' ? 'active' : ''}">

                    <div class="plugins-toggle options-section" @click="${this.showThemesView}">
                        <label>Themes</label>
                        <img src="/a7/iconoir/right.svg" alt="Themes" class="icon" draggable="false"/>
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
                        ${filteredPlugins
                            .sort((a, b) => a.title.localeCompare(b.title))
                            .map(
                                plugin => html`
                                    <div class="plugin-item" @click="${() => this.togglePlugin(plugin)}" style="cursor: pointer;">
                                        <img
                                            src="${SERVER + wisk.plugins.pluginData['icon-path'] + plugin.icon}"
                                            alt="${plugin.title}"
                                            class="plugin-icon"
                                            draggable="false"
                                        />
                                        <div class="plugin-info">
                                            <span class="plugin-title">${plugin.title} </span>
                                            <span class="plugin-description">${plugin.description}</span>
                                        </div>
                                    </div>
                                `
                            )}
                    </div>
                </div>

                <!-- Plugin Details View -->
                <div class="view vgap ${this.currentView === 'plugin-details' ? 'active' : ''}">
                    ${
                        this.selectedPlugin
                            ? html`
                                  <div class="plugins-header" style="margin-bottom: 10px">
                                      <div class="plugins-header">
                                          <img
                                              src="/a7/iconoir/left.svg"
                                              alt="Back"
                                              @click="${() => (this.currentView = 'plugins')}"
                                              class="icon"
                                              draggable="false"
                                          />
                                          <label>Plugin Details</label>
                                      </div>
                                  </div>

                                  <div class="installer-confirm__header">
                                      <img
                                          src="${SERVER + wisk.plugins.pluginData['icon-path'] + this.selectedPlugin.icon}"
                                          class="plugin-icon"
                                          draggable="false"
                                      />
                                      <div style="display: flex; flex-direction: column; gap: 5px;">
                                          <h4>${this.selectedPlugin.title}</h4>
                                          <p style="font-size: 14px">
                                              made by
                                              <a href="${this.selectedPlugin.contact}" target="_blank" style="color: var(--text-2)">
                                                  ${this.selectedPlugin.author}
                                              </a>
                                          </p>
                                      </div>
                                      <div style="flex: 1"></div>
                                      <div style="padding: var(--padding-3); display: flex; align-items: center; justify-content: center;">
                                          <button
                                              class="toggle-switch btn-primary"
                                              @click="${() => this.handlePluginInstall(this.selectedPlugin)}"
                                              ?disabled="${this.isPluginInstalled(this.selectedPlugin.name)}"
                                          >
                                              ${this.isPluginInstalled(this.selectedPlugin.name) ? 'Installed' : 'Install'}
                                          </button>
                                      </div>
                                  </div>

                                  <div class="options-section options-section--column">
                                      ${this.selectedPlugin.contents.some(
                                          content =>
                                              content.category.includes('mini-dialog') ||
                                              content.category.includes('full-dialog') ||
                                              content.category.includes('right-sidebar') ||
                                              content.category.includes('left-sidebar') ||
                                              content.category.includes('component') ||
                                              content.category.includes('auto') ||
                                              content.category.includes('context-box') ||
                                              content.nav ||
                                              content.experimental
                                      )
                                          ? html`
                                                <div class="options-section-inside">
                                                    <div>
                                                        <span class="tags"
                                                            >${this.selectedPlugin.contents.map(content => content.category).join(', ')}</span
                                                        >
                                                        ${this.selectedPlugin.contents.some(content => content.nav)
                                                            ? html`<span class="tags">navigation</span>`
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.experimental)
                                                            ? html`<span class="tags" style="background-color: var(--bg-red); color: var(--fg-red);"
                                                                  >experimental</span
                                                              >`
                                                            : ''}
                                                    </div>

                                                    <ul style="color: var(--text-2); display: flex; flex-direction: column; gap: var(--gap-1)">
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('mini-dialog'))
                                                            ? html` <p style="font-size: 14px;">• opens as a small dialog box</p> `
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('full-dialog'))
                                                            ? html`
                                                                  <p style="font-size: 14px;">
                                                                      • opens as a full-screen dialog box (Not implemented yet)
                                                                  </p>
                                                              `
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('right-sidebar'))
                                                            ? html` <p style="font-size: 14px;">• appears in the right sidebar</p> `
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('left-sidebar'))
                                                            ? html` <p style="font-size: 14px;">• appears in the left sidebar</p> `
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('component'))
                                                            ? html` <p style="font-size: 14px;">• adds a new block to the editor</p> `
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('auto'))
                                                            ? html`
                                                                  <p style="font-size: 14px;">
                                                                      • runs automatically without user intervention/has custom ui
                                                                  </p>
                                                              `
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('context-box'))
                                                            ? html`
                                                                  <p style="font-size: 14px;">
                                                                      • appears as a context menu or box (Not implemented yet)
                                                                  </p>
                                                              `
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.experimental)
                                                            ? html`
                                                                  <p style="font-size: 14px;">
                                                                      • is experimental and may cause issues and is not recommended to use
                                                                  </p>
                                                              `
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.nav)
                                                            ? html` <p style="font-size: 14px;">• will be shown in the navigation bar</p> `
                                                            : ''}
                                                    </ul>
                                                </div>
                                            `
                                          : ''}

                                      <div class="tags-div">
                                          ${this.selectedPlugin.tags.map(tag => html`<span class="tags-div-inner">#${tag}</span>`)}
                                      </div>

                                      <p>
                                          ${parts.map((part, index) => {
                                              if (part.match(urlRegex)) {
                                                  return html`<a href="${part}" class="link-blue" target="_blank"
                                                      >${part.replace(/(^\w+:|^)\/\//, '')}</a
                                                  >`;
                                              }
                                              return part;
                                          })}
                                      </p>
                                  </div>
                              `
                            : ''
                    }
                </div>

                <!-- Developer View -->
                <div class="view ${this.currentView === 'developer' ? 'active' : ''}">
                    <div class="plugins-header" style="margin-bottom: 10px">
                        <div class="plugins-header">
                            <img src="/a7/iconoir/left.svg" alt="Back" @click="${this.showSettingsView}" class="icon" draggable="false"/>
                            <label>Developer Options</label>
                        </div>
                    </div>

                    <div style="flex: 1; display: flex; flex-direction: column; overflow: auto">
                        <div class="plugins-toggle-nohover options-section">
                            <label>Copy Template Configurations</label>
                            <button class="toggle-switch btn-primary devops" @click="${() => this.copyTemplateConfigurations()}">Copy</button>
                        </div>

                        <div class="plugins-toggle-nohover options-section" style="flex-direction: column; gap: var(--gap-2); align-items: stretch">
                            <div style="display: flex; flex-direction: row; gap: var(--gap-2); align-items: center; justify-content: space-between;">
                                <label>Add Theme Object</label>
                                <button class="toggle-switch btn-primary devops" 
                                    @click="${() => wisk.theme.addTheme(this.shadowRoot.querySelector('#theme-tx').value)}"> Apply
                                </button>
                            </div>
                            
                            <textarea class="options-select" id="theme-tx" placeholder="Enter theme object here" 
                                style="height: 200px; resize: none; font-family: var(--font-mono)"></textarea>
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
                        <button id="signOut" class="btn-danger" @click="${() => wisk.auth.logOut()}">Sign Out</button>
                    </div>

                    <div class="options-section options-section--animated" id="check-update" style="display: ${window.location.href.includes('30007') ? 'flex' : 'none'}">
                        <label>Check for Updates</label>
                        <button class="btn-primary" @click="${() => this.checkForUpdatesX()}">Check</button>
                    </div>

                    <div class="options-section options-section--animated" id="update-available" style="display: none">
                        <label>Check for Updates</label>
                        <button class="btn-primary" @click="${() => this.performUpdateX()}">Update</button>
                    </div>

                    <div class="plugins-toggle options-section" @click="${this.showAboutView}">
                        <label>About</label>
                        <img src="/a7/iconoir/right.svg" alt="About" class="icon" draggable="false"/>
                    </div>

                    <div class="plugins-toggle options-section" @click="${this.showDeveloperView}">
                        <label>Developer Options</label>
                        <img src="/a7/iconoir/right.svg" alt="Developer" class="icon" draggable="false"/>
                    </div>

                </div>

                <!-- Themes View -->
                <div class="view ${this.currentView === 'themes' ? 'active' : ''}">
                    <div class="plugins-header" style="margin-bottom: 10px">
                        <div class="plugins-header">
                            <img src="/a7/iconoir/left.svg" alt="Back" @click="${this.showMainView}" class="icon" draggable="false"/>
                            <label>Themes</label>
                        </div>
                    </div>

                    <div class="themes-grid">
                        ${wisk.theme.getThemes().map(
                            theme => html`
                                <div
                                    class="theme-card ${wisk.theme.getTheme() == theme.name ? 'selected' : ''}"
                                    @click="${() => this.changeTheme(theme.name)}"
                                >
                                    <div class="theme-preview" style="background-color: ${theme['--bg-1']};">
                                        <div
                                            style="
                                        border-top: 1px solid ${theme['--border-1']}; border-left: 1px solid ${theme['--border-1']};
                                        border-top-left-radius: ${theme['--radius']}; padding: ${theme['--padding-w1']};
                                        width: 70%; display: block; margin-left: auto; height: 70%;
                                        filter: ${theme['--drop-shadow']};
                                        background-color: ${theme['--bg-2']}; 
                                    "
                                        >
                                            <h1
                                                style="
                                            font-family: ${theme['--font']}; color: ${theme['--text-1']};

                                            "
                                            >
                                                Aa
                                            </h1>
                                            <span
                                                style="
                                            font-family: ${theme['--font']}; color: ${theme['--text-2']};
                                            "
                                                >Aa</span
                                            >
                                        </div>
                                    </div>
                                    <span class="theme-name">${theme.name}</span>
                                </div>
                            `
                        )}
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
                            <h1 style="color: var(--text-1); display: flex; width: 100%; align-items: center; justify-content: center; gap: 12px; font-weight: 500">
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

    copyTemplateConfigurations() {
        var config = {
            plugins: wisk.editor.data.config.plugins,
            theme: wisk.editor.data.config.theme,
            elements: wisk.editor.data.elements,
            name: document.title,
        };

        navigator.clipboard.writeText(JSON.stringify(config)).then(
            function () {
                wisk.utils.showToast('Copied template configurations to clipboard', 3000);
            },
            function (err) {
                wisk.utils.showToast('Failed to copy template configurations', 3000);
            }
        );
    }
}

customElements.define('options-component', OptionsComponent);
