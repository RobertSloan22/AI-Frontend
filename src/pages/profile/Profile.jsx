import { Grid, Container, AppBar, Toolbar } from '@mui/material';
import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";
import { Link } from "react-router-dom";
import StatsGrid from "../../components/dashboard/StatsGrid";
// import invoice and new invoice from invoice folder
import InvoiceContainer from "../invoice/Invoice";
import NewInvoice from "../invoice/NewInvoice";
// import service list from service folder
import ServiceList from "../services/ServiceList";
import UnifiedDashboard from '../dashboard/UnifiedDashboard';
//import { VoiceAssistant } from '../../components/assistant/VoiceAssistant'
import './profile.css'
import { AppointmentsPage } from '../../components/assistant/AppointmentsPage'
import DiagnosticReports from '../../components/diagnostics/DiagnosticReports'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';


// import grid, item and gridcontainer from npm install @mui/material @emotion/react @emotion/styled
// use a grid to lay out the page
const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: 'transparent',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.primary,
    ...theme.applyStyles('dark', {
    }),
  }));
 

// import engine diagram from assistant folder

const Profile = () => {
	return (
    <>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(14, 1fr)',
      gridTemplateRows: '30vh 30vh 10vh',
      gap: 2,
      padding: 2
    }}>
    <Box sx={{ gridColumn: '1/ span 20', gridRow: '1' }}> 

    <UnifiedDashboard />
    <DiagnosticReports />

    </Box>
    </Box>
    </>
	);
};

export default Profile;
