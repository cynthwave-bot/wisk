import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class BrainrotElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 30;
            touch-action: none;
            user-select: none;
        }
        .container {
            position: relative;
            max-width: calc(100vw - 40px);
            cursor: move;
        }
        video {
            width: 420px;
            max-width: calc(100vw - 40px);
            border-radius: var(--radius);
            filter: var(--drop-shadow);
            border: 1px solid var(--border-1);
            display: block;
        }
        .button-container {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        button {
            padding: var(--padding-w2);
            background-color: var(--text-1);
            color: var(--bg-1);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            outline: none;
            font-weight: 500;
            filter: var(--drop-shadow);
        }
        .controls {
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            gap: 8px;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 31;
        }
        .container:hover .controls {
            opacity: 1;
        }
        .control-button {
            padding: 4px 8px;
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 12px;
        }
        .control-button:hover {
            background-color: rgba(0, 0, 0, 0.7);
        }
        .drag-handle {
            cursor: move;
            padding: 4px;
            border-radius: var(--radius);
            background: var(--text-1);
            color: var(--bg-1);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .drag-handle svg {
            width: 20px;
            height: 20px;
        }
    `;

    static properties = {
        show: { type: Boolean },
    };

    constructor() {
        super();
        this.show = true;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.moveDistance = 0;
        this.links = [
            "https://s3.cynthwave.com/brainrot/gta5.mp4",
            "https://s3.cynthwave.com/brainrot/minecraft.mp4",
            "https://s3.cynthwave.com/brainrot/subwaysurfers.mp4",
        ];
    }

    startDragging = (e) => {
        if (!this.show && !e.target.closest('.drag-handle')) return;
        if (e.target.classList.contains('control-button')) return;
        
        this.isDragging = true;
        this.moveDistance = 0;

        const rect = this.getBoundingClientRect();
        
        if (e.type === 'mousedown') {
            this.startX = e.clientX - rect.left;
            this.startY = e.clientY - rect.top;
        } else if (e.type === 'touchstart') {
            this.startX = e.touches[0].clientX - rect.left;
            this.startY = e.touches[0].clientY - rect.top;
        }

        window.addEventListener('mousemove', this.dragHandler);
        window.addEventListener('mouseup', this.stopDragHandler);
        window.addEventListener('touchmove', this.dragHandler);
        window.addEventListener('touchend', this.stopDragHandler);
    }

    dragHandler = (e) => {
        if (!this.isDragging) return;
        e.preventDefault();
        
        let clientX, clientY;
        if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const rect = this.getBoundingClientRect();
        const deltaX = clientX - (this.startX + rect.left);
        const deltaY = clientY - (this.startY + rect.top);
        this.moveDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Calculate new position relative to viewport
        let newX = clientX - this.startX;
        let newY = clientY - this.startY;

        // Constrain to viewport boundaries with padding
        const padding = 20;
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        this.style.left = Math.min(Math.max(padding, newX), maxX - padding) + 'px';
        this.style.bottom = Math.min(Math.max(padding, window.innerHeight - newY - rect.height), maxY - padding) + 'px';
        this.style.right = 'auto';
    }

    stopDragHandler = (e) => {
        if (this.isDragging) {
            this.isDragging = false;
            window.removeEventListener('mousemove', this.dragHandler);
            window.removeEventListener('mouseup', this.stopDragHandler);
            window.removeEventListener('touchmove', this.dragHandler);
            window.removeEventListener('touchend', this.stopDragHandler);
            
            if (this.moveDistance < 5 && !this.show) {
                const target = e.target;
                if (target.tagName.toLowerCase() === 'button' && !target.classList.contains('control-button')) {
                    this.toggleShow();
                }
            }
        }
    }

    toggleShow() {
        this.show = !this.show;
    }

    toggleMute(e) {
        e.stopPropagation();
        const video = this.shadowRoot.querySelector('video');
        if (video) {
            video.muted = !video.muted;
            e.target.textContent = video.muted ? 'Unmute' : 'Mute';
        }
    }

    render() {
        return html`
            ${this.show 
                ? html`
                    <div class="container"
                        @mousedown=${this.startDragging}
                        @touchstart=${this.startDragging}>
                        <video 
                            src="${this.links[Math.floor(Math.random() * this.links.length)]}" 
                            autoplay 
                            loop 
                            muted>
                        </video>
                        <div class="controls">
                            <button class="control-button" @click=${this.toggleMute}>
                                Unmute
                            </button>
                            <button class="control-button" @click=${this.toggleShow}>
                                Hide
                            </button>
                        </div>
                    </div>
                ` 
                : html`
                    <div class="button-container">
                        <div class="drag-handle" @mousedown=${this.startDragging} @touchstart=${this.startDragging}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 9h14M5 15h14"/>
                            </svg>
                        </div>
                        <button @click=${this.toggleShow}>Show Brainrot</button>
                    </div>
                `
            }
        `;
    }
}

customElements.define("brainrot-element", BrainrotElement);
document.body.appendChild(document.createElement("brainrot-element"));
