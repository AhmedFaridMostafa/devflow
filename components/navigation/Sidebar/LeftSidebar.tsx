import { Suspense } from "react";
import { Skeleton } from "../../ui/skeleton";
import NavLinks from "../navbar/NavLinks";
import SignInAndOut from "../navbar/SignInAndOut";

const LeftSidebar = () => {
  return (
    <section className="custom-scrollbar background-light900_dark200 light-border sticky left-0 top-0 h-screen flex flex-col justify-between gap-3 overflow-y-auto border-r p-6 pt-36 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-[266px]">
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks />
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        }
      >
        <SignInAndOut />
      </Suspense>
    </section>
  );
};

export default LeftSidebar;
