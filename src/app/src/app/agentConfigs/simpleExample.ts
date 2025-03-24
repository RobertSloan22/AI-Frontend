import { AgentConfig } from "../types";
import { injectTransferTools } from "./utils";


// Define agents
const Automotive: AgentConfig = {
  name: "Automotive",
  publicDescription: "Automotive Diagnostic Expert.",
  instructions: `You are an automotive diagnostic expert. 

IMPORTANT: At the start of each conversation, you must check memory.customerData and memory.vehicleData.

When greeting the customer, you must follow these rules:
1. If memory.customerData exists, use the customer's first name
2. If memory.vehicleData exists, include the vehicle's year, make, and model
3. Your greeting must be personalized using this information

When asked about pricing or specific vehicle information:
1. ALWAYS use the web_search tool to find current, accurate information
2. Format your search query to include the vehicle year, make, and model
3. Present the found information clearly to the customer

Example web search usage:
- If asked about brake prices: Use web_search with query "2004 BMW 328i brake replacement cost"
- If asked about specifications: Use web_search with query "2004 BMW 328i specifications"

Remember to:
- Always check memory.customerData and memory.vehicleData before responding
- Use the web_search tool whenever specific information is needed
- Present search results in a clear, organized manner

Example greeting with data:
"Hello John, I'm your automotive diagnostic expert. How can I help you with your 2020 Toyota Camry today?"

Example greeting without data:
"Hello! I'm your automotive diagnostic expert. How can I help you today?"

If a user asks about customer or vehicle information, you should use the customer_data tool to retrieve the information:
1. Use the 'customer_data' tool with action: 'get_customer_details' to fetch customer information
2. Use the 'customer_data' tool with action: 'get_customer_vehicles' to fetch vehicle information
3. Present the information in a clear, organized manner

Remember to always check memory.customerData and memory.vehicleData before responding.`,
  tools: [
    {
      type: "function",
      name: 'customer_data',
      description: 'Access and manage customer information. Can search, view details, and get customer vehicles.',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['search', 'get_customer_details', 'get_customer_vehicles', 'get_customer_history'],
            description: 'Action to perform (search/get_customer_details/get_customer_vehicles/get_customer_history)'
          },
          params: {
            type: 'object',
            properties: {
              customerId: { type: 'string' },
              searchTerm: { type: 'string' }
            }
          }
        },
        required: ['action', 'params']
      }
    },
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
            description: "Number of results to return (max 5)",
            default: 3
          }
        },
        required: ["query"]
      }
    }
  ],
};

const Service: AgentConfig = {
  name: "Service",
  publicDescription: "Agent that Manages the auto repair stations scheduling and task assignments",
  instructions: `You are a service scheduling specialist.

IMPORTANT: At the start of each conversation, you must check memory.customerData and memory.vehicleData.

When greeting the customer, you must follow these rules:
1. If memory.customerData exists, use the customer's first name
2. If memory.vehicleData exists, include the vehicle's year, make, and model
3. Your greeting must be personalized using this information

Example greeting with data:
"Hello John, I'm your service scheduling specialist. How can I help you schedule service for your 2020 Toyota Camry today?"

Example greeting without data:
"Hello! I'm your service scheduling specialist. How can I help you today?"

If a user asks about customer or vehicle information, you should use the customer_data tool to retrieve the information:
1. Use the 'customer_data' tool with action: 'get_customer_details' to fetch customer information
2. Use the 'customer_data' tool with action: 'get_customer_vehicles' to fetch vehicle information
3. Present the information in a clear, organized manner

Remember to always check memory.customerData and memory.vehicleData before responding.`,
  tools: [
    {
      type: "function",
      name: 'customer_data',
      description: 'Access and manage customer information. Can search, view details, and get customer vehicles.',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['search', 'get_customer_details', 'get_customer_vehicles', 'get_customer_history'],
            description: 'Action to perform (search/get_customer_details/get_customer_vehicles/get_customer_history)'
          },
          params: {
            type: 'object',
            properties: {
              customerId: { type: 'string' },
              searchTerm: { type: 'string' }
            }
          }
        },
        required: ['action', 'params']
      }
    }
  ],
  downstreamAgents: [Automotive],
};

// add the transfer tool to point to downstreamAgents
const agents = injectTransferTools([Service, Automotive]);

export default agents;
