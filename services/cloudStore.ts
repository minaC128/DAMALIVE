
/**
 * Simulated Google Cloud Firestore Service
 * This service handles data persistence keyed by User UID.
 */

const SYNC_DELAY = 1200; // 模擬雲端往返延遲

export const cloudStore = {
  /**
   * 模擬將資料儲存至 Google 雲端後台
   */
  save: async (uid: string, key: string, data: any): Promise<void> => {
    return new Promise((resolve) => {
      // 觸發同步動效通常在 UI 層級處理，這裡僅處理邏輯
      setTimeout(() => {
        const storageKey = `google_cloud_data_${uid}`;
        const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        existingData[key] = data;
        localStorage.setItem(storageKey, JSON.stringify(existingData));
        console.log(`[CloudSync] Data for ${key} synced to Google Backend for UID: ${uid}`);
        resolve();
      }, SYNC_DELAY);
    });
  },

  /**
   * 模擬從 Google 雲端後台獲取資料
   */
  load: async (uid: string, key: string): Promise<any | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storageKey = `google_cloud_data_${uid}`;
        const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        resolve(existingData[key] || null);
      }, 500);
    });
  }
};
