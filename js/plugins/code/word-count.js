import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class WorkdCount extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
            display: block;
            padding: 1rem;
            background-color: var(--bg-1);
        }
        .x {
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }
        .x > div {
            display: flex;
            justify-content: space-between;
            color: var(--text-1);
        }

        @media (hover: hover) {
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
        }
        ::placeholder {
            color: var(--text-2);
        }
    `;

    static properties = {};

    constructor() {
        super();
    }

    getWords(text) {
        return text
            .trim()
            .replace(/\s+/g, ' ')
            .split(' ')
            .filter(word => word.length > 0);
    }

    countWords(elements) {
        var words = 0;
        for (const element of elements) {
            var e = document.getElementById(element.id);
            if (e.getTextContent) {
                words += this.getWords(e.getTextContent().text).length;
            }
        }
        return words;
    }

    countCharacters(elements) {
        var characters = 0;
        for (const element of elements) {
            var e = document.getElementById(element.id);
            if (e.getTextContent) {
                characters += e.getTextContent().text.length;
            }
        }
        return characters;
    }

    countCharactersExcludingSpaces(elements) {
        var characters = 0;
        for (const element of elements) {
            var e = document.getElementById(element.id);
            if (e.getTextContent) {
                characters += e.getTextContent().text.replace(/\s/g, '').length;
            }
        }
        return characters;
    }

    opened() {
        this.requestUpdate();
    }

    render() {
        return html`
            <div class="x">
                <div>Words <span> ${this.countWords(wisk.editor.elements)} </span></div>
                <div>Characters <span> ${this.countCharacters(wisk.editor.elements)} </span></div>
                <div>Characters (excluding spaces) <span> ${this.countCharactersExcludingSpaces(wisk.editor.elements)} </span></div>
            </div>
        `;
    }
}

customElements.define('word-count', WorkdCount);
