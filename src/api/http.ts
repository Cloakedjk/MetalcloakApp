import type { AppConfig } from '../config';
import { StoreError } from './errors';
import { asRecord, stringOf } from './record';

export interface StoreHttp {
  get(path: string, token: string): Promise<unknown>;
  post(path: string, body: unknown, token?: string): Promise<unknown>;
}

export function createFetchHttp(config: AppConfig, fetchImpl: typeof fetch = fetch): StoreHttp {
  async function request(
    path: string,
    method: string,
    token: string | undefined,
    body?: unknown,
  ): Promise<unknown> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    if (config.magentoStoreCode) headers.Store = config.magentoStoreCode;

    const response = await fetchImpl(`${config.magentoBaseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    const payload = parseBody(text);
    if (!response.ok) {
      throw new StoreError(magentoErrorMessage(payload, text, response.status));
    }
    return payload;
  }

  return {
    get: (path, token) => request(path, 'GET', token),
    post: (path, body, token) => request(path, 'POST', token, body),
  };
}

function parseBody(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function magentoErrorMessage(payload: unknown, raw: string, status: number): string {
  const record = asRecord(payload);
  const message = stringOf(record?.message);
  if (message) return message;
  if (Array.isArray(record?.errors)) {
    for (const entry of record.errors) {
      const text = stringOf(asRecord(entry)?.message);
      if (text) return text;
    }
  }
  if (status === 401) return 'The store rejected this sign-in.';
  if (raw.trim()) return raw.trim().slice(0, 280);
  return `The store returned HTTP ${status}.`;
}
