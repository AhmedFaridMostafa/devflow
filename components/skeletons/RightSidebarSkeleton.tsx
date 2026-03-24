import { Skeleton } from "@/components/ui/skeleton";

const RightSidebarSkeleton = () => {
  return (
    <>
      <div>
        <Skeleton className="h-6 w-36 rounded-md" />
        <div className="mt-7 flex w-full flex-col gap-7.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-7">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="size-5 shrink-0 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <Skeleton className="h-6 w-32 rounded-md" />
        <div className="mt-7 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-4 w-5 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RightSidebarSkeleton;
