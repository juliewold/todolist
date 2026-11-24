/** Creates a new unique identifier for a domain entity. */
export function createId(): string {
  return crypto.randomUUID();
}
