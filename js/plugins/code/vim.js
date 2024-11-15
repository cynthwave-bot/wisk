class VimEditor {
    constructor() {
        this.mode = 'normal';
        this.activeElement = null;
        this.statusIndicator = null;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing VimEditor');
        this.createStatusIndicator();
        this.setupBlockEventListeners();
        this.processAllElements();
        // dont use mutation observer for now, we will use block events
        // this.setupMutationObserver();
    }

    setupMutationObserver() {
        // Observer for the main document
        const observer = new MutationObserver((mutations) => {
            console.log('Document mutation detected');
            this.checkForNewShadowRoots();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observers.add(observer);
    }

    checkForNewShadowRoots() {
        console.log('Checking for new shadow roots');
        const shadowHosts = Array.from(document.querySelectorAll('*'))
            .filter(el => el.shadowRoot);

        shadowHosts.forEach(host => {
            // If we haven't observed this shadow root yet
            if (!host.dataset.vimObserved) {
                console.log('Found new shadow root', host);
                host.dataset.vimObserved = 'true';
                
                // Observe the shadow root for changes
                const shadowObserver = new MutationObserver((mutations) => {
                    console.log('Shadow root mutation detected');
                    this.processShadowRoot(host.shadowRoot);
                });

                shadowObserver.observe(host.shadowRoot, {
                    childList: true,
                    subtree: true
                });

                this.observers.add(shadowObserver);
                this.processShadowRoot(host.shadowRoot);
            }
        });
    }

    setupBlockEventListeners() {
        console.log('Setting up block event listeners');
        ['block-created', 'block-changed', 'block-deleted', 'block-updated'].forEach(eventType => {
            console.log(' ---- Adding event listener for:', eventType);
            window.addEventListener(eventType, () => {
                console.log('Block event received:', eventType);
                this.processAllElements();
            });
        });
    }

    handleBlockEvent(event) {
        console.log('Handling block event:', event.type, event.detail);
        // Force a check for new elements
        this.checkForNewShadowRoots();
    }

    processAllElements() {
        console.log('Processing all elements');
        // Find all shadow roots
        const shadowHosts = Array.from(document.querySelectorAll('*'))
            .filter(el => el.shadowRoot);

        // Process each shadow root
        shadowHosts.forEach(host => {
            this.processShadowRoot(host.shadowRoot);
        });
    }

    processShadowRoot(shadowRoot) {
        console.log('Processing shadow root for editables');
        const editables = shadowRoot.querySelectorAll('[contenteditable="true"]');
        editables.forEach(editable => this.attachToEditable(editable));
    }

    createStatusIndicator() {
        this.statusIndicator = document.createElement('div');
        this.statusIndicator.style.position = 'fixed';
        this.statusIndicator.style.backgroundColor = 'var(--bg-1)';
        this.statusIndicator.style.border = '1px solid var(--border-1)';
        this.statusIndicator.style.color = 'var(--text-1)';
        this.statusIndicator.style.borderRadius = 'var(--radius)';
        this.statusIndicator.style.padding = 'var(--padding-w3)';
        this.statusIndicator.style.fontFamily = 'monospace';
        this.statusIndicator.style.fontSize = '12px';
        this.statusIndicator.style.zIndex = '10000';
        this.statusIndicator.style.display = 'none';
        this.statusIndicator.style.bottom = 'var(--padding-3)';
        this.statusIndicator.style.left = 'var(--padding-3)';
        document.body.appendChild(this.statusIndicator);
    }

    initializeEditor() {
        console.log('Initial check for shadow roots');
        this.checkForNewShadowRoots();
    }

    attachToEditable(element) {
        if (element.dataset.vimEnabled) {
            console.log('Element already vim enabled', element);
            return;
        }
        
        console.log('Attaching vim to editable', element);
        element.dataset.vimEnabled = 'true';

        element.addEventListener('focus', () => {
            console.log('Element focused');
            this.activeElement = element;
            this.mode = 'normal';
            this.updateStatus();
            this.statusIndicator.style.display = 'block';
        });

        element.addEventListener('blur', () => {
            console.log('Element blurred');
            this.activeElement = null;
            this.statusIndicator.style.display = 'none';
        });

        element.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
            this.updateStatus();
        });
    }

    updateStatus() {
        const modeText = {
            'normal': '-- NORMAL --',
            'insert': '-- INSERT --',
            'visual': '-- VISUAL --'
        };
        this.statusIndicator.textContent = modeText[this.mode] || '';
    }


    findWordBoundary(direction, bigWord = false) {
        const sel = window.getSelection();
        const text = this.activeElement.textContent;
        let pos = sel.anchorOffset;

        const wordRegex = bigWord ? /[^\s]/ : /[A-Za-z0-9_]/;

        if (direction === 'forward') {
            // Skip current word
            while (pos < text.length && wordRegex.test(text[pos])) pos++;
            // Skip spaces
            while (pos < text.length && !wordRegex.test(text[pos])) pos++;
        } else {
            // Move back
            if (pos > 0) pos--;
            // Skip spaces backwards
            while (pos > 0 && !wordRegex.test(text[pos])) pos--;
            // Go to start of word
            while (pos > 0 && wordRegex.test(text[pos - 1])) pos--;
        }

        return Math.max(0, Math.min(pos, text.length));
    }

    // Helper for deletion
    deleteText(count) {
        const {node, offset} = this.getCurrentPosition();
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, Math.min(offset + count, node.length));
        range.deleteContents();
        
        // Maintain cursor position
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    getCurrentPosition() {
        const sel = window.getSelection();
        const range = sel.getRangeAt(0);
        
        // If there's no text node, create one
        if (!this.activeElement.firstChild || this.activeElement.firstChild.nodeType !== Node.TEXT_NODE) {
            const textNode = document.createTextNode(this.activeElement.textContent || '');
            this.activeElement.textContent = '';
            this.activeElement.appendChild(textNode);
        }
        
        return {
            node: this.activeElement.firstChild,
            offset: range.startOffset
        };
    }

    deleteToPosition(position) {
        const {node, offset} = this.getCurrentPosition();
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, position);
        range.deleteContents();
        
        // Maintain cursor position
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // Helper for changing text
    changeText(count) {
        this.deleteText(count);
        this.mode = 'insert';
    }

    handleKeydown(e) {
        if (!this.activeElement) return;

        if (this.mode === 'normal') {
            switch(e.key) {
                // Mode changes
                case 'i':
                    this.mode = 'insert';
                    return;
                    
                case 'a':
                    this.mode = 'insert';
                    window.getSelection().modify('move', 'forward', 'character');
                    e.preventDefault();
                    return;

                case 'A':
                    this.mode = 'insert';
                    const endRange = document.createRange();
                    endRange.selectNodeContents(this.activeElement);
                    endRange.collapse(false);
                    const endSelection = window.getSelection();
                    endSelection.removeAllRanges();
                    endSelection.addRange(endRange);
                    e.preventDefault();
                    return;

                case 'I':
                    this.mode = 'insert';
                    const startRange = document.createRange();
                    startRange.selectNodeContents(this.activeElement);
                    startRange.collapse(true);
                    const startSelection = window.getSelection();
                    startSelection.removeAllRanges();
                    startSelection.addRange(startRange);
                    e.preventDefault();
                    return;

                // Basic movement
                case 'h':
                    window.getSelection().modify('move', 'backward', 'character');
                    e.preventDefault();
                    return;

                case 'l':
                    window.getSelection().modify('move', 'forward', 'character');
                    e.preventDefault();
                    return;

                case 'k':
                    window.getSelection().modify('move', 'backward', 'line');
                    e.preventDefault();
                    return;

                case 'j':
                    window.getSelection().modify('move', 'forward', 'line');
                    e.preventDefault();
                    return;

                // Word movement
                case 'w':
                    const nextWordPos = this.findWordBoundary('forward', false);
                    const wRange = document.createRange();
                    wRange.setStart(this.activeElement.firstChild, nextWordPos);
                    wRange.collapse(true);
                    const wSelection = window.getSelection();
                    wSelection.removeAllRanges();
                    wSelection.addRange(wRange);
                    e.preventDefault();
                    return;

                case 'W':
                    const nextBigWordPos = this.findWordBoundary('forward', true);
                    const WRange = document.createRange();
                    WRange.setStart(this.activeElement.firstChild, nextBigWordPos);
                    WRange.collapse(true);
                    const WSelection = window.getSelection();
                    WSelection.removeAllRanges();
                    WSelection.addRange(WRange);
                    e.preventDefault();
                    return;

                case 'b':
                    const prevWordPos = this.findWordBoundary('backward', false);
                    const bRange = document.createRange();
                    bRange.setStart(this.activeElement.firstChild, prevWordPos);
                    bRange.collapse(true);
                    const bSelection = window.getSelection();
                    bSelection.removeAllRanges();
                    bSelection.addRange(bRange);
                    e.preventDefault();
                    return;

                case 'B':
                    const prevBigWordPos = this.findWordBoundary('backward', true);
                    const BRange = document.createRange();
                    BRange.setStart(this.activeElement.firstChild, prevBigWordPos);
                    BRange.collapse(true);
                    const BSelection = window.getSelection();
                    BSelection.removeAllRanges();
                    BSelection.addRange(BRange);
                    e.preventDefault();
                    return;

                case 'e':
                    window.getSelection().modify('move', 'forward', 'word');
                    e.preventDefault();
                    return;

                // Line movement
                case '0':
                    const startLineRange = document.createRange();
                    startLineRange.selectNodeContents(this.activeElement);
                    startLineRange.collapse(true);
                    const lineSelection = window.getSelection();
                    lineSelection.removeAllRanges();
                    lineSelection.addRange(startLineRange);
                    e.preventDefault();
                    return;

                case '$':
                    const endLineRange = document.createRange();
                    endLineRange.selectNodeContents(this.activeElement);
                    endLineRange.collapse(false);
                    const lineEndSelection = window.getSelection();
                    lineEndSelection.removeAllRanges();
                    lineEndSelection.addRange(endLineRange);
                    e.preventDefault();
                    return;

                case 'x':
                    this.deleteText(1);  // Now uses the fixed deleteText function
                    e.preventDefault();
                    return;

                case 'd':
                    if (e.repeat) {
                        // dd - delete line
                        this.activeElement.textContent = '';
                        // Create empty text node to maintain editing capability
                        this.activeElement.appendChild(document.createTextNode(''));
                    } else {
                        // Wait for next command
                        this.lastAction = 'd';
                    }
                    e.preventDefault();
                    return;

                case 'D':
                    // Delete from cursor to end of line
                    const {node, offset} = this.getCurrentPosition();
                    const range = document.createRange();
                    range.setStart(node, offset);
                    range.setEnd(node, node.length);
                    range.deleteContents();
                    e.preventDefault();
                    return;

                case 'c':
                    if (e.repeat) {
                        // cc - change line
                        this.activeElement.textContent = '';
                        this.activeElement.appendChild(document.createTextNode(''));
                        this.mode = 'insert';
                    } else {
                        this.lastAction = 'c';
                    }
                    e.preventDefault();
                    return;

                case 'C':
                    // Change to end of line
                    const pos = this.getCurrentPosition();
                    const cRange = document.createRange();
                    cRange.setStart(pos.node, pos.offset);
                    cRange.setEnd(pos.node, pos.node.length);
                    cRange.deleteContents();
                    this.mode = 'insert';
                    e.preventDefault();
                    return;

                case 's':
                    // Substitute character
                    this.deleteText(1);
                    this.mode = 'insert';
                    e.preventDefault();
                    return;

                case 'S':
                    // Substitute line
                    this.activeElement.textContent = '';
                    this.mode = 'insert';
                    e.preventDefault();
                    return;

                default:
                    if (this.lastAction) {
                        // Handle compound commands (dw, cw, etc.)
                        if (this.lastAction === 'd' && e.key === 'w') {
                            // Delete word
                            const wordEnd = this.findWordBoundary('forward', false);
                            this.deleteToPosition(wordEnd);
                        } else if (this.lastAction === 'c' && e.key === 'w') {
                            // Change word
                            const wordEnd = this.findWordBoundary('forward', false);
                            this.deleteToPosition(wordEnd);
                            this.mode = 'insert';
                        }
                        this.lastAction = null;
                        e.preventDefault();
                        return;
                    }
                    break;
            }
        } else if (this.mode === 'insert' && e.key === 'Escape') {
            this.mode = 'normal';
            this.lastAction = null;
            e.preventDefault();
            return;
        }
    }

    destroy() {
        if (this.statusIndicator) {
            this.statusIndicator.remove();
        }
        // Remove all vim-enabled flags
        const shadowHosts = Array.from(document.querySelectorAll('*'))
            .filter(el => el.shadowRoot);
        
        shadowHosts.forEach(host => {
            const editables = host.shadowRoot.querySelectorAll('[data-vim-enabled]');
            editables.forEach(editable => {
                delete editable.dataset.vimEnabled;
            });
        });
    }
}

// Initialize
const vimEditor = new VimEditor();
