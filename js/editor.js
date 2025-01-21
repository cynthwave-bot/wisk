var debounceTimer;
var deletedElements = [];
var elementUpdatesLeft = [];
var deletedElementsLeft = [];
var configChanges = [];

// Utility functions
const createHoverImageContainer = elementId => {
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('hover-images');

    const addButton = createHoverButton('/a7/forget/plus.svg', () => whenPlusClicked(elementId));
    const deleteButton = createHoverButton('/a7/forget/trash.svg', () => whenTrashClicked(elementId));

    imageContainer.appendChild(addButton);
    imageContainer.appendChild(deleteButton);

    return imageContainer;
};

const createHoverButton = (src, clickHandler) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Hover image';
    img.classList.add('hover-image', 'plugin-icon');
    img.addEventListener('click', clickHandler);
    return img;
};

const createFullWidthWrapper = (elementId, block, imageContainer) => {
    const wrapper = document.createElement('div');
    wrapper.id = `full-width-wrapper-${elementId}`;
    wrapper.classList.add('full-width-wrapper');
    wrapper.appendChild(block);

    if (!window.wisk.editor.wiskSite) {
        wrapper.appendChild(imageContainer);
    }
    return wrapper;
};

const createBlockContainer = (elementId, blockType) => {
    const container = document.createElement('div');
    container.id = `div-${elementId}`;
    container.classList.add('rndr');

    if (window.wisk.plugins.getPluginDetail(blockType).width === 'max') {
        container.classList.add('rndr-full-width');
    }

    return container;
};

const createBlockElement = (elementId, blockType) => {
    const block = document.createElement(blockType);
    block.id = elementId;
    return block;
};

// Editor core functions
window.wisk.editor.generateNewId = () =>
    [...Array(15)].map(() => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 52)]).join('');

window.wisk.editor.elements = [];

window.wisk.editor.addConfigChange = async function (arr) {
    await saveUpdates(
        arr,
        window.wisk.editor.elements.map(e => e.id),
        []
    );

    for (const change of arr) {
        configChanges.push(change);
    }
    configChanges = [];
};

window.wisk.editor.savePluginData = async function (identifier, data) {
    var arr = [{ path: 'document.plugin.' + identifier, values: { data: data } }];
    await saveUpdates(
        arr,
        window.wisk.editor.elements.map(e => e.id),
        []
    );

    for (const change of arr) {
        configChanges.push(change);
    }
    configChanges = [];
};

window.wisk.editor.createBlockBase = function (elementId, blockType, value, remoteId, isRemote = false) {
    if (elementId === '') {
        elementId =
            window.wisk.editor.elements.length > 1
                ? window.wisk.editor.elements[window.wisk.editor.elements.length - 1].id
                : window.wisk.editor.elements[0].id;
    }

    const id = isRemote ? remoteId : window.wisk.editor.generateNewId();
    const obj = { value, id, component: blockType };

    const prevElement = document.getElementById(`div-${elementId}`);
    const blockElement = createBlockElement(id, blockType);

    const imageContainer = createHoverImageContainer(id);

    const fullWidthWrapper = createFullWidthWrapper(id, blockElement, imageContainer);
    const container = createBlockContainer(id, blockType);

    container.appendChild(fullWidthWrapper);
    document.getElementById('editor').insertBefore(container, prevElement.nextSibling);

    const elementIndex = window.wisk.editor.elements.findIndex(e => e.id === elementId);
    window.wisk.editor.elements.splice(elementIndex + 1, 0, obj);

    return { id, blockElement };
};

window.wisk.editor.createRemoteBlock = function (elementId, blockType, value, remoteId) {
    const { id, blockElement } = this.createBlockBase(elementId, blockType, value, remoteId, true);

    setTimeout(() => {
        window.wisk.editor.updateBlock(id, '', value, 'uwu');
    }, 0);
};

