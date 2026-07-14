import type { CollegeIdentity } from '../models/collegeIdentity.js';
import { CollegeStatus } from '../models/collegeStatus.js';
import type { CollegeType } from '../../domain/types.js';

/**
 * Deserializes college identities from a JSON string and validates the shape.
 */
export class RegistryImporter {
  import(json: string): CollegeIdentity[] {
    const parsed = JSON.parse(json) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error('Imported registry must be an array of college identities');
    }

    return parsed.map((item) => this.validate(item));
  }

  private validate(item: unknown): CollegeIdentity {
    if (!item || typeof item !== 'object') {
      throw new Error('College identity must be an object');
    }

    const record = item as Record<string, unknown>;

    return {
      id: this.requireString(record, 'id'),
      officialName: this.requireString(record, 'officialName'),
      shortName: this.requireString(record, 'shortName'),
      aliases: this.stringArray(record, 'aliases'),
      knownDomains: this.stringArray(record, 'knownDomains'),
      officialWebsite: this.requireString(record, 'officialWebsite'),
      city: this.requireString(record, 'city'),
      district: this.optionalString(record, 'district') ?? '',
      state: this.requireString(record, 'state'),
      university: this.optionalString(record, 'university') ?? '',
      collegeType: this.requireCollegeType(record, 'collegeType'),
      autonomous: this.requireBoolean(record, 'autonomous'),
      minorityStatus: this.optionalString(record, 'minorityStatus'),
      knownKeywords: this.stringArray(record, 'knownKeywords'),
      status: this.requireStatus(record, 'status'),
      createdAt: this.parseDate(record, 'createdAt'),
      updatedAt: this.parseDate(record, 'updatedAt'),
    };
  }

  private requireString(record: Record<string, unknown>, key: string): string {
    const value = record[key];
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(`Missing or invalid required field: ${key}`);
    }
    return value;
  }

  private optionalString(record: Record<string, unknown>, key: string): string | undefined {
    const value = record[key];
    if (value === undefined) {
      return undefined;
    }
    if (typeof value !== 'string') {
      throw new Error(`Field ${key} must be a string`);
    }
    return value;
  }

  private stringArray(record: Record<string, unknown>, key: string): readonly string[] {
    const value = record[key];
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
      throw new Error(`Field ${key} must be an array of strings`);
    }
    return value;
  }

  private requireBoolean(record: Record<string, unknown>, key: string): boolean {
    const value = record[key];
    if (typeof value !== 'boolean') {
      throw new Error(`Field ${key} must be a boolean`);
    }
    return value;
  }

  private requireCollegeType(record: Record<string, unknown>, key: string): CollegeType {
    const value = this.requireString(record, key);
    if (value !== 'government' && value !== 'private' && value !== 'aided') {
      throw new Error(`Field ${key} must be one of: government, private, aided`);
    }
    return value;
  }

  private requireStatus(record: Record<string, unknown>, key: string): CollegeStatus {
    const value = this.requireString(record, key);
    if (!Object.values(CollegeStatus).includes(value as CollegeStatus)) {
      throw new Error(`Field ${key} must be a valid CollegeStatus value`);
    }
    return value as CollegeStatus;
  }

  private parseDate(record: Record<string, unknown>, key: string): Date {
    const value = record[key];
    if (value instanceof Date) {
      return value;
    }
    if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
      throw new Error(`Field ${key} must be a valid date`);
    }
    return new Date(value);
  }
}
