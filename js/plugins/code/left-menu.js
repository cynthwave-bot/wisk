import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class LeftMenu extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            color: var(--text-1);
            transition: all 0.3s;
            font-size: 14px;
            user-select: none;
        }
        ul {
            list-style-type: none;
        }
        li {
            padding: var(--padding-2) 0;
            position: relative;
        }
        li a {
            color: var(--text-1);
            text-decoration: none;
            flex: 1;
            display: block;
            padding: var(--padding-w1);
            border-radius: var(--radius);

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .vert-nav {
            display: flex;
            flex-direction: column;
            gap: var(--gap-1);
            padding: var(--padding-2) 0;
        }
        .vert-nav-button {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            color: var(--text-1);
            background-color: var(--bg-1);
            text-decoration: none;
            cursor: pointer;
            outline: none;
            border: none;
            width: 100%;
            color: var(--accent-text);
        }
        .vert-nav-button img {
            width: 18px;
        }
        .vert-nav-button:hover {
            background-color: var(--accent-bg);
        }
        li a:hover {
            background-color: var(--bg-3);
            color: var(--text-1);
        }
        .outer {
            padding: 0 var(--padding-3);
            display: flex;
            flex-direction: column;
            height: 100%;
            gap: var(--gap-2);
        }
        .new {
            display: flex;
            padding: var(--padding-w1);
            text-align: center;
            text-decoration: none;
            border-radius: var(--radius);
            background-color: var(--accent-bg);
            color: var(--accent-text);
            gap: var(--gap-2);
            align-items: center;
            justify-content: center;
            white-space: nowrap;
        }
        .new:hover {
            background-color: var(--bg-3);
            color: var(--text-1);
        }
        .new-img {
            width: 22px;
            height: 22px;
            filter: var(--accent-svg);
        }
        .new:hover .new-img {
            filter: var(--themed-svg);
        }
        #search {
            width: 100%;
            color: var(--text-1);
            font-size: 1rem;
            outline: none;
            border: none;
            background-color: transparent;
            font-size: 14px;
        }
        .search-div img {
            width: 20px;
            height: 20px;
        }
        .search-div {
            padding: var(--padding-w1);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            background-color: var(--bg-2);
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            flex: 1;
        }
        .od {
            padding: var(--padding-w1);
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
        .od:has(.srch:focus) {
            border-color: var(--border-2);
            background-color: var(--bg-1);
            box-shadow: 0 0 0 2px var(--bg-3);
        }
        .item {
            display: flex;
            gap: var(--gap-2);
            align-items: center;
            padding: 0;
        }
        .more-options {
            position: relative;
            padding: 4px;
            border-radius: 100px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
            height: 30px;
            width: 30px;
        }
        .item:hover .more-options {
            opacity: 1;
        }
        .more-options:hover {
            background-color: var(--bg-3);
        }
        .dropdown {
            position: absolute;
            right: 0;
            top: 100%;
            background-color: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: var(--padding-1);
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .dropdown-item {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-2);
            cursor: pointer;
            border-radius: var(--radius);
            color: var(--text-1);
            text-decoration: none;
        }
        .dropdown-item:hover {
            background-color: var(--bg-2);
        }
        img {
            width: 22px;
            filter: var(--themed-svg);
        }
        ::placeholder {
            color: var(--text-2);
        }
        @media (max-width: 900px) {
            .more-options {
                opacity: 1;
            }
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
        filteredList: { type: Array },
        openDropdownId: { type: String },
    };

    constructor() {
        super();
        this.list = [];
        this.filteredList = [];
        this.openDropdownId = null;
    }

    opened() {
        if (window.wisk.editor.wiskSite) return;
        this.setList();
    }

    async setList() {
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
            this.list = data.map(item => ({
                id: item.id,
                name: item.title,
            }));
            this.filteredList = [...this.list];
            this.requestUpdate();
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    }

    async removeItem(id) {
        var result = confirm('Are you sure you want to delete this page?');
        if (!result) {
            return;
        }

        try {
            const auth = await document.getElementById('auth').getUserInfo();
            const response = await fetch(`https://cloud.wisk.cc/v1/document?id=${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer ' + auth.token,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete document');
            }

            this.list = this.list.filter(item => item.id !== id);
            this.filteredList = this.filteredList.filter(item => item.id !== id);
            this.requestUpdate();
        } catch (error) {
            console.error('Error deleting document:', error);
        }

        if (id == window.wisk.editor.pageId) {
            window.location.href = '/';
        }
    }

    levenshteinDistance(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[b.length][a.length];
    }

    fuzzySearch(query, title) {
        query = query.toLowerCase();
        title = title.toLowerCase();
        let queryIndex = 0;
        let titleIndex = 0;
        while (queryIndex < query.length && titleIndex < title.length) {
            if (query[queryIndex] === title[titleIndex]) {
                queryIndex++;
            }
            titleIndex++;
        }
        return queryIndex === query.length;
    }

    filterList(e) {
        if (e.target.value === '') {
            this.filteredList = [...this.list];
            return;
        }
        const searchTerm = e.target.value.toLowerCase();
        this.filteredList = this.list.filter(item => {
            const itemName = item.name.toLowerCase();
            return this.fuzzySearch(searchTerm, itemName) || this.levenshteinDistance(searchTerm, itemName) <= 2;
        });
        this.filteredList.sort((a, b) => {
            const distA = this.levenshteinDistance(searchTerm, a.name.toLowerCase());
            const distB = this.levenshteinDistance(searchTerm, b.name.toLowerCase());
            return distA - distB;
        });
    }

    openInEditor() {
        var url = 'https://app.wisk.cc?id=' + window.wisk.editor.pageId;
        window.open(url, '_blank');
    }

    toggleDropdown(id, e) {
        e.preventDefault();
        e.stopPropagation();
        this.openDropdownId = this.openDropdownId === id ? null : id;
    }

    closeDropdown() {
        this.openDropdownId = null;
    }

    render() {
        if (window.wisk.editor.wiskSite) {
            return html`
                <div class="outer">
                    <button @click=${this.openInEditor} class="new" style="cursor: pointer;">Open in Editor</button>
                </div>
            `;
        }

        return html`
            <div class="outer" @click=${this.closeDropdown}>
                <div class="vert-nav">
                    <button class="vert-nav-button" @click=${() => (window.location.href = '/home')}>
                        <img src="/a7/forget/home.svg" class="new-img" /> Home
                    </button>
                    <button class="vert-nav-button" @click=${() => document.querySelector('neo-ai').expandDialog()}>
                        <img src="/a7/forget/spark.svg" class="new-img" /> Neo AI
                    </button>
                    <button class="vert-nav-button" @click=${() => document.querySelector('template-dialog').show()}>
                        <img src="/a7/forget/layouts.svg" class="new-img" /> Templates
                    </button>
                    <button class="vert-nav-button" @click=${() => document.querySelector('feedback-dialog').show()}>
                        <img src="/a7/forget/feedback.svg" class="new-img" /> Feedback
                    </button>
                    <button class="vert-nav-button" @click=${() => document.querySelector('help-dialog').show()}>
                        <img src="/a7/forget/help.svg" class="new-img" /> Help
                    </button>
                </div>

                <div style="display: flex; gap: 10px; align-items: stretch;">
                    <div class="new-o">
                        <a href="/" class="new"> <img src="/a7/forget/plus1.svg" alt="New Page" class="new-img" /> New Page</a>
                    </div>

                    <div class="search-div od">
                        <img src="/a7/forget/search.svg" alt="Search" />
                        <input type="text" id="search" name="search" class="srch" placeholder="Search Documents" @input=${this.filterList} />
                    </div>
                </div>
                <ul style="flex: 1; overflow: auto;">
                    ${this.filteredList.map(
                        item => html`
                            <li class="item">
                                <a href="?id=${item.id}" style="display: flex; gap: var(--gap-2); align-items: center; font-size: 13px">
                                    <img src="/a7/forget/page-1.svg" alt="File" style="width: 18px; height: 18px; opacity: 0.8" /> ${item.name}
                                </a>
                                <div class="more-options" @click=${e => this.toggleDropdown(item.id, e)}>
                                    <img src="/a7/forget/morex.svg" alt="More options" />
                                    ${this.openDropdownId === item.id
                                        ? html`
                                              <div class="dropdown">
                                                  <div class="dropdown-item" @click=${() => this.removeItem(item.id)}>
                                                      <img src="/a7/forget/trash.svg" alt="Delete" style="width: 20px; height: 20px; padding: 2px;" />
                                                      Delete
                                                  </div>
                                              </div>
                                          `
                                        : ''}
                                </div>
                            </li>
                        `
                    )}
                </ul>

                <div></div>
            </div>
        `;
    }
}

customElements.define('left-menu', LeftMenu);
