import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Input as UiInput } from "../ui/input";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: 'transparent',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.primary,
  position: 'relative',
  '& .dtc-container': {
    position: 'relative',
    zIndex: 9999,
  },
  '& .console-container': {
    position: 'relative',
    zIndex: 1,
  },
}));



interface LicensePlateResponse {
  vin: string;
  make: string;
  model: string;
  year: string;
  plate: string;
  state: string;
}

const LicensePlateSearch: React.FC = () => {
  const [plate, setPlate] = useState('');
  const [state, setState] = useState('');
  const [result, setResult] = useState<LicensePlateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get('/licenseplate', {
        params: {
          plate,
          state,
        }
      });
      setResult(response.data);
    } catch (err: any) {
      console.error('Error details:', err);
      if (err.response) {
        setError(err.response.data.error || 'Failed to lookup license plate');
      } else if (err.request) {
        setError('No response received from server. Please check your internet connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[30vh] bg-gray-900 bg-opacity-75 rounded-lg shadow-lg">
      <div className="p-4 bg-gray-800 bg-opacity-50 rounded-t-lg border-l-4 border-blue-500">
        <h2 className="text-2xl font-semibold text-blue-400">
          License Plate to VIN Lookup
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900 bg-opacity-50">
        <div className="space-y-4">
          <div>
            <label className="block text-xl text-gray-100 mb-2">
              License Plate
            </label>
            <UiInput
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              className="w-full bg-gray-800 text-white text-xl placeholder:text-gray-400 border-gray-700"
              placeholder="Enter license plate"
            />
          </div>

          <div>
            <label className="block text-xl text-gray-100 mb-2">
              State
            </label>
            <UiInput
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              className="w-full bg-gray-800 text-white text-xl placeholder:text-gray-400 border-gray-700"
              placeholder="Enter state (e.g., CA)"
              maxLength={2}
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !plate || !state}
            className={`w-full px-4 py-2 text-xl text-white rounded ${
              loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-red-900 bg-opacity-50 border-l-4 border-red-500 text-red-200">
              {error}
            </div>
          )}

          {result && (
            <div className="p-3 rounded-lg bg-gray-800 text-gray-100 border-l-4 border-green-500">
              <h3 className="font-semibold text-xl mb-2">Results:</h3>
              <div className="space-y-2">
                <p>Plate: {result.plate}</p>
                <p>State: {result.state}</p>
                <p>VIN: {result.vin}</p>
                <p>Make: {result.make}</p>
                <p>Model: {result.model}</p>
                <p>Year: {result.year}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicensePlateSearch; 