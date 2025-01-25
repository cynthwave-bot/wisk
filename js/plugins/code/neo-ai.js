import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class NeoAI extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            scroll-behavior: smooth;
        }
        :host {
        }
        .i-container,
        .c-container {
            display: none;
            position: fixed;
            width: 100%;
            height: 100%;
            max-width: min(500px, calc(100% - calc(var(--padding-4) * 4)));
            max-height: min(800px, calc(100% - calc(var(--padding-4) * 8)));
            bottom: calc(var(--padding-4) * 2);
            right: calc(var(--padding-4) * 2);
            z-index: 800;
            background-color: var(--bg-1);
            border-radius: var(--radius-large);
            filter: var(--drop-shadow);
            border: 1px solid var(--border-1);
            flex-direction: column;
            overflow: hidden;
            transition: all 0.3s;
        }

        @starting-style {
            .i-container {
                opacity: 0;
                padding: 0;
                bottom: 0;
            }
        }

        .logo {
            background-color: var(--accent-bg);
            color: var(--accent-fg);
            border: 1px solid var(--accent-fg);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            outline: none;
            padding: var(--padding-3);

            position: fixed;
            bottom: calc(var(--padding-4) * 2);
            right: calc(var(--padding-4) * 2);
            font-size: 24px;
            cursor: pointer;

            display: none;
            transition: transform 0.3s;
            border: 1px solid var(--border-1);
        }
        .logo:hover {
            transform: rotate(90deg) scale(1.1);
        }

        ul,
        ol {
            list-style-position: inside; /* I hate that ive to do this */
        }

        .image-grid {
            display: flex;
            gap: var(--gap-2);
            flex-wrap: wrap;
        }

        .image-grid-img {
            border-radius: var(--radius);
            width: 160px;
            height: 120px;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            position: relative;
        }

        .image-grid-button {
            position: absolute;
            bottom: 10px;
            right: 10px;
            background-color: var(--bg-2);
            color: var(--text-1);
            padding: var(--padding-w1);
            border-radius: var(--radius-large);
            cursor: pointer;
            outline: none;
            font-weight: 600;
            border: 1px solid var(--border-1);
        }

        a {
            color: var(--fg-blue);
        }

        .active {
            display: flex;
        }
        .i-header,
        .c-header {
            display: flex;
            justify-content: flex-end;
            padding: var(--padding-4);
            align-items: center;
        }
        .i-content,
        .c-content {
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow: auto;
            padding: var(--padding-4);
            gap: var(--gap-3);
        }

        .reference-link {
            padding: var(--padding-w1);
            border-radius: var(--radius);
            background-color: var(--bg-blue);
            text-decoration: none;
        }

        .i-hx {
            font-size: 12px;
            font-weight: 500;
            color: var(--text-2);
        }

        .c-hx {
            font-size: 18px;
            font-weight: 500;
            color: var(--text-2);
            flex: 1;
            display: flex;
            align-items: center;
        }
        .i-buttons,
        .c-buttons {
            display: flex;
            flex-direction: column;
            padding-top: var(--padding-2);
            padding-bottom: var(--padding-3);
        }
        .i-action-button,
        .c-action-button {
            display: flex;
            padding: var(--padding-w2);
            border: none;
            outline: none;
            background-color: transparent;
            gap: var(--gap-2);
            cursor: pointer;
            border-radius: 100px;
            opacity: 0.8;
            color: var(--text-1);
        }
        .i-action-button:hover,
        .c-action-button:hover {
            opacity: 1;
            color: var(--accent-text);
            background-color: var(--accent-bg);
        }
        .i-action-icon,
        .c-action-icon {
            filter: var(--themed-svg);
        }
        .i-action-button:hover .i-action-icon,
        .c-action-button:hover .c-action-icon {
            filter: var(--accent-svg);
        }
        .i-input,
        .c-input {
            display: flex;
            justify-content: center;
            padding: var(--padding-w2);
            margin: var(--padding-4);
            border-radius: 100px;
            border: 2px solid var(--border-1);
        }
        .i-inp,
        .c-inp {
            flex: 1;
            padding: var(--padding-2);
            border: none;
            outline: none;
            background-color: transparent;
            border-radius: var(--radius);
            flex: 1;
            color: var(--text-1);
        }
        .i-btn,
        .c-btn {
            padding: var(--padding-2);
            border: none;
            outline: none;
            background-color: transparent;
            border-radius: 100px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .i-btn img,
        .c-btn img {
            filter: var(--themed-svg);
        }
        .i-btn:hover,
        .c-btn:hover {
        }

        .i-input:has(.i-inp:focus),
        .c-input:has(.c-inp:focus) {
            border: 2px solid var(--accent-text);
            background-color: var(--accent-bg);
        }

        .i-input:has(.i-inp:focus) .i-btn,
        .c-input:has(.c-inp:focus) .c-btn {
            filter: var(--accent-svg);
        }
        .close,
        .expand,
        .settings {
            padding: var(--padding-2);
            border: none;
            outline: none;
            background-color: transparent;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0.5;
        }
        .close img,
        .expand img,
        .settings img {
            filter: var(--themed-svg);
        }
        .close:hover,
        .expand:hover,
        .settings:hover {
            opacity: 1;
        }
        .message-container {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            font-size: 15px;
        }

        .message {
            display: flex;
            gap: var(--gap-2);
            max-width: 85%;
        }

        .message.user {
            flex-direction: row-reverse;
            align-self: flex-end;
        }

        .message-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: var(--accent-bg);
            display: flex;
            justify-content: center;
            align-items: center;
            display: none;
        }

        .message.user .message-avatar {
            background-color: var(--bg-2);
        }

        .message-content {
            display: flex;
            flex-direction: column;
            gap: var(--gap-1);
        }

        .message-bubble {
            background-color: var(--bg-2);
            padding: var(--padding-3);
            border-radius: var(--radius);
            color: var(--text-1);
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }

        .message.user .message-bubble {
            background-color: var(--accent-bg);
            color: var(--accent-text);
        }

        .message.info .message-bubble {
            background-color: var(--bg-1);
            border: 1px solid var(--border-1);
            color: var(--text-2);
        }

        .message-time {
            font-size: 12px;
            color: var(--text-2);
            align-self: flex-end;
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

        ::-webkit-input-placeholder {
            color: var(--text-2);
        }

        @media (max-width: 768px) {
            .message-container {
                padding: 0;
            }
            .i-container,
            .c-container {
                bottom: var(--padding-4);
                right: var(--padding-4);
                max-width: calc(100% - var(--padding-4) * 2);
                max-height: calc(100% - var(--padding-4) * 2);
            }
        }

        .expanded-container {
            max-width: 100%;
            max-height: 100%;
            bottom: 0;
            right: 0;
            border-radius: 0;
            border: none;
            padding: 0 calc((100% - 1000px) / 2);
        }

        .logo-bubble {
            display: flex;
            flex-direction: row-reverse;
            position: fixed;
            bottom: calc(var(--padding-4) * 2 + 69px); /* nice */
            right: calc(var(--padding-4) * 2);
            background-color: var(--bg-3);
            padding: var(--padding-3);
            border-radius: var(--radius-large);
            border: 3px solid var(--bg-3);
            filter: var(--drop-shadow);
            animation: 0.3s ease-in-out 0s 1 normal none running fadeIn;
            z-index: 800;
            color: white;
            align-items: center;
            animation: borderFlicker 62s infinite;
            transition: all 0.3s;
        }

        .logo-bubble::after {
            content: '';
            position: absolute;
            bottom: -12px;
            right: 13px;
            width: 0;
            height: 0;
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            border-top: 12px solid var(--bg-3);
        }

        @keyframes borderFlicker {
            0%,
            96.77% {
                filter: invert(0);
            }
            97%,
            100% {
                filter: invert(1);
            }
        }

        .logo-bubble-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo-bubble-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            opacity: 0.5;
            display: flex;
            align-items: center;
        }

        .logo-bubble-close:hover {
            opacity: 1;
        }

        .logo-bubble-close img {
            width: 18px;
            height: 18px;
            filter: var(--themed-svg);
        }

        .logo-bubble-content {
            color: var(--text-1);
            font-weight: 500;
            cursor: pointer;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin: 0.25em 0;
        }

        @media (max-width: 768px) {
            .logo,
            .logo-bubble,
            .expand,
            .close {
                display: none;
            }
            .i-container,
            .c-container {
                max-width: 100%;
                width: 100%;
                max-height: calc(100% - 50px);
                right: 0;
                border-radius: 0;
                border: none;
                bottom: 50px;
            }
        }
        .settings-div {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            height: 90%;
            max-width: 500px;
            max-height: 800px;
            background-color: var(--bg-1);
            display: flex;
            gap: var(--gap-3);
            align-items: flex-start;
            border-radius: var(--radius-large);
            border: 1px solid var(--border-1);
            filter: var(--drop-shadow);
            z-index: 801;
            padding: var(--padding-4);
            flex-direction: column;
        }

        .settings-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }

        .settings-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: var(--padding-2);
            display: flex;
            align-items: center;
            border-radius: 100px;
        }

        .settings-close img {
            width: 18px;
            height: 18px;
            filter: var(--themed-svg);
        }
        .model-select {
            display: flex;
            gap: var(--gap-3);
            padding: var(--padding-4);
            border-radius: var(--radius);
        }

        .model-option {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: var(--gap-1);
            padding: var(--padding-3);
            border-radius: var(--radius);
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
        }

        .model-option:hover {
            background-color: var(--bg-2);
        }

        .model-option.selected {
            background-color: var(--accent-bg);
            border: 1px solid var(--accent-text);
        }

        .model-icon {
            width: 40px;
            height: 40px;
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .model-icon img {
            width: 32px;
            height: 32px;
            filter: var(--themed-svg);
        }

        .model-info {
            display: flex;
            flex-direction: column;
            gap: var(--gap-1);
        }

        .model-name {
            font-weight: 600;
            color: var(--text-1);
        }

        .model-description {
            font-size: 13px;
            color: var(--text-2);
        }

        @media (max-width: 768px) {
            .settings-div {
                padding: var(--padding-4);
            }
            .model-select {
                flex-direction: column;
            }
        }
    `;

    static properties = {
        view: { type: String },
        expanded: { type: Boolean },
        selectedElementId: { type: String },
        selectedText: { type: String },
        showLogoBubble: { type: Boolean },
        messages: { type: Array },
        showSettings: { type: Boolean },
        modelName: { type: String },
    };

    constructor() {
        super();
        this.expanded = false;
        this.showSettings = false;
        this.modelName = 'neo';

        this.selectedElementId = '';
        this.selectedText = '';

        this.view = 'logo';
        this.path = '/a7/plugins/neo-ai/'; // add .svg to the end of the path
        this.iContent = [
            { category: 'Talk', image: 'summarize', text: 'Summarize', 'text-2': 'this page', arg: 'summarize' },
            { category: 'Talk', image: 'ask', text: 'Ask about', 'text-2': 'this page', arg: 'ask-about' },
            { category: 'Talk', image: 'translate', text: 'Translate page', 'text-2': '', arg: 'translate' },
            { category: 'More', image: 'more', text: 'What can Neo do?', 'text-2': '', arg: 'more' },
            { category: 'More', image: 'help', text: 'Help', 'text-2': '', arg: 'help' },
            { category: 'More', image: 'support', text: 'Get support', 'text-2': '', arg: 'support' },
        ];

        // user messages are always text, bot messages can have different types:
        // - text
        //      should support markdown, can have references
        // - status
        //      should be displayed in a different way, smaller font, and have a color
        // - results
        //      can be images or text, should be displayed in a different way
        this.messages = {
            chat: [{ from: 'bot', text: 'Hello! I am Neo. How can I help you today?', type: 'text' }],
        };
        this.showLogoBubble = true;

        this.allowedElements = [
            'main-element',
            'text-element',
            'code-element',
            'list-element',
            'heading1-element',
            'heading2-element',
            'heading3-element',
            'heading4-element',
            'heading5-element',
            'numbered-list-element',
            'checkbox-element',
            'quote-element',
            'callout-element',
            'divider-element',
            'table-element',
        ];
    }

    async callNeoAPI(query) {
        try {
            const auth = await document.getElementById('auth').getUserInfo();

            // Prepare conversation history
            const conversation = this.messages.chat.map(msg => ({
                content: msg.text,
                by: msg.from === 'bot' ? 'assistant' : 'user',
            }));
            conversation.pop();

            // Process document elements
            const doc = JSON.parse(JSON.stringify(wisk.editor.elements));
            const allowedDocs = doc.filter(d => this.allowedElements.includes(d.component));

            // Get text content for each element
            const processedDocs = await Promise.all(
                allowedDocs.map(async doc => {
                    const element = document.querySelector(`#${doc.id}`);
                    return {
                        id: doc.id,
                        type: doc.component,
                        content: element.getTextContent().text,
                    };
                })
            );

            // Prepare API request
            const docStr = JSON.stringify(processedDocs).replace(/"/g, "'");
            const response = await fetch('https://cloud.wisk.cc/v2/neo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({
                    conversation,
                    document: docStr,
                    model: this.modelName,
                }),
            });

            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const data = await response.json();
            if (!data.content) return null;

            // Preprocess lines to handle createBlock ordering
            let lines = data.content.split('\n');

            // Group createBlock commands by afterId
            const createBlockGroups = {};
            lines.forEach((line, index) => {
                if (line.startsWith('createBlock:')) {
                    const [_, params] = line.split(':');
                    const [__, afterId] = params.split(',');
                    const trimmedAfterId = afterId.trim();
                    if (!createBlockGroups[trimmedAfterId]) {
                        createBlockGroups[trimmedAfterId] = [];
                    }
                    createBlockGroups[trimmedAfterId].push(index);
                }
            });

            // Reverse order of createBlock commands with same afterId
            Object.values(createBlockGroups).forEach(indices => {
                if (indices.length > 1) {
                    // Get the lines at these indices
                    const createBlockLines = indices.map(i => lines[i]);
                    // Put them back in reverse order
                    indices.forEach((lineIndex, i) => {
                        lines[lineIndex] = createBlockLines[createBlockLines.length - 1 - i];
                    });
                }
            });

            // Process commands
            const displayText = [];
            for (const line of lines) {
                if (!line.trim()) continue;

                const [command, ...rest] = line.split(':');
                const params = rest.join(':').trim();

                switch (command.trim()) {
                    case 'deleteBlock':
                        const deleteId = params.trim();
                        if (deleteId) {
                            window.wisk.editor.deleteBlock(deleteId);
                        }
                        break;

                    case 'createBlock':
                        const [blockType, afterId, ...valueArr] = params.split(',');
                        if (blockType && afterId) {
                            const value = valueArr
                                .join(',')
                                .trim()
                                .replace(/^["'](.*)["']$/, '$1');

                            var newId = window.wisk.editor.createNewBlock(
                                afterId.trim(),
                                blockType.trim(),
                                { textContent: value },
                                { x: 0 },
                                undefined,
                                true
                            );
                        }
                        break;

                    case 'editBlock':
                        const [editId, ...editValueArr] = params.split(',');
                        if (editId) {
                            const value = editValueArr
                                .join(',')
                                .trim()
                                .replace(/^["'](.*)["']$/, '$1');

                            const element = document.querySelector(`#${editId.trim()}`);
                            if (element) {
                                element.setTextContent({ text: value });
                            }
                        }
                        break;

                    default:
                        displayText.push(line);
                }
            }

            return displayText.length
                ? [
                      {
                          type: 'text',
                          value: displayText.join('\n').trim(),
                      },
                  ]
                : null;
        } catch (error) {
            console.error('Error calling Neo API:', error, error.stack);
            return null;
        }
    }

    setSelection(elementId, text) {
        this.selectedElementId = elementId;
        this.selectedText = text;
    }

    getStatusColor(color) {
        switch (color) {
            case 'info':
                return { background: 'var(--bg-blue)', color: 'var(--fg-blue)' };
            case 'success':
                return { background: 'var(--bg-green)', color: 'var(--fg-green)' };
            case 'error':
                return { background: 'var(--bg-red)', color: 'var(--fg-red)' };
            case 'warning':
                return { background: 'var(--bg-yellow)', color: 'var(--fg-yellow)' };
            default:
                return { background: 'var(--bg-2)', color: 'var(--text-1)' };
        }
    }

    renderMessageContent(message) {
        switch (message.type) {
            case 'text':
                return html`
                    <div class="message-bubble">${this.renderMarkdown(message.text)}</div>
                    ${message.references ? this.renderReferences(message.references) : ''}
                `;

            case 'status':
                const statusStyle = this.getStatusColor(message.color);
                return html`
                    <div class="message-bubble status" style="background-color: ${statusStyle.background}; color: ${statusStyle.color};">
                        ${message.text}
                    </div>
                `;

            case 'image-results':
                return html`
                    <div class="message-bubble">
                        <div>${message.text}</div>
                        <div class="image-grid">
                            ${message.results.map(
                                url => html`
                                    <div class="image-grid-img" style="background-image:url(${url})" alt="Result">
                                        <button class="image-grid-button" @click=${() => window.open(url, '_blank')}>Open</button>
                                    </div>
                                `
                            )}
                        </div>
                    </div>
                `;

            case 'text-results':
                return html`
                    <div class="message-bubble">
                        <div>${message.text}</div>
                        <div class="results-list">
                            ${message.results.map(
                                result => html`
                                    <div class="result-item">
                                        <a href="${result.url}" target="_blank" rel="noopener noreferrer">
                                            <h4>${result.title}</h4>
                                            <p>${result.description}</p>
                                        </a>
                                    </div>
                                `
                            )}
                        </div>
                    </div>
                `;

            default:
                return html`<div class="message-bubble">${message.text}</div>`;
        }
    }

    // Helper method to render references
    renderReferences(references) {
        return html`
            <div class="references">
                ${references.map(
                    (ref, index) => html` <a href="${ref}" target="_blank" rel="noopener noreferrer" class="reference-link">${index + 1}</a> ${ref} `
                )}
            </div>
        `;
    }

    // Helper method to render markdown
    renderMarkdown(text) {
        const htmlx = marked.parse(text, { breaks: true });
        return html`<div .innerHTML="${htmlx}"></div>`;
    }

    // Modified render method for the chat container
    renderChatContainer() {
        return html`
            <div class="message-container">
                ${this.messages.chat.map(
                    message => html`
                        <div class="message ${message.from} ${message.type}">
                            ${message.from === 'bot'
                                ? html`
                                      <div class="message-avatar">
                                          <img
                                              src="${this.path}ai.svg"
                                              style="filter: var(--themed-svg); width: 24px; height: 24px;"
                                              draggable="false"
                                          />
                                      </div>
                                  `
                                : ''}
                            <div class="message-content">${this.renderMessageContent(message)}</div>
                        </div>
                    `
                )}
            </div>
        `;
    }

    runArg(arg) {
        console.log(arg);

        switch (arg) {
            case '':
                return;

            case 'summarize':
                this.shadowRoot.querySelector('.i-inp').value = 'Summarize this page';
                this.shadowRoot.querySelector('.i-inp').focus();
                break;

            case 'ask-about':
                this.shadowRoot.querySelector('.i-inp').value = 'So can you tell me about ...';
                this.shadowRoot.querySelector('.i-inp').focus();
                break;

            case 'translate':
                this.shadowRoot.querySelector('.i-inp').value = 'Translate this page to ...';
                this.shadowRoot.querySelector('.i-inp').focus();
                break;

            case 'more':
                window.open('https://wisk.cc/neo', '_blank');
                break;

            case 'help':
                document.querySelector('help-dialog').show();
                break;

            case 'support':
                window.open('https://discord.gg/YyqXEey4JS', '_blank');
                break;
        }
    }

    setView(view) {
        if (view == 'i-container' && this.messages.chat.length > 1) {
            view = 'c-container';
        }
        this.view = view;
    }

    expandDialog() {
        this.view = 'i-container';
    }

    viewVisible() {
        return this.view === 'i-container' || this.view === 'c-container';
    }

    sendClicked() {
        if (this.view === 'i-container') {
            if (!this.shadowRoot.querySelector('.i-inp').value.trim()) {
                wisk.utils.showToast('Oh no! You forgot to type something!', 3000);
                return;
            }
            const message = this.shadowRoot.querySelector('.i-inp').value;
            this.addUserMessage(message);
        }
        this.setView('c-container');
    }

    closeLogoBubble() {
        this.showLogoBubble = false;
    }

    async addUserMessage(message) {
        if (!message.trim()) return;

        // Add user message
        this.messages.chat.push({
            from: 'user',
            text: message,
            type: 'text',
        });
        this.shadowRoot.querySelector('.c-inp').value = '';

        // Add "thinking" message
        const thinkingMsgIndex = this.messages.chat.length;
        this.messages.chat.push({
            from: 'bot',
            text: 'Thinking...',
            type: 'status',
            color: 'info',
        });

        await this.requestUpdate();
        this.scrollToBottom();

        // Call API
        const response = await this.callNeoAPI(message);

        // Remove thinking message
        this.messages.chat.splice(thinkingMsgIndex, 1);

        // Add bot responses
        if (response) {
            for (const content of response) {
                if (content.type === 'text') {
                    this.messages.chat.push({
                        from: 'bot',
                        text: content.value,
                        type: 'text',
                    });
                } else if (content.type === 'action') {
                    this.messages.chat.push({
                        from: 'bot',
                        text: `Function Call: ${JSON.stringify({ name: content.name, args: content.args }, null, 2)}`,
                        type: 'text',
                    });
                }
            }
        } else {
            this.messages.chat.push({
                from: 'bot',
                text: 'Sorry, I encountered an error. Please try again.',
                type: 'status',
                color: 'error',
            });
        }

        await this.requestUpdate();
        this.scrollToBottom();
    }

    scrollToBottom() {
        const container = this.shadowRoot.querySelector('.c-content');
        const messageContainer = this.shadowRoot.querySelector('.message-container');
        if (container && messageContainer) {
            container.scrollTop = messageContainer.scrollHeight;
        }
    }

    hide() {
        this.view = 'logo';
    }

    expandClicked() {
        this.expanded = !this.expanded;
    }

    render() {
        if (wisk.editor.wiskSite) {
            return html``;
        }

        return html`
            ${this.showSettings
                ? html`
                      <div class="settings-div">
                          <div class="settings-header">
                              <h1>Settings</h1>
                              <button @click=${() => (this.showSettings = false)} class="settings-close">
                                  <img src="${this.path}close.svg" draggable="false" />
                              </button>
                          </div>

                          <div class="model-select">
                              <div
                                  class="model-option ${this.modelName === 'neo-swift' ? 'selected' : ''}"
                                  @click=${() => (this.modelName = 'neo-swift')}
                              >
                                  <div class="model-icon">
                                      <img src="${this.path}smol.svg" draggable="false" />
                                  </div>
                                  <div class="model-info">
                                      <div class="model-name">Neo Swift</div>
                                      <div class="model-description">Fastest model, great for quick tasks</div>
                                  </div>
                              </div>

                              <div class="model-option ${this.modelName === 'neo' ? 'selected' : ''}" @click=${() => (this.modelName = 'neo')}>
                                  <div class="model-icon">
                                      <img src="${this.path}sparkle.svg" draggable="false" />
                                  </div>
                                  <div class="model-info">
                                      <div class="model-name">Neo</div>
                                      <div class="model-description">Excellent balance of speed and capability</div>
                                  </div>
                              </div>

                              <div
                                  class="model-option ${this.modelName === 'neo-large' ? 'selected' : ''}"
                                  @click=${() => (this.modelName = 'neo-large')}
                              >
                                  <div class="model-icon">
                                      <img src="${this.path}chonk.svg" draggable="false" />
                                  </div>
                                  <div class="model-info">
                                      <div class="model-name">Neo Large</div>
                                      <div class="model-description">Most powerful model, best for complex tasks</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  `
                : ''}
            ${this.showLogoBubble && this.view === 'logo'
                ? html`
                      <div class="logo-bubble">
                          <div class="logo-bubble-header">
                              <button class="logo-bubble-close" @click=${() => this.closeLogoBubble()}>
                                  <img src="${this.path}close.svg" draggable="false" />
                              </button>
                          </div>
                          <div class="logo-bubble-content" @click=${() => this.setView('i-container')}>Hello! I'm Neo. How can I help you?</div>
                      </div>
                  `
                : ''}

            <button class="logo ${this.view === 'logo' ? 'active' : ''}" @click=${() => this.setView('i-container')}>
                <img src="/a7/plugins/neo-ai/ai.svg" style="filter: var(--themed-svg);" draggable="false" />
            </button>

            <div class="logo-footer" style="display: none;">
                <div class="logo-input">
                    <input type="text" placeholder="Ask anything or give a command..." />
                    <button>Attach</button>
                    <button>Send</button>
                </div>
            </div>

            <div class="i-container ${this.view === 'i-container' ? 'active' : ''} ${this.expanded ? 'expanded-container' : ''}">
                <div class="i-header">
                    <button class="expand" @click=${() => this.expandClicked()}>
                        <img src="${this.path}${this.expanded ? 'collapse' : 'expand'}.svg" draggable="false" />
                    </button>
                    <button class="settings" @click=${() => (this.showSettings = true)}>
                        <img src="${this.path}settings.svg" draggable="false" />
                    </button>
                    <button class="close" @click=${() => this.setView('logo')}><img src="${this.path}close.svg" draggable="false" /></button>
                </div>
                <div class="i-content">
                    <div style="display: flex; flex-direction: column; gap: var(--gap-2); padding: var(--padding-4);">
                        <div style="width: 52px; border-radius: 100px; height: 52px; background-color: var(--text-1);"></div>
                        <p class="text">Hello! I am Neo. How can I help you today?</p>
                    </div>

                    ${[...new Set(this.iContent.map(item => item.category))].map(
                        category => html`
                            <div class="i-category">
                                <div class="i-hx">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                                <div class="i-buttons">
                                    ${this.iContent
                                        .filter(item => item.category === category)
                                        .map(
                                            item => html`
                                                <button @click=${() => this.runArg(item.arg)} class="i-action-button">
                                                    <img src="${this.path}${item.image}.svg" draggable="false" class="i-action-icon" />
                                                    <span class="i-action-text">${item.text}</span>
                                                </button>
                                            `
                                        )}
                                </div>
                            </div>
                        `
                    )}
                </div>
                <div class="i-footer">
                    <div class="i-input">
                        <input
                            class="i-inp"
                            type="text"
                            placeholder="Ask anything or give a command..."
                            @keyup=${e => (e.key === 'Enter' ? this.sendClicked() : null)}
                        />
                        <button class="i-btn" style="display: none">Attach</button>
                        <button class="i-btn"><img src="${this.path}up.svg" draggable="false" @click=${() => this.sendClicked()} /></button>
                    </div>
                </div>
            </div>

            <div class="c-container ${this.view === 'c-container' ? 'active' : ''} ${this.expanded ? 'expanded-container' : ''}">
                <div class="c-header">
                    <p class="c-hx">
                        <span
                            style="color: var(--text-1); height: 24px; width: 24px; display: inline-block; background-color: var(--text-1); border-radius: 100px; margin-right: var(--gap-2);"
                        ></span>
                        Neo
                    </p>
                    <button class="expand" @click=${() => this.expandClicked()}>
                        <img src="${this.path}${this.expanded ? 'collapse' : 'expand'}.svg" draggable="false" />
                    </button>
                    <button class="settings" @click=${() => (this.showSettings = true)}>
                        <img src="${this.path}settings.svg" draggable="false" />
                    </button>
                    <button class="close" @click=${() => this.setView('logo')}><img src="${this.path}close.svg" draggable="false" /></button>
                </div>
                <div class="c-content">${this.renderChatContainer()}</div>
                <div class="c-footer">
                    <div class="c-input">
                        <input
                            class="c-inp"
                            type="text"
                            placeholder="Ask anything or give a command..."
                            @keyup=${e => (e.key === 'Enter' ? this.addUserMessage(e.target.value) : null)}
                        />
                        <button class="c-btn" style="display: none">Attach</button>
                        <button class="c-btn">
                            <img
                                src="${this.path}up.svg"
                                draggable="false"
                                @click=${async () => this.addUserMessage(this.shadowRoot.querySelector('.c-inp').value)}
                            />
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('neo-ai', NeoAI);

document.querySelector('.editor').appendChild(document.createElement('neo-ai'));
