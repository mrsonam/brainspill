import { RefObject } from "react";

type GridLayerProps = {
  gridRef: RefObject<HTMLDivElement | null>;
};

export function GridLayer({ gridRef }: GridLayerProps) {
  return (
    <div
      ref={gridRef}
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.055)_1px,transparent_1px)] bg-[size:48px_48px]"
      aria-hidden="true"
    />
  );
}
