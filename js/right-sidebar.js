function showRightSidebar(component, title) {
    byQuery('.right-sidebar-title').innerText = title;
    byQuery('.right-sidebar-body').innerHTML = `<${component}></${component}>`;
    byQuery('.right-sidebar').classList.remove('right-sidebar-hidden');
    if (byQuery(component).opened) byQuery(component).opened();
}

function hideRightSidebar() {
    byQuery('.right-sidebar').classList.add('right-sidebar-hidden');
}

function toggleRightSidebarNew(component, title) {
    const sidebar = byQuery('.right-sidebar');
    const titleElement = byQuery('.right-sidebar-title');
    const allComponents = byQuery('.right-sidebar-body').querySelectorAll('[data-plugin-component]');
    
    if (sidebar.classList.contains('right-sidebar-hidden')) {
        if (byQuery(component).opened) byQuery(component).opened();
        titleElement.innerText = title;
        allComponents.forEach(comp => {
            comp.style.display = comp.tagName.toLowerCase() === component.toLowerCase() ? '' : 'none';
        });
        sidebar.classList.remove('right-sidebar-hidden');
    } else {
        const visibleComponent = Array.from(allComponents).find(comp => comp.style.display !== 'none');
        if (visibleComponent && visibleComponent.tagName.toLowerCase() === component.toLowerCase()) {
            sidebar.classList.add('right-sidebar-hidden');
        } else {
            titleElement.innerText = title;
            allComponents.forEach(comp => {
                comp.style.display = comp.tagName.toLowerCase() === component.toLowerCase() ? '' : 'none';
            });
        }
    }
}

window.wisk.editor.showRightSidebar = showRightSidebar;
window.wisk.editor.hideRightSidebar = hideRightSidebar;
window.wisk.editor.toggleRightSidebar = toggleRightSidebarNew;
