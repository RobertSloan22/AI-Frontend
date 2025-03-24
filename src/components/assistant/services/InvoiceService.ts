import { Tool } from "@langchain/core/tools";
import axiosInstance from '../../../utils/axiosConfig';

interface InvoiceToolInput {
  action: string;
  params: Record<string, any>;
}

export class InvoiceServiceTool extends Tool {
  name = "invoice_service";
  description = "Manage invoices including creation, updates, and retrieval of invoice information.";

  async _call(input: InvoiceToolInput): Promise<string> {
    try {
      const { action, params } = input;
      console.log('🔧 Invoice Service Tool Called:', { action, params });

      switch (action.toLowerCase()) {
        case 'create':
          if (!params.customerId || !params.vehicleId) {
            return "Customer ID and Vehicle ID are required";
          }
          const createResponse = await axiosInstance.post('/invoices/create', params);
          return this.formatInvoiceData(createResponse.data);

        case 'vehicles':
          if (!params.customerId) {
            return "Customer ID is required to fetch vehicles";
          }
          const vehiclesResponse = await axiosInstance.get(`/customers/${params.customerId}/vehicles`);
          return this.formatVehicleList(vehiclesResponse.data);

        case 'update':
          if (!params.invoiceId) {
            return "Invoice ID is required for updates";
          }
          const updateResponse = await axiosInstance.put(`/invoices/${params.invoiceId}`, params);
          return this.formatInvoiceData(updateResponse.data);

        case 'get':
          if (!params.invoiceId) {
            return "Invoice ID is required";
          }
          const getResponse = await axiosInstance.get(`/invoices/${params.invoiceId}`);
          return this.formatInvoiceData(getResponse.data);

        case 'list':
          const listResponse = await axiosInstance.get('/invoices');
          return this.formatInvoiceList(listResponse.data);

        case 'search':
          if (!params.searchTerm) {
            return "Search term is required";
          }
          const searchResponse = await axiosInstance.get('/invoices/search', {
            params: { term: params.searchTerm }
          });
          return this.formatInvoiceList(searchResponse.data);

        default:
          return `Unhandled action type: ${action}. Available actions: create, update, get, list, search, vehicles`;
      }
    } catch (error) {
      console.error('Error in InvoiceServiceTool:', error);
      return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    }
  }

  private formatInvoiceData(invoice: any): string {
    return `
Invoice #${invoice._id || invoice.id}
Customer: ${invoice.customerName}
Date: ${invoice.invoiceDate}
Total Amount: $${invoice.totalAmount}
Status: ${invoice.invoiceStatus}
Services: ${invoice.serviceDescription || 'N/A'}
    `.trim();
  }

  private formatInvoiceList(invoices: any[]): string {
    if (!invoices?.length) return "No invoices found";
    return invoices.map(invoice => this.formatInvoiceData(invoice)).join('\n\n');
  }

  private formatVehicleList(vehicles: any[]): string {
    if (!vehicles?.length) return "No vehicles found";
    return vehicles.map(vehicle => `
Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}
VIN: ${vehicle.vin}
Mileage: ${vehicle.mileage}
Color: ${vehicle.color}
Engine: ${vehicle.engine}
    `.trim()).join('\n\n');
  }
}


