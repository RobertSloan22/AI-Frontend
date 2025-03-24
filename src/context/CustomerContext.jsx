// src/context/CustomerContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [customerData, setCustomerData] = useState({});

  // Fetch complete customer data when a customer is selected
  useEffect(() => {
    const fetchCompleteCustomerData = async () => {
      if (!selectedCustomer?._id) {
        setSelectedVehicle(null);
        return;
      }

      try {
        const response = await axiosInstance.get(`/customers/${selectedCustomer._id}`);
        const completeCustomer = response.data;

        // Update the selected customer with complete data
        setSelectedCustomer(completeCustomer);

        // Set default vehicle if available and no vehicle is currently selected
        if (!selectedVehicle && completeCustomer.vehicles?.length > 0) {
          setSelectedVehicle(completeCustomer.vehicles[0]);
        }

        // Update customerData state
        setCustomerData(prevData => ({
          ...prevData,
          [completeCustomer._id]: completeCustomer,
        }));
      } catch (error) {
        console.error('Error fetching complete customer data:', error);
      }
    };

    fetchCompleteCustomerData();
  }, [selectedCustomer?._id]);

  const updateCustomerData = (data) => {
    setCustomerData(prevData => ({
      ...prevData,
      ...data,
    }));
  };

  // Provide a way to manually refresh customer data
  const refreshCustomerData = async (customerId) => {
    if (!customerId) return;

    try {
      const response = await axiosInstance.get(`/customers/${customerId}`);
      const refreshedCustomer = response.data;

      if (selectedCustomer?._id === customerId) {
        setSelectedCustomer(refreshedCustomer);
      }

      setCustomerData(prevData => ({
        ...prevData,
        [customerId]: refreshedCustomer,
      }));

      return refreshedCustomer;
    } catch (error) {
      console.error('Error refreshing customer data:', error);
      throw error;
    }
  };

  /**
   * researchVehicleProblem
   *
   * This function accepts a problem description and calls the backend research endpoint,
   * providing the selected customer's vehicle details (vin, year, make, model) along with the problem.
   *
   * @param {string} problem - The description of the vehicle problem.
   * @returns {Promise<string>} - The research result (analysis and recommendations) from the backend.
   */
  const researchVehicleProblem = async (problem) => {
    if (!selectedVehicle) {
      throw new Error('No vehicle details available for the selected customer.');
    }

    const { vin, year, make, model } = selectedVehicle;

    try {
      const response = await axiosInstance.post('/research', {
        vin,
        year,
        make,
        model,
        problem,
      });
      return response.data.result;
    } catch (error) {
      console.error('Error researching vehicle problem:', error);
      throw error;
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        selectedCustomer,
        setSelectedCustomer,
        selectedVehicle,
        setSelectedVehicle,
        customerData,
        updateCustomerData,
        refreshCustomerData,
        researchVehicleProblem,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
