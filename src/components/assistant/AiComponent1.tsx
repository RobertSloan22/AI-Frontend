import OpenAI from "openai";
const openai = new OpenAI();
const OPENAI_API_KEY: string = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Missing VITE_OPENAI_API_KEY environment variable');
}
async function main() {
  const assistant = await openai.beta.assistants.create({
    name: "Math Tutor",
    instructions: "You are a personal math tutor. Write and run code to answer math questions.",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4o"
  });
}

main();