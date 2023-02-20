import { z } from "zod";
import { hasError, safePromise } from "../utils";
import { streamOpenAI } from "./stream";

export async function POST(req: Request) {
  const bodySchema = z.object({ name: z.string().max(25), size: z.coerce.number().min(0), industry: z.string().max(25) });
  const parseResult = await safePromise(req.json().then(bodySchema.parse));
  if (hasError(parseResult)) return new Response(parseResult.error, { status: 400 });

  const { name, size, industry } = parseResult.data;
  const prompt = generatePrompt(name, size, industry);
  const streamResult = await safePromise(streamOpenAI({ model: "text-davinci-003", max_tokens: 1000, prompt }));
  if (hasError(streamResult)) return new Response(streamResult.error, { status: 500 });

  return new Response(streamResult.data);
}

const generatePrompt = (name: string, size: number, industry: string) => {
  return `List some cyber security recommendations, including principals, tooling and potential hires (with expected salary) you would make for a company in the ${industry} industry called ${name} with around ${size} employees. Format like:
  1. [recommendation] -- [why it's important for Quorum Cyber]
  2. [recommendation] -- [why it's important for Quorum Cyber]
 ...`;
};
