export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "").replace(/[0-9]/g, "");
}
