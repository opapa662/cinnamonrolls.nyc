import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("cr_admin")?.value;
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.redirect(new URL("/admin-opdl-stfrancis/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin-opdl-stfrancis",
    "/admin-opdl-stfrancis/((?!login).*)",
    "/ig-generator",
    "/ig-generator/(.*)",
  ],
};
