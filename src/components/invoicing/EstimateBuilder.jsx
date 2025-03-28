import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { useCustomer } from '../../context/CustomerContext';

const EstimateBuilder = () => {
    const { selectedCustomer, selectedVehicle } = useCustomer();
    const [items, setItems] = useState([]);
    const [labor, setLabor] = useState([]);

    const addItem = () => {
        setItems([...items, { 
            partNumber: '', 
            description: '', 
            quantity: 1, 
            price: 0 
        }]);
    };

    const addLabor = () => {
        setLabor([...labor, { 
            description: '', 
            hours: 1, 
            rate: 0 
        }]);
    };

    const calculateTotal = () => {
        const partsTotal = items.reduce((sum, item) => 
            sum + (item.quantity * item.price), 0);
        const laborTotal = labor.reduce((sum, item) => 
            sum + (item.hours * item.rate), 0);
        return partsTotal + laborTotal;
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-3xl font-bold text-white mb-6">Create Estimate</h2>

            {/* Customer & Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-700 rounded p-4">
                    <h3 className="text-xl font-semibold text-white mb-2">Customer</h3>
                    {selectedCustomer && (
                        <div className="text-gray-300 text-base">
                            <p>{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                            <p>{selectedCustomer.email}</p>
                            <p>{selectedCustomer.phoneNumber}</p>
                        </div>
                    )}
                </div>
                <div className="bg-gray-700 rounded p-4">
                    <h3 className="text-xl font-semibold text-white mb-2">Vehicle</h3>
                    {selectedVehicle && (
                        <div className="text-gray-300 text-base">
                            <p>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                            <p>VIN: {selectedVehicle.vin}</p>
                            <p>Mileage: {selectedVehicle.mileage}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Parts Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Parts</h3>
                    <button
                        onClick={addItem}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add Part
                    </button>
                </div>
                {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 mb-4">
                        {/* Part input fields */}
                    </div>
                ))}
            </div>

            {/* Labor Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Labor</h3>
                    <button
                        onClick={addLabor}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add Labor
                    </button>
                </div>
                {labor.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 mb-4">
                        {/* Labor input fields */}
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="bg-gray-700 rounded p-4">
                <div className="flex justify-between text-white text-lg font-semibold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default EstimateBuilder; 