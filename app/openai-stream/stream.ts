import type { CreateCompletionRequest } from "openai";

export async function streamOpenAI(options: CreateCompletionRequest) {
  const response = await fetch("https://api.openai.com/v1/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify({ stream: true, ...options }),
  });
  if (!response.ok || !response.body) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  return response.body.pipeThrough(openAIStreamParser());
}

const openAIStreamParser = () => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  return new TransformStream({
    transform(chunk: Uint8Array, controller: TransformStreamDefaultController) {
      const chunkString = decoder.decode(chunk);
      const event = chunkString.trim().split("data: ")[1];
      if (event === "[DONE]") return controller.terminate();
      const data = JSON.parse(event);
      const text = data.choices[0].text;
      const result = encoder.encode(text);
      controller.enqueue(result);
    },
  });
};
