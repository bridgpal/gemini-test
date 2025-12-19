import { GoogleGenAI } from "@google/genai";

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const prompt = formData.get("prompt") as string ||
      "Ultra-realistic recreation of an old vintage photo, keeping the same original face (99% likeness, no alteration). Transform into a modern high-quality digital portrait with vibrant updated colors, smooth realistic skin textures, and natural lighting. Try not to change any clothing or accessories";

    if (!image) {
      return new Response(JSON.stringify({ error: "No image uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = image.type || "image/jpeg";

    console.log("Calling Gemini 2.5 Flash Image with prompt:", prompt.substring(0, 100));

    const ai = new GoogleGenAI({ apiKey });

    // Call Gemini with the correct format for image generation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts || [];

    console.log("Gemini response parts count:", parts.length);
    parts.forEach((p: any, i: number) => {
      console.log(`Part ${i}: hasText=${!!p.text}, hasInlineData=${!!p.inlineData}`);
    });

    // Find the generated image in the response
    const imagePart = parts.find((p: any) => p.inlineData);

    if (imagePart && imagePart.inlineData?.data) {
      const generatedImageBase64 = imagePart.inlineData.data;
      const generatedMimeType = imagePart.inlineData.mimeType || "image/png";

      console.log("Image generated successfully, mime:", generatedMimeType, "base64 length:", generatedImageBase64.length);

      // Return the generated image as a data URL
      const dataUrl = `data:${generatedMimeType};base64,${generatedImageBase64}`;

      // Get any text response
      const textPart = parts.find((p: any) => p.text);
      const responseText = textPart?.text || "";

      return new Response(JSON.stringify({
        success: true,
        imageUrl: dataUrl,
        text: responseText,
        model: "gemini-2.5-flash-image"
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // If no image was generated, log the text response for debugging
    const textPart = parts.find((p: any) => p.text);
    if (textPart) {
      console.log("No image generated. Text response:", textPart.text);
    }

    return new Response(JSON.stringify({
      success: false,
      error: "No image was generated",
      text: textPart?.text || "No response from model"
    }), {
      status: 422,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Restore error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to process image",
      details: errorMessage
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
