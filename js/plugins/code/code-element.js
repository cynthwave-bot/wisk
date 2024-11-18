class CodeElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.render();
        this.isVirtualKeyboard = this.checkIfVirtualKeyboard();
    }

    checkIfVirtualKeyboard() {
        // TODO: Implement a better way to detect virtual keyboard
        return false;
    }

    connectedCallback() {
        this.editable = this.shadowRoot.querySelector("#editable");
        this.bindEvents();
    }

    setValue(path, value) {
        if (path == "value.append") {
            this.editable.innerText += value.textContent;
        } else {
            this.editable.innerText = value.textContent;
        }
    }

    getValue() {
        return {
            textContent: this.editable.innerText,
        };
    }

    focus(identifier) {
        if (typeof identifier.x != "number") {
            identifier.x = 0;
        }

        const textLength = this.editable.innerText.length;
        identifier.x = Math.max(0, Math.min(identifier.x, textLength));

        if (textLength === 0) {
            this.editable.focus();
            return;
        }

        const selection = this.shadowRoot.getSelection();
        const range = document.createRange();
        const node = this.editable.childNodes[0] || this.editable;
        range.setStart(node, identifier.x);
        range.setEnd(node, identifier.x);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    getFocus() {
        try {
            const sel = this.shadowRoot.getSelection();
            if (!sel.rangeCount) {
                throw new Error("No ranges selected.");
            }

            const range = sel.getRangeAt(0).cloneRange();
            range.setStart(this.editable, 0);
            return range.toString().length;
        } catch (error) {
            console.error("Failed to get caret position: ", error);
            return -1;
        }
    }

    onValueUpdated(event) {
        const text = this.editable.innerText;
        if (this.handleSpecialKeys(event)) {
            return;
        }
        this.sendUpdates();
    }

    getTextContent() {
        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: "```\n" + this.editable.innerText + "\n```",
        }
    }


    handleSpecialKeys(event) {
        const keyHandlers = {
            Enter: () => this.handleEnterKey(event),
            "/": () => this.handleForwardSlash(event),
            Backspace: () => this.handleBackspace(event),
            Tab: () => this.handleTab(event),
            ArrowLeft: () => this.handleArrowKey(event, "next-up", 0),
            ArrowRight: () => this.handleArrowKey(event, "next-down", this.editable.innerText.length),
            ArrowUp: () => this.handleVerticalArrow(event, "next-up"),
            ArrowDown: () => this.handleVerticalArrow(event, "next-down"),
        };

        const handler = keyHandlers[event.key];
        return handler ? handler() : false;
    }

    handleEnterKey(event) {
        if (!this.isVirtualKeyboard) {
            event.preventDefault();
            // get current line where the cursor is
            var line = this.editable.innerText.substring(0, this.getFocus()).split("\n").pop();
            var spaces = line.match(/^\s*/)[0];

            // TODO handle empty lines

            // calculate current indentation
            var indent = "";
            for (let i = 0; i < spaces.length; i++) {
                indent += " ";
            }

            document.execCommand("insertText", false, "\n" + indent);
            return true;
        }
        return false;
    }

    handleForwardSlash(event) {
        if (!event.shiftKey && !this.isVirtualKeyboard) {
            event.preventDefault();
            window.wisk.editor.showSelector(this.id);
            return true;
        }
        return false;
    }

    handleBackspace(event) {
        if (this.getFocus() === 0) {
            event.preventDefault();

            var prevElement;

            for (let i = 0; i < window.wisk.editor.elements.length; i++) {
                if (window.wisk.editor.elements[i].id === this.id) {
                    if (i === 0) {
                        return true;
                    }

                    prevElement = window.wisk.editor.elements[i - 1];
                    break;
                }
            }

            var prevComponentDetail = window.wisk.plugins.getPluginDetail(prevElement.component);

            if (prevComponentDetail.textual) {
                var len = prevElement.value.textContent.length;
                window.wisk.editor.updateBlock(prevElement.id, "value.append", { textContent: this.editable.innerText });
                window.wisk.editor.focusBlock(prevElement.id, { x: len });
            }

            window.wisk.editor.deleteBlock(this.id);
            return true;
        }
        return false;
    }

    handleTab(event) {
        event.preventDefault();
        document.execCommand("insertText", false, "    ");
        window.wisk.editor.justUpdates(this.id);
        return true;
    }

    handleArrowKey(event, direction, targetOffset) {
        // TODO add realtime updates for friends focus
        const pos = this.getFocus();
        if (pos === targetOffset) {
            event.preventDefault();

            if (direction === "next-up") {
                var prevElement = window.wisk.editor.prevElement(this.id);
                if (prevElement == null) {
                    return true;
                }

                const prevComponentDetail = window.wisk.plugins.getPluginDetail(prevElement.component);
                if (prevComponentDetail.textual) {
                    window.wisk.editor.focusBlock(prevElement.id, { x: prevElement.value.textContent.length });
                }
            }

            if (direction === "next-down") {
                var nextElement = window.wisk.editor.nextElement(this.id);
                if (nextElement == null) {
                    return true;
                }

                const nextComponentDetail = window.wisk.plugins.getPluginDetail(nextElement.component);
                if (nextComponentDetail.textual) {
                    window.wisk.editor.focusBlock(nextElement.id, { x: 0 });
                }
            }

            return true;
        }
        return false;
    }

    handleVerticalArrow(event, direction) {
        const pos = this.getFocus();

        setTimeout(() => {
            const pos2 = this.getFocus();
            if (direction === "next-up" && pos2 === 0) {
                var prevElement = window.wisk.editor.prevElement(this.id);
                if (prevElement == null) {
                    return true;
                }

                const prevComponentDetail = window.wisk.plugins.getPluginDetail(prevElement.component);
                if (prevComponentDetail.textual) {
                    window.wisk.editor.focusBlock(prevElement.id, { x: pos });
                }
            }

            if (direction === "next-down" && pos2 === this.editable.innerText.length) {
                var nextElement = window.wisk.editor.nextElement(this.id);
                if (nextElement == null) {
                    return true;
                }

                const nextComponentDetail = window.wisk.plugins.getPluginDetail(nextElement.component);
                if (nextComponentDetail.textual) {
                    window.wisk.editor.focusBlock(nextElement.id, { x: pos });
                }
            }
        }, 0);

        return true;
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
                font-family: var(--font-mono);
            }
            #editable {
                outline: none;
                position: relative;
                line-height: 1.5;
                padding: var(--padding-4);
                border: 1px solid var(--border-1);
                background: var(--bg-2);
                color: var(--text-1);
                border-radius: var(--radius);
                overflow: auto;
            }
            *::-webkit-scrollbar { width: 15px; }
            *::-webkit-scrollbar-track { background: var(--bg-1); }
            *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
            *::-webkit-scrollbar-thumb:hover { background-color: var(--text-1); }
            </style>
        `;
        const content = `<pre id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" ></pre>`;
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

customElements.define("code-element", CodeElement);
