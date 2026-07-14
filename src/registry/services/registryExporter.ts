import type { CollegeRegistryService } from './collegeRegistryService.js';

/**
 * Serializes the current registry contents to JSON.
 */
export class RegistryExporter {
  export(service: CollegeRegistryService): string {
    return JSON.stringify(service.getAll(), null, 2);
  }
}
