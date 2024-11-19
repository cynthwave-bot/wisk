// Initialize width management
const DEFAULT_RIGHT_WIDTH = 450;
const MIN_RIGHT_WIDTH = 200;
const MAX_RIGHT_WIDTH = 1000;

let rightSidebarWidth = parseInt(localStorage.getItem('rightSidebarWidth')) || DEFAULT_RIGHT_WIDTH;

// Initialize resize functionality
function initializeRightSidebarResize() {
    const sidebar = byQuery('.right-sidebar');
    if (!sidebar) return;
    
    sidebar.style.position = 'relative';
    
    // Create resize handle if it doesn't exist
    if (!sidebar.querySelector('.resize-handle')) {
        const handle = document.createElement('div');
        handle.className = 'resize-handle resize-handle-left';
        
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
            const diff = startX - e.clientX;
            let newWidth = Math.min(Math.max(startWidth + diff, MIN_RIGHT_WIDTH), MAX_RIGHT_WIDTH);
            sidebar.style.width = `${newWidth}px`;
            rightSidebarWidth = newWidth;
            localStorage.setItem('rightSidebarWidth', newWidth);
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
function showRightSidebar(component, title) {
    const sidebar = byQuery('.right-sidebar');
    byQuery('.right-sidebar-title').innerText = title;
    byQuery('.right-sidebar-body').innerHTML = `<${component}></${component}>`;
    sidebar.classList.remove('right-sidebar-hidden');
    if (byQuery(component).opened) byQuery(component).opened();
    
    // Apply saved width
    if (window.innerWidth >= 900) {
        sidebar.style.width = `${rightSidebarWidth}px`;
    }
    
    // Initialize resize handle
    initializeRightSidebarResize();
    window.dispatchEvent(new Event('resize'));
}

function hideRightSidebar() {
    byQuery('.right-sidebar').classList.add('right-sidebar-hidden');
    window.dispatchEvent(new Event('resize'));
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
        
        // Apply saved width
        if (window.innerWidth >= 900) {
            sidebar.style.width = `${rightSidebarWidth}px`;
        }
        
        // Initialize resize handle
        initializeRightSidebarResize();
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
    window.dispatchEvent(new Event('resize'));
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = byQuery('.right-sidebar');
    if (sidebar && !sidebar.classList.contains('right-sidebar-hidden')) {
        initializeRightSidebarResize();
        if (window.innerWidth >= 900) {
            sidebar.style.width = `${rightSidebarWidth}px`;
        }
    }
});

window.wisk.editor.showRightSidebar = showRightSidebar;
window.wisk.editor.hideRightSidebar = hideRightSidebar;
window.wisk.editor.toggleRightSidebar = toggleRightSidebarNew;
