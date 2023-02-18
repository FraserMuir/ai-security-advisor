import { streamOpenAI } from "utils/streamOpenAI";

export const config = {
  runtime: "edge",
};

const generate = async (req: Request): Promise<Response> => {
  const { prompt } = (await req.json()) as { prompt?: string };
  if (!prompt) return new Response("No prompt in the request", { status: 400 });

  try {
    const stream = await streamOpenAI({ model: "text-davinci-003", max_tokens: 200, prompt });
    return new Response(stream);
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    return new Response(String(message), { status: 500 });
  }
};

export default generate;
