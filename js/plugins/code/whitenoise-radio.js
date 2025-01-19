import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class WhitenoiseRadioElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
            display: inline-block;
        }
        .radio-container {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-4);
            background-color: var(--bg-2);
            border-radius: var(--radius-large);
            box-shadow: var(--drop-shadow);
        }
        button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2.5rem;
            height: 2.5rem;
            border: none;
            background-color: transparent;
            border-radius: var(--radius);
            cursor: pointer;
            transition: filter 0.2s;
            padding: var(--padding-2);
            color: var(--bg-1);
        }
        .station-name {
            font-family: var(--font-mono);
        }
        img {
            filter: var(--themed-svg);
        }
        a {
            color: var(--text-1);
        }
        .support {
            margin-top: var(--padding-4);
            display: flex;
            flex-direction: column;
            gap: var(--gap-1);
        }
    `;

    static properties = {
        isPlaying: { type: Boolean },
    };

    constructor() {
        super();
        this.isPlaying = false;
        this.audioElement = null;
    }

    firstUpdated() {
        this.audioElement = new Audio('/a7/forget/youtube_AslKWwxPNbY_audio.mp3');
        this.audioElement.loop = true;
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audioElement.pause();
        } else {
            this.audioElement.play();
        }
        this.isPlaying = !this.isPlaying;
    }

    opened() {
        this.requestUpdate();
    }

    render() {
        return html`
            <div class="radio-container">
                <button @click=${this.togglePlay} aria-label=${this.isPlaying ? 'Pause' : 'Play'}>
                    ${this.isPlaying ? html`<img src="/a7/plugins/nightwave-plaza/pause.svg" alt="Pause" />` : html`<img src="/a7/plugins/nightwave-plaza/play.svg" alt="Play" />`}
                </button>

                <span class="station-name">Whitenoise</span>
            </div>
            <div class="support">
                <span>Sounds provided by <a href="https://youtu.be/AslKWwxPNbY" target="_blank" rel="noopener"> The manikin </a>
            </div>
        `;
    }
}

customElements.define('whitenoise-radio', WhitenoiseRadioElement);
