import { z } from "zod";

/** A single field in a dynamic form definition. */
export const formFieldSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Field name must be a valid identifier (letters, numbers, underscore)"),
  label: z.string().min(1).max(150),
  type: z.enum(["text", "email", "tel", "textarea", "select", "checkbox", "number"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // for "select"
});
export type FormField = z.infer<typeof formFieldSchema>;

export const formDefSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Key must be lowercase letters, numbers, and hyphens only"),
  name: z.string().min(1).max(150),
  fields: z.array(formFieldSchema).min(1, "A form needs at least one field"),
  notifyEmail: z.string().email().optional().nullable(),
});
export type FormDefInput = z.infer<typeof formDefSchema>;

export const formDefUpdateSchema = formDefSchema.partial();

/**
 * Builds a Zod object schema at runtime from a form's field definitions, so
 * every public submission is validated against exactly the fields the form
 * was configured with — no hardcoded shape per form.
 */
export function buildSubmissionSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    let schema: z.ZodTypeAny;
    switch (field.type) {
      case "email":
        schema = z.string().email();
        break;
      case "number":
        schema = z.coerce.number();
        break;
      case "checkbox":
        schema = z.coerce.boolean();
        break;
      case "select":
        schema = field.options && field.options.length > 0
          ? z.enum(field.options as [string, ...string[]])
          : z.string();
        break;
      default:
        schema = z.string().max(5000);
    }
    shape[field.name] = field.required ? schema : schema.optional();
  }
  // Honeypot: always present, always expected empty.
  shape.website = z.string().max(0).optional().or(z.literal(""));
  return z.object(shape);
}
