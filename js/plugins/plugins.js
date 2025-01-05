window.wisk.plugins = {
    defaultPlugins: [
        // editor elements
        "text-element",
        "heading1-element",
        "heading2-element",
        "heading3-element",
        "heading4-element",
        "heading5-element",
        "image-element",
        "code-element",
        "list-element",
        "numbered-list-element",
        "checkbox-element",
        "quote-element",
        "callout-element",
        "divider-element",
        "table-element",
        "embed-element",
        "link-preview-element",
        "canvas-element",
        "latex-element",
        "mermaid-element",
        "chart-element",

        // other elements
        'general-chat',
        'manage-citations',
        'share-manager',
        'export-manager',
        "more",
        "left-menu",
    ],
    loadedPlugins: [],
    pluginData: null,
    readyElements: new Map(),
};

async function fetchDataJSON() {
    return fetch(SERVER + "/js/plugins/plugin-data.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .catch((error) => {
            console.error("There was a problem with the fetch operation:", error);
        });
}

function elementReady(elementName) {
    return new Promise((resolve) => {
        if (window.wisk.plugins.readyElements.has(elementName)) {
            resolve();
        } else {
            window.wisk.plugins.readyElements.set(elementName, resolve);
        }
    });
}

async function loadPlugin(pluginName, inx) {
    if (!inx) {
        inx = window.wisk.plugins.loadedPlugins.length;
    }

    if (window.wisk.plugins.loadedPlugins.includes(pluginName)) {
        console.log(`Plugin ${pluginName} is already loaded.`);
        return;
    }

    const pluginData = window.wisk.plugins.pluginData.list[pluginName];
    if (!pluginData) {
        console.error(`Plugin ${pluginName} not found in PluginData.`);
        return;
    }

    const loadPromises = pluginData.contents.map(async (content) => {
        const componentUrl = `${SERVER}/js/plugins/code/${content.component}.js`;
        const response = await fetch(componentUrl);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const scriptText = await response.text();
        const scriptElement = document.createElement("script");
        scriptElement.type = content.loadAsModule ? "module" : "text/javascript";
        scriptElement.textContent = scriptText;
        document.body.appendChild(scriptElement);

        // Wait for the custom element to be defined
        if (content.category != "auto") {
            await customElements.whenDefined(content.component);
        }

        // Add to nav bar if necessary
        if (content.nav === true && !window.wisk.editor.wiskSite) {
            addToNavBar(content, inx);
        }
    });

    await Promise.all(loadPromises);
    window.wisk.plugins.loadedPlugins.push(pluginName);
    console.log(`Plugin loaded: ${pluginName}`);
}

window.wisk.plugins.loadPlugin = loadPlugin;

window.wisk.plugins.getPluginDetail = function (pluginName) {
    for (let key in window.wisk.plugins.pluginData.list) {
        for (let i = 0; i < window.wisk.plugins.pluginData.list[key].contents.length; i++) {
            if (window.wisk.plugins.pluginData.list[key].contents[i].category === "component" && window.wisk.plugins.pluginData.list[key].contents[i].component === pluginName) {
                return window.wisk.plugins.pluginData.list[key].contents[i];
            }
        }
    }
}

async function loadComponent(componentName) {
    for (let key in window.wisk.plugins.pluginData.list) {
        for (let i = 0; i < window.wisk.plugins.pluginData.list[key].contents.length; i++) {
            if (window.wisk.plugins.pluginData.list[key].contents[i].component === componentName) {
                return loadPlugin(key, window.wisk.plugins.loadedPlugins.length);
            }
        }
    }
}

window.wisk.plugins.loadComponent = loadComponent;

function addToNavBar(content, inx) {
    const nav = document.querySelector(".nav-plugins");
    const button = document.createElement("button");
    button.classList.add("nav-button");
    button.title = content.title;

    // Create icon
    const icon = document.createElement("img");
    icon.classList.add("plugin-icon");
    icon.draggable = false;
    icon.src = `${SERVER}${window.wisk.plugins.pluginData["icon-path"]}${content.icon}`;
    button.appendChild(icon);

    if (content.title == "Options") {
        inx = 999;
    }
    button.style.order = inx;

    // Create the component container and add it to the appropriate parent
    const componentElement = document.createElement(content.component);
    componentElement.style.display = 'none';
    componentElement.dataset.pluginComponent = 'true';
    
    // Add component to appropriate container based on category
    let containerSelector;
    switch (content.category) {
        case "mini-dialog":
            containerSelector = '.mini-dialog-body';
            break;
        case "right-sidebar":
            containerSelector = '.right-sidebar-body';
            break;
        case "left-sidebar":
            containerSelector = '.left-sidebar-body';
            break;
    }
    
    const container = document.querySelector(containerSelector);
    container.appendChild(componentElement);

    button.onclick = () => {
        console.log(`Toggling ${content.category}:`, content.title, content.component);
        switch (content.category) {
            case "mini-dialog":
                toggleMiniDialogNew(content.component, content.title);
                break;
            case "right-sidebar":
                toggleRightSidebarNew(content.component, content.title);
                break;
            case "left-sidebar":
                toggleLeftSidebarNew(content.component, content.title);
                break;
        }
    };

    window.wisk.editor.registerCommand("Toggle " + content.title, "", "Plugin", () => { button.click(); }, "");
    nav.appendChild(button);
}

async function loadAllPlugins() {
    window.wisk.utils.showLoading("Loading plugins...");
    try {
        await Promise.all(window.wisk.plugins.defaultPlugins.map(loadPlugin));
        console.log("All plugins loaded");
    } catch (error) {
        console.error("Error loading plugins:", error);
    } finally {
        // window.wisk.utils.hideLoading();
    }
}

async function init() {
    try {
        window.wisk.plugins.pluginData = await fetchDataJSON();
        console.log("Plugin data loaded:", window.wisk.plugins.pluginData);
        await loadAllPlugins();
        // await sync();
    } catch (error) {
        console.error("Initialization error:", error);
    }
}

init();
