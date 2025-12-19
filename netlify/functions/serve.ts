import { getStore } from "@netlify/blobs";

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const type = url.searchParams.get("type") || "original"; // original or result

  if (!id) {
    return new Response("Missing ID", { status: 400 });
  }

  const store = getStore("restorations");
  const key = `${id}-${type}`; // e.g. uuid-original
  
  try {
    const result = await store.getWithMetadata(key, { type: "stream" });

    if (!result) {
      // Fallback: if result requested but not found (logic issue?), return original
      if (type === 'result') {
         const fallback = await store.getWithMetadata(`${id}-original`, { type: "stream" });
         if (fallback?.data) {
             return new Response(fallback.data as ReadableStream, {
                headers: { "Content-Type": fallback.metadata.contentType as string }
             });
         }
      }
      return new Response("Not found", { status: 404 });
    }

    const { data, metadata } = result;

    return new Response(data as ReadableStream, {
      headers: { "Content-Type": metadata.contentType as string }
    });

  } catch (error) {
    console.error(error);
    return new Response("Error serving image", { status: 500 });
  }
}
