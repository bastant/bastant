import { createMemo, onCleanup } from "solid-js";

export interface PreviewProps {
  file: Blob;
}

export function Preview(props: PreviewProps) {
  if (!props.file.type.startsWith("image")) {
    return <div>Preview not available</div>;
  }

  const url = createMemo<string>((prev) => {
    if (prev) {
      URL.revokeObjectURL(prev);
    }

    const url = URL.createObjectURL(props.file);

    onCleanup(() => {
      URL.revokeObjectURL(url);
    });

    return url;
  });

  return <img src={url()} />;
}
