import { NextResponse } from "next/server"
import { getNavigationSettingsFromCms } from "@/lib/cms"

export const runtime = "nodejs"

export async function GET() {
  const settings = await getNavigationSettingsFromCms()
  return NextResponse.json(
    {
      ok: true,
      data: settings,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  )
}
