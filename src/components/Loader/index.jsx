import React from "react";

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/* Animated spinner */}
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-b-primary/40 animate-spin" style={{ animationDuration: "1.5s" }} />
      </div>

      {/* Skeleton cards */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 bg-muted rounded-full animate-pulse" />
                <div className="h-9 w-9 bg-muted rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-36 bg-muted rounded-full animate-pulse" />
              <div className="h-3 w-40 bg-muted rounded-full animate-pulse" />
              <div className="h-9 w-full bg-muted rounded-md animate-pulse mt-2" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
          <div className="h-5 w-48 bg-muted rounded-full animate-pulse" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-24 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground animate-pulse">Loading your finances...</p>
    </div>
  );
}

export default Loader;