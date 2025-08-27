import React, { useEffect, useRef, useState } from "react";

type ChatContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  onEditName: () => void;
  onDelete: () => void;
};

const MENU_WIDTH = 200;
const MENU_HEIGHT = 98; // ~2 items + padding

const ChatContextMenu =  ({
  x,
  y,
  onClose,
  onEditName,
  onDelete,
}: ChatContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: y, left: x });

  // Keep the menu within the viewport if user right-clicks near edges
  useEffect(() => {
    const { innerWidth, innerHeight } = window;
    let top = y;
    let left = x;

    if (left + MENU_WIDTH > innerWidth - 8) left = innerWidth - MENU_WIDTH - 8;
    if (top + MENU_HEIGHT > innerHeight - 8) top = innerHeight - MENU_HEIGHT - 8;

    setPos({ top, left });
  }, [x, y]);

  // Close on click outside or Esc
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Simple keyboard nav
  const items = [
    { label: "Edit name", action: onEditName, id: "edit" },
    { label: "Delete", action: onDelete, id: "delete", destructive: true },
  ];
  const [focusIdx, setFocusIdx] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => (i + 1) % items.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => (i - 1 + items.length) % items.length);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        items[focusIdx].action();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusIdx, items]);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Timeline actions"
      className="fixed z-[1000] select-none"
      style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
    >
      {/* Pointer arrow */}
      <div className="absolute -top-2 left-4 h-4 w-4 rotate-45 bg-slate-800 border border-slate-700" />

      {/* Panel */}
      <div
        className="relative rounded-xl border border-slate-700 bg-slate-800/95 backdrop-blur
                   shadow-xl shadow-black/40 overflow-hidden animate-[fadeIn_90ms_ease-out]
                   "
      >
        <div className="p-1">
          {items.map((item, idx) => (
            <button
              key={item.id}
              role="menuitem"
              onClick={() => {
                item.action();
                onClose();
              }}
              onMouseEnter={() => setFocusIdx(idx)}
              className={[
                "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm",
                "transition-colors duration-100 outline-none",
                idx === focusIdx ? "bg-slate-700/60" : "hover:bg-slate-700/50",
                item.destructive
                  ? "text-rose-300 hover:text-rose-200 focus:text-rose-200"
                  : "text-slate-200 hover:text-white focus:text-white",
              ].join(" ")}
            >
              {item.id === "edit" ? (
                // Pencil icon
                <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90">
                  <path
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                // Trash icon
                <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90">
                  <path
                    d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 7h2v8h-2v-8zm4 0h2v8h-2v-8zM7 10h2v8H7v-8z"
                    fill="currentColor"
                  />
                </svg>
              )}
              <span className={item.destructive ? "font-medium tracking-tight" : "tracking-tight"}>
                {item.label}
              </span>
              {item.destructive && (
                <span className="ml-auto rounded-md border border-rose-400/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-rose-300">
                  Dangerous
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CSS keyframe for a quick pop-in */}
      <style>{`
        @keyframes fadeIn {
          from { transform: scale(0.98); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
};

export default ChatContextMenu;