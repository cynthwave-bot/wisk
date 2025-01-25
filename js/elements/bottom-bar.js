import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class BottomBar extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            user-select: none;
        }
        :host {
            z-index: 50;
        }
        @media (min-width: 768px) {
            :host {
                display: none;
            }
        }
        .bottom-bar {
            background-color: var(--bg-1);
            height: 50px;
            position: fixed;
            bottom: 0;
            width: 100%;
            border-top: 1px solid var(--bg-3);
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            filter: var(--drop-shadow);
        }
        .bottom-bar button {
            background-color: transparent;
            border: none;
            cursor: pointer;
            height: 100%;
            outline: none;
            padding: var(--padding-2);
        }

        .bottom-bar button img {
            height: 20px;
            width: 20px;
            filter: var(--themed-svg);
            opacity: 0.9;
        }
    `;

    static properties = {};

    constructor() {
        super();
    }

    buttonClicked(arg) {
        switch (arg) {
            case 'home':
                if (document.querySelector('neo-ai').viewVisible()) {
                    document.querySelector('neo-ai').hide();
                } else {
                    window.location.href = '/home';
                }
                break;
            case 'sparkle':
                document.querySelector('neo-ai').expandDialog();
                break;
            case 'plus':
                window.location.href = '/';
                break;
            case 'more':
                toggleMiniDialogNew('options-component', 'Options');
                break;
        }
    }

    render() {
        return html`
            <div class="bottom-bar">
                <button @click="${() => this.buttonClicked('home')}"><img src="/a7/plugins/bottom-bar/home.svg" alt="Home" /></button>
                <button @click="${() => this.buttonClicked('sparkle')}"><img src="/a7/plugins/bottom-bar/sparkle.svg" alt="Home" /></button>
                <button @click="${() => this.buttonClicked('plus')}"><img src="/a7/plugins/bottom-bar/plus.svg" alt="Home" /></button>
                <button @click="${() => this.buttonClicked('more')}"><img src="/a7/plugins/bottom-bar/more.svg" alt="Home" /></button>
            </div>
        `;
    }
}

customElements.define('bottom-bar', BottomBar);
