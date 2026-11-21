const identifierPattern = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function getIdentifierError(name: string, takenNames: readonly string[], prefix: string): string | null {
    const trimmed = name.trim();
    if (!trimmed) return 'Name is required.';
    if (!identifierPattern.test(trimmed)) {
        return `Use letters, digits, _ or $ only, not starting with a digit, so it can be read as ${prefix}.${trimmed.replace(/\W/g, '_') || 'name'}.`;
    }
    if (takenNames.includes(trimmed)) return 'This name is already used.';
    return null;
}
