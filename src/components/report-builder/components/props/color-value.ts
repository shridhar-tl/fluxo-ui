const hexColorPattern = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: string | undefined): value is string {
    return !!value && hexColorPattern.test(value);
}
