import { NextResponse } from "next/server";

export async function GET() {
  try {
    const resp = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_size: 10 }),
      }
    );

    const data = await resp.json();

    const items = data.results.map((page: any) => {
      const props = page.properties;
      
      return {
        id: page.id,
        title: props.Title?.title[0]?.plain_text || "Untitled",
        sourceType: props["Source Type"]?.select?.name || "Unknown",
        summary: props.Summary?.rich_text?.[0]?.plain_text || "",
        whyItMatters: props["Why It Matters"]?.rich_text?.[0]?.plain_text || "",
        score: props.Score?.number ?? null,
        estimatedTime: props["Estimated Time"]?.number ?? null,
        tags: props.Tags?.multi_select?.map((t: any) => t.name) || [],
        consumed: props.Consumed?.checkbox || false,
        dateAdded: props["Date Added"]?.date?.start || null,
        publicationDate: props["Publication Date"]?.date?.start || null,
        link: props.Link?.url || null,
      };
    });

    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

