import { enforceImmutableRiskLimits } from './riskEngine';
import { createEncryptedBackup, decryptAndRestoreBackup, DEFAULT_VAULT_PASSPHRASE } from './cryptoBackup';

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
      if (!data) return fallback;
      const parsed = JSON.parse(data);

      // CRITICAL: Always enforce code-level immutable boundaries if loading risk settings
      if (key === STORAGE_KEYS.RISK) {
        return enforceImmutableRiskLimits(parsed) as unknown as T;
      }

      return parsed;
    } catch (e) {
      console.error(`Error loading ${key} from storage:`, e);
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): void {
    try {
      let toStore = value;
      // CRITICAL: Enforce immutable boundary before persisting
      if (key === STORAGE_KEYS.RISK) {
        toStore = enforceImmutableRiskLimits(value) as unknown as T;
      }
      localStorage.setItem(key, JSON.stringify(toStore));
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

  /**
   * Generates a genuinely AES-256-GCM encrypted backup with PBKDF2 key derivation and SHA-256 integrity hash
   */
  async exportEncryptedBackup(payload: any, passphrase: string = DEFAULT_VAULT_PASSPHRASE): Promise<string> {
    return await createEncryptedBackup(payload, passphrase);
  },

  /**
   * Decrypts AES-256-GCM encrypted backup or verifies SHA-256 signed backup, enforcing immutable limits
   */
  async restoreEncryptedBackup(
    fileContent: string,
    passphrase: string = DEFAULT_VAULT_PASSPHRASE
  ): Promise<{ success: boolean; data?: any; error?: string; isEncrypted?: boolean }> {
    return await decryptAndRestoreBackup(fileContent, passphrase);
  },

  KEYS: STORAGE_KEYS,
};
