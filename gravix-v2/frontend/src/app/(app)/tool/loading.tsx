export default function ToolLoading() {
  return (
    <div className="flex h-screen bg-brand-900">
      {/* Left Panel Skeleton */}
      <div className="w-full md:w-[45%] border-r border-brand-700 p-6 space-y-4">
        {/* Header skeleton */}
        <div className="h-8 w-48 bg-brand-800 rounded animate-pulse" />
        <div className="h-4 w-64 bg-brand-800 rounded animate-pulse" />

        {/* Form skeletons */}
        <div className="space-y-6 pt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-brand-800 rounded animate-pulse" />
              <div className="h-12 w-full bg-brand-800 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Button skeleton */}
        <div className="h-12 w-full bg-accent-500/20 rounded animate-pulse mt-8" />
      </div>

      {/* Right Panel Skeleton */}
      <div className="hidden md:flex md:w-[55%] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-brand-800 rounded-full mx-auto animate-pulse" />
          <div className="h-6 w-64 bg-brand-800 rounded mx-auto animate-pulse" />
          <div className="h-4 w-48 bg-brand-800 rounded mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}
