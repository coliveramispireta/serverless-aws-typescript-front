"use client";
import { toPng } from "html-to-image";

/**
 * Helfers reutilizables para compartir imágenes (patrón usado en logros).
 * Genera un PNG de un nodo DOM con html-to-image y lo comparte vía Web Share
 * API (nativo del móvil), o lo descarga como respaldo.
 */

export function canSystemShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

/** Genera el PNG (Blob) de un nodo del DOM mediante html-to-image. */
export async function captureNodeToBlob(
  node: HTMLElement,
  filename: string,
  pixelRatio = 2
): Promise<{ blob: Blob; file: File } | null> {
  if (!node) return null;
  try {
    const dataUrl = await toPng(node, {
      pixelRatio,
      cacheBust: true,
      width: node.offsetWidth,
      height: node.offsetHeight,
    });
    const blob = await (await fetch(dataUrl)).blob();
    return { blob, file: new File([blob], filename, { type: "image/png" }) };
  } catch (err) {
    console.error("captureNodeToBlob:", err);
    return null;
  }
}

/** Descarga el PNG localmente (respaldo cuando no hay Web Share con archivos). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Comparte la imagen generada del nodo:
 * - Si el dispositivo soporta Web Share con archivos, abre el menú nativo.
 * - Si no, descarga la imagen.
 * Devuelve true si se pudo completar (compartir o descargar).
 */
export async function shareNodeAsImage(
  node: HTMLElement,
  filename: string,
  opts?: { title?: string; text?: string }
): Promise<boolean> {
  const captured = await captureNodeToBlob(node, filename);
  if (!captured) return false;
  const { blob, file } = captured;

  const canFiles =
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [file] });

  if (canFiles && canSystemShare()) {
    try {
      await navigator.share({
        title: opts?.title,
        text: opts?.text,
        files: [file],
      });
      return true;
    } catch {
      // El usuario canceló → se cae a descargar la imagen
    }
  }

  downloadBlob(blob, filename);
  return true;
}

/** Copia texto al portapapeles (fallback para compartir sin Web Share). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
