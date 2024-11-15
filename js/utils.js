window.wisk.utils.showToast = function(message, duration) {
    if (!duration) duration = 3000;

    console.log("Showing toast:", message, "for", duration, "ms");

    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.parentNode.removeChild(toast);
        });
    }, duration);
}

window.wisk.utils.showInfo = function(message) {
    // TODO move to a dialog
    console.log("Showing info:", message);
    window.wisk.utils.showToast(message, 3000);
}

window.wisk.utils.showLoading = function(message) {
    console.log("Showing loading:", message);
    let loadingDiv = document.querySelector('.loading-div');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-div';
        document.body.appendChild(loadingDiv);
        
        let loadingTextTop = document.createElement('p');
        loadingTextTop.className = 'loading-text-top';
        loadingTextTop.textContent = 'Loading';
        loadingDiv.appendChild(loadingTextTop);
        
        let loadingTextBottom = document.createElement('p');
        loadingTextBottom.className = 'loading-text-bottom';
        loadingDiv.appendChild(loadingTextBottom);
    }

    let loadingTextBottom = document.querySelector('.loading-text-bottom');
    loadingTextBottom.textContent = message;
    loadingDiv.style.display = 'flex';
}

window.wisk.utils.hideLoading = function() {
    console.log("Hiding loading");
    let loadingDiv = document.querySelector('.loading-div');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}
