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
  onAdd?: () => void;
  onIncrease?: () => void;
  onDecrease?: () => void;
  quantity?: number;
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
  onAdd,
  onIncrease,
  onDecrease,
  quantity,
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

  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  function handleError() {
    const nextIdx = triedIdx + 1;
    if (nextIdx < variants.length) {
      setState({ src: variants[nextIdx], triedIdx: nextIdx, variants });
      setLoaded(false);
      return;
    }
    if (imgRef.current) imgRef.current.src = PLACEHOLDER_SVG;
    setLoaded(true);
  }

  function handleLoad() {
    setLoaded(true);
  }

  const priceText =
    typeof price === "number"
      ? BRL.format(price)
      : /^\d+(\.\d+)?$/.test(price)
      ? BRL.format(parseFloat(price))
      : price;

  return (
    <article className="group overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
      {imageMode === "contain" ? (
        // BEBIDAS: imagem inteira, fundo branco com padding
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-white flex items-center justify-center p-6">
          {!loaded && <div className="absolute inset-0 skeleton" />}
          <img
            ref={imgRef}
            src={src || PLACEHOLDER_SVG}
            alt={name}
            loading="lazy"
            className={`max-h-full max-w-full object-contain object-center transition-all duration-500 group-hover:scale-[1.03] ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            onError={handleError}
            onLoad={handleLoad}
          />
          {/* Overlay sutil no hover */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
        </div>
      ) : (
        // LANCHES (e padrão): cover
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
          {!loaded && <div className="absolute inset-0 skeleton" />}
          <img
            ref={imgRef}
            src={src}
            alt={name}
            loading="lazy"
            className={`h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-[1.03] ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            onError={handleError}
            onLoad={handleLoad}
          />
          {/* Overlay sutil no hover */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
        </div>
      )}

      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight text-gray-900">{name}</h3>
        {description ? (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
        ) : null}
        <p className="mt-2 text-sm font-bold text-gray-900">{priceText}</p>
        {typeof quantity === "number" && quantity > 0 && onIncrease && onDecrease ? (
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onDecrease}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-lg leading-none text-gray-700 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
              aria-label={`Remover ${name}`}
            >
              −
            </button>
            <div className="min-w-[3rem] text-center text-sm font-semibold text-gray-800" aria-live="polite">
              {quantity}
            </div>
            <button
              type="button"
              onClick={onIncrease}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-lg leading-none text-gray-700 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
              aria-label={`Adicionar mais ${name}`}
            >
              +
            </button>
          </div>
        ) : onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
          >
            Adicionar ao carrinho
          </button>
        ) : null}
      </div>
    </article>
  );
}
