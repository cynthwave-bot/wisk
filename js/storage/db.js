// db.js
window.wisk = window.wisk || {};
window.wisk.db = (function() {
    const dbName = 'WiskDatabase';
    const dataStoreName = 'WiskStore';
    const assetStoreName = 'WiskAssetStore';
    const dbVersion = 2; // Increased version number for new store
    let db;

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, dbVersion);
            request.onerror = (event) => reject("IndexedDB error: " + event.target.error);
            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };
            request.onupgradeneeded = (event) => {
                db = event.target.result;
                // Create or ensure both stores exist
                if (!db.objectStoreNames.contains(dataStoreName)) {
                    db.createObjectStore(dataStoreName);
                }
                if (!db.objectStoreNames.contains(assetStoreName)) {
                    db.createObjectStore(assetStoreName);
                }
            };
        });
    }

    // Original data store operations
    function getItem(key) {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction([dataStoreName], 'readonly');
                const store = transaction.objectStore(dataStoreName);
                const request = store.get(key);
                request.onerror = (event) => reject("Error fetching data: " + event.target.error);
                request.onsuccess = (event) => resolve(event.target.result);
            }).catch(reject);
        });
    }

    function setItem(key, value) {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction([dataStoreName], 'readwrite');
                const store = transaction.objectStore(dataStoreName);
                const request = store.put(value, key);
                request.onerror = (event) => reject("Error storing data: " + event.target.error);
                request.onsuccess = (event) => resolve();
            }).catch(reject);
        });
    }

    function removeItem(key) {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction([dataStoreName], 'readwrite');
                const store = transaction.objectStore(dataStoreName);
                const request = store.delete(key);
                request.onerror = (event) => reject("Error removing data: " + event.target.error);
                request.onsuccess = (event) => resolve();
            }).catch(reject);
        });
    }

    function getAllKeys() {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction([dataStoreName], 'readonly');
                const store = transaction.objectStore(dataStoreName);
                const request = store.getAllKeys();
                request.onerror = (event) => reject("Error fetching keys: " + event.target.error);
                request.onsuccess = (event) => resolve(event.target.result);
            }).catch(reject);
        });
    }

    // New asset store operations
    async function saveAsset(url, blob) {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction([assetStoreName], 'readwrite');
                const store = transaction.objectStore(assetStoreName);
                const request = store.put(blob, url);
                request.onerror = (event) => reject("Error storing asset: " + event.target.error);
                request.onsuccess = (event) => resolve();
            }).catch(reject);
        });
    }

    async function getAsset(url) {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction([assetStoreName], 'readonly');
                const store = transaction.objectStore(assetStoreName);
                const request = store.get(url);
                request.onerror = (event) => reject("Error fetching asset: " + event.target.error);
                request.onsuccess = (event) => resolve(event.target.result);
            }).catch(reject);
        });
    }

    async function removeAsset(url) {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction([assetStoreName], 'readwrite');
                const store = transaction.objectStore(assetStoreName);
                const request = store.delete(url);
                request.onerror = (event) => reject("Error removing asset: " + event.target.error);
                request.onsuccess = (event) => resolve();
            }).catch(reject);
        });
    }

    async function getAllAssetUrls() {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction([assetStoreName], 'readonly');
                const store = transaction.objectStore(assetStoreName);
                const request = store.getAllKeys();
                request.onerror = (event) => reject("Error fetching asset URLs: " + event.target.error);
                request.onsuccess = (event) => resolve(event.target.result);
            }).catch(reject);
        });
    }

    return {
        // Original data store methods
        getItem,
        setItem,
        removeItem,
        getAllKeys,
        // New asset store methods
        saveAsset,
        getAsset,
        removeAsset,
        getAllAssetUrls
    };
})();
