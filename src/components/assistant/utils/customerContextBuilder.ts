import { CustomerInfo, Vehicle } from '../../../types';

export const buildCustomerContext = (customer: CustomerInfo | null): string => {
  if (!customer) {
    return `No customer currently selected. You can:
    - Search for customers using the customer_data tool with 'search' action
    - Create a new customer using the customer_data tool with 'create' action
    - View all customers using the customer_data tool with 'list' action`;
  }

  // Get the primary/active vehicle or first vehicle in the list
  const primaryVehicle = customer.vehicles?.find(v => v.status === 'active') || customer.vehicles?.[0];

  // Format the customer data object exactly as expected by the greeting
  const customerData = {
    firstName: customer.firstName,
    lastName: customer.lastName
  };

  // Format the vehicle data object exactly as expected by the greeting
  const vehicleData = primaryVehicle ? {
    year: primaryVehicle.year,
    make: primaryVehicle.make,
    model: primaryVehicle.model
  } : null;

  // Set the memory context that the AI uses for the greeting
  const memoryContext = `
customerData = ${JSON.stringify(customerData)};
vehicleData = ${JSON.stringify(vehicleData)};
`;

  const vehicleDetails = customer.vehicles?.map(vehicle => `
    ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}
    - VIN: ${vehicle.vin}
    - License Plate: ${vehicle.licensePlate}
    - Mileage: ${vehicle.mileage.toLocaleString()}
    - Engine: ${vehicle.engine}
    - Transmission: ${vehicle.transmission}
    - Fuel Type: ${vehicle.fuelType}
    - Status: ${vehicle.status}
    ${vehicle.notes ? `- Notes: ${vehicle.notes}` : ''}`
  ).join('\n\n') || 'No vehicles registered';

  return `${memoryContext}

Current Customer Context:
Customer Information:
- Name: ${customer.firstName} ${customer.lastName}
- Email: ${customer.email || 'Not provided'}
- Phone: ${customer.phoneNumber || 'Not provided'}
${customer.workphoneNumber ? `- Work Phone: ${customer.workphoneNumber}` : ''}
${customer.address ? `- Address: ${customer.address}, ${customer.city} ${customer.zipCode}` : ''}
${customer.preferredContact ? `- Preferred Contact Method: ${customer.preferredContact}` : ''}
${customer.notes ? `- Customer Notes: ${customer.notes}` : ''}

Vehicles:
${vehicleDetails}

Available Actions:
- Use customer_data tool with 'details' action to get full customer details
- Use customer_data tool with 'vehicles' action to get detailed vehicle information
- Use customer_data tool with 'history' action to get service history
- Use get_repair_history tool to get specific vehicle repair history
- Use log_repair_history tool to record new repairs
- Use get_diagnostic_info tool to check vehicle diagnostics

When discussing this customer:
1. Always reference their specific vehicles and history
2. Use their name and vehicle details in responses
3. Consider their service history when making recommendations
4. Note their preferred contact method for communications
5. Reference any existing notes or special considerations`;
}; 