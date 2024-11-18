class EmbedElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.link = "wisk.cc";
        this.render();
        this.isVirtualKeyboard = this.checkIfVirtualKeyboard();
    }

    checkIfVirtualKeyboard() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    connectedCallback() {
        this.editable = this.shadowRoot.querySelector("#editable");
        this.iframe = this.shadowRoot.querySelector("iframe");
        this.bindEvents();
    }

    setValue(path, value) {
        if (path === "value.append") {
            this.editable.innerText += value.textContent;
        } else {
            this.editable.innerText = value.textContent;
        }
        this.link = this.editable.innerText;
        this.updateIframeSource();
    }

    getValue() {
        return {
            textContent: this.editable.innerText
        };
    }

    updateIframeSource() {
        this.iframe.src = `https://${this.editable.innerText}`;
    }

    onValueUpdated(event) {
        const text = this.editable.innerText;
        if (this.handleSpecialKeys(event)) {
            return;
        }
        this.link = text;
        this.sendUpdates();
        setTimeout(() => {
            this.updateIframeSource();
        }, 0);
    }

    handleSpecialKeys(event) {
        const keyHandlers = {
            Enter: () => this.handleEnterKey(event),
            Backspace: () => this.handleBackspace(event),
            Tab: () => this.handleTab(event),
            ArrowLeft: () => this.handleArrowKey(event, "next-up", 0),
            ArrowRight: () => this.handleArrowKey(event, "next-down", this.editable.innerText.length),
        };

        const handler = keyHandlers[event.key];
        return handler ? handler() : false;
    }

    handleEnterKey(event) {
        if (!this.isVirtualKeyboard) {
            event.preventDefault();
            window.wisk.editor.createNewBlock(this.id, "text-element", { textContent: "" }, { x: 0 });
            return true;
        }
        return false;
    }

    handleBackspace(event) {
        if (this.editable.innerText.length === 0) {
            event.preventDefault();
            window.wisk.editor.deleteBlock(this.id);
            return true;
        }
        return false;
    }

    handleTab(event) {
        event.preventDefault();
        return true;
    }

    handleArrowKey(event, direction, targetOffset) {
        const currentOffset = this.getCurrentOffset();
        if (currentOffset === targetOffset) {
            event.preventDefault();
            if (direction === "next-up") {
                var prevElement = window.wisk.editor.prevElement(this.id);
                if (prevElement != null) {
                    const prevComponentDetail = window.wisk.plugins.getPluginDetail(prevElement.component);
                    if (prevComponentDetail.textual) {
                        window.wisk.editor.focusBlock(prevElement.id, { x: prevElement.value.textContent.length });
                    }
                }
            } else if (direction === "next-down") {
                var nextElement = window.wisk.editor.nextElement(this.id);
                if (nextElement != null) {
                    const nextComponentDetail = window.wisk.plugins.getPluginDetail(nextElement.component);
                    if (nextComponentDetail.textual) {
                        window.wisk.editor.focusBlock(nextElement.id, { x: 0 });
                    }
                }
            }
            return true;
        }
        return false;
    }

    getCurrentOffset() {
        const selection = this.shadowRoot.getSelection();
        return selection.rangeCount ? selection.getRangeAt(0).startOffset : 0;
    }

    sendUpdates() {
        setTimeout(() => {
            window.wisk.editor.justUpdates(this.id);
        }, 0);
    }

    render() {
        const style = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font);
            }
            .link {
                outline: none;
                padding: 0;
                border: none;
                font-family: var(--font-mono);
            }
            #editable {
                width: 100%;
            }
            .outer {
                border: 1px solid var(--border-1);
                border-radius: var(--radius);
                overflow: hidden;
            }
            iframe {
                width: 100%;
                height: 500px;
                outline: none;
                display: block;
            }
            p {
                display: inline-block;
            }
            .table-controls {
                padding: var(--padding-w2);
                display: flex;
                align-items: center;
                background-color: var(--bg-2);
                border-bottom: 1px solid var(--border-1);
            }
            </style>
        `;
        const content = `
            <div class="outer">
                <div class="table-controls">
                    <div class="link">https://</div>
                    <div class="link" id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false">${this.link}</div>
                </div>
                <iframe src="https://${this.link}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }

    bindEvents() {
        const eventType = this.isVirtualKeyboard ? "input" : "keydown";
        this.editable.addEventListener(eventType, this.onValueUpdated.bind(this));
        this.editable.addEventListener("focus", () => {
            if (this.editable.innerText.trim() === "") {
                this.editable.classList.add("empty");
            }
        });
    }
}

customElements.define("embed-element", EmbedElement);
