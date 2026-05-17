import { NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard"];
const authRoutes = ["/sign-in", "/sign-up"];

export default function middleware(req) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get("pw_refresh_token")?.value;
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (token && (pathname === "/" || isAuthRoute)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
