import { NextResponse } from "next/server";
import { getInventoryMap } from "@/lib/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public read-only endpoint so client components (cart drawer/page) can show
// the same live discounted price/stock that checkout will actually charge —
// a Map isn't JSON-serializable, so this flattens it to a plain object.
export async function GET() {
  const inventory = await getInventoryMap();
  const data: Record<string, { quantity: number | null; discountPercent: number }> = {};
  for (const [slug, entry] of inventory) {
    data[slug] = entry;
  }
  return NextResponse.json(data);
}
