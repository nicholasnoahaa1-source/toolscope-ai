// ============================================
// BACKEND SYNC ENGINE - PHASE 4
// ============================================
// Syncs IndexedDB analytics data to Next.js backend

class BackendSyncEngine {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl || '';
    this.isOnline = navigator.onLine;
    this.syncInterval = 30000; // 30 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000;

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  handleOnline() {
    this.isOnline = true;
    console.log('🟢 Backend sync: Online detected, syncing queued data...');
    this.syncPendingQueue();
  }

  handleOffline() {
    this.isOnline = false;
    console.log('🔴 Backend sync: Offline detected, queueing for later');
  }

  // ============================================
  // API CALLS
  // ============================================

  async postMetric(metric) {
    const url = `${this.baseUrl}/api/sacopex/metrics`;
    return this.makeRequest('POST', url, metric);
  }

  async getMetrics(contentId = null, limit = 100) {
    const params = new URLSearchParams();
    if (contentId) params.append('contentId', contentId);
    params.append('limit', limit);
    const url = `${this.baseUrl}/api/sacopex/metrics?${params}`;
    return this.makeRequest('GET', url);
  }

  async postContentGenerated(content) {
    const url = `${this.baseUrl}/api/sacopex/content/generated`;
    return this.makeRequest('POST', url, content);
  }

  async getContentGenerated(cascadeId = null) {
    const params = new URLSearchParams();
    if (cascadeId) params.append('cascadeId', cascadeId);
    const url = `${this.baseUrl}/api/sacopex/content/generated?${params}`;
    return this.makeRequest('GET', url);
  }

  async postContentPublished(content) {
    const url = `${this.baseUrl}/api/sacopex/content/published`;
    return this.makeRequest('POST', url, content);
  }

  async getContentPublished(contentId = null, platform = null) {
    const params = new URLSearchParams();
    if (contentId) params.append('contentId', contentId);
    if (platform) params.append('platform', platform);
    const url = `${this.baseUrl}/api/sacopex/content/published?${params}`;
    return this.makeRequest('GET', url);
  }

  async getAnalyticsSummary() {
    const url = `${this.baseUrl}/api/sacopex/analytics`;
    return this.makeRequest('GET', url);
  }

  async postSyncLog(status, batchSize = 0, error = null) {
    const url = `${this.baseUrl}/api/sacopex/sync`;
    return this.makeRequest('POST', url, { status, batchSize, error });
  }

  // ============================================
  // SYNC ORCHESTRATION
  // ============================================

  async syncAllData() {
    if (!this.isOnline) {
      console.log('⏳ Backend sync: Offline, skipping sync');
      return { skipped: true };
    }

    console.log('⏱️  Backend sync: Starting full sync...');
    try {
      const metrics = await this.getAllMetricsFromIndexedDB();
      const generated = await this.getAllGeneratedFromIndexedDB();
      const published = await this.getAllPublishedFromIndexedDB();

      let synced = 0;
      let failed = 0;

      // Sync metrics
      for (const metric of metrics) {
        try {
          await this.postMetric(metric);
          synced++;
        } catch (error) {
          console.error('❌ Failed to sync metric:', error);
          failed++;
        }
      }

      // Sync generated content
      for (const content of generated) {
        try {
          await this.postContentGenerated(content);
          synced++;
        } catch (error) {
          console.error('❌ Failed to sync generated content:', error);
          failed++;
        }
      }

      // Sync published content
      for (const content of published) {
        try {
          await this.postContentPublished(content);
          synced++;
        } catch (error) {
          console.error('❌ Failed to sync published content:', error);
          failed++;
        }
      }

      await this.postSyncLog('synced', synced, failed > 0 ? `${failed} items failed` : null);

      console.log(`✅ Backend sync: ${synced} items synced, ${failed} failed`);
      return { synced, failed };
    } catch (error) {
      console.error('❌ Sync failed:', error);
      await this.postSyncLog('failed', 0, error.message);
      throw error;
    }
  }

  async syncNewMetrics(limit = 100) {
    if (!this.isOnline) return { skipped: true };

    try {
      const metrics = await this.getRecentMetricsFromIndexedDB(limit);
      let synced = 0;

      for (const metric of metrics) {
        try {
          await this.postMetric(metric);
          synced++;
        } catch (error) {
          console.error('❌ Failed to sync metric:', error);
        }
      }

      return { synced };
    } catch (error) {
      console.error('❌ Failed to sync new metrics:', error);
      throw error;
    }
  }