window.wisk.editor.createNewBlock = function (elementId, blockType, value, focusIdentifier, rec) {
    const { id, blockElement } = this.createBlockBase(elementId, blockType, value, null, false);

    setTimeout(() => {
        window.wisk.editor.updateBlock(id, '', value, rec);
        window.wisk.editor.focusBlock(id, focusIdentifier);
    }, 0);
};

window.wisk.editor.handleChanges = async function (updateObject) {
    // Handle case where updateObject might be undefined or null
    if (!updateObject) return;

    // If changes is a single object, convert it to an array
    const changes = Array.isArray(updateObject.changes) ? updateObject.changes : updateObject.changes ? [updateObject.changes] : [];

    const allElements = updateObject.allElements || [];
    const newDeletedElements = updateObject.newDeletedElements || [];

    // Handle deletions first
    await handleElementDeletions(newDeletedElements);

    // Handle updates and additions
    for (const change of changes) {
        if (change.path === 'document.elements') {
            await handleElementChange(change.values, allElements);
        }
        if (change.path.startsWith('document.config.access')) {
            if (change.path.includes('public')) {
                window.wisk.editor.data.config.public = change.values.public;
            }
            if (change.path.includes('add')) {
                window.wisk.editor.data.config.access.push(change.values.email);
            }
            if (change.path.includes('remove')) {
                window.wisk.editor.data.config.access = window.wisk.editor.data.config.access.filter(a => a !== change.values.email);
            }
        }
        if (change.path.startsWith('document.config.plugins')) {
            if (change.path.includes('add')) {
                window.wisk.plugins.loadPlugin(change.values.plugin);
            }
        }
        if (change.path.startsWith('document.config.theme')) {
            window.wisk.theme.setTheme(change.values.theme);
        }
        if (change.path.startsWith('document.plugin')) {
            if (change.values.data) {
                document.getElementById(change.path.replace('document.plugin.', '')).loadData(change.values.data);
            }
        }
    }

    // Handle reordering only if necessary
    if (allElements.length > 0) {
        smartReorderElements(allElements);
    }
};

const handleElementChange = async (updatedElement, allElements) => {
    if (!updatedElement) return;

    const existingElement = window.wisk.editor.elements.find(e => e.id === updatedElement.id);
    const domElement = document.getElementById(updatedElement.id);

    if (!existingElement || !domElement) {
        const currentIndex = allElements.indexOf(updatedElement.id);
        const prevElementId = currentIndex > 0 ? allElements[currentIndex - 1] : '';

        window.wisk.editor.createRemoteBlock(prevElementId, updatedElement.component, updatedElement.value, updatedElement.id);
    } else {
        updateExistingElement(existingElement, updatedElement, domElement, 'uwu');
    }
};

const updateExistingElement = (existingElement, updatedElement, domElement, rec) => {
    Object.assign(existingElement, {
        value: updatedElement.value,
        lastEdited: updatedElement.lastEdited,
        component: updatedElement.component,
    });

    if (domElement.tagName.toLowerCase() !== updatedElement.component) {
        const prevElement = window.wisk.editor.prevElement(updatedElement.id);
        if (prevElement) {
            window.wisk.editor.changeBlockType(updatedElement.id, updatedElement.value, updatedElement.component, rec);
        }
    } else {
        setTimeout(() => {
            domElement.setValue('', updatedElement.value);
        }, 0);
    }
};

const handleElementDeletions = async newDeletedElements => {
    if (!Array.isArray(newDeletedElements)) return;

    for (const deletedId of newDeletedElements) {
        if (!deletedElements.includes(deletedId)) {
            deletedElements.push(deletedId);
            const element = document.getElementById(`div-${deletedId}`);
            if (element) {
                document.getElementById('editor').removeChild(element);
                window.wisk.editor.elements = window.wisk.editor.elements.filter(e => e.id !== deletedId);
            }
        }
    }
};

