"use client";

import { useState } from "react";
import { cn } from "@/utils/tailwind";

const PREVIEW_IMAGES = [
  { id: 1, color: "bg-rose-400" },
  { id: 2, color: "bg-amber-400" },
  { id: 3, color: "bg-emerald-400" },
  { id: 4, color: "bg-sky-400" },
  { id: 5, color: "bg-violet-400" },
  { id: 6, color: "bg-pink-400" },
  { id: 7, color: "bg-orange-400" },
  { id: 8, color: "bg-teal-400" },
  { id: 9, color: "bg-indigo-400" },
];

export function GridPreview() {
  const [items, setItems] = useState(PREVIEW_IMAGES);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newItems = [...items];
    const draggedItemContent = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(index, 0, draggedItemContent);
    setItems(newItems);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-card p-4 shadow-2xl md:max-w-lg">
      {/* Mock Profile Header */}
      <div className="mb-4 flex items-center gap-3 px-2">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-rose-400 to-amber-400" />
        <div className="flex-1">
          <p className="font-semibold">your_profile</p>
          <p className="text-sm text-muted-foreground">Your creative space</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "aspect-square cursor-grab rounded-sm transition-all duration-200",
              item.color,
              draggedItem === index && "scale-95 opacity-50"
            )}
          />
        ))}
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Try dragging the squares to rearrange them
      </p>
    </div>
  );
}
