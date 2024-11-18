window.wisk = window.wisk || {};

window.wisk.plugins = {
    defaultPlugins: [],
    loadedPlugins: [],
    pluginData: {},
    loadPlugin: function(plugin) {},
    references: [],
};
window.wisk.db = {
    getItem: function(pageId) {},
    setItem: function(pageId, value) {},
    removeItem: function(pageId) {},
    getAllItems: function() {},
};

window.wisk.theme = {
    themeObject: { themes: [] },
    setTheme: function(theme) {},
    getTheme: function() {},
    getThemes: function() {},
    getThemeData: function(theme) {},
};

window.wisk.editor = {
    showSelector: function(elementId) {},
    generateNewId: function() {},
    pageId: "",
    elements: [],
    data: {},
    wiskSite: false,
    createNewBlock: function(elementId, blockType, value, focusIdentifier) {},
    deleteBlock: function(elementId) {},
    focusBlock: function(elementId, identifier) {},
    updateBlock: function(elementId, path, newValue) {},
    runBlockFunction: function(elementId, functionName, arg) {},
    justUpdates: function(elementId, value) {},
    showSelector: function(elementId, focusIdentifier) {},
    registerCommand: function(name, description, category, callback, shortcut) {},
};

window.wisk.utils = {
    showToast: function(message, duration) {},
    showInfo: function(message) {},
    showLoading: function(message) {},
    hideLoading: function() {},
};

if (window.location.href.includes(".wisk.site")) {
    window.wisk.editor.wiskSite = true;
    const subdomain = window.location.href.split("https://")[1].split(".wisk.site")[0];
    SERVER = "https://" + subdomain + ".wisk.site";
}
