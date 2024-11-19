// Initialize width management
const DEFAULT_LEFT_WIDTH = 450;
const MIN_LEFT_WIDTH = 200;
const MAX_LEFT_WIDTH = 1000;

let leftSidebarWidth = parseInt(localStorage.getItem('leftSidebarWidth')) || DEFAULT_LEFT_WIDTH;

// Initialize resize functionality
function initializeLeftSidebarResize() {
    const sidebar = byQuery('.left-sidebar');
    if (!sidebar) return;
    
    sidebar.style.position = 'relative';
    
    // Create resize handle if it doesn't exist
    if (!sidebar.querySelector('.resize-handle')) {
        const handle = document.createElement('div');
        handle.className = 'resize-handle resize-handle-right';
        
        let startX;
        let startWidth;
        
        handle.addEventListener('mousedown', initResize);
        
        function initResize(e) {
            startX = e.clientX;
            startWidth = parseInt(getComputedStyle(sidebar).width, 10);
            
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
            document.body.classList.add('sidebar-resizing');
        }
        
        function resize(e) {
            const diff = e.clientX - startX;
            let newWidth = Math.min(Math.max(startWidth + diff, MIN_LEFT_WIDTH), MAX_LEFT_WIDTH);
            sidebar.style.width = `${newWidth}px`;
            leftSidebarWidth = newWidth;
            localStorage.setItem('leftSidebarWidth', newWidth);
        }
        
        function stopResize() {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
            document.body.classList.remove('sidebar-resizing');
        }
        
        sidebar.appendChild(handle);
    }
}

// Modified sidebar management functions
function showLeftSidebar(component, title) {
    const sidebar = byQuery('.left-sidebar');
    byQuery('.left-sidebar-title').innerText = title;
    byQuery('.left-sidebar-body').innerHTML = `<${component}></${component}>`;
    sidebar.classList.remove('left-sidebar-hidden');
    if (byQuery(component).opened) byQuery(component).opened();
    
    // Apply saved width
    if (window.innerWidth >= 900) {
        sidebar.style.width = `${leftSidebarWidth}px`;
    }
    
    // Initialize resize handle
    initializeLeftSidebarResize();
    window.dispatchEvent(new Event('resize'));
}

function hideLeftSidebar() {
    byQuery('.left-sidebar').classList.add('left-sidebar-hidden');
    window.dispatchEvent(new Event('resize'));
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
        
        // Apply saved width
        if (window.innerWidth >= 900) {
            sidebar.style.width = `${leftSidebarWidth}px`;
        }
        
        // Initialize resize handle
        initializeLeftSidebarResize();
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
    window.dispatchEvent(new Event('resize'));
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = byQuery('.left-sidebar');
    if (sidebar && !sidebar.classList.contains('left-sidebar-hidden')) {
        initializeLeftSidebarResize();
        if (window.innerWidth >= 900) {
            sidebar.style.width = `${leftSidebarWidth}px`;
        }
    }
});

window.wisk.editor.showLeftSidebar = showLeftSidebar;
window.wisk.editor.hideLeftSidebar = hideLeftSidebar;
window.wisk.editor.toggleLeftSidebar = toggleLeftSidebarNew;
