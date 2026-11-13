export function move(x: number, speed: number) {
  return Math.max(0, Math.min(10, x + speed));
}
export function fanOn(temperature: number, threshold: number) {
  return temperature >= threshold;
}
export function binaryValue(bits: boolean[]) {
  return bits.reduce((sum, bit, i) => sum + (bit ? 2 ** (3 - i) : 0), 0);
}
export function canAccess(
  role: "visitor" | "editor",
  action: string,
  permissions: string[],
) {
  return permissions.includes(`${role}:${action}`);
}
export const leastPrivilege = ["visitor:read", "editor:read", "editor:write"];
export function validPermissions(permissions: string[]) {
  return (
    permissions.length === 3 &&
    leastPrivilege.every((p) => permissions.includes(p))
  );
}
export function promptParts(parts: string[]) {
  return parts.length === 4 && parts.every((p) => p.trim().length >= 6);
}
// Strict teaching subset; the preview is built from text nodes, never untrusted HTML.
export function parseTeachingHTML(source: string) {
  const elements: { tag: "h1" | "p" | "button"; text: string }[] = [];
  const re = /<(h1|p|button)(?:\s+type="button")?>([^<>]+)<\/\1>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)))
    elements.push({
      tag: match[1] as "h1" | "p" | "button",
      text: match[2].trim(),
    });
  const rest = source.replace(re, "").trim();
  return {
    elements,
    valid:
      rest === "" &&
      elements.length === 3 &&
      ["h1", "p", "button"].every((t) =>
        elements.some((e) => e.tag === t && e.text.length > 0),
      ) &&
      /<button type="button">/.test(source),
  };
}
export const samplePoints = (rate: number) =>
  Array.from({ length: rate + 1 }, (_, i) => ({
    x: i / rate,
    y: Math.sin((2 * Math.PI * 2 * i) / rate),
  }));
