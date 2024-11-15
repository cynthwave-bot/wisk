window.wisk = window.wisk || {};

window.wisk.db = (function() {
    const dbName = 'WiskDatabase';
    const storeName = 'WiskStore';
    const dbVersion = 1;
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
                db.createObjectStore(storeName);
            };
        });
    }

    function getItem(key) {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(key);

                request.onerror = (event) => reject("Error fetching data: " + event.target.error);
                request.onsuccess = (event) => resolve(event.target.result);
            }).catch(reject);
        });
    }

    function setItem(key, value) {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put(value, key);

                request.onerror = (event) => reject("Error storing data: " + event.target.error);
                request.onsuccess = (event) => resolve();
            }).catch(reject);
        });
    }

    function removeItem(key) {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(key);

                request.onerror = (event) => reject("Error removing data: " + event.target.error);
                request.onsuccess = (event) => resolve();
            }).catch(reject);
        });
    }

    function getAllKeys() {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAllKeys();

                request.onerror = (event) => reject("Error fetching keys: " + event.target.error);
                request.onsuccess = (event) => resolve(event.target.result);
            }).catch(reject);
        });
    }

    return {
        getItem,
        setItem,
        removeItem,
        getAllKeys
    };
})();
