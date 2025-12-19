import { getStore } from "@netlify/blobs";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return new Response("No image uploaded", { status: 400 });
    }

    const id = uuidv4();
    const store = getStore("restorations");
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await image.arrayBuffer();

    // Store the initial state
    // We store the image data in a blob named `{id}-original`
    await store.set(`${id}-original`, arrayBuffer, {
      metadata: {
        contentType: image.type,
        uploadedAt: new Date().toISOString(),
        status: "processing",
        prompt: "Ultra-realistic recreation of an old vintage photo, keeping the same original face (99% likeness, no alteration). Transform into a modern high-quality digital portrait with vibrant updated colors, smooth realistic skin textures, and natural lighting. Try not to change any clothing or accessories"
      }
    });

    return new Response(JSON.stringify({ id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
