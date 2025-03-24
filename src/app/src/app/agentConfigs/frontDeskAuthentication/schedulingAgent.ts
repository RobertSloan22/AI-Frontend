import { AgentConfig } from "../../types";
import axiosInstance from "../../../../../utils/axiosConfig";

// import authenticationAgent from "./authenticationAgent";

/**
 * Typed agent definitions in the style of AgentConfigSet from ../types
 */
const schedulingAgent: AgentConfig = {
  name: "Scheduling Agent",
  publicDescription:
    "Schedules appointments for Harlem Division Auto Repair.",
  instructions: `
# Role and Capabilities
You are the scheduling agent for Harlem Division Auto Repair. You have direct access to the shop's appointment system and can:
- Create new appointments
- View existing appointments
- Update appointments
- Cancel appointments

# Personality and Tone
## Identity
You are a Scheduling Agent for Harlem Division Auto Repair with the ability to directly schedule and manage appointments in the system.

## Task
Your main goal is to schedule and manage appointments for Harlem Division Auto Repair customers. You have direct access to the scheduling system and should use it to help customers.

## Available Services
The shop offers various automotive services including:
- Oil changes
- Brake service
- Tire rotation and balancing
- Engine diagnostics and repair
- Transmission service
- General maintenance
- State inspections
- AC service
- Battery service
- And other common automotive repairs

## Required Information
When scheduling an appointment, always collect:
1. Customer name
2. Phone number
3. Vehicle information
4. Service type
5. Preferred date and time

## Demeanor
You are a friendly and helpful Scheduling Agent who takes pride in efficiently managing the shop's appointments.

## Tone
Professional yet warm and approachable. You should be confident in your ability to schedule appointments since you have direct access to the system.

## Process
1. Greet the customer with: "Thank you for contacting Harlem Division Auto Repair. I'm here to help schedule your appointment."
2. If customer provides appointment details upfront, proceed to schedule using the createAppointment tool
3. If details are missing, ask for:
   - Preferred date and time (if not provided)
   - Type of service needed (if not provided)
   - Customer information (if not provided)
   - Vehicle information (if not provided)
4. Once all information is collected, use the createAppointment tool to schedule the appointment
5. Confirm the appointment details with the customer

## Important Notes
- You have direct access to the scheduling system through your tools - use them!
- Always use the createAppointment tool when you have all required information
- If you need to check availability, use the getAppointments tool
- For changes to existing appointments, use updateAppointment
- For cancellations, use deleteAppointment
`,
  tools: [
    {
      type: "function",
      name: "createAppointment",
      description: "Schedule a new appointment for the customer",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "Date of the appointment in ISO format"
          },
          time: {
            type: "string",
            description: "Time of the appointment"
          },
          serviceType: {
            type: "string",
            description: "Type of service requested"
          },
          customerName: {
            type: "string",
            description: "Name of the customer"
          },
          customerPhone: {
            type: "string",
            description: "Phone number of the customer"
          },
          notes: {
            type: "string",
            description: "Additional notes for the appointment"
          }
        },
        required: ["date", "time", "serviceType", "customerName", "customerPhone"]
      }
    },
    {
      type: "function",
      name: "getAppointments",
      description: "Retrieve all appointments",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      type: "function",
      name: "updateAppointment",
      description: "Update an existing appointment",
      parameters: {
        type: "object",
        properties: {
          appointmentId: {
            type: "string",
            description: "ID of the appointment to update"
          },
          date: {
            type: "string",
            description: "New date of the appointment in ISO format"
          },
          time: {
            type: "string",
            description: "New time of the appointment"
          },
          serviceType: {
            type: "string",
            description: "New type of service"
          },
          customerName: {
            type: "string",
            description: "New name of the customer"
          },
          customerPhone: {
            type: "string",
            description: "New phone number of the customer"
          },
          notes: {
            type: "string",
            description: "New additional notes"
          }
        },
        required: ["appointmentId"]
      }
    },
    {
      type: "function",
      name: "deleteAppointment",
      description: "Delete an existing appointment",
      parameters: {
        type: "object",
        properties: {
          appointmentId: {
            type: "string",
            description: "ID of the appointment to delete"
          }
        },
        required: ["appointmentId"]
      }
    }
  ],
  toolLogic: {
    createAppointment: async (params) => {
      try {
        const response = await axiosInstance.post('/api/appointments', params);
        return {
          success: true,
          data: response.data,
          message: "Appointment scheduled successfully!"
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: "Failed to schedule appointment"
        };
      }
    },
    getAppointments: async () => {
      try {
        const response = await axiosInstance.get('/api/appointments');
        return {
          success: true,
          data: response.data,
          message: "Appointments retrieved successfully!"
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: "Failed to retrieve appointments"
        };
      }
    },
    updateAppointment: async (params) => {
      const { appointmentId, ...updateData } = params;
      try {
        const response = await axiosInstance.put(`/api/appointments/${appointmentId}`, updateData);
        return {
          success: true,
          data: response.data,
          message: "Appointment updated successfully!"
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: "Failed to update appointment"
        };
      }
    },
    deleteAppointment: async (params) => {
      try {
        const response = await axiosInstance.delete(`/api/appointments/${params.appointmentId}`);
        return {
          success: true,
          data: response.data,
          message: "Appointment deleted successfully!"
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: "Failed to delete appointment"
        };
      }
    }
  }
};

export default schedulingAgent;
