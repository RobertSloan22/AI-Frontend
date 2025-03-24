import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';

//import all components needed for the chat feature
import ElizaChat from '../../components/ElizaChat';

import { Imagemodal } from '../../components/assistant/ImageModal';
import { ImageSearchResults } from '../../components/assistant/ImageSearchResults';
import UnifiedDashboard from '../dashboard/UnifiedDashboard';
import A from '../../components/assistant/A';

//import the message container

const Overview = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [serviceRecords, setServiceRecords] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [serviceVehicles, setServiceVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [selectedDiagram, setSelectedDiagram] = useState(null);
    const [searchResults, setSearchResults] = useState([]);

    // Add function to fetch saved images
    const fetchSavedImages = async () => {
        try {
            const response = await axiosInstance.get('/images');
            setSearchResults(response.data);
        } catch (error) {
            console.error('Failed to fetch saved images:', error);
        }
    };

    // Fetch images when component mounts
    useEffect(() => {
        fetchSavedImages();
    }, []);

    const handleImageClick = (image) => {
        setSelectedDiagram({
            url: image.imageUrl,
            title: image.title,
            thumbnail: image.thumbnailUrl,
            sourceUrl: image.link,
            fileType: 'image'
        });
        setIsImageModalOpen(true);
    };

    const handleSaveImage = async (image) => {
        try {
            const response = await axiosInstance.post('/images', {
                ...image,
                timestamp: new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error('Failed to save image:', error);
            throw error;
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch appointments
                const { data } = await axiosInstance.get('/appointments');
                console.log('Raw appointments from API:', data);
                
                // Format appointments like in Appointments.jsx
                const formattedAppointments = data.map(apt => ({
                    _id: apt._id,
                    customerName: apt.customerName,
                    vehicle: apt.vehicle,
                    start: new Date(apt.start),
                    end: new Date(apt.end),
                    status: apt.status,
                    complaint: apt.complaint || apt.description,
                    notes: apt.notes
                }));

                // Filter for today's appointments
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const todaysAppointments = formattedAppointments.filter(apt => 
                    apt.start >= today && apt.start < tomorrow
                );

                console.log('Today\'s appointments:', todaysAppointments);
                setAppointments(todaysAppointments);
                // fetch vehicles
                const { data: vehicleData } = await axiosInstance.get('/vehicles');
                console.log('Raw vehicles:', vehicleData);

                const formattedVehicles = Array.isArray(vehicleData) ? vehicleData.map(vehicle => ({
                    _id: vehicle._id,
                    year: vehicle.year,
                    make: vehicle.make,
                    model: vehicle.model,
                    licensePlate: vehicle.licensePlate
                })) : [];

                console.log('Formatted Vehilces:', formattedVehicles);


                setServiceVehicles(formattedVehicles);

                // Fetch recent invoices
                const { data: invoiceData } = await axiosInstance.get('/invoices/recent');
                console.log('Raw invoices from API:', invoiceData);
                console.log('Invoice data type:', typeof invoiceData);
                console.log('Is array?', Array.isArray(invoiceData));
                
                const formattedInvoices = Array.isArray(invoiceData) ? invoiceData.map(invoice => ({
                    _id: invoice._id,
                    invoiceNumber: invoice.invoiceNumber || 'N/A',
                    customerName: invoice.customerName,
                    vehicle: invoice.vehicle || {},
                    total: invoice.total || 0,
                    date: invoice.date ? new Date(invoice.date) : new Date(),
                    status: invoice.status || 'pending',
                    paid: invoice.paid || false,
                    description: invoice.description || ''
                })) : [];

                console.log('Formatted invoices:', formattedInvoices);

                setServiceRecords(formattedInvoices);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const stats = [
        { label: 'Appointments Today', value: appointments.length, icon: '📅' },
        { label: 'Vehicles In Service', value: vehicles.length, icon: '🚗' },
        { label: 'Pending Invoices', value: serviceRecords.filter(r => !r.paid).length, icon: '📄' },
        { label: 'Low Stock Items', value: '12', icon: '⚠️' }
    ];


// the menu should be centered in the screen with equal padding on top and bottom 
return (
    <>
        <div className="h-[100vh]">
            <ElizaChat />
       <A />
            <UnifiedDashboard />

            {/* Image Control Buttons */}
            <div className="fixed bottom-4 right-4 flex gap-2 z-50">
                <button
                    onClick={() => setIsSearchModalOpen(true)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    🔍 Image Search
                </button>
                <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    🖼️ View Images
                </button>
            </div>

            {/* Image Search Modal */}
            {isSearchModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-gray-800 rounded-lg p-6 w-3/4 h-3/4 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Image Search</h2>
                            <button 
                                onClick={() => setIsSearchModalOpen(false)}
                                className="text-white hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>
                        <ImageSearchResults
                            searchResults={searchResults}
                            onImageClick={handleImageClick}
                            onSaveImage={handleSaveImage}
                        />
                    </div>
                </div>
            )}

            {/* Image Viewer Modal */}
            {selectedDiagram && (
                <Imagemodal
                    isOpen={isImageModalOpen}
                    onClose={() => {
                        setIsImageModalOpen(false);
                        setSelectedDiagram(null);
                    }}
                    imageUrl={selectedDiagram.url}
                    title={selectedDiagram.title}
                />
            )}
        </div>
    </>
);
};

export default Overview;