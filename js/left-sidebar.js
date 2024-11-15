function showLeftSidebar(component, title) {
    byQuery('.left-sidebar-title').innerText = title;
    byQuery('.left-sidebar-body').innerHTML = `<${component}></${component}>`;
    byQuery('.left-sidebar').classList.remove('left-sidebar-hidden');
    if (byQuery(component).opened) byQuery(component).opened();
}

function hideLeftSidebar() {
    byQuery('.left-sidebar').classList.add('left-sidebar-hidden');
}

function toggleLeftSidebarNew(component, title) {
    const sidebar = byQuery('.left-sidebar');
    const titleElement = byQuery('.left-sidebar-title');
    const allComponents = byQuery('.left-sidebar-body').querySelectorAll('[data-plugin-component]');
    
    if (sidebar.classList.contains('left-sidebar-hidden')) {
        if (byQuery(component).opened) byQuery(component).opened();

        titleElement.innerText = title;
        allComponents.forEach(comp => {
            comp.style.display = comp.tagName.toLowerCase() === component.toLowerCase() ? 'block' : 'none';
        });
        sidebar.classList.remove('left-sidebar-hidden');
    } else {
        const visibleComponent = Array.from(allComponents).find(comp => comp.style.display !== 'none');
        if (visibleComponent && visibleComponent.tagName.toLowerCase() === component.toLowerCase()) {
            sidebar.classList.add('left-sidebar-hidden');
        } else {
            titleElement.innerText = title;
            allComponents.forEach(comp => {
                comp.style.display = comp.tagName.toLowerCase() === component.toLowerCase() ? 'block' : 'none';
            });
        }
    }
}

window.wisk.editor.showLeftSidebar = showLeftSidebar;
window.wisk.editor.hideLeftSidebar = hideLeftSidebar;
window.wisk.editor.toggleLeftSidebar = toggleLeftSidebarNew;
