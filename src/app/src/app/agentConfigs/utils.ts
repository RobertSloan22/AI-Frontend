import { AgentConfig, Tool } from "../types";

/**
 * If you want certain tools to appear on *all* agents, define them here.
 * For example, these might match the "set_memory", "invoice_service",
 * "logs_service", etc. from your refactored code.
 */
const UNIVERSAL_TOOLS: Tool[] = [
  {
    type: "function",
    name: "set_memory",
    description: "Saves data into memory for use in conversation context",
    parameters: {
      type: "object",
      properties: {
        key: { type: "string", description: "Memory key" },
        value: {
          type: "string",
          description: "Data to store in memory (string or object)",
        },
      },
      required: ["key", "value"],
    },
  },
  {
    type: "function",
    name: "get_research_data",
    description: "Retrieves the current vehicle research data including problem description, diagnostic steps, causes, fixes, and detailed analysis",
    parameters: {
      type: "object",
      properties: {
        dataType: {
          type: "string",
          enum: ["all", "problem", "research", "detailed"],
          description: "Type of research data to retrieve",
        }
      },
      required: ["dataType"],
    },
  },
  {
    type: "function",
    name: "invoice_service",
    description: "Manage invoices including creation, updates, and retrieval",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["create", "update", "get", "list", "search", "vehicles"],
        },
        params: {
          type: "object",
          properties: {
            invoiceId: { type: "string" },
            customerId: { type: "string" },
            vehicleMake: { type: "string"},
            vehicleVin: { type: "string"},
            vehicleYear: {type: "number"}
            // ...and so on
          },
        },
      },
      required: ["action", "params"],
    },
  },
  {
    type: "function",
    name: "logs_service",
    description: "Access and analyze system logs",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["get_logs", "get_latest", "get_stats", "get_by_id"],
        },
        params: {
          type: "object",
          properties: {
            page: { type: "number" },
            limit: { type: "number" },
            startDate: { type: "string" },
            endDate: { type: "string" },
            logId: { type: "string" },
          },
        },
      },
      required: ["action"],
    },
  },
  {
    type: "function",
    name: "search_images",
    description: "Search for images/diagrams using external APIs",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        type: {
          type: "string",
          enum: ["diagram", "part", "repair"],
        },
      },
      required: ["query"],
    },
  },
  // ... Add any more "universal" tools here ...
];

/**
 * This modifies each agentDef by:
 * 1) Adding the universal tools (if not already present).
 * 2) Adding a 'transferAgents' tool if downstreamAgents exist.
 *
 * Finally, it strips the downstreamAgents to prevent circular references
 * (only name/publicDescription are preserved).
 */
export function injectTransferTools(agentDefs: AgentConfig[]): AgentConfig[] {
  agentDefs.forEach((agentDef) => {
    // Ensure the agent has a tools array
    if (!agentDef.tools) {
      agentDef.tools = [];
    }

    // -----------------------------------------------------------------
    // (A) Merge in universal tools (avoid duplicates by name)
    // -----------------------------------------------------------------
    UNIVERSAL_TOOLS.forEach((universalTool) => {
      const alreadyHasTool = agentDef.tools?.some(
        (existing) => existing.name === universalTool.name
      );
      if (!alreadyHasTool) {
        agentDef.tools.push(universalTool);
      }
    });

    // -----------------------------------------------------------------
    // (B) If downstreamAgents exist, inject a transferAgent tool
    // -----------------------------------------------------------------
    const downstreamAgents = agentDef.downstreamAgents || [];
    if (downstreamAgents.length > 0) {
      // Build a list of downstream agents for the tool description
      const availableAgentsList = downstreamAgents
        .map(
          (dAgent) =>
            `- ${dAgent.name}: ${dAgent.publicDescription ?? "No description"}`
        )
        .join("\n");

      // Create the transferAgentTool for this agent
      const transferAgentTool: Tool = {
        type: "function",
        name: "transferAgents",
        description: `Triggers a transfer of the user to a more specialized agent.
Only call this if one of the available agents is more appropriate than you.
Let the user know you're transferring them first.
Available Agents:
${availableAgentsList}`,
        parameters: {
          type: "object",
          properties: {
            rationale_for_transfer: {
              type: "string",
              description: "Reasoning for this transfer.",
            },
            conversation_context: {
              type: "string",
              description: `Relevant context to send to the new agent (customer/vehicle info, etc.)`,
            },
            destination_agent: {
              type: "string",
              description:
                "The downstream agent that should handle the user's request.",
              enum: downstreamAgents.map((dAgent) => dAgent.name),
            },
          },
          required: [
            "rationale_for_transfer",
            "conversation_context",
            "destination_agent",
          ],
        },
      };

      // Add transferAgentTool if not already present
      const alreadyHasTransferTool = agentDef.tools.some(
        (tool) => tool.name === "transferAgents"
      );
      if (!alreadyHasTransferTool) {
        agentDef.tools.push(transferAgentTool);
      }
    }

    // -----------------------------------------------------------------
    // (C) Convert downstreamAgents to a minimal form
    // -----------------------------------------------------------------
    agentDef.downstreamAgents = agentDef.downstreamAgents?.map(
      ({ name, publicDescription }) => ({ name, publicDescription })
    );
  });

  return agentDefs;
}
