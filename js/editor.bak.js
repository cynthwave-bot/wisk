const generateNewId = () => [...Array(15)].map(() => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 52)]).join('');

function initEditor() {

    console.log("Initializing editor...");

    if (window.wisk.editor.pageId) {
        window.wisk.db.getItem(window.wisk.editor.pageId).then((value) => {
            if (value) {
                // value = {
                //     "name": "asdasdasdas",
                //     "lastUpdated": "1727087144",
                //     "elements": [
                //         {
                //             "textContent": "asdasdasdas",
                //             "component": "heading1-element"
                //         }
                //     ]
                // }
                window.wisk.editor.elementIds = [];
                const editorMain = byQuery(".editor-main");
                editorMain.innerHTML = "";

                console.log("Setting value: ", value);

                for (let i = 0; i < value.elements.length; i++) {
                    const element = value.elements[i];
                    const newId = value.elements[i].id;
                    const componentTag = element.component;
                    const newBlockHTML = `
                        <div class="rndr">
                            <button class="left-buttons add-button" onclick="newElementWithDialog('${newId}')">
                                <img src="/a7/iconoir/plus.svg">
                            </button>
                            <button class="left-buttons delete-button" onclick="deleteElement('${newId}')">
                                <img src="/a7/iconoir/trash.svg">
                            </button>
                            <${componentTag} element-id="${newId}" class="${newId} editor-element"></${componentTag}>
                        </div>
                    `;

                    editorMain.insertAdjacentHTML("beforeend", newBlockHTML);
                    window.wisk.editor.elementIds.push(newId);
                    addEventListeners(`.${newId}`);
                    console.log(`Setting value for ${newId}: `, element, byQuery(`.${newId}`));
                }

                setTimeout(() => {
                    for (let i = 0; i < window.wisk.editor.elementIds.length; i++) {
                        const element = byQuery(`.${window.wisk.editor.elementIds[i]}`);
                        console.log("Setting value for ", element);
                        element.setValue(value.elements[i]);
                    }
                    // TODO FIX THIS SHIT
                }, 100);

                return;
            }
        });
    }

    const editorMain = byQuery(".editor-main");
    editorMain.innerHTML = `
        <div class="rndr">
            <button class="left-buttons add-button"><img src="/a7/iconoir/plus.svg"></button>
            <button class="left-buttons delete-button"><img src="/a7/iconoir/trash.svg"></button>
            <heading1-element element-id="abcdefABCDEFxyz" class="abcdefABCDEFxyz editor-element"></heading1-element>
        </div>
    `;

    window.wisk.editor.elementIds.push("abcdefABCDEFxyz");
    addEventListeners(".abcdefABCDEFxyz");

    editorMain.querySelector(".add-button").onclick = () => newElementWithDialog("abcdefABCDEFxyz");
    editorMain.querySelector(".delete-button").onclick = () => deleteElement("abcdefABCDEFxyz");

    editorMain.addEventListener("click", handleEditorClick);
}

// Event listeners
function addEventListeners(selector) {
    byQuery(selector).addEventListener("value-updated", handleDispatches);
}

function handleDispatches(event) {
    const eventType = event.detail.eventType;
    
    switch (eventType) {
        case "show-selector":
            showSelector(event.detail.fromElementId);
            break;
        case "delete-block":
            deleteBlock(event);
            break;
        case "enter-block":
            createNewBlock(event);
            break;
        case "move-focus":
            moveFocus(event);
            return;
        case "just-updates":
            updateValue(event);
            break;
        case "update-block":
            updateValue(event);
            break;
        default:
            justUpdates();
    }

    justUpdates();
}

