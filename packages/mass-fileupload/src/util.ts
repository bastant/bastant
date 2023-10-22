const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  js: "application/javascript",
};

export function acceptMime(accepts: string[], mime: string): boolean {
  return accepts.some((m) => {
    m === mime || EXT_MIME[m] == mime;
  });
}
