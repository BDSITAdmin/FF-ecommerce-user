type PageLoaderProps = {
  label?: string;
  fullScreen?: boolean;
};

export default function PageLoader({ label = "Loading", fullScreen = true }: PageLoaderProps) {
  return (
    <div
      className={
        fullScreen
          ? "min-h-[55vh] w-full flex items-center justify-center"
          : "w-full flex items-center justify-center py-12"
      }
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <span className="loader-ring loader-ring-outer" />
          <span className="loader-ring loader-ring-inner" />
          <span className="loader-dot" />
        </div>
        <p className="text-sm font-semibold tracking-[0.16em] text-[#0065a6] uppercase">{label}</p>
      </div>
    </div>
  );
}