// Create a new block
function createNewBlock(event) {
    console.log("Creating new block...");

    const { elementId, offset } = event.detail;


    const newId = generateNewId();
    const element = byQuery(`.${elementId}`).closest('.rndr');

    var newBlockHTML;
    if (event.detail.elementTagName) {
        newBlockHTML = createBlockHTML(newId, event.detail.elementTagName);
    } else {
        newBlockHTML = createBlockHTML(newId, "text-element");
    }
    
    element.insertAdjacentHTML("afterend", newBlockHTML);
    
    const index = window.wisk.editor.elementIds.indexOf(elementId);
    window.wisk.editor.elementIds.splice(index + 1, 0, newId);

    setTimeout(() => {
        addEventListeners(`.${newId}`);
        const elementText = element.querySelector('.editor-element').getValue().textContent;
        const newElement = byQuery(`.${newId}`);
        
        newElement.setValue({ textContent: elementText.slice(offset) });
        element.querySelector('.editor-element').setValue({ textContent: elementText.slice(0, offset) });
        newElement.focusOnIndex(0);
    }, 0);
}

// Delete a block
function deleteBlock(event) {

    console.log("Deleting block...");

    const { elementId } = event.detail;

    const currElementIdIndex = window.wisk.editor.elementIds.indexOf(elementId);
    if (currElementIdIndex === 0) return;

    const container = byQuery(`.${elementId}`).closest('.rndr');
    const previousContainer = container.previousElementSibling;
    const previousElement = previousContainer.querySelector('.editor-element');

    if (previousElement) {
        const previousElementText = previousElement.getValue().textContent;
        const elementText = container.querySelector('.editor-element').getValue().textContent;
        previousElement.setValue({ textContent: previousElementText + elementText });
        previousElement.focusOnIndex(previousElementText.length);
    }

    window.wisk.editor.elementIds.splice(currElementIdIndex, 1);
    container.remove();
}

function moveFocus(event) {
    console.log("Moving focus...");
    const { elementId, offset, direction } = event.detail;
    if (direction === "next-up") {
        const index = window.wisk.editor.elementIds.indexOf(elementId);
        if (index === 0) return;
        byQuery(`.${window.wisk.editor.elementIds[index - 1]}`).focusOnIndex(offset);
    }
    
    if (direction === "next-down") {
        const index = window.wisk.editor.elementIds.indexOf(elementId);
        if (index === window.wisk.editor.elementIds.length - 1) return;
        byQuery(`.${window.wisk.editor.elementIds[index + 1]}`).focusOnIndex(offset);
    }

    if (direction === "to-element") {
        byQuery(`.${elementId}`).focusOnIndex(offset - 1);
    }
}

function updateValue(event) {
    const { elementId, value } = event.detail;
    const element = byQuery(`.${elementId}`);
    element.setValue(value);
}

async function justUpdates() {
    var value = {
        name: byQuery(`.${window.wisk.editor.elementIds[0]}`).getValue().textContent || "Untitled",
        lastUpdated: Math.floor(Date.now() / 1000).toString(),
        elements: []
    }

    // go through all elements and get their values and add them to the value object
    for (let i = 0; i < window.wisk.editor.elementIds.length; i++) {
        const element = byQuery(`.${window.wisk.editor.elementIds[i]}`);
        var elementValue = element.getValue();
        elementValue.component = element.tagName.toLowerCase();
        elementValue.id = window.wisk.editor.elementIds[i];
        value.elements.push(elementValue);
    }

    console.log("Saving value: ", value);
    await window.wisk.db.setItem(window.wisk.editor.pageId, value);
}

function changeElement(elementId, elementTagName) {
    const oldElement = byQuery(`.${elementId}`);
    const newElementId = generateNewId();
    const newBlockHTML = createBlockHTML(newElementId, elementTagName);

    oldElement.closest('.rndr').insertAdjacentHTML("afterend", newBlockHTML);
    const index = window.wisk.editor.elementIds.indexOf(elementId);
    window.wisk.editor.elementIds.splice(index, 1, newElementId);

    const newElement = byQuery(`.${newElementId}`);
    newElement.setValue(oldElement.getValue());
    oldElement.closest('.rndr').remove();

    setTimeout(() => {
        addEventListeners(`.${newElementId}`);
        newElement.focusOnIndex(0);
    }, 0);
}

// Delete an element
function deleteElement(elementId) {

    if (window.wisk.editor.elementIds.length > 0 && window.wisk.editor.elementIds[0] === elementId) {
        return;
    }

    const container = byQuery(`.${elementId}`).closest('.rndr');
    const index = window.wisk.editor.elementIds.indexOf(elementId);
    window.wisk.editor.elementIds.splice(index, 1);
    container.remove();
}