const smartReorderElements = allElements => {
    if (!Array.isArray(allElements) || allElements.length === 0) return;

    const editorElement = document.getElementById('editor');
    if (!editorElement) return;

    // Get currently focused element if any
    const activeElement = document.activeElement;
    const focusedId = activeElement?.id;

    // Create a map of current positions
    const currentPositions = new Map();
    Array.from(editorElement.children).forEach((element, index) => {
        const id = element.id?.replace('div-', '');
        if (id) currentPositions.set(id, index);
    });

    // Calculate which elements need to move
    const elementsToMove = [];
    allElements.forEach((id, newIndex) => {
        const currentIndex = currentPositions.get(id);
        if (currentIndex !== undefined && currentIndex !== newIndex) {
            elementsToMove.push({ id, newIndex, currentIndex });
        }
    });

    // Move only the elements that are out of position
    elementsToMove.forEach(({ id, newIndex }) => {
        const element = document.getElementById(`div-${id}`);
        if (!element) return;

        const referenceElement = editorElement.children[newIndex];
        if (referenceElement) {
            editorElement.insertBefore(element, referenceElement);
        } else {
            editorElement.appendChild(element);
        }
    });

    // Restore focus if needed
    if (focusedId) {
        const elementToFocus = document.getElementById(focusedId);
        if (elementToFocus) {
            elementToFocus.focus();
        }
    }

    // Update the elements array order to match
    window.wisk.editor.elements.sort((a, b) => allElements.indexOf(a.id) - allElements.indexOf(b.id));
};

async function initEditor(doc) {
    console.log('INIT EDITOR', doc);
    window.wisk.editor.data = doc.data;
    document.title = doc.name;

    // Load plugins
    if (doc.data.config.plugins && !Array.isArray(doc.data.config.plugins)) {
        doc.data.config.plugins = [];
    }

    await Promise.all(
        doc.data.config.plugins
            .filter(plugin => !window.wisk.plugins.loadedPlugins.includes(plugin))
            .map(plugin => window.wisk.plugins.loadPlugin(plugin))
    );

    // once plugins are loaded we load the data of plugins using their identifiers
    // loop through all loadedPlugins and loop through their contents and load their dat.
    for (const plugin of window.wisk.plugins.loadedPlugins) {
        var tempPlugin = window.wisk.plugins.getPluginGroupDetail(plugin);
        for (const content of tempPlugin.contents) {
            if (content.identifier && doc.data.pluginData[content.identifier]) {
                document.getElementById(content.identifier).loadData(doc.data.pluginData[content.identifier]);
            }
        }
    }

    window.wisk.theme.setTheme(doc.data.config.theme);

    const page = doc.data;
    deletedElements = page.deletedElements;
    window.wisk.editor.elements = page.elements;

    if (!window.wisk.editor.wiskSite) {
        document.getElementById('last-space').addEventListener('click', handleEditorClick);
    }

    await initializeElements();

    window.wisk.utils.hideLoading();
}

async function initializeElements() {
    if (window.wisk.editor.elements.length > 1) {
        document.getElementById('getting-started').style.display = 'none';
    }

    const firstElement = window.wisk.editor.elements[0];
    const container = createBlockContainer(firstElement.id, firstElement.component);
    const block = createBlockElement(firstElement.id, firstElement.component);
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('hover-images');

    const plusButton = createHoverButton('/a7/forget/plus.svg', () => whenPlusClicked(firstElement.id));
    imageContainer.appendChild(plusButton);

    const fullWidthWrapper = createFullWidthWrapper(firstElement.id, block, imageContainer);
    container.appendChild(fullWidthWrapper);
    document.getElementById('editor').appendChild(container);

    window.dispatchEvent(new CustomEvent('block-created', { detail: { id: firstElement.id } }));

    setTimeout(() => {
        document.getElementById(firstElement.id).setValue('', firstElement.value);

        if (wisk.editor.template && wisk.editor.template !== '') {
            fetch('/js/templates/storage/' + wisk.editor.template + '.json')
                .then(response => response.json())
                .then(data => {
                    // set data
                    setTimeout(() => {
                        wisk.editor.useTemplate(data);
                    }, 0);
                });
        }

        if (window.wisk.editor.elements.length === 1) {
            window.wisk.editor.focusBlock(firstElement.id, {
                x: firstElement.value.textContent.length,
            });
            return;
        }

        initializeRemainingElements();
    }, 0);
}

