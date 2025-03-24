import axiosInstance from '../utils/axiosConfig';
// This Service Sends the Eliza Agent the User Data
class AgentService {
    constructor() {
        // Update the proxy endpoint to match the backend route
        this.proxyEndpoint = '/agentproxy';  // Add /api prefix
    }

    async sendMessage(text, agentName = 'Atlas', userId = null) {
        try {
            const response = await axiosInstance.post(`${this.proxyEndpoint}/message`, {
                text,
                agentName,
                userId,
            });
            
            return response.data;
        } catch (error) {
            console.error('Error sending message to agent:', error);
            throw error;
        }
    }

    // Format and send comprehensive data to agent
    async sendComprehensiveData(customer, vehicle, invoices, researchData) {
        const formattedData = this.formatComprehensiveData(customer, vehicle, invoices, researchData);
        return this.sendMessage(formattedData, 'car', customer?._id);
    }

    // Format comprehensive data into a structured text message
    formatComprehensiveData(customer, vehicle, invoices, researchData) {
        let formattedText = "=== COMPREHENSIVE VEHICLE AND CUSTOMER DATA ===\n\n";

        // Customer Information
        if (customer) {
            formattedText += "CUSTOMER INFORMATION:\n";
            formattedText += `Name: ${customer.firstName} ${customer.lastName}\n`;
            if (customer.email) formattedText += `Email: ${customer.email}\n`;
            if (customer.phone) formattedText += `Phone: ${customer.phone}\n`;
            formattedText += "\n";
        }

        // Vehicle Information
        if (vehicle) {
            formattedText += "VEHICLE INFORMATION:\n";
            formattedText += `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}\n`;
            formattedText += `VIN: ${vehicle.vin}\n`;
            if (vehicle.engine) formattedText += `Engine: ${vehicle.engine}\n`;
            if (vehicle.transmission) formattedText += `Transmission: ${vehicle.transmission}\n`;
            if (vehicle.mileage) formattedText += `Mileage: ${vehicle.mileage}\n`;
            formattedText += "\n";
        }

        // Invoice History
        if (invoices?.length > 0) {
            formattedText += "INVOICE HISTORY:\n";
            invoices.forEach(invoice => {
                const date = new Date(invoice.invoiceDate).toLocaleDateString();
                formattedText += `- Date: ${date}\n`;
                formattedText += `  Total: $${invoice.total?.toFixed(2) || '0.00'}\n`;
                if (invoice.services?.length) {
                    formattedText += `  Services: ${invoice.services.join(", ")}\n`;
                }
                if (invoice.notes) {
                    formattedText += `  Notes: ${invoice.notes}\n`;
                }
                formattedText += "\n";
            });
        }

        // Research Data
        if (researchData) {
            formattedText += "VEHICLE RESEARCH DATA:\n";
            
            // Diagnostic Steps
            if (researchData.diagnosticSteps?.length) {
                formattedText += "\nDiagnostic Steps:\n";
                researchData.diagnosticSteps.forEach((step, index) => {
                    formattedText += `${index + 1}. ${step.step}\n`;
                    formattedText += `   Details: ${step.details}\n`;
                    if (step.tools?.length) {
                        formattedText += `   Tools Required: ${step.tools.join(", ")}\n`;
                    }
                });
            }

            // Possible Causes
            if (researchData.possibleCauses?.length) {
                formattedText += "\nPossible Causes:\n";
                researchData.possibleCauses.forEach((cause, index) => {
                    formattedText += `${index + 1}. ${cause.cause} (${cause.likelihood})\n`;
                    formattedText += `   Explanation: ${cause.explanation}\n`;
                });
            }

            // Recommended Fixes
            if (researchData.recommendedFixes?.length) {
                formattedText += "\nRecommended Fixes:\n";
                researchData.recommendedFixes.forEach((fix, index) => {
                    formattedText += `${index + 1}. ${fix.fix}\n`;
                    formattedText += `   Difficulty: ${fix.difficulty}\n`;
                    formattedText += `   Estimated Cost: ${fix.estimatedCost}\n`;
                    if (fix.professionalOnly) {
                        formattedText += `   ⚠️ Professional Installation Required\n`;
                    }
                });
            }

            // Technical Notes
            if (researchData.technicalNotes) {
                formattedText += "\nTechnical Notes:\n";
                if (researchData.technicalNotes.commonIssues?.length) {
                    formattedText += "Common Issues:\n";
                    researchData.technicalNotes.commonIssues.forEach(issue => {
                        formattedText += `- ${issue}\n`;
                    });
                }
                if (researchData.technicalNotes.recalls?.length) {
                    formattedText += "\nRecalls:\n";
                    researchData.technicalNotes.recalls.forEach(recall => {
                        formattedText += `- ${recall}\n`;
                    });
                }
            }
        }

        return formattedText;
    }

    // Helper methods for specific queries
    async getVehicleData(query) {
        return this.sendMessage(`fetch vehicle data ${query}`);
    }

    async searchCustomer(searchTerm) {
        return this.sendMessage(`search for customer ${searchTerm}`);
    }

    async getMaintenanceLogs(vehicleId) {
        return this.sendMessage(`check maintenance logs for vehicle ${vehicleId}`);
    }

    async getDiagnosticInfo(code) {
        return this.sendMessage(`get diagnostic information for code ${code}`);
    }

    async getServiceRecommendations(vehicleData) {
        return this.sendMessage(`recommend services based on ${JSON.stringify(vehicleData)}`);
    }

    async getTechnicianSuggestions(serviceType) {
        return this.sendMessage(`suggest technicians for ${serviceType} service`);
    }

    // New method to fetch and send all relevant data
    async sendAllVehicleData(customer, vehicle) {
        try {
            // Fetch invoices
            const invoicesResponse = await axiosInstance.get(`/invoices/customer/${customer._id}`);
            const invoices = invoicesResponse.data;

            // Fetch vehicle research data if available
            let researchData = null;
            try {
                const researchResponse = await axiosInstance.get(`/research`, {
                    params: {
                        vin: vehicle.vin,
                        year: vehicle.year,
                        make: vehicle.make,
                        model: vehicle.model
                    }
                });
                researchData = researchResponse.data;
            } catch (error) {
                console.warn('Vehicle research data not available:', error);
            }

            // Send comprehensive data to agent
            return this.sendComprehensiveData(customer, vehicle, invoices, researchData);
        } catch (error) {
            console.error('Error fetching and sending vehicle data:', error);
            throw error;
        }
    }
}

export const agentService = new AgentService(); 