import { NextResponse, type NextRequest } from "next/server";
import { publicUrl } from "@/lib/public-url";

export function GET(request: NextRequest) {
  // OAuth failures land here whenever an error redirect is missing; forward
  // the reason to the sign-in page instead of a silent 401 bounce later.
  if (
    request.nextUrl.searchParams.has("error") ||
    request.nextUrl.searchParams.has("error_description")
  ) {
    return NextResponse.redirect(publicUrl("/sign-in?error=oauth", request));
  }
  // Success carries ?welcome=1 so the workspace can greet once; the param
  // strips itself after the toast.
  return NextResponse.redirect(publicUrl("/dashboard?welcome=1", request));
}
