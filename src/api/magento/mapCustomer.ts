import type { Customer } from '../../domain';
import { StoreError } from '../errors';
import { asRecord, dateOnly, stringOf } from '../record';

export function mapCustomer(payload: unknown): Customer {
  const record = asRecord(payload);
  if (!record) throw new StoreError('The store returned an unreadable customer profile.');
  const id = record.id ?? record.entity_id;
  const email = stringOf(record.email);
  if ((typeof id !== 'number' && typeof id !== 'string') || !email) {
    throw new StoreError('The store customer profile is missing an id or email.');
  }
  return {
    id: String(id),
    email,
    firstName: stringOf(record.firstname ?? record.firstName) ?? '',
    lastName: stringOf(record.lastname ?? record.lastName) ?? '',
    createdAt: dateOnly(record.created_at ?? record.createdAt),
  };
}
