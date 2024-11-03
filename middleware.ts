import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/sign-in(.*)", "/sign-up(.*)", "/api/trpc(.*)"];
const ignoredRoutes = ["/((?!api|trpc))(_next|.+\\.[\\w]+$)", "/favicon.ico"];

export default clerkMiddleware((auth, req) => {
  const isPublicRoute = publicRoutes.some(pattern => 
    new RegExp(`^${pattern}$`).test(req.nextUrl.pathname)
  );

  const isIgnoredRoute = ignoredRoutes.some(pattern => 
    new RegExp(`^${pattern}$`).test(req.nextUrl.pathname)
  );

  if (isIgnoredRoute) {
    return NextResponse.next();
  }

  if (!auth.userId && !isPublicRoute) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ],
};