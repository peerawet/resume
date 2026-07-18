"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useResumeData } from "./resume-data";
import { useEditing } from "./editing";
import { compressPhoto } from "@/lib/image";
import {
  PHOTO_SIZE_MAX,
  PHOTO_SIZE_MIN,
  PHOTO_ZOOM_MAX,
  PHOTO_ZOOM_MIN,
} from "@/lib/schema";

const DEFAULT_SIZE = 92;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * รูปโปรไฟล์ใน Header — โหมด view เป็นรูปเฉยๆ, โหมด editor แตะรูปเพื่อเปิด
 * แผงปรับแต่ง: อัพโหลด (Vercel Blob), ย่อ/ขยายกรอบ, ซูม, ลากรูปจัดตำแหน่งในกรอบ
 *
 * ค่าทั้งหมดเก็บใน contact (photo/photoSize/photoZoom/photoX/photoY) —
 * ติดไปกับ snapshot ตอน publish เหมือนเนื้อหาอื่น
 */
export default function ResumePhoto() {
  const { content, contact } = useResumeData();
  const { editable, update, resumeId } = useEditing();

  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ระหว่างลากจัดตำแหน่ง: เก็บ delta ไว้ local ให้ลื่น แล้ว commit ครั้งเดียวตอนปล่อย
  const [panDelta, setPanDelta] = useState<{ x: number; y: number } | null>(null);

  const frameRef = useRef<HTMLSpanElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const size = contact.photoSize ?? DEFAULT_SIZE;
  const zoom = contact.photoZoom ?? 1;
  // เลื่อนได้มากสุดแค่พอที่ขอบรูปยังไม่โผล่เข้ามาในกรอบ: translate ก่อน scale
  // ⇒ ขอบรูปอยู่ที่ ±50·zoom + offset ต้องคลุม ±50 ⇒ |offset| ≤ 50·(zoom−1)
  const maxPan = 50 * (zoom - 1);
  const baseX = clamp(contact.photoX ?? 0, -maxPan, maxPan);
  const baseY = clamp(contact.photoY ?? 0, -maxPan, maxPan);
  const x = clamp(baseX + (panDelta?.x ?? 0), -maxPan, maxPan);
  const y = clamp(baseY + (panDelta?.y ?? 0), -maxPan, maxPan);

  const frame = (
    <span
      ref={frameRef}
      className={`block shrink-0 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-300 ${
        editable ? "select-none" : ""
      }`}
      style={{ width: size, height: size }}
    >
      {contact.photo ? (
        <img
          src={contact.photo}
          alt={content.personal.name}
          draggable={false}
          className="h-full w-full object-cover"
          style={
            zoom !== 1 || x !== 0 || y !== 0
              ? { transform: `translate(${x}%, ${y}%) scale(${zoom})` }
              : undefined
          }
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-display font-bold text-slate-400"
          style={{ fontSize: Math.round(size * 0.39) }}
        >
          {content.personal.name.trim().charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </span>
  );

  if (!editable) return frame;

  const canPan = Boolean(contact.photo) && zoom > 1;

  /** แตะ = เปิด/ปิดแผง, ลาก (เมื่อซูมอยู่) = เลื่อนตำแหน่งรูปในกรอบ */
  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = frameRef.current?.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    let moved = false;
    let dx = 0;
    let dy = 0;
    target.setPointerCapture(event.pointerId);

    const onMove = (move: PointerEvent) => {
      dx = move.clientX - startX;
      dy = move.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      // rect วัดหลัง auto-fit scale แล้ว — แปลง px จอ → % ของกรอบได้ตรง
      if (moved && canPan && rect?.width) {
        setPanDelta({ x: (dx / rect.width) * 100, y: (dy / rect.height) * 100 });
      }
    };
    const onUp = () => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
      if (moved && canPan && rect?.width) {
        const nextX = round1(clamp(baseX + (dx / rect.width) * 100, -maxPan, maxPan));
        const nextY = round1(clamp(baseY + (dy / rect.height) * 100, -maxPan, maxPan));
        setPanDelta(null);
        update((d) => {
          d.contact.photoX = nextX;
          d.contact.photoY = nextY;
        });
      } else if (!moved) {
        setOpen((prev) => !prev);
      }
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || !resumeId || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const photo = await compressPhoto(file);
      const result = await upload(
        `resumes/${resumeId}/photo.${photo.ext}`,
        photo.blob,
        {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: photo.contentType,
          clientPayload: JSON.stringify({ resumeId }),
        },
      );
      // blob เก่าถูกลบใน updateDraft ตอน autosave flush (ถ้า published ไม่อ้างอยู่)
      update((d) => {
        d.contact.photo = result.url;
        d.contact.photoZoom = 1;
        d.contact.photoX = 0;
        d.contact.photoY = 0;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัพโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const setZoom = (next: number) => {
    const nextMaxPan = 50 * (next - 1);
    update((d) => {
      d.contact.photoZoom = round1(next);
      d.contact.photoX = round1(clamp(x, -nextMaxPan, nextMaxPan));
      d.contact.photoY = round1(clamp(y, -nextMaxPan, nextMaxPan));
    });
  };

  const removePhoto = () => {
    setOpen(false);
    update((d) => {
      d.contact.photo = undefined;
      d.contact.photoZoom = undefined;
      d.contact.photoX = undefined;
      d.contact.photoY = undefined;
    });
  };

  return (
    <span className="relative block shrink-0 print:contents">
      <span
        role="button"
        tabIndex={0}
        title={canPan ? "แตะเพื่อปรับแต่งรูป · ลากเพื่อเลื่อนตำแหน่ง" : "แตะเพื่อปรับแต่งรูป"}
        onPointerDown={onPointerDown}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
        className={`block rounded-full outline-2 outline-offset-2 outline-dashed transition-[outline-color] ${
          // ตอนแผงเปิด ต้องลอยเหนือ backdrop ไม่งั้นลากรูปจัดตำแหน่งไม่ได้
          open ? "relative z-30 outline-navy/60" : "outline-transparent hover:outline-navy/40"
        } ${canPan ? "cursor-move touch-none" : "cursor-pointer"}`}
      >
        {frame}
      </span>

      {open && (
        <>
          {/* backdrop ปิดแผงเมื่อคลิกที่อื่น */}
          <span
            className="fixed inset-0 z-20 print:hidden"
            onClick={() => setOpen(false)}
          />
          <span className="absolute left-0 top-full z-30 mt-2 block w-64 rounded-md border border-slate-200 bg-white p-3 text-[13px] shadow-lg print:hidden">
            <span className="flex items-center gap-2">
              {/* ไม่มี resumeId = โหมดลองแก้ไขของ guest — อัพโหลดไม่ได้ (ไม่มีสิทธิ์) */}
              {resumeId ? (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded border border-slate-300 px-2 py-1.5 font-semibold text-slate-600 hover:border-navy/50 hover:text-navy disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> กำลังอัพโหลด…
                    </>
                  ) : (
                    <>
                      <Camera size={13} /> อัพโหลดรูป
                    </>
                  )}
                </button>
              ) : (
                <span className="flex-1 text-[11px] leading-4 text-slate-400">
                  โหมดทดลอง — ปรับได้เฉพาะขนาด/ซูม/ตำแหน่ง
                </span>
              )}
              {contact.photo && (
                <button
                  type="button"
                  title="ลบรูป"
                  onClick={removePhoto}
                  className="rounded border border-slate-300 p-1.5 text-slate-400 hover:border-red-300 hover:text-red-600"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </span>
            {error && (
              <span className="mt-2 block text-[12px] text-red-600">{error}</span>
            )}

            <label className="mt-3 flex items-center gap-2 text-slate-500">
              <span className="w-9 shrink-0 font-semibold">ขนาด</span>
              <input
                type="range"
                min={PHOTO_SIZE_MIN}
                max={PHOTO_SIZE_MAX}
                step={2}
                value={size}
                onChange={(event) =>
                  update(
                    (d) => void (d.contact.photoSize = Number(event.target.value)),
                  )
                }
                className="flex-1 accent-navy"
              />
              <span className="w-10 shrink-0 text-right tabular-nums">
                {size}px
              </span>
            </label>

            <label
              className={`mt-2 flex items-center gap-2 text-slate-500 ${
                contact.photo ? "" : "opacity-40"
              }`}
            >
              <span className="w-9 shrink-0 font-semibold">ซูม</span>
              <input
                type="range"
                min={PHOTO_ZOOM_MIN}
                max={PHOTO_ZOOM_MAX}
                step={0.05}
                value={zoom}
                disabled={!contact.photo}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="flex-1 accent-navy"
              />
              <span className="w-10 shrink-0 text-right tabular-nums">
                {zoom.toFixed(2)}×
              </span>
            </label>

            <span className="mt-2 block text-[11px] leading-4 text-slate-400">
              {canPan
                ? "ลากที่รูปเพื่อเลื่อนตำแหน่งในกรอบ"
                : "ซูมมากกว่า 1× แล้วลากที่รูปเพื่อเลื่อนตำแหน่งได้"}
            </span>
          </span>
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </span>
  );
}
