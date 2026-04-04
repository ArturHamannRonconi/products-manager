export function resolveImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
}
