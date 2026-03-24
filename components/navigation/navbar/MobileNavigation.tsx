import Image from "next/image";
import Link from "next/link";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import NavLinks from "./NavLinks";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SignInAndOut from "./SignInAndOut";

const MobileNavigation = async () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Image
          src="/icons/hamburger.svg"
          width={36}
          height={36}
          alt="Menu"
          className="invert-colors sm:hidden"
        />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="background-light900_dark200 border-none p-4"
        showCloseButton={false}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Sidebar</SheetTitle>
          <SheetDescription>Displays the mobile sidebar.</SheetDescription>
        </SheetHeader>
        <Link href="/" className="flex items-center gap-1 mt-5">
          <Image
            src="/images/site-logo.svg"
            width={46}
            height={46}
            alt="Logo"
          />

          <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900">
            Dev<span className="text-primary-500">Flow</span>
          </p>
        </Link>

        <div className="no-scrollbar flex h-[calc(100vh-80px)] flex-col justify-between overflow-y-auto gap-4">
          <section className="flex h-full flex-col gap-6 pt-16">
            <NavLinks isMobileNav />
          </section>

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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