// Create a new element with dialog
function newElementWithDialog(elementId) {
    const newId = generateNewId();
    const newBlockHTML = createBlockHTML(newId);

    console.log("CREATE BLOCK: ", newBlockHTML);
    
    byQuery(`.${elementId}`).closest('.rndr').insertAdjacentHTML("afterend", newBlockHTML);
    
    const index = window.wisk.editor.elementIds.indexOf(elementId);
    window.wisk.editor.elementIds.splice(index + 1, 0, newId);

    console.log("Adding event listeners to ", newId);

    setTimeout(() => {
        addEventListeners(`.${newId}`);
        byQuery(`.${newId}`).focusOnIndex(0);
    }, 0);

    window.wisk.editor.showSelector(newId);
}

// Show selector
function showSelector(callingElement) {
    console.log("Showing selector...");
    const selector = byQuery("selector-element");
    selector.setAttribute("calling-element", callingElement);
    selector.setAttribute("calling-type", "change-element");
    selector.show();
}

// Create a new element
function newElement(elementId, dataPluginId, dataContentId) {
    const newId = generateNewId();
    const componentTag = dataPluginId && dataContentId
        ? window.wisk.plugins.pluginData.list[dataPluginId].contents[dataContentId].component
        : "text-element";

    const newBlockHTML = `
        <div class="rndr">
            <button class="left-buttons add-button" onclick="newElementWithDialog('${newId}')">
                <img src="/a7/iconoir/plus.svg">
            </button>
            <button class="left-buttons delete-button" onclick="deleteElement('${newId}')">
                <img src="/a7/iconoir/trash.svg">
            </button>
            <${componentTag} element-id="${newId}" class="${newId} editor-element"></${componentTag}>
        </div>
    `;
    
    byQuery(`.${elementId}`).closest('.rndr').insertAdjacentHTML("afterend", newBlockHTML);
    
    const index = window.wisk.editor.elementIds.indexOf(elementId);
    window.wisk.editor.elementIds.splice(index + 1, 0, newId);

    setTimeout(() => {
        addEventListeners(`.${newId}`);
        byQuery(`.${newId}`).focusOnIndex(0);
    }, 0);
}

// Handle editor click
function handleEditorClick(event) {
    const computedStyle = window.getComputedStyle(this);
    const { paddingLeft, paddingRight, paddingBottom } = computedStyle;
    const rect = this.getBoundingClientRect();
    
    const relativeX = event.clientX - rect.left + this.scrollLeft;
    const relativeY = event.clientY - rect.top + this.scrollTop;
    
    if (relativeX <= parseInt(paddingLeft) || relativeX >= this.scrollWidth - parseInt(paddingRight)) {
        return;
    }
    
    if (relativeY < this.scrollHeight - parseInt(paddingBottom) && event.target !== this) {
        return;
    }
    
    const lastElementId = window.wisk.editor.elementIds[window.wisk.editor.elementIds.length - 1];
    const lastElement = byQuery(`.${lastElementId}`);
    if (lastElement.tagName == "TEXT-ELEMENT") {
        lastElement.focusOnIndex(lastElement.getValue().textContent.length);
    } else {
        newElement(lastElementId);
    }
}

function createBlockHTML(elementId, elementTagName) {
    if (!elementTagName) {
        elementTagName = "text-element";
    }
    return `
        <div class="rndr">
            <button class="left-buttons add-button" onclick="newElementWithDialog('${elementId}')">
                <img src="/a7/iconoir/plus.svg">
            </button>
            <button class="left-buttons delete-button" onclick="deleteElement('${elementId}')">
                <img src="/a7/iconoir/trash.svg">
            </button>
            <${elementTagName} element-id="${elementId}" class="${elementId} editor-element"></${elementTagName}>
        </div>
    `;
}

window.changeElement = changeElement;
window.newElement = newElement;
window.wisk.editor.showSelector = showSelector;
