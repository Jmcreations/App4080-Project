import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing or invalid URL" }, { status: 400 });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: 400 });
    }

    const text = await response.text();
    return NextResponse.json({ data: text }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching ICS link:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