async function initializeRemainingElements() {
    for (let i = 1; i < window.wisk.editor.elements.length; i++) {
        const element = window.wisk.editor.elements[i];

        const container = createBlockContainer(element.id, element.component);
        const block = createBlockElement(element.id, element.component);

        const imageContainer = createHoverImageContainer(element.id);

        const fullWidthWrapper = createFullWidthWrapper(element.id, block, imageContainer);
        container.appendChild(fullWidthWrapper);
        document.getElementById('editor').appendChild(container);

        window.dispatchEvent(new CustomEvent('block-created', { detail: { id: element.id } }));

        setTimeout(() => {
            document.getElementById(element.id).setValue('', element.value);
        }, 0);
    }
}

window.wisk.editor.htmlToMarkdown = function (html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    function escapeBackslashes(text) {
        return text.replace(/\\/g, '\\\\');
    }

    function processNode(node) {
        if (node.nodeType === 3) {
            return escapeBackslashes(node.textContent);
        }

        let result = '';

        for (const child of node.childNodes) {
            result += processNode(child);
        }

        switch (node.nodeName.toLowerCase()) {
            case 'a':
                if (node.classList?.contains('reference-number')) {
                    const refNum = result.replace(/[\[\]]/g, '');
                    return `[ref_${refNum}]`;
                }
                return `[${result}](${node.href})`;
            case 'b':
            case 'strong':
                return `**${result}**`;
            case 'i':
            case 'em':
                return `*${result}*`;
            case 'strike':
                return `~~${result}~~`;
            case 'u':
                return `__${result}__`;
            case 'span':
                const refSpan = node.querySelector('.reference-number');
                if (refSpan) {
                    const refNum = refSpan.textContent.replace(/[\[\]]/g, '');
                    return result.replace(refSpan.outerHTML, `[ref_${refNum}]`);
                }
                return result;
            default:
                return result;
        }
    }

    return processNode(temp).trim();
};

// Element Navigation/Management Functions
window.wisk.editor.getElement = function (elementId) {
    return window.wisk.editor.elements.find(e => e.id === elementId);
};

window.wisk.editor.prevElement = function (elementId) {
    if (elementId === window.wisk.editor.elements[0].id) {
        return null;
    }

    const index = window.wisk.editor.elements.findIndex(e => e.id === elementId);
    return index > 0 ? window.wisk.editor.elements[index - 1] : null;
};

window.wisk.editor.nextElement = function (elementId) {
    const index = window.wisk.editor.elements.findIndex(e => e.id === elementId);
    return index < window.wisk.editor.elements.length - 1 ? window.wisk.editor.elements[index + 1] : null;
};

window.wisk.editor.showSelector = function (elementId, focusIdentifier) {
    const selector = byQuery('selector-element');
    selector.show(elementId);
};

window.wisk.editor.deleteBlock = function (elementId, rec) {
    deletedElements.push(elementId);
    const element = document.getElementById(`div-${elementId}`);
    if (element) {
        document.getElementById('editor').removeChild(element);
        window.wisk.editor.elements = window.wisk.editor.elements.filter(e => e.id !== elementId);
        deletedElementsLeft.push(elementId);

        window.dispatchEvent(new CustomEvent('block-deleted', { detail: { id: elementId } }));

        if (rec == undefined) {
            window.wisk.editor.justUpdates();
        }
    }
};

window.wisk.editor.focusBlock = function (elementId, identifier) {
    const element = document.getElementById(elementId);
    if (element) {
        element.focus(identifier);
    }
};

