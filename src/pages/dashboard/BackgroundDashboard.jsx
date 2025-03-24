import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { DiagnosticDisplay } from '../../components/DiagnosticDisplay';
import VehicleResearch from '../../components/vehicle/VehicleResearch';
import ServiceResearch from '../../components/service/ServiceResearch';
import { ChatInfoDisplay } from '../../components/ChatInfoDisplay';

const BackgroundDashboard = () => {
  return (
    <div className="w-[100vw] h-[100vh] overflow-y-auto bg-gray-700/80">
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(14, 1fr)',
        gridTemplateRows: '80vh 80vh 55vh 15vh 30vh 50vh 55vh',
        gap: 2,
        padding: 2
      }}>
        {/* Vehicle Research */}
        <Box sx={{ gridColumn: '1/ span 12', gridRow: '1' }}>
          <VehicleResearch />
        </Box>

        {/* Diagnostic Display */}


        {/* Service Research */}
        <Box sx={{ gridColumn: '1/ span 12', gridRow: '3' }}>
          <ServiceResearch />
        </Box>
      </Box>
    </div>
  );
};

export default BackgroundDashboard;
