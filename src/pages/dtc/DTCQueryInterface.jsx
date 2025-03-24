import { useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import './DTCQueryInterface.css';
import { toast } from 'react-toastify';

const DTCQueryInterface = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [url, setUrl] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);
    const apiKey = window.env?.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
    const [selectedVehicleData, setSelectedVehicleData] = useState(null);
    const [currentVehicle, setCurrentVehicle] = useState(null);

    const handleInitialize = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await axiosInstance.post('/dtc-initialize', { url, apiKey });
            setIsInitialized(true);
            toast.success('DTC Query system initialized successfully');
        } catch (err) {
            setError('Failed to initialize with the provided URL. Please check the URL and try again.');
            console.error('Initialization error:', err);
        } finally {
            setLoading(false);
        }
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
            const formattedVehicleData = {
                type: vehicleInfo.type || `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`,
                vin: vehicleInfo.vin,
                engine: vehicleInfo.engine,
                transmission: vehicleInfo.transmission,
                mileage: vehicleInfo.mileage,
                description: vehicleInfo.description || ''
            };

            const result = await axiosInstance.post('/api/dtc-query', { 
                query,
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

    return (
        <div className="dtc-query-container">
            <h2>BMW DTC Code Query</h2>
            <form onSubmit={handleInitialize} className="initialize-form">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter forum URL to initialize..."
                />
                <button type="submit" disabled={loading}>
                    Initialize
                </button>
            </form>
            <form onSubmit={handleSubmit} className="query-form">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your DTC code or question..."
                    className="query-input"
                />
                <button 
                    type="submit" 
                    disabled={loading || !query.trim()}
                    className="submit-button"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}
            
            {response && (
                <div className="response-container">
                    <h3>Response:</h3>
                    <div className="response-content">
                        {response}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DTCQueryInterface; 