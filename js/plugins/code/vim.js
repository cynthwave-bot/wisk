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

    handleKeydown(e) {
        if (!this.activeElement) return;

        const selection = window.getSelection();

        if (this.mode === 'normal') {
            switch(e.key) {
                // Mode changes remain the same
                case 'i':
                    this.mode = 'insert';
                    return;
                    
                case 'a':
                    this.mode = 'insert';
                    selection.modify('move', 'forward', 'character');
                    e.preventDefault();
                    return;

                case 'A':
                    this.mode = 'insert';
                    // Move to end of line
                    selection.modify('move', 'forward', 'lineboundary');
                    e.preventDefault();
                    return;

                case 'I':
                    this.mode = 'insert';
                    // Move to start of line
                    selection.modify('move', 'backward', 'lineboundary');
                    e.preventDefault();
                    return;

                // Basic movement using Selection API
                case 'h':
                    selection.modify('move', 'backward', 'character');
                    e.preventDefault();
                    return;

                case 'l':
                    selection.modify('move', 'forward', 'character');
                    e.preventDefault();
                    return;

                case 'k':
                    selection.modify('move', 'backward', 'line');
                    e.preventDefault();
                    return;

                case 'j':
                    selection.modify('move', 'forward', 'line');
                    e.preventDefault();
                    return;

                // Word movement using Selection API
                case 'w':
                    selection.modify('move', 'forward', 'word');
                    e.preventDefault();
                    return;

                case 'b':
                    selection.modify('move', 'backward', 'word');
                    e.preventDefault();
                    return;

                case 'e':
                    selection.modify('move', 'forward', 'word');
                    e.preventDefault();
                    return;

                // Line movement using Selection API
                case '0':
                    selection.modify('move', 'backward', 'lineboundary');
                    e.preventDefault();
                    return;

                case '$':
                    selection.modify('move', 'forward', 'lineboundary');
                    e.preventDefault();
                    return;

                // Deletion operations
                case 'x':
                    document.execCommand('delete', false);
                    e.preventDefault();
                    return;

                case 'v':
                    this.mode = 'visual';
                    this.visualStart = selection.getRangeAt(0).startOffset;
                    e.preventDefault();
                    return;

                case 'd':
                    if (e.repeat) {
                        // dd - delete line
                        selection.modify('move', 'backward', 'lineboundary');
                        selection.modify('extend', 'forward', 'lineboundary');
                        document.execCommand('delete', false);
                    } else {
                        this.lastAction = 'd';
                    }
                    e.preventDefault();
                    return;

                case 'D':
                    // Delete from cursor to end of line
                    selection.modify('extend', 'forward', 'lineboundary');
                    document.execCommand('delete', false);
                    e.preventDefault();
                    return;

                case 'c':
                    if (e.repeat) {
                        // cc - change line
                        selection.modify('move', 'backward', 'lineboundary');
                        selection.modify('extend', 'forward', 'lineboundary');
                        document.execCommand('delete', false);
                        this.mode = 'insert';
                    } else {
                        this.lastAction = 'c';
                    }
                    e.preventDefault();
                    return;

                case 'C':
                    // Change to end of line
                    selection.modify('extend', 'forward', 'lineboundary');
                    document.execCommand('delete', false);
                    this.mode = 'insert';
                    e.preventDefault();
                    return;

                default:
                    if (this.lastAction) {
                        // Handle compound commands
                        if (this.lastAction === 'd' && e.key === 'w') {
                            // Delete word
                            selection.modify('extend', 'forward', 'word');
                            document.execCommand('delete', false);
                        } else if (this.lastAction === 'c' && e.key === 'w') {
                            // Change word
                            selection.modify('extend', 'forward', 'word');
                            document.execCommand('delete', false);
                            this.mode = 'insert';
                        }
                        this.lastAction = null;
                        e.preventDefault();
                        return;
                    }
                    break;
            }

        } else if (this.mode === 'visual') {
            switch(e.key) {
                case 'Escape':
                    this.mode = 'normal';
                    selection.collapseToEnd();
                    e.preventDefault();
                    return;

                case 'h':
                    selection.modify('extend', 'backward', 'character');
                    e.preventDefault();
                    return;

                case 'l':
                    selection.modify('extend', 'forward', 'character');
                    e.preventDefault();
                    return;

                case 'k':
                    selection.modify('extend', 'backward', 'line');
                    e.preventDefault();
                    return;

                case 'j':
                    selection.modify('extend', 'forward', 'line');
                    e.preventDefault();
                    return;

                case 'w':
                    selection.modify('extend', 'forward', 'word');
                    e.preventDefault();
                    return;

                case 'b':
                    selection.modify('extend', 'backward', 'word');
                    e.preventDefault();
                    return;

                case 'd':
                case 'x':
                    document.execCommand('delete', false);
                    this.mode = 'normal';
                    e.preventDefault();
                    return;

                case 'y':
                    document.execCommand('copy', false);
                    this.mode = 'normal';
                    selection.collapseToStart();
                    e.preventDefault();
                    return;

                case '>':
                    document.execCommand('indent', false);
                    e.preventDefault();
                    return;

                case '<':
                    document.execCommand('outdent', false);
                    e.preventDefault();
                    return;
            }
        } else if (this.mode === 'insert' && e.key === 'Escape') {
            this.mode = 'normal';
            this.lastAction = null;
            selection.modify('move', 'backward', 'character');
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
