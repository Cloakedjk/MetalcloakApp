export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function stringOf(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

export function numberOf(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

export function describePayload(payload: unknown): string {
  if (payload == null) return String(payload);
  if (Array.isArray(payload)) return `array length ${payload.length}`;
  if (typeof payload === 'object') {
    const keys = Object.keys(payload).slice(0, 12);
    return `object keys: ${keys.join(', ') || '(none)'}`;
  }
  return typeof payload;
}

export function dateOnly(value: unknown): string {
  if (typeof value !== 'string' || value.length < 10) return '';
  return value.slice(0, 10);
}
