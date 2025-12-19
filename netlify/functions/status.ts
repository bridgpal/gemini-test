import { getStore } from "@netlify/blobs";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response("Missing ID", { status: 400 });
  }

  const store = getStore("restorations");
  const resultKey = `${id}-result`;
  
  try {
    // Check if result already exists
    const resultMetadata = await store.getMetadata(resultKey);
    if (resultMetadata) {
       return new Response(JSON.stringify({
        status: "completed",
        imageUrl: `/.netlify/functions/serve?id=${id}&type=result`
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // If not, we need to generate it.
    // First, get original
    const originalKey = `${id}-original`;
    // We need the data to send to Gemini
    const originalBlob = await store.get(originalKey, { type: "arrayBuffer" }); 
    const originalMetadata = await store.getMetadata(originalKey);

    if (!originalBlob || !originalMetadata) {
      return new Response("Original not found", { status: 404 });
    }

    // Call Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // Using gemini-2.5-flash-image (Nano Banana)
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" }); 
            
            const prompt = (originalMetadata.metadata?.prompt as string) || "Restore this image";
            const contentType = (originalMetadata.metadata?.contentType as string) || "image/jpeg";
            const base64Image = Buffer.from(originalBlob).toString("base64");

            // We await the call to ensure it works.
            const result = await model.generateContent([
                prompt,
                { inlineData: { data: base64Image, mimeType: contentType } }
            ]);
            
            const response = result.response;
            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

            if (imagePart && imagePart.inlineData) {
                const generatedImageBase64 = imagePart.inlineData.data;
                const generatedImageMime = imagePart.inlineData.mimeType;
                const generatedImageBuffer = Buffer.from(generatedImageBase64, "base64");
                
                // Convert Buffer to ArrayBuffer for store.set
                const arrayBuffer = generatedImageBuffer.buffer.slice(
                    generatedImageBuffer.byteOffset, 
                    generatedImageBuffer.byteOffset + generatedImageBuffer.byteLength
                );

                await store.set(resultKey, arrayBuffer, {
                    metadata: {
                        contentType: generatedImageMime,
                        generatedBy: "gemini-2.5-flash-image"
                    }
                });

                return new Response(JSON.stringify({
                    status: "completed",
                    imageUrl: `/.netlify/functions/serve?id=${id}&type=result`
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            // Log response text for debugging/metadata if no image found
            try {
                const text = response.text();
                console.log("Gemini response text:", text);
            } catch (e) {
                console.log("No text in Gemini response");
            }

        } catch (e) {
            console.error("Gemini call failed:", e);
            // Continue to save result so the user isn't stuck
        }
    } else {
        console.log("No GEMINI_API_KEY found, skipping AI call.");
    }

    // Save result (Original image as placeholder)
    await store.set(resultKey, originalBlob, {
        metadata: {
            contentType: originalMetadata.metadata?.contentType,
            generatedBy: "gemini-fallback"
        }
    });

    return new Response(JSON.stringify({
      status: "completed",
      imageUrl: `/.netlify/functions/serve?id=${id}&type=result`
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