// src/agents/AutomotiveAgent.ts
import { AgentConfig } from "../types";
import { baseInstructions, customerToolInstructions } from '../../../../components/assistant/utils/conversation_config';


const AutomotiveAgent: AgentConfig = {
  name: "AutomotivePlus",
  publicDescription: "A full-featured Automotive Agent with all tools",
  instructions: `
    ${baseInstructions}
    ${customerToolInstructions}
    You are Atlas, a professional automotive technician AI assistant. 
    
    You have access to the following tools:
    - customer_data: Access & manage customer information
    - invoice_service: Manage invoices
    - logs_service: Access system logs
    - search_images: Search for automotive diagrams or parts
    - web_search: Search for vehicle-related information
    - set_memory: Save and recall context
    - carmd_lookup: Retrieve diagnostic information
    - saved_conversations: Load and save past interactions

    Instructions:
    - Always greet the user using their customer and vehicle details if available.
    - Provide expert diagnostic and repair insights.
    - Consider repair complexity and labor time when making recommendations.
  `,
  tools: [
    // 1. Memory Management
    {
      type: "function",
      name: "set_memory",
      description: "Saves context in memory",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", description: "Memory key" },
          value: { type: "string", description: "Data to store" }
        },
        required: ["key", "value"]
      }
    },
    // 2. Customer Data
    {
      type: "function",
      name: "customer_data",
      description: "Manage customer information, vehicles, and history",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: [
              "search",
              "get_customer_details",
              "get_customer_vehicles",
              "get_customer_history",
              "create_customer"
            ]
          },
          params: { type: "object" }
        },
        required: ["action", "params"]
      }
    },
    // 3. Invoice Service
    {
      type: "function",
      name: "invoice_service",
      description: "Manage invoices (create, update, retrieve)",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["create", "update", "get", "list", "search"] },
          params: { type: "object" }
        },
        required: ["action"]
      }
    },
    // 4. Logs Service
    {
      type: "function",
      name: "logs_service",
      description: "Access and analyze system logs (e.g., sensor readings)",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["get_logs", "get_latest", "get_stats", "get_by_id"] },
          params: { type: "object" }
        },
        required: ["action"]
      }
    },
    // 5. Image Search
    {
      type: "function",
      name: "search_images",
      description: "Find images, diagrams, and repair visuals",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          type: { type: "string", enum: ["diagram", "part", "repair"] }
        },
        required: ["query"]
      }
    },
    // 6. Web Search
    {
      type: "function",
      name: "web_search",
      description: "Find vehicle-related information from the web",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          num_results: { type: "number" }
        },
        required: ["query"]
      }
    }
  ]
};

export default [AutomotiveAgent];
