import { GenerateStudyLessonResponse, toJSONSchema } from "@workspace/api-zod";

// Strict structured output keeps enum identifiers intact while prose is translated.
type Schema = Record<string, unknown>;
function strictSchema(schema: Schema): Schema {
  const result = { ...schema };
  if (result.properties && typeof result.properties === "object") {
    const required = Array.isArray(result.required) ? result.required : [];
    const properties = result.properties as Record<string, Schema>;
    result.properties = Object.fromEntries(Object.entries(properties).map(([key, value]) => {
      const child = strictSchema(value);
      return [key, required.includes(key) ? child : { anyOf: [child, { type: "null" }] }];
    }));
    result.required = Object.keys(properties);
    result.additionalProperties = false;
  }
  if (result.items && typeof result.items === "object") result.items = strictSchema(result.items as Schema);
  for (const key of ["anyOf", "oneOf"]) {
    if (Array.isArray(result[key])) result[key] = (result[key] as Schema[]).map(strictSchema);
  }
  return result;
}

export const lessonOutputSchema = strictSchema(toJSONSchema(GenerateStudyLessonResponse));

/** Strict outputs encode optional fields as null; the API contract uses omission. */
export function normalizeLessonOutput(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeLessonOutput);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).filter(([key, child]) =>
    child !== null || !["animation", "illustration", "fraction", "language"].includes(key),
  ).map(([key, child]) => [key, normalizeLessonOutput(child)]));
}
