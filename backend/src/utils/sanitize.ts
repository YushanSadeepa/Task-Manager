/**
 * Sanitizes free-text input before validation/storage:
 *  - removes control characters (keeps tab/newline/CR)
 *  - strips HTML tags, repeatedly, so nested payloads like "<scr<b>ipt>" cannot reassemble
 *  - normalizes whitespace and trims
 * Output encoding is still handled by React on the frontend; this is defence in depth.
 */
export function sanitizeText(input: string, opts: { multiline?: boolean } = {}): string {
  let out = input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

  let previous: string;
  do {
    previous = out;
    out = out.replace(/<[^>]*>/g, "");
  } while (out !== previous);

  out = opts.multiline
    ? out.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n")
    : out.replace(/\s+/g, " ");

  return out.trim();
}
