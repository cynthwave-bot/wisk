import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

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
        }
        :host {
        }
        ul {
            list-style-type: none;
        }
        li {
            padding: var(--padding-2) 0;
        }
        li a {
            color: var(--text-1);
            text-decoration: none;
            flex: 1;
            display: block;
            padding: var(--padding-w1);
            border-radius: var(--radius);
        }
        li a:hover {
            background-color: var(--bg-3);
            color: var(--text-2);
        }
        .outer {
            padding: var(--padding-4);
        }
        .new {
            display: flex;
            padding: var(--padding-2) var(--padding-3);
            text-align: center;
            text-decoration: none;
            border-radius: var(--radius);
            background-color: var(--bg-1);
            color: var(--text-1);
            border: 1px solid var(--border-1);
            gap: var(--gap-2);
            align-items: center;
            justify-content: center;
            white-space: nowrap;
        }
        .new:hover {
            background-color: var(--bg-2);
        }
        .new-img {
            width: 22px;
            height: 22px;
        }
        #search {
            width: 100%;
            color: var(--text-1);
            font-size: 1rem;
            outline: none;
            border: none;
            background-color: var(--bg-2);
            font-size: 14px;
        }
        .search-div img {
            width: 20px;
            height: 20px;
        }
        .search-div {
            padding: var(--padding-2) var(--padding-3);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            background-color: var(--bg-2);
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            flex: 1;
        }
        .item {
            display: flex;
            gap: var(--gap-2);
            padding: var(--padding-1) 0;
        }
        .delete {
            border: none;
            outline: none;
            background-color: transparent;
            cursor: pointer;
        }
        img {
            width: 22px;
        }

        img {
            filter: var(--themed-svg);
        }
        ::placeholder {
            color: var(--text-2);
        }
    `;

    static properties = {
        filteredList: { type: Array },
    };

    constructor() {
        super();
        this.list = [];
        this.filteredList = [];
    }

    opened() {
        this.setList();
    }

    async setList() {
        try {
            const auth = await document.getElementById("auth").getUserInfo();
            const response = await fetch("https://cloud.wisk.cc/v1/document", {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + auth.token,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch documents');
            }

            const data = await response.json();
            this.list = data.map(item => ({
                id: item.id,
                name: item.title
            }));
            this.filteredList = [...this.list];
            this.requestUpdate();
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    }

    async removeItem(id) {
        var result = confirm("Are you sure you want to delete this page?");
        if (!result) {
            return;
        }

        try {
            const auth = await document.getElementById("auth").getUserInfo();
            const response = await fetch(`https://cloud.wisk.cc/v1/document?id=${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + auth.token,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete document');
            }

            this.list = this.list.filter((item) => item.id !== id);
            this.filteredList = this.filteredList.filter((item) => item.id !== id);
            this.requestUpdate();
        } catch (error) {
            console.error('Error deleting document:', error);
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
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
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
        if (e.target.value === "") {
            this.filteredList = [...this.list];
            return;
        }
        const searchTerm = e.target.value.toLowerCase();
        this.filteredList = this.list.filter((item) => {
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
        var url = "https://app.wisk.cc?id=" + window.wisk.editor.pageId;
        window.open(url, "_blank");
    }

    render() {
        if (window.wisk.editor.wiskSite) {
            return html`
            <div class="outer">
                <button @click=${this.openInEditor} class="new" style="cursor: pointer;"> Open in Editor </button>
            </div>
            `
        }

        return html`
            <div class="outer">
                <div style="display: flex; gap: 10px">
                    <div>
                        <a href="/" class="new"> <img src="/a7/forget/file-plus.svg" alt="New Page" class="new-img" /> New Page</a>
                    </div>

                    <div class="search-div">
                        <img src="/a7/forget/search.svg" alt="Search"/>
                        <input type="text" id="search" name="search" placeholder="Search Documents" @input=${this.filterList} />
                    </div>
                </div>
                <ul style="margin-top: var(--padding-4);">
                    ${this.filteredList.map(
                        (item) => html`
                            <li class="item">
                                <a href="?id=${item.id}">${item.name}</a>
                                <button @click=${() => this.removeItem(item.id)} class="delete">Delete</button>
                            </li>
                        `
                    )}
                </ul>
            </div>
        `;
    }
}

customElements.define("left-menu", LeftMenu);
