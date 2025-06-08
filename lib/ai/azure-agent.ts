import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

const endpoint = process.env.AZURE_PROJECTS_ENDPOINT!;
const agentId = process.env.AZURE_AGENT_ID!;
const threadId = process.env.AZURE_THREAD_ID!;

export async function runAgentConversation(userMessage: string) {
  const project = new AIProjectClient(endpoint, new DefaultAzureCredential());
  const agent = await project.agents.getAgent(agentId);
  const thread = await project.agents.threads.get(threadId);
  await project.agents.messages.create(thread.id, "user", userMessage);
  let run = await project.agents.runs.create(thread.id, agent.id);
  while (run.status === "queued" || run.status === "in_progress") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await project.agents.runs.get(thread.id, run.id);
  }
  if (run.status === "failed") {
    throw new Error(`Run failed: ${run.lastError}`);
  }
  const messages = await project.agents.messages.list(thread.id, { order: "asc" });
  const result: { role: string; text: string }[] = [];
  for await (const m of messages) {
    // Use unknown, but cast to Record<string, unknown> for safe property access
    const textContent = m.content.find((c: unknown): c is { type: "text"; text: { value: string } } => {
      if (typeof c !== "object" || c === null) return false;
      const obj = c as Record<string, unknown>;
      return obj.type === "text" &&
        typeof obj.text === "object" && obj.text !== null &&
        typeof (obj.text as Record<string, unknown>).value === "string";
    });
    if (textContent) {
      result.push({ role: m.role, text: textContent.text.value });
    }
  }
  return result;
}
