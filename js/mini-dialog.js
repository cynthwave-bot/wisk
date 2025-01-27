function showMiniDialog(component, title) {
    byQuery('.mini-dialog-title').innerText = title;
    byQuery('.mini-dialog-body').innerHTML = `<${component}></${component}>`;
    byQuery('.mini-dialog').classList.remove('hidden');
    if (byQuery(component).opened) byQuery(component).opened();
}

function hideMiniDialog() {
    byQuery('.mini-dialog').classList.add('hidden');
}

function toggleMiniDialogNew(component, title) {
    const dialog = byQuery('.mini-dialog');
    const titleElement = byQuery('.mini-dialog-title');
    const allComponents = byQuery('.mini-dialog-body').querySelectorAll('[data-plugin-component]');

    if (dialog.classList.contains('hidden')) {
        if (byQuery(component).opened) byQuery(component).opened();
        // Show dialog
        titleElement.innerText = title;
        allComponents.forEach(comp => {
            comp.style.display = comp.tagName.toLowerCase() === component.toLowerCase() ? 'block' : 'none';
        });
        dialog.classList.remove('hidden');
    } else {
        // If same component is clicked, hide dialog
        const visibleComponent = Array.from(allComponents).find(comp => comp.style.display !== 'none');
        if (visibleComponent && visibleComponent.tagName.toLowerCase() === component.toLowerCase()) {
            dialog.classList.add('hidden');
        } else {
            // Switch to new component
            titleElement.innerText = title;
            allComponents.forEach(comp => {
                comp.style.display = comp.tagName.toLowerCase() === component.toLowerCase() ? 'block' : 'none';
            });
        }
    }
}

wisk.editor.showMiniDialog = showMiniDialog;
wisk.editor.hideMiniDialog = hideMiniDialog;
wisk.editor.toggleMiniDialog = toggleMiniDialogNew;
