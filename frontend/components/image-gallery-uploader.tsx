"use client";

import { useState } from "react";
import { DragHandleIcon, ImageIcon, LinkIcon, StarIcon, TrashIcon } from "@/components/icons";

export interface ProductImage {
  id: string;
  url: string;
}

export interface ImageGalleryUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
}

export function ImageGalleryUploader({
  images,
  onChange,
  maxImages = 6,
}: ImageGalleryUploaderProps) {
  const [linkValue, setLinkValue] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const atLimit = images.length >= maxImages;

  function addImage() {
    const url = linkValue.trim();
    if (!url || atLimit) return;
    onChange([...images, { id: `img-${Date.now()}`, url }]);
    setLinkValue("");
  }

  function removeImage(id: string) {
    onChange(images.filter((image) => image.id !== id));
  }

  function makePrimary(id: string) {
    const target = images.find((image) => image.id === id);
    if (!target) return;
    onChange([target, ...images.filter((image) => image.id !== id)]);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
    setDragIndex(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <LinkIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="url"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage();
              }
            }}
            placeholder="https://cdn.artisancommerce.store/products/matcha-glaze-01.jpg"
            disabled={atLimit}
            className="h-9 w-full rounded-lg bg-slate-50 pr-3 pl-9 text-body-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-focus/20 focus:outline-none disabled:opacity-60"
          />
        </div>
        <button
          type="button"
          onClick={addImage}
          disabled={atLimit || !linkValue.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-label-md font-semibold text-slate-900 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImageIcon className="h-4 w-4" />
          Paste Image Link
        </button>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-slate-50 p-8 text-center text-body-sm text-slate-500">
          <ImageIcon className="h-6 w-6" />
          No images yet — paste a link above to add the first product photo.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="group relative aspect-square cursor-grab overflow-hidden rounded-lg bg-slate-100 shadow-level-1 active:cursor-grabbing"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {index === 0 ? (
                <div className="absolute top-2 left-2 rounded-md bg-slate-900/90 px-2 py-0.5 text-label-sm font-semibold tracking-wider text-white uppercase backdrop-blur-sm">
                  Primary Cover
                </div>
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/30 opacity-0 transition-opacity group-hover:opacity-100">
                {index !== 0 ? (
                  <button
                    type="button"
                    title="Make primary cover"
                    onClick={() => makePrimary(image.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-level-2 transition-transform hover:scale-110"
                  >
                    <StarIcon className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-level-2">
                    <DragHandleIcon className="h-4 w-4" />
                  </span>
                )}
                <button
                  type="button"
                  title="Remove image"
                  onClick={() => removeImage(image.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-destructive shadow-level-2 transition-transform hover:scale-110"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-body-sm text-slate-500">
        <DragHandleIcon className="h-4 w-4 shrink-0 text-primary" />
        Drag thumbnail cards to reorder the customer sequence. The first image auto-syncs as the catalog cover.
      </div>
    </div>
  );
}
