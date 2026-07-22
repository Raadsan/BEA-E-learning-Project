export function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    let id = "";
    if (parsed.hostname.includes("youtu.be")) id = parsed.pathname.slice(1).split("/")[0];
    else if (parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.split("/")[2];
    else if (parsed.pathname.startsWith("/embed/")) id = parsed.pathname.split("/")[2];
    else id = parsed.searchParams.get("v") || "";
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch { return url; }
}

export function getYouTubeThumbnailUrl(url?: string | null) {
  const embed = getYouTubeEmbedUrl(url);
  const id = embed.match(/youtube\.com\/embed\/([^?&/]+)/)?.[1];
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

export function isYouTubeUrl(url?: string | null) {
  return Boolean(url && /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\//i.test(url.trim()));
}
