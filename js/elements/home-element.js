import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class HomeElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            color: var(--text-1);
            transition: all 0.3s;
            user-select: none;
        }

        .container {
            padding: var(--padding-4);
            max-width: 890px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: var(--gap-4);
        }

        .section {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            padding: calc(2 * var(--padding-4)) 0;
        }

        .section-title {
            font-size: 1.5rem;
            color: var(--text-1);
        }

        .search-div {
            padding: var(--padding-3);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            background-color: var(--bg-2);
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            max-width: 400px;
        }

        .search-input {
            width: 100%;
            color: var(--text-1);
            font-size: 14px;
            outline: none;
            border: none;
            background-color: transparent;
        }

        .search-div:has(.search-input:focus-within) {
            border: 1px solid var(--accent-text);
            background-color: var(--accent-bg);
            color: var(--accent-text);
        }

        .search-div:has(.search-input:focus-within) img {
            filter: var(--accent-svg);
        }

        .files-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: var(--gap-3);
        }

        .file-card {
            padding: var(--padding-4);
            border-radius: var(--radius-large);
            background: var(--bg-2);
            cursor: pointer;
            border: none;
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            overflow: hidden;
            text-decoration: none;
        }

        .file-card:hover {
            background: var(--accent-bg);
            color: var(--accent-text);
        }

        .file-card img {
            filter: var(--themed-svg);
        }

        .file-card:hover img {
            filter: var(--accent-svg);
        }

        .templates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: var(--gap-3);
        }

        .template-card {
            padding: 0;
            border-radius: var(--radius-large);
            overflow: hidden;
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            cursor: pointer;
        }

        .template-card:hover {
            background: var(--bg-3);
        }

        .preview-container {
            position: relative;
            overflow: clip;
            height: 120px;
        }

        .desktop-preview {
            width: 300px;
            height: 150px;
            position: absolute;
            top: 0;
            right: -36px;
            object-fit: cover;
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            background-size: cover;
        }

        .template-info h3 {
            color: var(--text-1);
            margin-bottom: var(--gap-1);
            margin-top: var(--gap-3);
            margin-left: var(--gap-3);
        }

        .template-by {
            color: var(--text-2);
            font-size: 12px;
            margin-left: var(--gap-3);
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
    `;

    static properties = {
        files: { type: Array },
        filteredFiles: { type: Array },
        templates: { type: Array },
    };

    constructor() {
        super();
        this.files = [];
        this.filteredFiles = [];
        this.templates = [];
        this.fetchTemplates();
        this.greet = this.getGreeting();
    }

    async fetchFiles() {
        try {
            const auth = await document.getElementById('auth').getUserInfo();
            const response = await fetch('https://cloud.wisk.cc/v1/document', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + auth.token,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch documents');
            }

            const data = await response.json();
            this.files = data.map(item => ({
                id: item.id,
                name: item.title,
            }));
            this.filteredFiles = [...this.files];
            this.requestUpdate();
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    }

    async fetchTemplates() {
        try {
            const response = await fetch('/js/templates/templates.json');
            const data = await response.json();
            this.templates = data.templates;
            this.requestUpdate();
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    }

    filterFiles(e) {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm === '') {
            this.filteredFiles = [...this.files];
        } else {
            this.filteredFiles = this.files.filter(file => file.name.toLowerCase().includes(searchTerm));
        }
    }

    useTemplate(template) {
        window.location.href = `/?template=${template.path}`;
    }

    getGreeting() {
        const hour = new Date().getHours();

        const timeBasedGreetings = {
            morning: ['Good morning!', 'Rise and shine!', 'Top of the morning to you!', 'Good morning, sunshine!'],
            afternoon: ['Good afternoon!', 'Having a good afternoon?', 'Hope your afternoon is going well!', "Wonderful afternoon, isn't it?"],
            evening: ['Good evening!', 'Pleasant evening...', "Hope you're having a nice evening!", 'Lovely evening to you!'],
            night: ['Good night!', 'Have a peaceful night...', 'Sweet dreams!', 'Rest well!'],
        };

        const generalGreetings = [
            'Hello there!',
            'Greetings!',
            'Welcome!',
            'Hey! Nice to see you!',
            'Hi! How are you today?',
            'Hey there!',
            'Great to see you...',
            "Hi, how's it going?",
        ];

        if (Math.random() < 0.5) {
            if (hour >= 5 && hour < 12) {
                return timeBasedGreetings.morning[Math.floor(Math.random() * timeBasedGreetings.morning.length)];
            } else if (hour >= 12 && hour < 17) {
                return timeBasedGreetings.afternoon[Math.floor(Math.random() * timeBasedGreetings.afternoon.length)];
            } else if (hour >= 17 && hour < 21) {
                return timeBasedGreetings.evening[Math.floor(Math.random() * timeBasedGreetings.evening.length)];
            } else {
                return timeBasedGreetings.night[Math.floor(Math.random() * timeBasedGreetings.night.length)];
            }
        } else {
            return generalGreetings[Math.floor(Math.random() * generalGreetings.length)];
        }
    }

    render() {
        return html`
            <div class="container">
                <div class="section" style="margin-top: 60px">
                    <h1 style="text-align: center">${this.greet}</h1>
                </div>

                <div class="section">
                    <h2 class="section-title">Create New</h2>
                    <div class="templates-grid">
                        <div class="template-card" @click=${() => (window.location.href = '/?template=blank')}>
                            <div
                                style="height: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 12px; min-height: 120px"
                            >
                                <h2>Blank</h2>
                                <span class="">Start from scratch</span>
                            </div>
                        </div>

                        ${this.templates.map(
                            template => html`
                                <div class="template-card" @click=${() => this.useTemplate(template)}>
                                    <div class="template-info">
                                        <h3>${template.name}</h3>
                                        <span class="template-by">By ${template.by}</span>
                                    </div>

                                    <div class="preview-container">
                                        <div
                                            class="desktop-preview"
                                            style="background-image: url(/a7/templates/${template.path}/desktop.png)"
                                            alt="${template.name} preview"
                                        ></div>
                                    </div>
                                </div>
                            `
                        )}
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Your Files</h2>
                    <div class="search-div">
                        <img src="/a7/forget/search.svg" alt="Search" style="width: 20px" />
                        <input type="text" class="search-input" placeholder="Search files..." @input=${this.filterFiles} />
                    </div>
                    <div class="files-grid">
                        ${this.filteredFiles.length === 0 ? html` <p>No files found</p> ` : ''}
                        ${this.filteredFiles.map(
                            file => html`
                                <a href="/?id=${file.id}" class="file-card">
                                    <img src="/a7/forget/page-1.svg" alt="File" style="width: 18px" />
                                    ${file.name}
                                </a>
                            `
                        )}
                    </div>
                </div>

                <br />
                <br />
                <br />
                <br />

                <div class="section">
                    <?xml version="1.0" encoding="UTF-8"?><svg
                        width="64px"
                        height="64px"
                        stroke-width="1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#000000"
                    >
                        <path
                            d="M22 8.86222C22 10.4087 21.4062 11.8941 20.3458 12.9929C17.9049 15.523 15.5374 18.1613 13.0053 20.5997C12.4249 21.1505 11.5042 21.1304 10.9488 20.5547L3.65376 12.9929C1.44875 10.7072 1.44875 7.01723 3.65376 4.73157C5.88044 2.42345 9.50794 2.42345 11.7346 4.73157L11.9998 5.00642L12.2648 4.73173C13.3324 3.6245 14.7864 3 16.3053 3C17.8242 3 19.2781 3.62444 20.3458 4.73157C21.4063 5.83045 22 7.31577 22 8.86222Z"
                            stroke="#000000"
                            stroke-width="1.5"
                            stroke-linejoin="round"
                        ></path>
                    </svg>
                    <h2 class="section-title">Thanks for using Wisk!</h2>
                </div>

                <br />
                <br />
                <br />
                <br />
            </div>
        `;
    }
}

customElements.define('home-element', HomeElement);