window.wisk.editor.updateBlock = function (elementId, path, newValue, rec) {
    const element = document.getElementById(elementId);
    if (element) {
        element.setValue(path, newValue);

        window.dispatchEvent(new CustomEvent('block-updated', { detail: { id: elementId } }));

        if (rec === undefined) {
            this.justUpdates(elementId);
        }
    }
};

window.wisk.editor.changeBlockType = function (elementId, value, newType, rec) {
    const prevElement = window.wisk.editor.prevElement(elementId);
    if (!prevElement) {
        return;
    }

    window.wisk.editor.deleteBlock(elementId, rec);
    window.wisk.editor.createNewBlock(prevElement.id, newType, value, { x: 0 }, rec);

    window.dispatchEvent(new CustomEvent('block-changed', { detail: { id: prevElement.id } }));
};

window.wisk.editor.runBlockFunction = function (elementId, functionName, arg) {
    const element = document.getElementById(elementId);
    if (element && typeof element[functionName] === 'function') {
        element[functionName](arg);
    }
};

window.wisk.editor.useTemplate = async function (template) {
    if (this.elements.length > 1) {
        alert('You need to clear the current document before using a template.');
        return;
    }

    for (const plugin of template.plugins) {
        await window.wisk.plugins.loadPlugin(plugin);
        await window.wisk.editor.addConfigChange([{ path: 'document.config.plugins.add', values: { plugin } }]);
    }

    // delete all elements
    for (const element of window.wisk.editor.elements) {
        if (element.id !== 'abcdefABCDEFxyz') window.wisk.editor.deleteBlock(element.id);
    }

    for (const element of template.elements) {
        if (element.id === 'abcdefABCDEFxyz') {
            document.getElementById('abcdefABCDEFxyz').setValue('', element.value);
            document.getElementById('abcdefABCDEFxyz').sendUpdates();
        }
        if (element.id !== 'abcdefABCDEFxyz') window.wisk.editor.createNewBlock('', element.component, element.value, { x: 0 });
    }

    wisk.theme.setTheme(template.theme);
    await wisk.editor.addConfigChange([{ path: 'document.config.theme', values: { theme: template.theme } }]);

    window.wisk.editor.justUpdates();

    // focus on the first element
    setTimeout(() => {
        const firstElement = window.wisk.editor.elements[0];
        window.wisk.editor.focusBlock(firstElement.id, { x: firstElement.value.textContent.length });
    }, 0);
};

// Event Handler Functions
function whenPlusClicked(elementId) {
    window.wisk.editor.createNewBlock(elementId, 'text-element', { textContent: '' }, { x: 0 });
    const nextElement = window.wisk.editor.nextElement(elementId);
    if (nextElement) {
        window.wisk.editor.showSelector(nextElement.id, { x: 0 });
    }
}

function whenTrashClicked(elementId) {
    console.log('TRASH CLICKED', elementId);
    window.wisk.editor.deleteBlock(elementId);
}

function handleEditorClick(event) {
    if (event.target.closest('#getting-started')) {
        return;
    }

    const lastElement = window.wisk.editor.elements[window.wisk.editor.elements.length - 1];

    if (lastElement.component === 'text-element') {
        window.wisk.editor.focusBlock(lastElement.id, {
            x: lastElement.value.textContent.length,
        });
    } else {
        window.wisk.editor.createNewBlock(lastElement.id, 'text-element', { textContent: '' }, { x: 0 });
    }
}

