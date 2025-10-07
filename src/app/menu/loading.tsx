export default function Loading() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between">
        <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
      </header>

      {/* Skeleton Lanches */}
      <div className="space-y-4">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border bg-white/60 shadow-sm">
              <div className="aspect-[16/9] w-full bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton Bebidas */}
      <div className="space-y-4">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border bg-white/60 shadow-sm">
              <div className="aspect-[16/9] w-full bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
