export default function LiveBadge() {
  return (
    <span className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-600 text-white text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      LIVE
    </span>
  );
}
