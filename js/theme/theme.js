var defaultTheme = localStorage.getItem('webapp-theme') || 'Light';

window.wisk.theme.setTheme = async function (themeName) {
    if (window.wisk.editor.wiskSite) {
        if (themeName === 'default') {
            themeName = 'Light';
        }
    } else {
        if (themeName === 'default') {
            themeName = defaultTheme;
        }
    }

    console.log('Setting theme:', themeName, window.wisk.theme.themeObject);
    let theme = window.wisk.theme.themeObject.themes.find(t => t.name === themeName);

    if (theme === undefined) {
        console.error('Theme not found:', themeName);
        console.error(
            'Available themes:',
            window.wisk.theme.themeObject.themes.map(t => t.name)
        );
        return;
    }

    localStorage.setItem('webapp-theme', themeName);

    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
        if (key !== 'name') {
            root.style.setProperty(key, value);
        }
    });

    const textColor = theme['--text-1'] || '#000000';
    const bgColor = theme['--bg-1'] || '#ffffff';
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/svg+xml';
    favicon.href = createThemedFaviconSVG(textColor, bgColor);
    document.head.appendChild(favicon);

    // make a event to notify the theme change
    const event = new CustomEvent('wisk-theme-changed', { detail: { theme: theme } });
    window.dispatchEvent(event);
};

window.wisk.theme.getTheme = function () {
    return localStorage.getItem('webapp-theme');
};

window.wisk.theme.getThemes = function () {
    return window.wisk.theme.themeObject.themes;
};

window.wisk.theme.getThemeData = function (theme) {
    return window.wisk.theme.themeObject.themes.find(t => t.name === theme);
};

async function initTheme() {
    const jsonUrl = SERVER + '/js/theme/theme-data.json';
    try {
        const response = await fetch(jsonUrl);
        const data = await response.json();
        window.wisk.theme.themeObject = data;
        for (let i = 0; i < data.themes.length; i++) {
            window.wisk.editor.registerCommand(data.themes[i].name, '', 'Theme', () => window.wisk.theme.setTheme(data.themes[i].name), '');
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

function createThemedFaviconSVG(textColor, bgColor) {
    const svgContent = `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="100" fill="${bgColor}"/>
            <g transform="translate(18.5, 18.5)">
                <path d="M141.983 31.5492L80.3901 54.8666C75.573 56.6902 74.3086 62.9164 78.0329 66.4745L125.003 111.35C128.962 115.132 135.535 113.109 136.683 107.756L151.306 39.5635C152.468 34.1429 147.168 29.5864 141.983 31.5492Z" fill="${textColor}"/>
                <path d="M83.1785 95.4337L38.4727 52.5974C34.5341 48.8236 27.9837 50.8051 26.7973 56.1293L11.8953 123.006C10.6693 128.509 16.118 133.129 21.3461 131.021L80.9538 106.98C85.6662 105.079 86.8474 98.9491 83.1785 95.4337Z" fill="${textColor}"/>
            </g>
        </svg>
    `;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
}

initTheme();
