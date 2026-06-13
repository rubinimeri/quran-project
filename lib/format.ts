export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}
