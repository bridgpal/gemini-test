import { getStore } from "@netlify/blobs";

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response("Missing ID", { status: 400 });
  }

  const store = getStore("restorations");
  const key = `${id}-original`;
  
  try {
    const metadata = await store.getMetadata(key);

    if (!metadata) {
      return new Response("Not found", { status: 404 });
    }

    const uploadedAt = new Date(metadata.metadata.uploadedAt as string).getTime();
    const now = Date.now();
    const timeDiff = now - uploadedAt;

    // Simulate 5 seconds processing time
    const isComplete = timeDiff > 5000;
    const status = isComplete ? "completed" : "processing";

    // In a real app, we would have a separate blob for the result.
    // Here we just return the original as the result if complete.
    
    return new Response(JSON.stringify({
      status,
      // If complete, provide a URL to fetch the image. 
      // We can create a separate function to serve the blob or just use a data URI mechanism on frontend if small.
      // But better: let's make a `serve` function or just reuse this endpoint to get data?
      // Standard pattern: return a URL.
      // We will create a `serve` function next.
      imageUrl: isComplete ? `/api/serve?id=${id}&type=original` : null
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Check failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
