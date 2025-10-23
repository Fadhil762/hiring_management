import { z } from 'zod';
import type { ApplicationField } from './types';

export function zodSchemaFromFields(fields: ApplicationField[]) {
    const shape: Record<string, z.ZodTypeAny> = {};
    fields.forEach(f => {
        if (f.validation?.required) shape[f.key] = z.string().min(1, `${f.key} is required`);
        else shape[f.key] = z.string().optional();
    });
    return z.object(shape);
}

export function visibleFields(fields: ApplicationField[]){
      // Off (hidden) = field missing in array → handled by API; we just render what’s given
    return fields;
}