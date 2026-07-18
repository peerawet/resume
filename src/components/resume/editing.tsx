"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import type { ContactInfo, ResumeContent } from "@/i18n/types";

/* ------------------------------------------------------------------ */
/* Editing context                                                     */
/* ------------------------------------------------------------------ */

export interface EditableDraft {
  content: ResumeContent;
  contact: ContactInfo;
}

interface EditingValue {
  editable: boolean;
  /** mutate สำเนาของ draft (content ภาษาปัจจุบัน + contact) แล้ว state ถูก set ใหม่ */
  update: (recipe: (draft: EditableDraft) => void) => void;
}

const EditingContext = createContext<EditingValue>({
  editable: false,
  update: () => {},
});

export const useEditing = () => useContext(EditingContext);

export function EditingProvider({
  update,
  children,
}: {
  update: EditingValue["update"];
  children: ReactNode;
}) {
  return (
    <EditingContext.Provider value={{ editable: true, update }}>
      {children}
    </EditingContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* EditableText                                                        */
/* ------------------------------------------------------------------ */

interface EditableTextProps {
  value: string;
  onCommit: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  /** class เสริม (เช่น font-semibold) — โหมด view ที่ไม่ editable จะ render value เปล่าๆ ไม่มี wrapper */
  className?: string;
}

/**
 * Primitive แก้ inline: คลิก span → input/textarea ที่ typography เหมือน view เป๊ะ
 * (สืบทอด font ผ่าน .editable-input) — blur/Enter commit, Esc ยกเลิก,
 * Shift+Enter ขึ้นบรรทัดใหม่ในโหมด multiline
 */
export function EditableText({
  value,
  onCommit,
  multiline = false,
  placeholder,
  className = "",
}: EditableTextProps) {
  const { editable } = useEditing();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // auto-grow ความสูง textarea ตามเนื้อหา
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!editing || !multiline || !el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [editing, draft, multiline]);

  if (!editable) {
    if (!value) return null;
    return className ? <span className={className}>{value}</span> : <>{value}</>;
  }

  if (!editing) {
    return (
      <span
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className={`-mx-0.5 cursor-text rounded-[2px] px-0.5 outline-1 outline-dashed outline-transparent transition-colors hover:bg-navy/5 hover:outline-navy/40 ${
          value ? "" : "italic text-slate-300"
        } ${className}`}
      >
        {value || placeholder || "แก้ไข…"}
      </span>
    );
  }

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== value) onCommit(next);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setEditing(false);
    } else if (event.key === "Enter" && !(multiline && event.shiftKey)) {
      event.preventDefault();
      commit();
    }
  };

  const inputClass = `editable-input -mx-0.5 rounded-[2px] bg-navy/5 px-0.5 outline-1 outline-navy/50 ${className}`;

  if (multiline) {
    return (
      <textarea
        ref={areaRef}
        autoFocus
        rows={1}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        className={`block w-full resize-none overflow-hidden ${inputClass}`}
      />
    );
  }

  return (
    <input
      autoFocus
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      style={{ width: `${Math.max(draft.length, placeholder?.length ?? 0, 3) + 2}ch` }}
      className={`max-w-full ${inputClass}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* UrlEditButton — แก้ URL ผ่าน prompt (MVP)                           */
/* ------------------------------------------------------------------ */

export function UrlEditButton({
  url,
  onCommit,
}: {
  url: string | undefined;
  onCommit: (url: string) => void;
}) {
  const { editable } = useEditing();
  if (!editable) return null;
  return (
    <button
      type="button"
      title={url ? `แก้ URL (${url})` : "ใส่ URL"}
      onClick={() => {
        const next = window.prompt("URL (ต้องขึ้นต้นด้วย http:// หรือ https://)", url || "https://");
        if (next === null) return;
        const trimmed = next.trim();
        if (trimmed && !/^https?:\/\//i.test(trimmed)) {
          window.alert("URL ต้องขึ้นต้นด้วย http:// หรือ https://");
          return;
        }
        onCommit(trimmed);
      }}
      className="inline-flex shrink-0 items-center text-slate-400 hover:text-navy print:hidden"
    >
      <LinkIcon size={11} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* SortableList — ลาก/เพิ่ม/ลบ item (dnd-kit, รองรับ touch)            */
/* ------------------------------------------------------------------ */

type ContainerTag = "div" | "ul";
type ItemTag = "div" | "li" | "span";

interface SortableListProps<T> {
  items: T[];
  onItemsChange: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  /** class ของ container — ต้องตรงกับ markup โหมด view เดิมเป๊ะ */
  className?: string;
  as?: ContainerTag;
  itemAs?: ItemTag;
  itemClassName?: (item: T, index: number) => string;
  /** block: ปุ่มลอยมุมขวาบน + ลากที่ grip; chip: ทั้งชิ้นลากได้ + ปุ่มลบมุมชิป */
  variant?: "block" | "chip";
  onAdd?: () => void;
  addLabel?: string;
}

function SortableItem({
  id,
  as: Tag,
  className,
  variant,
  onRemove,
  children,
}: {
  id: string;
  as: ItemTag;
  className: string;
  variant: "block" | "chip";
  onRemove: () => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const chipDrag = variant === "chip" ? { ...attributes, ...listeners } : {};

  return (
    <Tag
      ref={setNodeRef as never}
      style={style}
      {...chipDrag}
      className={`group/item relative ${variant === "chip" ? "touch-none" : ""} ${
        isDragging ? "z-20 opacity-70" : ""
      } ${className}`}
    >
      {children}
      {variant === "block" ? (
        <span className="absolute -top-2.5 right-0 z-10 flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1 py-0.5 opacity-50 shadow-sm transition-opacity md:opacity-0 md:group-hover/item:opacity-100 print:hidden">
          <button
            type="button"
            title="ลากเพื่อจัดลำดับ"
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-slate-400 hover:text-navy"
          >
            <GripVertical size={13} />
          </button>
          <button
            type="button"
            title="ลบ"
            onClick={onRemove}
            className="text-slate-400 hover:text-red-600"
          >
            <Trash2 size={12} />
          </button>
        </span>
      ) : (
        <button
          type="button"
          title="ลบ"
          onClick={onRemove}
          className="absolute -right-1.5 -top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-400 opacity-60 shadow-sm hover:text-red-600 md:opacity-0 md:group-hover/item:opacity-100 print:hidden"
        >
          <Trash2 size={9} />
        </button>
      )}
    </Tag>
  );
}

export function SortableList<T>({
  items,
  onItemsChange,
  renderItem,
  className = "",
  as = "div",
  itemAs = "div",
  itemClassName = () => "",
  variant = "block",
  onAdd,
  addLabel = "เพิ่ม",
}: SortableListProps<T>) {
  const { editable } = useEditing();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const Container = as;
  const Item = itemAs;

  // โหมด view: markup เดิมเป๊ะ ไม่มี chrome ใดๆ
  if (!editable) {
    return (
      <Container className={className}>
        {items.map((item, index) => (
          <Item key={index} className={itemClassName(item, index) || undefined}>
            {renderItem(item, index)}
          </Item>
        ))}
      </Container>
    );
  }

  const ids = items.map((_, index) => `i${index}`);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = Number(String(active.id).slice(1));
    const to = Number(String(over.id).slice(1));
    onItemsChange(arrayMove(items, from, to));
  };

  const addButton = onAdd && (
    <button
      type="button"
      onClick={onAdd}
      className="inline-flex w-fit items-center gap-1 rounded border border-dashed border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-400 transition-colors hover:border-navy/50 hover:text-navy print:hidden"
    >
      <Plus size={11} /> {addLabel}
    </button>
  );

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={ids}
          strategy={variant === "chip" ? rectSortingStrategy : verticalListSortingStrategy}
        >
          <Container className={className}>
            {items.map((item, index) => (
              <SortableItem
                key={ids[index]}
                id={ids[index]}
                as={Item}
                variant={variant}
                className={itemClassName(item, index)}
                onRemove={() => onItemsChange(items.filter((_, i) => i !== index))}
              >
                {renderItem(item, index)}
              </SortableItem>
            ))}
            {variant === "chip" && addButton}
          </Container>
        </SortableContext>
      </DndContext>
      {variant === "block" && addButton && <div className="mt-2">{addButton}</div>}
    </>
  );
}
