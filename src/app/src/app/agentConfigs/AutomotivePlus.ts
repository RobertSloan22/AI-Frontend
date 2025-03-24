// simpleExample.ts (or wherever your agent configs live)
import { AgentConfig } from "../types";

/**
 * Combined agent that includes all tools
 * from your refactored conversation code.
 */
const AutomotivePlus: AgentConfig = {
  name: "AutomotivePlus",
  publicDescription: "A full-featured Automotive Agent with all tools",
  instructions: `You are a full-featured Automotive Agent with the following tools:
- set_memory: Save relevant data into memory
- customer_data: Access & manage customer information
- invoice_service: Manage invoices
- logs_service: Access system logs
- search_images: Search for images or diagrams
- web_search: (existing tool) Search the web for vehicle-related information


Tool use: enabled.

Instructions:
- You are Atlas, a professional automotive technician AI assistant
- When starting a conversation, you MUST use exactly this greeting format:
  "Hello, I'm Atlas. How can I assist you with {customerData.firstName} {customerData.lastName}'s appointment for their {vehicleData.year} {vehicleData.make} {vehicleData.model}?"
- Your voice and demeanor should be calm, approachable, and patient
- You have access to the following tools:
  * customer_data_tool: Access customer data, vehicles, and service history
  * vehicle_data_tool: Access vehicle data, parts, and service history
  * invoice_tool: Access invoice data
  * searchImages: Search for relevant images
  * carmd_lookup: Look up vehicle diagnostic information
  * google_search: Search Google for automotive information
  * Invoice_service tool: Generate invoices
  * saved_conversations_tool: Load and save conversations

Tool Success Handling:
- When a tool returns a success status, the results are immediately available
- For image searches:
  * When you receive a success response, the images are already displayed to the user
  * Do not say you failed to retrieve images if you receive a success response
  * Instead, describe the images that were found and ask if they're helpful
- For customer data:
  * When you receive a success response, the customer data is loaded
  * Reference the data directly instead of saying you're trying to retrieve it
- For diagnostic data:
  * When you receive a success response, proceed with analyzing the data
  * Don't ask for confirmation that the data was retrieved

When helping Automotive Technicians:
- Always Start with the greeting format:
  "Hello, I'm Atlas. How can I assist you with {customerData.firstName} {customerData.lastName}'s appointment for their {vehicleData.year} {vehicleData.make} {vehicleData.model}?"
- Provide detailed explanations of:
  * Diagnostic results
  * Diagnostic procedures and equipment needed
  * Repair procedures and equipment needed
  * Maintenance schedules and procedures
  * Part requirements and specifications
- Consider repair difficulty and labor hours when making recommendations;`,
  tools: [
    // 1) set_memory
    {
      type: "function",
      name: "set_memory",
      description: "Saves data into memory for use in context",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", description: "Memory key" },
          value: {
            type: "string",
            description: "Data to store in memory (string or object)"
          }
        },
        required: ["key", "value"]
      }
    },

    // 2) customer_data
    {
      type: "function",
      name: "customer_data",
      description:
        "Access and manage customer information. Can search, view details, or get customer vehicles/history.",
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
            ],
            description: "Action to perform"
          },
          params: {
            type: "object",
            properties: {
              searchTerm: { type: "string" },
              customerId: { type: "string" },
              firstName: { type: "string" },
              lastName: { type: "string" },
              email: { type: "string" },
              phoneNumber: { type: "string" },
              notes: { type: "string" }
            }
          }
        },
        required: ["action", "params"]
      }
    },

    // 3) invoice_service
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
            description: "Action to perform on invoices"
          },
          params: {
            type: "object",
            properties: {
              invoiceId: { type: "string" },
              customerId: { type: "string" },
              vehicleId: { type: "string" },
              customerName: { type: "string" },
              customerEmail: { type: "string" },
              phoneNumber: { type: "string" },
              address: { type: "string" },
              invoiceDate: { type: "string" },
              vehicleType: {
                type: "string",
                enum: ["Car", "Truck", "Van", "SUV", "Other"]
              }
              // ...any additional fields you need
            }
          }
        },
        required: ["action", "params"]
      }
    },

    // 4) logs_service
    {
      type: "function",
      name: "logs_service",
      description: "Access and analyze system logs (e.g., sensors, temperatures)",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["get_logs", "get_latest", "get_stats", "get_by_id"],
            description: "Action for logs"
          },
          params: {
            type: "object",
            properties: {
              page: { type: "number" },
              limit: { type: "number" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              logId: { type: "string" }
            }
          }
        },
        required: ["action"]
      }
    },

    // 5) search_images
    {
      type: "function",
      name: "search_images",
      description: "Search for images/diagrams using Serper or other APIs",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for images or diagrams"
          },
          type: {
            type: "string",
            enum: ["diagram", "part", "repair"],
            description: "Type of image to search for"
          }
        },
        required: ["query"]
      }
    },

    // 6) (Existing) web_search
    {
      type: "function",
      name: "web_search",
      description: "Search the web for vehicle-related information",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query"
          },
          num_results: {
            type: "number",
            description: "Number of results to return (max 5)"
          }
        },
        required: ["query"]
      }
    }
  ]
};

export default [AutomotivePlus];
