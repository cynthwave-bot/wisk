// sync.js
let socket;
let firstMsg = true;

async function sync() {
    wisk.utils.showLoading('Syncing with server...');
    console.log('PAGE', wisk.editor.pageId);

    var pages = await wisk.db.getAllKeys();
    // upload all offline pages and update their IDs
    var offlinePages = [];
    for (var i = 0; i < pages.length; i++) {
        if (pages[i].startsWith('of-')) {
            var offlinePage = await wisk.db.getItem(pages[i]);
            offlinePages.push(offlinePage);
        }
    }

    console.log('Offline pages:', offlinePages);
}

function initializeWebSocket() {
    return new Promise((resolve, reject) => {
        socket = new WebSocket('wss://' + wisk.editor.backendUrl.replace('https://', '').replace('http://', '') + '/v1/live');

        socket.addEventListener('open', event => {
            console.log('Connected to WebSocket server');
            resolve();
        });

        socket.addEventListener('message', event => {
            handleIncomingMessage(event.data);
        });

        socket.addEventListener('error', event => {
            alert('Connection with server failed. Click OK to reload the page.');
            location.reload();
        });

        socket.addEventListener('close', event => {
            alert('Connection with server closed. Click OK to reload the page.');
            location.reload();
        });
    });
}

function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        console.log('Connection is not open. ReadyState:', socket ? socket.readyState : 'socket not initialized');
    }
}

function startMessageLoop(interval = 5000) {
    return setInterval(() => {
        sendMessage('hello');
    }, interval);
}

function stopMessageLoop(intervalId) {
    clearInterval(intervalId);
}

async function sendAuth() {
    var user = await document.querySelector('auth-component').getUserInfo();
    sendMessage(
        JSON.stringify({
            id: wisk.editor.pageId,
            token: user.token,
        })
    );
}

async function live() {
    console.log('PAGE LIVE', wisk.editor.pageId);

    if (wisk.editor.readonly) {
        // TODO
        // FIXX THIS THIS IS REALLY BAD
        // the way im adding wisk.site
        // but i have to ship early
        var fetchUrl = wisk.editor.backendUrl + '/v1/new?doc=' + getURLParam('uwu');
        var fetchOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        var response = await fetch(fetchUrl, fetchOptions);

        if (response.status !== 200) {
            window.location.href = '/404.html';
            return;
        }

        var data = await response.json();
        initEditor(data);
        return;
    }

    try {
        await initializeWebSocket();
        await sendAuth();
    } catch (error) {
        console.error('Error:', error);
    }
}

function saveUpdates(changes, allElements, newDeletedElements) {
    // save to db -- for now
    // wisk.db.setItem(wisk.editor.pageId, {
    //     name: wisk.editor.elements[0].value.textContent,
    //     lastUpdated: Math.floor(Date.now() / 1000).toString(),
    //     elements: wisk.editor.elements,
    //     deletedElements: deletedElements,
    // });

    // send to server
    sendMessage(
        JSON.stringify({
            changes: changes,
            allElements: allElements,
            newDeletedElements: newDeletedElements,
        })
    );
}

function handleIncomingMessage(message) {
    var m = JSON.parse(message);
    console.log('Received:', m);

    if (firstMsg) {
        initEditor(m);
        firstMsg = false;
    }

    if (!('uuid' in m)) {
        wisk.editor.handleChanges(m);
    }
}

window.addEventListener('online', () => {
    console.log('User is online');
});

window.addEventListener('offline', () => {
    console.log('User is offline');
});
