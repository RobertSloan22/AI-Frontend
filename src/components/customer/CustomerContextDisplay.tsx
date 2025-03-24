import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useResearch } from '../../context/ResearchContext';
import { CustomerInfo, Vehicle } from '../../types';
import { VehicleSelectionModal } from './VehicleSelectionModal';
import { Button } from '../ui/button';
import axiosInstance from '../../utils/axiosConfig';
import { agentService } from '../../services/agentService';
import { toast } from 'react-hot-toast';

const VehicleCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => (
  <div className="bg-gray-700 p-4 rounded-lg mb-3 text-base">
    <h4 className="text-xl font-bold text-blue-300">
      {vehicle.year} {vehicle.make} {vehicle.model} 
    </h4>
    <div className="grid grid-cols-2 gap-4 mt-2">
      <div>
        <p className="text-gray-400 text-xl font-bold">VIN</p>
        <p className="text-white text-base font-bold">{vehicle.vin}</p>
      </div>
      <div>
        <p className="text-gray-400 text-xl font-bold">Year</p>
        <p className="text-white text-base font-bold">{vehicle.year}</p>
      </div>
      <div>
        <p className="text-gray-400 text-xl font-bold">License Plate</p>
        <p className="text-white text-base font-bold">{vehicle.licensePlate}</p>
      </div>
      <div>
        <p className="text-gray-400 text-xl font-bold">Engine</p>
        <p className="text-white text-base font-bold">{vehicle.engine}</p>
      </div>
      <div>
        <p className="text-gray-400 text-xl font-bold">Transmission</p>
        <p className="text-white text-base font-bold">{vehicle.transmission}</p>
      </div>
      <div>
        <p className="text-gray-400 text-xl font-bold">Fuel Type</p>
        <p className="text-white text-base font-bold">{vehicle.fuelType}</p>
      </div>
      <div>
        <p className="text-gray-400 text-xl font-bold">Fuel Type</p>
        <p className="text-white text-base font-bold">{vehicle.fuelType}</p>
      </div>


    </div>
  </div>
);

export const CustomerContextDisplay: React.FC = () => {
  const { selectedCustomer, selectedVehicle } = useCustomer();
  const { 
    problem, 
    setProblem, 
    isLoading, 
    setIsLoading, 
    setResearchData, 
    researchData,
    detailedData,
    isLoadingAllDetails,
    allDetailsLoaded,
    preloadAllDetails
  } = useResearch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleResearch = async () => {
    if (!problem.trim() || !selectedVehicle) return;
    
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/research', {
        vin: selectedVehicle.vin,
        year: selectedVehicle.year,
        make: selectedVehicle.make,
        model: selectedVehicle.model,
        problem: problem,
        dtcCode: 'your-dtc-code-here',
      });

      if (response.data?.result) {
        let parsed = typeof response.data.result === 'string'
          ? JSON.parse(response.data.result)
          : response.data.result;
        setResearchData(parsed);
      }
    } catch (error) {
      console.error('Error researching problem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to send data to AI Assistant
  const sendToElizaChat = async () => {
    if (!selectedCustomer || !selectedVehicle || !researchData) {
      toast.error('Missing required data to send to AI Assistant');
      return;
    }
    try {
      const formattedResearchData = {
        ...researchData,
        problem,
        detailedAnalysis: detailedData
      };
      await agentService.sendComprehensiveData(
        selectedCustomer,
        selectedVehicle,
        [], // No invoices needed
        formattedResearchData
      );
      toast.success('Research data sent to AI Assistant');
    } catch (error) {
      console.error('Error sending data to AI Assistant:', error);
      toast.error('Failed to send data to AI Assistant');
    }
  };

  if (!selectedCustomer) {
    return (
      <div className="bg-gray-900 bg-opacity-75 p-6 rounded-lg">
        <p className="text-gray-400 text-xl">No customer selected</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 bg-opacity-75 rounded-lg p-6 space-y-6 shadow-lg h-[55vh] overflow-y-auto">
      {/* Personal Information */}
      <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-2xl font-semibold text-blue-400 mb-4">
          {selectedCustomer.firstName} {selectedCustomer.lastName}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-xl">Email</p>
            <p className="text-white text-xl">{selectedCustomer.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xl">Phone Number</p>
            <p className="text-white text-xl">{selectedCustomer.phoneNumber || 'N/A'}</p>
          </div>

          {selectedCustomer.workphoneNumber && (
            <div>
              <p className="text-gray-400 text-xl">Work Phone</p>
              <p className="text-white text-xl">{selectedCustomer.workphoneNumber}</p>
            </div>
          )}

          {selectedCustomer.address && (
            <div className="col-span-2">
              <p className="text-gray-400 text-xl">Address</p>
              <p className="text-white text-xl">
                {selectedCustomer.address}, {selectedCustomer.city} {selectedCustomer.zipCode}
              </p>
            </div>
          )}
          
          {selectedCustomer.preferredContact && (
            <div>
              <p className="text-gray-400 text-base">Preferred Contact</p>
              <p className="text-white text-base">{selectedCustomer.preferredContact}</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Vehicle */}
      <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border-l-4 border-green-500">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold text-green-400">Selected Vehicle</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Switch Vehicle
          </button>
        </div>
        {selectedVehicle ? (
          <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
            <h4 className="text-xl font-bold text-blue-300">
              {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
            </h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-gray-400 text-xl">VIN</p>
                <p className="text-white text-xl">{selectedVehicle.vin}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xl">Year</p>
                <p className="text-white text-xl">{selectedVehicle.year}</p>
              </div>

              <div>
                <p className="text-gray-400 text-xl">License Plate</p>
                <p className="text-white text-xl">{selectedVehicle.licensePlate}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xl">Engine</p>
                <p className="text-white text-xl">{selectedVehicle.engine}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xl">Transmission</p>
                <p className="text-white text-xl">{selectedVehicle.transmission}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-xl">No vehicle selected</p>
        )}
      </div>

      {/* Problem Description Section */}
      {selectedVehicle && (
        <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-xl font-semibold text-blue-400 mb-4">Problem Description</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="problem" className="block text-white text-xl font-medium mb-2">
                Describe the Problem
              </label>
              <textarea
                id="problem"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the vehicle problem or symptom"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleResearch}
                disabled={!problem.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? 'Researching...' : 'Research Problem'}
              </Button>
              {researchData && (
                <>
                  <Button 
                    onClick={sendToElizaChat} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    Send to AI Assistant
                  </Button>
                  <Button
                    onClick={preloadAllDetails}
                    disabled={isLoadingAllDetails || allDetailsLoaded}
                    className="w-full"
                  >
                    {isLoadingAllDetails ? 'Loading...' : allDetailsLoaded ? 'All Details Loaded' : 'Preload All Details'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {selectedCustomer.notes && (
        <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border-l-4 border-purple-500">
          <h3 className="text-xl font-semibold text-purple-400 mb-3">Notes</h3>
          <p className="text-gray-300 text-xl whitespace-pre-wrap">{selectedCustomer.notes}</p>
        </div>
      )}

      {/* Vehicle Selection Modal */}
      <VehicleSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicles={selectedCustomer.vehicles || []}
      />
    </div>
  );
};

export default CustomerContextDisplay