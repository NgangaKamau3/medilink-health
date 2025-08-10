import { getSyncQueue, removeSyncItem, clearSyncQueue } from './database';
import api from './api';

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Auto-sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncData();
      }
    }, 5 * 60 * 1000);
  }
  
  handleOnline() {
    this.isOnline = true;
    console.log('Connection restored - starting sync');
    this.syncData();
  }
  
  handleOffline() {
    this.isOnline = false;
    console.log('Connection lost - working offline');
  }
  
  async syncData() {
    if (this.syncInProgress || !this.isOnline) return;
    
    this.syncInProgress = true;
    
    try {
      const syncQueue = await getSyncQueue();
      console.log(`Syncing ${syncQueue.length} items`);
      
      for (const item of syncQueue) {
        try {
          await this.syncItem(item);
          await removeSyncItem(item.id);
        } catch (error) {
          console.error('Failed to sync item:', item, error);
        }
      }
      
      window.dispatchEvent(new CustomEvent('syncComplete', {
        detail: { success: true, itemsCount: syncQueue.length }
      }));
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }
  
  async syncItem(item) {
    const { table, action, data } = item;
    
    switch (table) {
      case 'patients':
        if (action === 'update') {
          await api.put(`/patients/${data.patient_id}`, data);
        }
        break;
      case 'encounters':
        if (action === 'create') {
          await api.post(`/patients/${data.patient_id}/encounters`, data);
        }
        break;
    }
  }
  
  getStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress
    };
  }
}

export const syncService = new SyncService();