window.wisk.editor.justUpdates = async function (elementId) {
    window.dispatchEvent(new CustomEvent('something-updated', { detail: { id: elementId } }));

    if (elementId) {
        if (elementId === window.wisk.editor.elements[0].id) {
            document.title = byQuery('#' + elementId).getTextContent().text;
            window.wisk.editor.addConfigChange([{ path: 'document.name', values: { name: byQuery('#' + elementId).getTextContent().text } }]);
        }

        const element = window.wisk.editor.getElement(elementId);
        if (element) {
            const domElement = document.getElementById(elementId);
            if (domElement) {
                element.value = domElement.getValue();
                element.lastEdited = Math.floor(Date.now() / 1000);
                element.component = domElement.tagName.toLowerCase();
                document.getElementById('nav').classList.add('nav-disappear');
                document.getElementById('getting-started').style.display = 'none';

                if (!elementUpdatesLeft.includes(elementId)) {
                    elementUpdatesLeft.push(elementId);
                }
            }
        }
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        const changed = elementUpdatesLeft
            .map(elementId => {
                const element = window.wisk.editor.getElement(elementId);
                if (element) {
                    return {
                        path: 'document.elements',
                        values: {
                            id: element.id,
                            value: element.value,
                            lastEdited: element.lastEdited,
                            component: element.component,
                        },
                    };
                }
                return null;
            })
            .filter(Boolean);

        const elementIds = window.wisk.editor.elements.map(e => e.id);

        await saveUpdates(changed, elementIds, deletedElementsLeft);

        elementUpdatesLeft = [];
        deletedElementsLeft = [];
    }, 100); // should it be less? to voice your opinion, join our discord server: https://discord.gg/YyqXEey4JS
};

class FocusMonitor {
    constructor(timeThreshold = 2000) {
        this.timeThreshold = timeThreshold;
        this.focusTimer = null;
        this.currentElement = null;
        this.init();
    }

    init() {
        document.addEventListener('focusin', event => {
            const webComponent =
                event.target.closest(':not(:defined)') ||
                Array.from(event.composedPath()).find(el => el instanceof HTMLElement && el.tagName.includes('-'));

            if (webComponent) {
                this.clearTimer();
                this.currentElement = webComponent;
                this.startTimer();
            }
        });

        document.addEventListener('focusout', () => {
            this.clearTimer();
        });
    }

    startTimer() {
        this.focusTimer = setTimeout(() => {
            if (this.currentElement) {
                console.log('Element focused for 2 seconds:', {
                    element: this.currentElement,
                    tagName: this.currentElement.tagName,
                    activeElement: this.findActiveElement(this.currentElement),
                });
            }
        }, this.timeThreshold);
    }

    clearTimer() {
        if (this.focusTimer) {
            clearTimeout(this.focusTimer);
            this.focusTimer = null;
        }
        this.currentElement = null;
    }

    findActiveElement(root) {
        const active = document.activeElement;
        if (root.shadowRoot) {
            const shadowActive = root.shadowRoot.activeElement;
            if (shadowActive) {
                return this.findActiveElement(shadowActive);
            }
        }
        return active;
    }
}

const focusMonitor = new FocusMonitor();

class PlainTextPasteHandler {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener(
            'paste',
            event => {
                const activeElement = this.getDeepActiveElement();
                if (activeElement?.hasAttribute('contenteditable') && this.isWithinWebComponent(activeElement)) {
                    event.preventDefault();
                    let text = event.clipboardData?.getData('text/plain') || '';

                    // Clean the text:
                    // 1. Replace all whitespace characters (including newlines, tabs) with single spaces
                    // 2. Trim any leading/trailing whitespace
                    text = text.replace(/\s+/g, ' ').trim();
                    if (text) {
                        document.execCommand('insertText', false, text);
                    }
                }
            },
            true
        );
    }

    getDeepActiveElement() {
        let active = document.activeElement;

        while (active?.shadowRoot?.activeElement) {
            active = active.shadowRoot.activeElement;
        }

        return active;
    }

    isWithinWebComponent(element) {
        let parent = element;

        while (parent) {
            if (parent.tagName?.includes('-')) {
                return true;
            }
            parent = parent.parentElement || parent.getRootNode()?.host;
        }

        return false;
    }
}

// TODO change this to handle things better
// - like if user is pasting list, it should add a list
// - or image
// etc
const pasteHandler = new PlainTextPasteHandler();
