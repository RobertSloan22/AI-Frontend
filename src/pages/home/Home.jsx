//import LogoutButton from '../../components/sidebar/LogoutButton';
//import LicensePlateSearch from '../../components/vehicles/LicensePlateSearch';
import Box from '@mui/material/Box';
//import { Whisper } from '../../components/assistant/Whisper'
//import { Grid } from '@mui/material';
//import EstimateBuilder from '../../components/invoicing/EstimateBuilder';
//import ServiceForm from '../services/ServiceForm';
//import ServiceList from '../services/ServiceList';
//import TechnicianDashboard from '../technicians/TechnicianDashboard';
//import TechnicianDetails from '../technicians/TechnicianDetails';
//import TechnicianList from '../technicians/TechnicianList';
import ForumDTCAnalyzer from '../../components/dtc/ForumDTCAnalyzer';
//import UnifiedDashboard from '../dashboard/UnifiedDashboard';
//import RealtimeChat from '../../components/realtime/RealtimeChat';

//import A from '../../components/assistant/A';


const Home = () => {
    return (
        <>
<Box sx={{
  display: 'grid',
  // Define columns - creates 12 equal columns
  gridTemplateColumns: 'repeat(12, 1fr)',
  // Define rows - creates 3 rows with specific heights
  gridTemplateRows: '20vh 40vh 40vh 30vh 20vh ',
  gap: 2,
  height: '100vh', // Full viewport height
  padding: 2
}}>
  <Box sx={{ gridColumn: '2 / span 4', gridRow: '2' }}>
  <ForumDTCAnalyzer />
  </Box>
</Box>


        </>
    );
};

export default Home;
