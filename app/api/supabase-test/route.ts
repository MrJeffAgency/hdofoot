import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabaseUrlConfigured:
      !!process.env.NEXT_PUBLIC_SUPABASE_URL,

    supabaseKeyConfigured:
      !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,

    supabaseUrl:
      process.env.NEXT_PUBLIC_SUPABASE_URL
        ? process.env.NEXT_PUBLIC_SUPABASE_URL.replace(
            /^https?:\/\//,
            ""
          )
        : null,
  });
}
