import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { LogService } from '../../services/LogService';

interface LogData {
  _id: string;
  "Time (sec)": number;
  " Vehicle speed (MPH)": number;
  " Engine RPM (RPM)": number;
  " Engine coolant temperature (°F)": number;
  " Calculated load value (%)": number;
  " Fuel rate (gal/hr)": number;
  " Throttle position (%)": number;
  " Intake manifold pressure (psi)": number;
  " Air intake temperature (°F)": number;
  " MAF air flow rate (lb/min)": number;
  " O2 Voltage Bank 1 sensor 1 (V)": number;
  " O2 Voltage Bank 1 sensor 2 (V)": number;
  " Short term fuel trim Bank 1 (%)": number;
  " Long term fuel trim Bank 1 (%)": number;
  " Short term fuel trim Bank 2 (%)": number;
  " Long term fuel trim Bank 2 (%)": number;
  " Absolute throttle position (%)": number;
  " Relative throttle position (%)": number;
  " Timing advance (°)": number;
  " Catalyst temperature Bank 1 Sensor 1 (°F)": number;
  " Catalyst temperature Bank 1 Sensor 2 (°F)": number;
  " Catalyst temperature Bank 2 Sensor 1 (°F)": number;
  " Catalyst temperature Bank 2 Sensor 2 (°F)": number;
  " Control module voltage (V)": number;
  " Absolute load value (%)": number;
  " Commanded equivalence ratio": number;
  " Relative accelerator pedal position (%)": number;
  " Hybrid battery pack remaining life (%)": number;
  " Engine oil temperature (°F)": number;
  " Fuel injection timing (°)": number;
  " Engine fuel rate (gal/hr)": number;
}

interface LogViewerProps {
  logService: LogService;
}

export const LogViewer: React.FC<LogViewerProps> = ({ logService }) => {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching logs from:', 'http://localhost:3005/api/logs');
        const response = await fetch('http://localhost:3005/api/logs', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors'
        });
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to fetch logs: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        setLogs(data.logs);
        setError(null);
      } catch (err) {
        console.error('Error details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch log data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !logs.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column" gap={2}>
        <Typography color="error" variant="h6">Error loading logs:</Typography>
        <Typography color="error" variant="body1">{error}</Typography>
      </Box>
    );
  }

  if (!logs.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h6">No log data available</Typography>
      </Box>
    );
  }

  // Get all columns from the LogData interface except _id
  const columns = Object.keys(logs[0]).filter(key => key !== '_id');

  return (
    <TableContainer 
      component={Paper} 
      style={{ 
        maxHeight: '100%', 
        overflow: 'auto',
        padding: '16px',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Table size="medium" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell 
                key={column} 
                style={{ 
                  fontWeight: 'bold', 
                  whiteSpace: 'nowrap',
                  fontSize: '1rem',
                  padding: '12px 16px',
                  backgroundColor: '#1976d2',
                  color: 'white'
                }}
              >
                {column.replace(/^[ "]|"$/g, '')}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow 
              key={log._id}
              hover
              style={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
            >
              {columns.map((column) => (
                <TableCell 
                  key={column} 
                  style={{ 
                    whiteSpace: 'nowrap',
                    fontSize: '0.95rem',
                    padding: '10px 16px'
                  }}
                >
                  {typeof log[column as keyof LogData] === 'number' 
                    ? (log[column as keyof LogData] as number).toFixed(2)
                    : log[column as keyof LogData]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LogViewer; 