var defaultTheme = localStorage.getItem('webapp-theme') || 'Light';

window.wisk.theme.setTheme = async function (themeName) {
    if (window.wisk.editor.wiskSite) {
        if (themeName === 'default') {
            themeName = 'Light'
        }
    } else {
        if (themeName === 'default') {
            themeName = defaultTheme;
        }
    }

    console.log('Setting theme:', themeName, window.wisk.theme.themeObject);
    let theme = window.wisk.theme.themeObject.themes.find(t => t.name === themeName) || {};

    localStorage.setItem('webapp-theme', themeName);
    
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
        if (key !== 'name') {
            root.style.setProperty(key, value);
        }
    });

    // make a event to notify the theme change
    const event = new CustomEvent('themechange', { detail: { theme: theme } });
    window.dispatchEvent(event);
}

window.wisk.theme.getTheme = function () {
    return localStorage.getItem('webapp-theme');
}

window.wisk.theme.getThemes = function () {
    return window.wisk.theme.themeObject.themes;
}

window.wisk.theme.getThemeData = function (theme) {
    return window.wisk.theme.themeObject.themes.find(t => t.name === theme);
}

async function initTheme() {
    const jsonUrl = SERVER + '/js/theme/theme-data.json';
    try {
        const response = await fetch(jsonUrl);
        const data = await response.json();
        window.wisk.theme.themeObject = data;
        for (let i = 0; i < data.themes.length; i++) {
            window.wisk.editor.registerCommand(data.themes[i].name, "", "Theme", () => window.wisk.theme.setTheme(data.themes[i].name), "");
        }
        await window.wisk.theme.setTheme(defaultTheme);
    } catch (error) {
        console.error('Error loading CSS variables:', error);
    }
}

function importGoogleFont(fontName, fontUrl) {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = fontUrl;

    document.head.appendChild(linkElement);
}

initTheme();
