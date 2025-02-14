function showMenu() {
    showLeftSidebar('left-menu', 'Menu');
}

function hideMenu() {
    hideLeftSidebar();
}

function toggleMenu() {
    wisk.editor.toggleLeftSidebar('left-menu', 'Menu');
}

function getURLParam(str) {
    // if url contains wisk.site then get the id from path url which is everything after the wisk.site/
    // TODO also this sucks make it better
    if (window.location.href.includes('wisk.site')) {
        var split = window.location.href.split('wisk.site/');
        var id = split[1];
        return id;
    }

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(str);
}

function setURLParam(id) {
    // get template param from url
    var template = getURLParam('template');
    window.history.replaceState({}, '', window.location.pathname + '?id=' + id);

    if (template != null && template != '') {
        wisk.editor.template = template;
    }
}

async function initScript() {
    var u = await document.querySelector('auth-component').getUserInfo();
    if (getURLParam('id') == null || getURLParam('id') == '') {
        const id = Date.now() + Math.random().toString(36).substring(2, 22) + 'uwu';
        const id2 = Date.now() + Math.random().toString(36).substring(2, 22) + 'owo';

        console.log('No ID found in URL, generating new ID:', id, id2, getURLParam('id'));

        // TODO https://stackoverflow.com/a/52171480
        console.log(u);

        wisk.utils.showLoading('Creating new document...');

        var fetchUrl = wisk.editor.backendUrl + '/v1/new';
        var fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + u.token,
            },
            body: JSON.stringify({}),
        };

        var response = await fetch(fetchUrl, fetchOptions);
        var data = await response.json();

        setURLParam(data.id);
    }

    wisk.editor.pageId = getURLParam('id');

    document.addEventListener('mousemove', function () {
        document.getElementById('nav').classList.remove('nav-disappear');
    });

    live();
}

var wasSignedOut = false;

var firstTime = true;
window.onSignIn = function () {
    if (firstTime) {
        firstTime = false;
        initScript();
    }
    if (wasSignedOut) {
        window.location.href = '/';
    }
};

window.onSignOut = function () {
    wasSignedOut = true;
    // alert('You need to sign in to use this service. (for now, we are working on making it work without sign in)');
    // window.location.href = '/';
    window.showToast('You need to sign in', 5000);
    document.querySelector('auth-component').show();
};

if (window.location.href.includes('.wisk.site/')) {
    live();
    document.querySelector('#menu-1').style.display = 'none';
}

const closeApp = () => fetch('/app-nav/close');
const minimizeApp = () => fetch('/app-nav/minimize');
const maximizeApp = () => fetch('/app-nav/maximize');

// if url contains 55557 then .nav-app display flex
// for desktop app
if (window.location.href.includes('55557')) {
    document.querySelector('.nav-app').style.display = 'flex';
    document.querySelector('body').style.borderRadius = '20px';
    document.querySelector('html').style.borderRadius = '20px';
    document.querySelector('html').style.overflow = 'hidden';
    document.querySelector('body').style.overflow = 'hidden';
    document.querySelector('html').style.backgroundColor = 'transparent';
}
