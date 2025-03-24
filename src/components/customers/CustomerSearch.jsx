import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosConfig';

const CustomerSearch = ({ onCustomerSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (value) => {
        setSearchTerm(value);
        if (value.length < 2) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.get(`/customers/search`, {
                params: { term: value }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Error searching customers');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerSelect = (customer) => {
        if (onCustomerSelect) {
            onCustomerSelect(customer);
            setSearchResults([]);
            setSearchTerm('');
        }
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search customers..."
                className="w-full p-3 text-lg bg-gray-700 border border-gray-600 rounded-md text-white"
            />

            {loading && (
                <div className="absolute right-3 top-3">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
            )}

            {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((customer) => (
                        <div
                            key={customer._id}
                            onClick={() => handleCustomerSelect(customer)}
                            className="p-4 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0"
                        >
                            <div className="text-white text-xl font-semibold">
                                {customer.firstName} {customer.lastName}
                            </div>
                            {customer.email && (
                                <div className="text-gray-400 text-lg">{customer.email}</div>
                            )}
                            {customer.phoneNumber && (
                                <div className="text-gray-400 text-lg">{customer.phoneNumber}</div>
                            )}
                            {customer.vehicles && customer.vehicles.length > 0 && (
                                <div className="text-gray-400 text-lg mt-1">
                                    Vehicle: {customer.vehicles[0].year} {customer.vehicles[0].make} {customer.vehicles[0].model}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerSearch;
