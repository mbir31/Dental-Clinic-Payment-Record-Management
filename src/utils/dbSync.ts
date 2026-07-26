// Helper to manage persistent FileSystemFileHandle storage in IndexedDB
// This allows Chrome/Edge users to select a physical .json file on their local PC,
// and have this application automatically sync and write to it in real-time.

const DB_NAME = 'DentalSyncDB';
const STORE_NAME = 'handles';
const KEY_NAME = 'sync_file_handle';

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

export function saveHandleToIndexedDB(handle: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const putReq = store.put(handle, KEY_NAME);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export function getHandleFromIndexedDB(): Promise<any | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getReq = store.get(KEY_NAME);
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => reject(getReq.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export function clearHandleFromIndexedDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const delReq = store.delete(KEY_NAME);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function verifyPermission(fileHandle: any, withWrite = true): Promise<boolean> {
  const options: any = {};
  if (withWrite) {
    options.mode = 'readwrite';
  }
  
  // Check if we already have permission
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  
  // Request permission (must be triggered by a user gesture)
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  
  return false;
}

export async function writeDatabaseToFile(
  handle: any,
  patients: any[],
  settings: any
): Promise<void> {
  const writable = await handle.createWritable();
  const backupData = {
    patients,
    settings,
    lastSyncedAt: new Date().toISOString(),
    backupTime: Date.now()
  };
  await writable.write(JSON.stringify(backupData, null, 2));
  await writable.close();
}
