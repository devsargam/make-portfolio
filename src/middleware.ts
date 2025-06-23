import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const publicRoutes = ["/sign-in"];
const protectedRoutes = ["/dashboard", "/chat-wizard"];

const isPublicRoute = (path: string) => {
  return publicRoutes.includes(path);
};

const isProtectedRoute = (path: string) => {
  return protectedRoutes.includes(path);
};

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (sessionCookie && isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Need to make sure this is updated when the routes change
export const config = {
  matcher: ["/dashboard", "/sign-in", "/chat-wizard"],
};
