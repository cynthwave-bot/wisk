import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class PomodoroTimerElement extends LitElement {
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
        .timer-container {
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
        .timer-display {
            font-family: var(--font-mono);
            font-size: 1.2rem;
            min-width: 100px;
            flex: 1;
            text-align: center;
        }
        img {
            filter: var(--themed-svg);
        }
    `;

    static properties = {
        isRunning: { type: Boolean, reflect: true },
        timeLeft: { type: Number },
        totalMinutes: { type: Number },
    };

    constructor() {
        super();
        this.totalMinutes = 25;
        this.isRunning = false;
        this.timeLeft = this.totalMinutes * 60;
        this.intervalId = null;

        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.isBeeping = false;
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = 0;
        }
    }

    startBeeping() {
        if (this.isBeeping) return;

        this.initAudio();
        this.isBeeping = true;

        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.value = 800;
        this.oscillator.connect(this.gainNode);

        const beepDuration = 0.2;
        const beepInterval = 2;
        const now = this.audioContext.currentTime;

        this.oscillator.start(now);

        const scheduleBeeps = startTime => {
            for (let i = 0; i < 10; i++) {
                const beepTime = startTime + i * beepInterval;
                this.gainNode.gain.setValueAtTime(0, beepTime);
                this.gainNode.gain.linearRampToValueAtTime(0.5, beepTime + 0.01);
                this.gainNode.gain.linearRampToValueAtTime(0, beepTime + beepDuration);
            }

            if (this.isBeeping) {
                setTimeout(
                    () => {
                        scheduleBeeps(startTime + 10 * beepInterval);
                    },
                    (10 * beepInterval - 1) * 1000
                );
            }
        };

        scheduleBeeps(now);
    }

    stopBeeping() {
        this.isBeeping = false;
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
        if (this.gainNode) {
            this.gainNode.gain.value = 0;
        }
    }

    toggleTimer() {
        if (!this.isRunning) {
            this.startTimer();
        } else {
            this.pauseTimer();
        }
    }

    startTimer() {
        if (this.timeLeft === 0) return;

        this.isRunning = true;
        this.intervalId = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft === 0) {
                this.pauseTimer();
                this.startBeeping();
            }
            this.requestUpdate();
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    resetTimer() {
        this.pauseTimer();
        this.stopBeeping();
        this.timeLeft = this.totalMinutes * 60;
        this.isRunning = false;
        this.requestUpdate();
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    render() {
        return html`
            <div class="timer-container">
                <button @click=${this.toggleTimer} aria-label=${this.isRunning ? 'Pause' : 'Start'}>
                    ${this.isRunning
                        ? html`<img src="/a7/plugins/nightwave-plaza/pause.svg" alt="Pause" />`
                        : html`<img src="/a7/plugins/nightwave-plaza/play.svg" alt="Play" />`}
                </button>
                <span class="timer-display">${this.formatTime(this.timeLeft)}</span>
                <button @click=${this.resetTimer} aria-label="Reset">
                    <img src="/a7/plugins/nightwave-plaza/refresh.svg" alt="Reset" />
                </button>
            </div>
        `;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.pauseTimer();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

customElements.define('pomodoro-timer', PomodoroTimerElement);
