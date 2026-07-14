import { describe, it, expect } from 'vitest';
import { CollegeRegistryService } from './collegeRegistryService.js';
import { RegistryExporter } from './registryExporter.js';
import { RegistryImporter } from './registryImporter.js';
import { collegeSeedData } from '../seed/collegeSeedData.js';

describe('RegistryExporter and RegistryImporter', () => {
  it('exports and re-imports the registry preserving identities', () => {
    const registry = new CollegeRegistryService();
    for (const college of collegeSeedData) {
      registry.register(college);
    }

    const exporter = new RegistryExporter();
    const importer = new RegistryImporter();

    const json = exporter.export(registry);
    const imported = importer.import(json);

    expect(imported).toHaveLength(collegeSeedData.length);
    expect(imported.map((c) => c.id).sort()).toEqual(collegeSeedData.map((c) => c.id).sort());
    expect(imported[0]?.createdAt instanceof Date).toBe(true);
  });

  it('throws on invalid JSON input', () => {
    const importer = new RegistryImporter();

    expect(() => importer.import('not json')).toThrow();
  });

  it('throws when imported data is not an array', () => {
    const importer = new RegistryImporter();

    expect(() => importer.import('{"id":"x"}')).toThrow(
      'Imported registry must be an array of college identities',
    );
  });
});
