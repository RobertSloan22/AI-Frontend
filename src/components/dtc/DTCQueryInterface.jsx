import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { useVehicle } from '../../context/VehicleContext';
import { useCustomer } from '../../context/CustomerContext';
import { toast } from 'react-hot-toast';
import { Container, Grid } from '@mui/material';    

const DTCQueryInterface = () => {
    const { currentVehicle } = useVehicle();
    const { selectedCustomer, selectedVehicle, setSelectedVehicle } = useCustomer();
    const [url, setUrl] = useState('');
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [selectedVehicleData, setSelectedVehicleData] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [selectedCustomerInfo, setSelectedCustomerInfo] = useState(null);
    const [presetUrls] = useState([
        {
            name: 'F30 Bimmerpost',
            url: 'https://f30.bimmerpost.com/forums/'
        },
        {
            name: 'Jeep Wrangler Forum',
            url: 'https://www.jlwranglerforums.com/forum/'
        }, 
        {
            name: 'Audi Forums',
            url: 'https://www.audiworld.com/forums/'
        }
    ]);
    
    // Use effect to set initial customer and vehicle data when selectedCustomer changes
    useEffect(() => {
        if (selectedCustomer && selectedVehicle) {
            // Set customer info
            setSelectedCustomerInfo({
                name: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
                email: selectedCustomer.email,
                phone: selectedCustomer.phoneNumber,
                address: selectedCustomer.address,
                vehicle: selectedVehicle.vin,
                year: selectedVehicle.year,
                make: selectedVehicle.make,
                model: selectedVehicle.model,
                engine: selectedVehicle.engine,
                transmission: selectedVehicle.transmission,
                mileage: selectedVehicle.mileage,
                notes: selectedVehicle.notes
            });

            // Set vehicle data using selectedVehicle
            const vehicleData = {
                type: `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`.trim(),
                vin: selectedVehicle.vin,
                engine: selectedVehicle.engine,
                engineDisplacement: selectedVehicle.engineDisplacement,
                fuelType: selectedVehicle.fuelType,
                engineCode: selectedVehicle.engineCode,
                hasTurbo: selectedVehicle.hasTurbo,
                isHybrid: selectedVehicle.isHybrid,
                transmission: selectedVehicle.transmission,
                isAutomatic: selectedVehicle.isAutomatic,
                gearCount: selectedVehicle.gearCount,
                transmissionCode: selectedVehicle.transmissionCode,
                mileage: selectedVehicle.mileage,
                serviceHistory: selectedVehicle.serviceHistory || [],
                previousDTCs: selectedVehicle.previousDTCs || [],
                modifications: selectedVehicle.modifications || [],
                description: selectedVehicle.notes || '',
                checkEngineLightOn: selectedVehicle.checkEngineLightOn,
                otherWarningLights: selectedVehicle.warningLights || [],
                drivabilityIssues: selectedVehicle.drivabilityIssues || [],
                noiseVibrationIssues: selectedVehicle.noiseVibrationIssues || [],
                fluidLeakIssues: selectedVehicle.fluidLeakIssues || [],
                weatherConditions: selectedVehicle.weatherConditions,
                temperature: selectedVehicle.temperature,
                altitude: selectedVehicle.altitude,
                lastDriven: selectedVehicle.lastDriven,
                freezeFrameData: selectedVehicle.freezeFrameData,
                liveSensorData: selectedVehicle.liveSensorData,
                pendingCodes: selectedVehicle.pendingCodes,
                affectedSystems: selectedVehicle.affectedSystems,
                recentRepairs: selectedVehicle.recentRepairs,
                knownIssues: selectedVehicle.knownIssues,
                customerComplaints: selectedVehicle.customerComplaints || [],
                serviceManualRefs: selectedVehicle.serviceManualRefs || [],
                tsbRefs: selectedVehicle.tsbRefs || [],
                recallInfo: selectedVehicle.recallInfo || [],
                customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
            };
            setSelectedVehicleData(vehicleData);
        }
    }, [selectedCustomer, selectedVehicle]);

    const fetchVehicles = async () => {
        try {
            const response = await axiosInstance.get('/vehicles');
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Failed to fetch vehicles');
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await axiosInstance.get('/appointments');
            setAppointments(response.data);
        } catch (err) {
            toast.error('Failed to fetch appointments');
            console.error('Error fetching appointments:', err);
        }
    };

    const handleImportVehicleData = async () => {
        try {
            const response = await axiosInstance.get('/invoices/all');
            setInvoices(response.data);
            setShowInvoiceModal(true);
        } catch (error) {
            console.error('Error importing vehicle data:', error);
            toast.error('Failed to import vehicle data');
        }
    };

    const handleImportFromVehicles = () => {
        setShowVehicleModal(true);
        fetchVehicles();
    };

    const handleImportFromAppointments = () => {
        setShowAppointmentModal(true);
        fetchAppointments();
    };

    const handleImportFromCustomers = () => {
        setShowCustomerModal(true);
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomerInfo({
            name: `${customer.firstName} ${customer.lastName}`,
            email: customer.email,
            phone: customer.phoneNumber,
            address: customer.address,
            vehicle: customer.vehicle,
            vin: customer.vin
        });

        if (customer.vehicles && customer.vehicles.length > 0) {
            const vehicle = customer.vehicles[0];
            const vehicleData = {
                type: `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim(),
                vin: vehicle.vin,
                engine: vehicle.engine,
                engineDisplacement: vehicle.engineDisplacement,
                fuelType: vehicle.fuelType,
                engineCode: vehicle.engineCode,
                hasTurbo: vehicle.hasTurbo,
                isHybrid: vehicle.isHybrid,
                transmission: vehicle.transmission,
                isAutomatic: vehicle.isAutomatic,
                gearCount: vehicle.gearCount,
                transmissionCode: vehicle.transmissionCode,
                mileage: vehicle.mileage,
                serviceHistory: vehicle.serviceHistory || [],
                previousDTCs: vehicle.previousDTCs || [],
                modifications: vehicle.modifications || [],
                description: vehicle.notes || '',
                checkEngineLightOn: vehicle.checkEngineLightOn,
                otherWarningLights: vehicle.warningLights || [],
                drivabilityIssues: vehicle.drivabilityIssues || [],
                noiseVibrationIssues: vehicle.noiseVibrationIssues || [],
                fluidLeakIssues: vehicle.fluidLeakIssues || [],
                weatherConditions: vehicle.weatherConditions,
                temperature: vehicle.temperature,
                altitude: vehicle.altitude,
                lastDriven: vehicle.lastDriven,
                freezeFrameData: vehicle.freezeFrameData,
                liveSensorData: vehicle.liveSensorData,
                pendingCodes: vehicle.pendingCodes,
                affectedSystems: vehicle.affectedSystems,
                recentRepairs: vehicle.recentRepairs,
                knownIssues: vehicle.knownIssues,
                customerComplaints: vehicle.customerComplaints || [],
                serviceManualRefs: vehicle.serviceManualRefs || [],
                tsbRefs: vehicle.tsbRefs || [],
                recallInfo: vehicle.recallInfo || [],
                customerName: `${customer.firstName} ${customer.lastName}`
            };
            setSelectedVehicleData(vehicleData);
        } else {
            setSelectedVehicleData(null);
        }
        setShowCustomerModal(false);
        toast.success('Customer data imported successfully');
    };

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        const vehicleData = {
            type: `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim(),
            vin: vehicle.vin,
            engine: vehicle.engine,
            engineDisplacement: vehicle.engineDisplacement,
            fuelType: vehicle.fuelType,
            engineCode: vehicle.engineCode,
            hasTurbo: vehicle.hasTurbo,
            isHybrid: vehicle.isHybrid,
            transmission: vehicle.transmission,
            isAutomatic: vehicle.isAutomatic,
            gearCount: vehicle.gearCount,
            transmissionCode: vehicle.transmissionCode,
            mileage: vehicle.mileage,
            serviceHistory: vehicle.serviceHistory || [],
            previousDTCs: vehicle.previousDTCs || [],
            modifications: vehicle.modifications || [],
            description: vehicle.description || '',
            checkEngineLightOn: vehicle.checkEngineLightOn,
            otherWarningLights: vehicle.warningLights || [],
            drivabilityIssues: vehicle.drivabilityIssues || [],
            noiseVibrationIssues: vehicle.noiseVibrationIssues || [],
            fluidLeakIssues: vehicle.fluidLeakIssues || [],
            weatherConditions: vehicle.weatherConditions,
            temperature: vehicle.temperature,
            altitude: vehicle.altitude,
            lastDriven: vehicle.lastDriven,
            freezeFrameData: vehicle.freezeFrameData,
            liveSensorData: vehicle.liveSensorData,
            pendingCodes: vehicle.pendingCodes,
            affectedSystems: vehicle.affectedSystems,
            recentRepairs: vehicle.recentRepairs,
            knownIssues: vehicle.knownIssues,
            customerComplaints: vehicle.customerComplaints || [],
            serviceManualRefs: vehicle.serviceManualRefs || [],
            tsbRefs: vehicle.tsbRefs || [],
            recallInfo: vehicle.recallInfo || [],
            customerName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
        };
        setSelectedVehicleData(vehicleData);
        setShowVehicleModal(false);
        toast.success('Vehicle data imported successfully');
    };

    const handleSelectInvoice = (invoice) => {
        const vehicleData = {
            type: `${invoice.vehicleYear || ''} ${invoice.vehicleMake || ''} ${invoice.vehicleModel || ''} ${invoice.vehicleType || ''}`.trim(),
            vin: invoice.vehicleVin,
            engine: invoice.vehicleEngine,
            transmission: invoice.vehicleTransmission,
            mileage: invoice.vehicleMileage,
            description: invoice.vehicleDescription || ''
        };
        setSelectedVehicleData(vehicleData);
        setShowInvoiceModal(false);
        toast.success('Vehicle data imported successfully');
    };

    const handleSelectAppointment = (appointment) => {
        const vehicleData = {
            type: `${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}`.trim(),
            vin: appointment.vehicle.vin,
            engine: appointment.vehicle.engine,
            transmission: appointment.vehicle.transmission,
            mileage: appointment.vehicle.mileage,
            description: appointment.vehicle.description || '',
            appointmentDate: appointment.date,
            serviceType: appointment.serviceType,
            complaint: appointment.complaint
        };
        setSelectedVehicleData(vehicleData);
        setShowAppointmentModal(false);
        toast.success('Vehicle data imported from appointment');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isInitialized) {
            setError('Please initialize with a forum URL first');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const vehicleInfo = selectedVehicleData || currentVehicle;
            // Enhanced vehicle data structure with more technical details
            const formattedVehicleData = {
                type: vehicleInfo.type || `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`,
                vin: vehicleInfo.vin,
                engine: {
                    type: vehicleInfo.engine,
                    displacement: vehicleInfo.engineDisplacement,
                    fuelType: vehicleInfo.fuelType,
                    engineCode: vehicleInfo.engineCode,
                    turbo: vehicleInfo.hasTurbo,
                    hybrid: vehicleInfo.isHybrid
                },
                transmission: {
                    type: vehicleInfo.transmission,
                    automatic: vehicleInfo.isAutomatic,
                    gearCount: vehicleInfo.gearCount,
                    transmissionCode: vehicleInfo.transmissionCode
                },
                mileage: vehicleInfo.mileage,
                serviceHistory: vehicleInfo.serviceHistory || [],
                previousDTCs: vehicleInfo.previousDTCs || [],
                modifications: vehicleInfo.modifications || [],
                description: vehicleInfo.description || '',
                symptoms: {
                    checkEngineLight: vehicleInfo.checkEngineLightOn,
                    otherWarningLights: vehicleInfo.otherWarningLights || [],
                    drivabilityIssues: vehicleInfo.drivabilityIssues || [],
                    noiseVibration: vehicleInfo.noiseVibrationIssues || [],
                    fluidLeaks: vehicleInfo.fluidLeakIssues || []
                },
                environmentalFactors: {
                    weather: vehicleInfo.weatherConditions,
                    temperature: vehicleInfo.temperature,
                    altitude: vehicleInfo.altitude,
                    lastDriven: vehicleInfo.lastDriven
                }
            };

            // Enhanced query with more context
            const enhancedQuery = {
                dtcCode: query,
                scanToolInfo: {
                    freezeFrameData: vehicleInfo.freezeFrameData,
                    liveSensorData: vehicleInfo.liveSensorData,
                    pendingCodes: vehicleInfo.pendingCodes
                },
                systemContext: {
                    relatedSystems: vehicleInfo.affectedSystems,
                    recentRepairs: vehicleInfo.recentRepairs,
                    commonIssues: vehicleInfo.knownIssues
                },
                customerComplaints: vehicleInfo.customerComplaints || [],
                technicalContext: {
                    serviceManuals: vehicleInfo.serviceManualRefs || [],
                    tsbs: vehicleInfo.tsbRefs || [],
                    recalls: vehicleInfo.recallInfo || []
                }
            };

            const result = await axiosInstance.post('/dtc-query', { 
                query: enhancedQuery,
                vehicle: formattedVehicleData
            });
            setResponse(result.data.response);
        } catch (err) {
            setError('Failed to get response. Please try again.');
            console.error('Query error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInitialize = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await axiosInstance.post('/dtc-initialize', { url });
            setIsInitialized(true);
            toast.success('DTC Query system initialized successfully');
        } catch (err) {
            setError('Failed to initialize with the provided URL. Please check the URL and try again.');
            console.error('Initialization error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to format the response with proper styling
    const formatResponse = (text) => {
        if (!text) return null;

        try {
            // Parse the JSON response
            const data = typeof text === 'string' ? JSON.parse(text) : text;

            // Ensure all required sections exist with defaults
            const safeData = {
                "Vehicle-Specific Information": {
                    "Make/Model/Year": "",
                    "DTC Code Confirmation": "",
                    "TSBs or Recalls": "",
                    "Known Issues": "",
                    ...(data["Vehicle-Specific Information"] || {})
                },
                "DTC Code Definition": {
                    "DTC Name": "",
                    "DTC Meaning": "",
                    "System Related": "",
                    "Variations": "",
                    ...(data["DTC Code Definition"] || {})
                },
                "Common Causes": data["Common Causes"] || [],
                "Symptoms": data["Symptoms"] || [],
                "Diagnostic Steps": data["Diagnostic Steps"] || [],
                "Repair Solutions": data["Repair Solutions"] || [],
                "Additional Notes": data["Additional Notes"] || []
            };

            // Define section renderers with enhanced styling
            const renderSection = (title, content, isArray = false) => (
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 hover:bg-opacity-70 transition-all duration-200">
                    <h3 className="text-blue-400 text-2xl mb-2 flex items-center">
                        <span className="mr-2">{title}</span>
                        {!isArray && Object.values(content).some(v => v) && (
                            <span className="text-2xl bg-blue-600 px-2 py-1 rounded-full">
                                {Object.values(content).filter(v => v).length} items
                            </span>
                        )}
                    </h3>
                    <div className="text-gray-200 space-y-2">
                        {isArray ? content : Object.entries(content).map(([key, value]) => (
                            value && (
                                <p key={key} className="ml-2 flex items-start">
                                    <span className="text-blue-400 min-w-[150px] mr-2">{key}:</span>
                                    <span className="flex-1">{value}</span>
                                </p>
                            )
                        ))}
                    </div>
                </div>
            );

            // Enhanced array section renderer with collapsible sections
            const renderArraySection = (title, items, formatter) => (
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 hover:bg-opacity-70 transition-all duration-200">
                    <h3 className="text-blue-400 font-bold mb-2 flex items-center">
                        <span className="mr-2">{title}</span>
                        {items.length > 0 && (
                            <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">
                                {items.length} items
                            </span>
                        )}
                    </h3>
                    <div className="text-gray-200 space-y-4">
                        {items.length > 0 ? (
                            items.map((item, index) => (
                                <div key={index} className="ml-2 p-3 border-l-2 border-blue-600 bg-gray-700 bg-opacity-50 rounded-r-lg hover:bg-opacity-70 transition-all duration-200">
                                    {formatter(item)}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 italic">No information available</p>
                        )}
                    </div>
                </div>
            );

            // Enhanced boolean formatter with icons
            const formatBoolean = (value) => {
                if (typeof value !== 'boolean') return <span className="text-gray-400">Unknown</span>;
                return value ? 
                    <span className="text-green-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Yes
                    </span> : 
                    <span className="text-red-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                        No
                    </span>;
            };

            // Safe accessor function for nested objects
            const safeGet = (obj, path, defaultValue = "") => {
                try {
                    return path.split('.').reduce((acc, part) => acc[part], obj) || defaultValue;
                } catch {
                    return defaultValue;
                }
            };

            return (
                <div className="space-y-6 animate-fade-in">
                    {/* Vehicle-Specific Information */}
                    {renderSection("Vehicle-Specific Information", safeData["Vehicle-Specific Information"])}

                    {/* DTC Code Definition */}
                    {renderSection("DTC Code Definition", safeData["DTC Code Definition"])}

                    {/* Common Causes */}
                    {renderArraySection("Common Causes", safeData["Common Causes"], (cause) => (
                        <div className="space-y-2">
                            <p><span className="text-blue-400">Problem:</span> {safeGet(cause, 'Problem', 'Not specified')}</p>
                            <p><span className="text-blue-400">Reason:</span> {safeGet(cause, 'Reason', 'Not specified')}</p>
                            <p><span className="text-blue-400">Make/Model Specific:</span> {formatBoolean(cause["Make/Model Specific"])}</p>
                        </div>
                    ))}

                    {/* Symptoms */}
                    {renderArraySection("Symptoms", safeData.Symptoms, (symptom) => (
                        <div className="space-y-2">
                            <p><span className="text-blue-400">Observable Symptoms:</span> {safeGet(symptom, 'Observable Symptoms', 'None reported')}</p>
                            <p><span className="text-blue-400">Dashboard Indicators:</span> {safeGet(symptom, 'Dashboard Indicators', 'None reported')}</p>
                            <p><span className="text-blue-400">Performance Issues:</span> {safeGet(symptom, 'Performance Issues', 'None reported')}</p>
                            <p><span className="text-blue-400">Make/Model Specific:</span> {formatBoolean(symptom["Make/Model Specific"])}</p>
                        </div>
                    ))}

                    {/* Diagnostic Steps */}
                    {renderArraySection("Diagnostic Steps", safeData["Diagnostic Steps"], (step) => (
                        <div className="space-y-2">
                            <p><span className="text-blue-400">Step:</span> {safeGet(step, 'Step', 'Not specified')}</p>
                            <p><span className="text-blue-400">Tools/Equipment:</span> {safeGet(step, 'Tools/Equipment', 'Not specified')}</p>
                            <p><span className="text-blue-400">Voltage Readings:</span> {safeGet(step, 'Voltage Readings', 'Not available')}</p>
                            <p><span className="text-blue-400">Make/Model Specific:</span> {formatBoolean(step["Make/Model Specific"])}</p>
                        </div>
                    ))}

                    {/* Repair Solutions */}
                    {renderArraySection("Repair Solutions", safeData["Repair Solutions"], (solution) => (
                        <div className="space-y-2">
                            <p><span className="text-blue-400">Problem:</span> {safeGet(solution, 'Problem', 'Not specified')}</p>
                            <p><span className="text-blue-400">Reason:</span> {safeGet(solution, 'Reason', 'Not specified')}</p>
                            <p><span className="text-blue-400">Common Parts Needed:</span> {safeGet(solution, 'Common Parts Needed', 'Not specified')}</p>
                            <p><span className="text-blue-400">Approximate Costs:</span> {safeGet(solution, 'Approximate Costs', 'Not available')}</p>
                            <p><span className="text-blue-400">Make/Model Specific:</span> {formatBoolean(solution["Make/Model Specific"])}</p>
                        </div>
                    ))}

                    {/* Additional Notes */}
                    {renderArraySection("Additional Notes", safeData["Additional Notes"], (note) => (
                        <div className="space-y-2">
                            <p><span className="text-blue-400">Vehicle-Specific Information:</span> {safeGet(note, 'Vehicle-Specific Information', 'Not available')}</p>
                            <p><span className="text-blue-400">Common Misdiagnoses:</span> {safeGet(note, 'Common Misdiagnoses', 'Not available')}</p>
                            <p><span className="text-blue-400">TSBs:</span> {safeGet(note, 'TSBs', 'None reported')}</p>
                            <p><span className="text-blue-400">Manufacturer-Specific Issues:</span> {safeGet(note, 'Manufacturer-Specific Issues', 'None reported')}</p>
                        </div>
                    ))}
                </div>
            );
        } catch (error) {
            console.error('Error formatting response:', error);
            return (
                <div className="bg-red-900 bg-opacity-50 text-red-200 rounded p-4">
                    <p className="font-bold">Error Formatting Response</p>
                    <p className="text-sm">{error.message}</p>
                    <p className="text-xs mt-2">Response data: {JSON.stringify(text).substring(0, 200)}...</p>
                </div>
            );
        }
    };

    const CustomerSearchModal = ({ onSelect, onClose }) => {
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

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Select Customer</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                    
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search customers..."
                        className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />

                    {loading && (
                        <div className="text-center py-4">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
                        </div>
                    )}

                    <div className="max-h-[60vh] overflow-y-auto">
                        {searchResults.map((customer) => (
                            <div
                                key={customer._id}
                                onClick={() => onSelect(customer)}
                                className="p-4 bg-gray-700 rounded mb-2 cursor-pointer hover:bg-gray-600"
                            >
                                <p className="text-white font-medium">
                                    {customer.firstName} {customer.lastName}
                                </p>
                                {customer.vehicles && customer.vehicles.length > 0 && (
                                    <p className="text-sm text-gray-300">
                                        Vehicle: {customer.vehicles[0].year} {customer.vehicles[0].make} {customer.vehicles[0].model}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
        <Container maxWidth="xl">
        <Grid container spacing={2}>
        <Grid item xs={12}>
      
        </Grid>

        <Grid item xs={12}>
        <div className="flex-1 w-[30vw] text-xl text-white bg-gray-900 bg-opacity-75 backdrop-blur-md rounded-lg shadow-lg p-4  overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-white">Vehicle DTC Code Query</h2>
            

            {/* Fixed header section with vehicle info */}
            <div className="flex-none">
                {/* Display current vehicle info */}
                {currentVehicle && (
                    <div className="mb-4 p-3 bg-gray-800 bg-opacity-50 rounded font-bold text-white">
                        <h3 className="text-white bold mb-2 font-bold">Current Vehicle:</h3>
                        <div className="font-white text-white">
                            <p>{currentVehicle.year} {currentVehicle.make} {currentVehicle.model}</p>
                            <p className="text-xl">VIN: {currentVehicle.vin}</p>
                            {currentVehicle.engine && <p className="text-xl">Engine: {currentVehicle.engine}</p>}
                        </div>
                    </div>
                )}

                {/* URL Input Form */}
                <form onSubmit={handleInitialize} className="space-y-4 mb-6">
                    <div className="flex gap-2">
                        <div className="flex-1 flex gap-2">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter automotive forum URL or other URL..."
                                className="flex-1 p-2 bg-gray-800 text-white text-xl border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                            />
                            <select 
                                onChange={(e) => setUrl(e.target.value)}
                                className="p-2 bg-gray-800 text-white border text-xl border-gray-700 rounded focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Select preset forum...</option>
                                {presetUrls.map((preset, index) => (
                                    <option key={index} value={preset.url}>
                                        {preset.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || !url.trim()}
                            className={`px-4 py-2 rounded text-white ${
                                loading || !url.trim() 
                                    ? 'bg-gray-600' 
                                    : 'bg-green-600 hover:bg-green-700'
                            } transition-colors duration-200`}
                        >
                            {loading ? 'Initializing...' : 'Initialize'}
                        </button>
                    </div>
                </form>

                {/* Import buttons */}
                <div className="mb-4 flex gap-2">
                    <button
                        onClick={handleImportVehicleData}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Import from Invoice
                    </button>
                    <button
                        onClick={handleImportFromVehicles}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        Import from Vehicles
                    </button>
                    <button
                        onClick={handleImportFromAppointments}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                        Import from Appointments
                    </button>
                    <button
                        onClick={handleImportFromCustomers}
                        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    >
                        Import from Customers
                    </button>
                </div>
            </div>

            {/* Scrollable content section */}
            <div className="flex-1 overflow-y-auto pr-2">
                <div className="mt-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-xll font-semibold text-white mb-2">Selected Vehicle Data</h3>
                        {selectedCustomerInfo && (
                            <div className="mb-2 text-gray-300">
                                <p><span className="font-medium">Customer:</span> {selectedCustomerInfo.name}</p>
                                {selectedCustomerInfo.email && (
                                    <p><span className="font-medium">Email:</span> {selectedCustomerInfo.email}</p>
                                )}
                                {selectedCustomerInfo.phone && (
                                    <p><span className="font-medium">Phone:</span> {selectedCustomerInfo.phone}</p>
                                )}
                                {selectedCustomerInfo.vehicle && (
                                    <p><span className="font-medium">Vehicle:</span> {selectedCustomerInfo.vehicle}</p>
                                )}
                                {selectedCustomerInfo.vin && (
                                    <p><span className="font-medium">VIN:</span> {selectedCustomerInfo.vin}</p>
                                )}
                            </div>
                        )}
                        {selectedVehicleData && (
                            <div className="text-gray-300">
                                <p><span className="font-medium">Vehicle:</span> {selectedVehicleData.type}</p>
                                <p><span className="font-medium">VIN:</span> {selectedVehicleData.vin || 'N/A'}</p>
                                <p><span className="font-medium">Engine:</span> {selectedVehicleData.engine || 'N/A'}</p>
                                <p><span className="font-medium">Mileage:</span> {selectedVehicleData.mileage || 'N/A'}</p>
                                {selectedVehicleData.description && (
                                    <p><span className="font-medium">Notes:</span> {selectedVehicleData.description}</p>
                                )}
                            </div>
                        )}
                        {!selectedCustomerInfo && !selectedVehicleData && (
                            <p className="text-gray-400">No customer or vehicle selected</p>
                        )}
                    </div>
                </div>

                {/* Query Input Form */}
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter DTC code or describe the issue..."
                            className="flex-1 p-2 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !query.trim() || !isInitialized}
                            className={`px-4 py-2 rounded text-white ${
                                loading || !query.trim() || !isInitialized
                                    ? 'bg-gray-600' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                            } transition-colors duration-200`}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 p-2 bg-red-900 bg-opacity-50 text-red-200 rounded">
                        {error}
                    </div>
                )}
                
                {/* Query Results */}
                {response && (
                    <div className="mt-4 pb-4 max-h-[50vh] overflow-y-auto">
                        {formatResponse(response)}
                    </div>
                )}
            </div>
        </div>
        </Grid>
        </Grid>
        </Container>

        {/* Keep modals outside the scrollable area */}
        {showInvoiceModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 99999 }}>
                <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-white mb-4">Select Vehicle Data from Invoice</h3>
                    <div className="space-y-4">
                        {Array.isArray(invoices) && invoices.length > 0 ? (
                            invoices.map((invoice) => (
                                <div
                                    key={invoice._id}
                                    onClick={() => handleSelectInvoice(invoice)}
                                    className="p-4 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                                >
                                    <p className="text-white font-medium">
                                        {invoice.vehicleType} - VIN: {invoice.vehicleVin}
                                    </p>
                                    <p className="text-sm text-gray-300">
                                        Engine: {invoice.vehicleEngine} | Mileage: {invoice.vehicleMileage}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-white">No invoices found</p>
                        )}
                    </div>
                    <button
                        onClick={() => setShowInvoiceModal(false)}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}

        {showVehicleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 99999 }}>
                <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-white mb-4">Select Vehicle</h3>
                    <div className="space-y-4">
                        {vehicles.map((vehicle) => (
                            <div
                                key={vehicle._id}
                                onClick={() => handleSelectVehicle(vehicle)}
                                className="p-4 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                            >
                                <p className="text-white font-medium">
                                    {vehicle.year} {vehicle.make} {vehicle.model} - VIN: {vehicle.vin}
                                </p>
                                <p className="text-sm text-gray-300">
                                    Engine: {vehicle.engine} | Mileage: {vehicle.mileage}
                                </p>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowVehicleModal(false)}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}

        {showAppointmentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 99999 }}>
                <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-white mb-4">Select Vehicle from Active Appointments</h3>
                    <div className="space-y-4">
                        {appointments.map((appointment) => (
                            <div
                                key={appointment._id}
                                onClick={() => handleSelectAppointment(appointment)}
                                className="p-4 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-white font-medium">
                                            {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                                        </p>
                                        <p className="text-sm text-gray-300">VIN: {appointment.vehicle.vin}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-300">
                                            {new Date(appointment.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-blue-400">{appointment.serviceType}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">
                                    Complaint: {appointment.complaint}
                                </p>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowAppointmentModal(false)}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}

        {showCustomerModal && (
            <CustomerSearchModal
                onSelect={handleSelectCustomer}
                onClose={() => setShowCustomerModal(false)}
            />
        )}
        </> 
    );
};

export default DTCQueryInterface;