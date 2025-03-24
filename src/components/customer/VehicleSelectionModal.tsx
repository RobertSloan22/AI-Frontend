import { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { CustomerInfo, Vehicle } from '../../types';
interface VehicleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
}

export const VehicleSelectionModal: React.FC<VehicleSelectionModalProps> = ({
  isOpen,
  onClose,
  vehicles,
}) => {
  const { setSelectedVehicle } = useCustomer();
  const { selectedCustomer, selectedVehicle } = useCustomer();

  if (!isOpen) return null;

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 bg-opacity-75 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh]">
        <div className="bg-gray-800 bg-opacity-25 p-6 flex justify-between items-center sticky top-0 border-b border-gray-700">
          <div classname="bg-gray-800">
            <h2 className="text-2xl font-bold text-blue-400">Select Vehicle for {selectedCustomer.firstName} {selectedCustomer.lastName} </h2>
            <p className="text-gray-400 text-sm mt-1">Choose a vehicle to work with</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4  max-h-[50vh] overflow-y-auto">
          {vehicles.map((vehicle) => (
            <button
              key={vehicle.vin}
              onClick={() => handleVehicleSelect(vehicle)}
              className="w-full text-left bg-gray-800 bg-opacity-50 p-4 rounded-lg border-l-4 border-blue-500 
                hover:bg-gray-700 hover:border-blue-400 transition-all"
            >
              <h4 className="text-xl font-bold text-blue-300">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h4>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-gray-400 text-xl">VIN</p>
                  <p className="text-white text-xl">{vehicle.vin}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xl">License Plate</p>
                  <p className="text-white text-xl">{vehicle.licensePlate}</p>
                </div>
                {vehicle.engine && (
                  <div>
                    <p className="text-gray-400 text-xl">Engine</p>
                    <p className="text-white text-xl">{vehicle.engine}</p>
                  </div>
                )}
                {vehicle.mileage && (
                  <div>
                    <p className="text-gray-400 text-xl">Mileage</p>
                    <p className="text-white text-xl">{vehicle.mileage.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};