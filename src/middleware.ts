import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PRIMARY_SUPER_ADMIN_EMAIL } from "./lib/security/adminAuth";

/**
 * Next.js Edge Middleware
 * 1. Synchronizes Supabase auth session cookies.
 * 2. Enforces strict Role-Based Access Control (RBAC) on /admin routes.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // 1. Initialize Supabase SSR Client for Cookie Session Handling
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { pathname } = request.nextUrl;

  // 2. Strict Protection for the /admin Path
  if (pathname.startsWith("/admin")) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // 2A. Unauthenticated User -> Redirect to /login
    if (authError || !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2B. Check if user is Super Admin by primary email
    const isSuperAdminEmail =
      user.email?.trim().toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase();

    if (!isSuperAdminEmail) {
      // 2C. Query user role from public.profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = profile?.role;
      const hasAdminRole = userRole === "admin" || userRole === "super_admin";

      // Non-Admin User -> Redirect to homepage with 403 Forbidden parameter
      if (profileError || !hasAdminRole) {
        const forbiddenUrl = new URL("/", request.url);
        forbiddenUrl.searchParams.set("error", "unauthorized_admin_access");
        return NextResponse.redirect(forbiddenUrl);
      }
    }
  }

  return response;
}

// 3. Matcher config to filter static assets
export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
