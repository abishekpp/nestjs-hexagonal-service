import { VaultSecretKey } from './vault.constants';

export interface VaultKVData {
  [key: string]: string;
}

export interface VaultSecretResponse {
  data: {
    request_id: string;
    lease_id: string;
    renewable: boolean;
    lease_duration: number;
    data: VaultKVData;
    metadata: {
      created_time: string;
      custom_metadata: null | Record<string, unknown>;
      deletion_time: string;
      destroyed: boolean;
      version: number;
    };
  };
  wrap_info: null; // or a typed WrapInfo object if you use wrapping
  warnings: null; // or string[] if warnings can appear
  auth: null; // or a VaultAuth type if auth is returned
  mount_type: string;
}

export type VaultSecretsMap = Record<VaultSecretKey, string>;