  // ============================================
  // INDEXEDDB HELPERS
  // ============================================

  async getAllMetricsFromIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('sacopex-analytics');

      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('metrics-collected', 'readonly');
        const store = tx.objectStore('metrics-collected');
        const getRequest = store.getAll();

        getRequest.onsuccess = () => {
          resolve(getRequest.result);
        };
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getRecentMetricsFromIndexedDB(limit) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('sacopex-analytics');

      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('metrics-collected', 'readonly');
        const store = tx.objectStore('metrics-collected');
        const getRequest = store.getAll();

        getRequest.onsuccess = () => {
          const all = getRequest.result;
          resolve(all.slice(-limit));
        };
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAllGeneratedFromIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('sacopex-analytics');

      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('content-generated', 'readonly');
        const store = tx.objectStore('content-generated');
        const getRequest = store.getAll();

        getRequest.onsuccess = () => {
          resolve(getRequest.result);
        };
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAllPublishedFromIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('sacopex-analytics');

      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('content-published', 'readonly');
        const store = tx.objectStore('content-published');
        const getRequest = store.getAll();

        getRequest.onsuccess = () => {
          resolve(getRequest.result);
        };
      };

      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // OFFLINE QUEUE MANAGEMENT
  // ============================================

  async syncPendingQueue() {
    try {
      const queued = await this.getPendingQueue();
      if (queued.length === 0) return;

      console.log(`📤 Syncing ${queued.length} queued items...`);

      for (const item of queued) {
        try {
          const result = await this.makeRequest(item.method, item.url, item.data);
          await this.removeFromQueue(item.id);
          console.log(`✅ Synced queued item: ${item.id}`);
        } catch (error) {
          console.error(`❌ Failed to sync queued item: ${item.id}`, error);
        }
      }
    } catch (error) {
      console.error('❌ Failed to process pending queue:', error);
    }
  }

  async getPendingQueue() {
    return new Promise((resolve, reject) => {
      const tx = indexedDB.open('sacopex-analytics');

      tx.onsuccess = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('sync-queue')) {
          resolve([]);
          return;
        }

        const transaction = db.transaction('sync-queue', 'readonly');
        const store = transaction.objectStore('sync-queue');
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result);
        };
      };

      tx.onerror = () => reject(tx.error);
    });
  }

  async addToQueue(method, url, data) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('sacopex-analytics');

      request.onsuccess = (event) => {
        const db = event.target.result;

        // Create store if it doesn't exist
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.close();
          resolve(null);
          return;
        }

        const tx = db.transaction('sync-queue', 'readwrite');
        const store = tx.objectStore('sync-queue');
        const item = {
          id: `${Date.now()}-${Math.random()}`,
          method,
          url,
          data,
          createdAt: new Date().toISOString(),
        };

        const addRequest = store.add(item);
        addRequest.onsuccess = () => resolve(item.id);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async removeFromQueue(id) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('sacopex-analytics');

      request.onsuccess = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('sync-queue')) {
          resolve(null);
          return;
        }

        const tx = db.transaction('sync-queue', 'readwrite');
        const store = tx.objectStore('sync-queue');
        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = () => resolve(null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // HTTP REQUEST HELPER
  // ============================================

  async makeRequest(method, url, data = null, retries = 0) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (retries < this.maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * Math.pow(2, retries))
        );
        return this.makeRequest(method, url, data, retries + 1);
      }

      if (!this.isOnline) {
        // Queue for later if offline
        await this.addToQueue(method, url, data);
        throw new Error('Offline: queued for sync');
      }

      throw error;
    }
  }

  // ============================================
  // BACKGROUND SYNC
  // ============================================

  startPeriodicSync() {
    this.syncIntervalId = setInterval(() => {
      if (this.isOnline) {
        this.syncNewMetrics(50).catch((error) =>
          console.error('Periodic sync error:', error)
        );
      }
    }, this.syncInterval);

    console.log('🔄 Backend sync: Started periodic sync every 30s');
  }

  stopPeriodicSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      console.log('⏹️  Backend sync: Stopped periodic sync');
    }
  }
}
