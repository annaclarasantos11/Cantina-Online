"use client";

import { useMemo, useRef, useState } from "react";

type Props = {
  id: number | string;
  name: string;
  description?: string;
  price: string | number;
  imageUrl?: string;
  /** Controla o encaixe da imagem. Default: "cover" (lanches). Use "contain" para bebidas. */
  imageMode?: "cover" | "contain";
};

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Placeholder embutido (não depende de arquivo externo)
const PLACEHOLDER_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360' preserveAspectRatio='xMidYMid slice'>
      <defs>
        <linearGradient id='g' x1='0' x2='1'>
          <stop offset='0%' stop-color='#f6f6f6'/>
          <stop offset='100%' stop-color='#ececec'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
    </svg>`
  );

// 1) Normaliza caminho web
function normalizeWebPath(p?: string) {
  if (!p || !p.trim()) return "";
  let s = p.replace("../public", "").replace(/^\.\//, "/");
  if (!s.startsWith("/")) s = "/" + s;
  s = s.replace(/\/{2,}/g, "/");
  return s;
}

// 2) Separa diretório/arquivo/extensão e decodifica se vier %xx
function splitAndDecode(p: string) {
  const lastSlash = p.lastIndexOf("/");
  const dir = lastSlash >= 0 ? p.slice(0, lastSlash + 1) : "/";
  const file = lastSlash >= 0 ? p.slice(lastSlash + 1) : p;
  let decodedFile = file;
  try {
    decodedFile = file.includes("%") ? decodeURIComponent(file) : file;
  } catch {
    decodedFile = file;
  }
  const lastDot = decodedFile.lastIndexOf(".");
  const name = lastDot > 0 ? decodedFile.slice(0, lastDot) : decodedFile;
  const ext = lastDot > 0 ? decodedFile.slice(lastDot) : "";
  return { dir, name, ext };
}

// 3) Tira acentos
function stripDiacritics(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// 4) Variantes de nome (p/ tentar encontrar arquivo)
function buildNameVariants(name: string) {
  const ascii = stripDiacritics(name);
  const base = ascii
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const stop = /\b(de|da|do|dos|das|e)\b/g;
  const v1 = base;
  const v2 = base.replace(stop, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const v3 = v2.replace(/-/g, "");
  return Array.from(new Set([v1, v2, v3])).filter(Boolean);
}

export default function MenuCard({
  id,
  name,
  description = "",
  price,
  imageUrl,
  imageMode = "cover",
}: Props) {
  const initial = useMemo(() => normalizeWebPath(imageUrl), [imageUrl]);
  const [{ src, triedIdx, variants }, setState] = useState(() => {
    if (!initial) {
      return { src: PLACEHOLDER_SVG, triedIdx: -1, variants: [] as string[] };
    }
    const { dir, name, ext } = splitAndDecode(initial);
    const nameVariants = buildNameVariants(name).map(
      (n) => `${dir}${n}${ext.toLowerCase()}`
    );
    const original = `${dir}${name}${ext}`;
    const first = normalizeWebPath(original);
    const all = [first, ...nameVariants].filter((v, i, a) => a.indexOf(v) === i);
    return { src: all[0], triedIdx: 0, variants: all };
  });

  const imgRef = useRef<HTMLImageElement | null>(null);

  function handleError() {
    const nextIdx = triedIdx + 1;
    if (nextIdx < variants.length) {
      setState({ src: variants[nextIdx], triedIdx: nextIdx, variants });
      return;
    }
    if (imgRef.current) imgRef.current.src = PLACEHOLDER_SVG;
  }

  const priceText =
    typeof price === "number"
      ? BRL.format(price)
      : /^\d+(\.\d+)?$/.test(price)
      ? BRL.format(parseFloat(price))
      : price;

  return (
    <article className="overflow-hidden rounded-2xl border bg-white/60 ring-1 ring-black/5 shadow-sm transition hover:shadow-md dark:bg-zinc-900/60">
      {imageMode === "contain" ? (
        // BEBIDAS: imagem inteira, fundo branco
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-white dark:bg-white flex items-center justify-center p-2">
          <img
            ref={imgRef}
            src={src || PLACEHOLDER_SVG}
            alt={name}
            className="max-h-full max-w-full object-contain object-center"
            onError={handleError}
          />
        </div>
      ) : (
        // LANCHES (e padrão): mantém cover, mas com fundo branco
        <div className="aspect-[16/9] w-full overflow-hidden bg-white dark:bg-white">
          <img
            ref={imgRef}
            src={src}
            alt={name}
            className="h-full w-full object-cover object-center"
            onError={handleError}
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight">{name}</h3>
        {description ? (
          <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400 line-clamp-2">
            {description}
          </p>
        ) : null}
        <p className="mt-2 text-sm font-bold">{priceText}</p>
      </div>
    </article>
  );
}
