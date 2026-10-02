export interface BackupData {
  version: string;
  exportedAt: string;
  user: string;
  data: {
    strategies: any[];
    setups: any[];
    paperPositions: any[];
    journalEntries: any[];
    riskSettings: any;
    privacySettings: {
      askBeforeSavingScreenshots: boolean;
      askBeforeSavingSensitiveNotes: boolean;
    };
  };
  checksum: string;
}

const STORAGE_KEYS = {
  STRATEGIES: 'trademitra_strategies',
  SETUPS: 'trademitra_setups',
  POSITIONS: 'trademitra_positions',
  JOURNAL: 'trademitra_journal',
  RISK: 'trademitra_risk',
  PRIVACY: 'trademitra_privacy',
  LANGUAGE: 'trademitra_lang',
};

export const StorageService = {
  getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Error loading ${key} from storage:`, e);
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  },

  getStorageUsageBytes(): number {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += (localStorage[x].length + x.length) * 2;
      }
    }
    return total;
  },

  exportBackup(payload: any): string {
    const backup: BackupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: 'Aakash',
      data: payload,
      checksum: btoa(`trademitra-${Date.now()}-${payload.journalEntries?.length || 0}`),
    };
    return JSON.stringify(backup, null, 2);
  },

  validateAndRestoreBackup(jsonString: string): { success: boolean; data?: any; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.checksum || !parsed.data) {
        return { success: false, error: 'Corrupt or unrecognized backup format.' };
      }
      return { success: true, data: parsed.data };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Invalid JSON file.' };
    }
  },

  KEYS: STORAGE_KEYS,
};
