/**
 * Limpa texto de email IMAP (HTML entities, zero-width, tags residuais)
 * para não inflar a UI com lixo de tracking/marketing.
 */
export function formatMailboxBodyText(raw: string | null | undefined): string {
  if (!raw) return "";

  let s = raw;

  s = s.replace(/&#x([0-9a-fA-F]+);/gi, (_, hex: string) => {
    const code = Number.parseInt(hex, 16);
    return isVisibleCodePoint(code) ? String.fromCodePoint(code) : "";
  });
  s = s.replace(/&#(\d+);/g, (_, dec: string) => {
    const code = Number.parseInt(dec, 10);
    return isVisibleCodePoint(code) ? String.fromCodePoint(code) : "";
  });

  s = s
    .replace(/&nbsp;/gi, " ")
    .replace(/&ensp;/gi, " ")
    .replace(/&emsp;/gi, " ")
    .replace(/&thinsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–");

  s = s.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n");
  s = s.replace(/<[^>]+>/g, " ");

  // Zero-width / BOM / soft hyphen / figure space / word joiner
  s = s.replace(/[\u00AD\u200B-\u200F\u2028\u2029\u2060\uFEFF\u2007]/g, "");

  s = s.replace(/[ \t\f\v\u00A0]+/g, " ");
  s = s.replace(/ *\n */g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}

function isVisibleCodePoint(code: number): boolean {
  if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return false;
  // Control + common invisible / spacing tricks used in marketing HTML
  if (code < 32 && code !== 9 && code !== 10 && code !== 13) return false;
  if (
    code === 0xad ||
    code === 0x2007 ||
    (code >= 0x200b && code <= 0x200f) ||
    code === 0x2028 ||
    code === 0x2029 ||
    code === 0x2060 ||
    code === 0xfeff ||
    code === 0x847 // combining grapheme joiner often abused as spacer
  ) {
    return false;
  }
  return true;
}
