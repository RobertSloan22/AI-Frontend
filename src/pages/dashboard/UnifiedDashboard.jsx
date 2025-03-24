import VehicleResearch from '../../components/vehicle/VehicleResearch';
import Research from '../../components/vehicle/Research';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { CustomerContextDisplay } from "../../components/customer/CustomerContextDisplay";
import { AppointmentsPage } from "../../components/assistant/AppointmentsPage";
//import App from '../../app/src/app/App';
import { App } from '../../app/src/app/App';
import { TranscriptProvider } from '../../app/src/app/contexts/TranscriptContext';
import { EventProvider } from '../../app/src/app/contexts/EventContext';
import { TextAssist } from "../../components/assistant/TextAssist";
import DTCQueryInterface from "../../components/dtc/DTCQueryInterface";
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

const UnifiedDashboard = () => {
    return (
        <>
        <div className="w-[100vw]">
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(14, 1fr)',
                gridTemplateRows: '35vh 10vh 55vh 15vh 30vh 50vh 55vh',
                gap: 2,
                padding: 2
            }}>
                <Box sx={{ 
                    gridColumn: '11/ span 4', 
                    gridRow: '1',
                    width: '100%',
                    height: '45vh',
                    '& > *': {
                        width: '100%',
                        height: '100%',
                        overflow: 'auto'
                    }
                }}>
                   
                </Box>
                
                <Box sx={{ gridColumn: '1/ span 4', gridRow: '3' }}>
                
                    <CustomerContextDisplay/>
                </Box>
                
                <Box sx={{ gridColumn: '9/ span 6', gridRow: '6' }}>
                </Box> 
                    <Box sx={{ gridColumn: '6/ span 5', gridRow: '5' }}>
                    </Box> 
                 <Box sx={{ gridColumn: '5/ span 6', gridRow: '1' }}>
                    
                        <VehicleResearch />
                    
                </Box>
                <Box sx={{ 
                    gridColumn: '9/ span 6', 
                    gridRow: '4',
                    width: '100%',
                    height: '45vh',
                    '& > *': {
                        width: '100%',
                        height: '100%',
                        overflow: 'auto'
                    }
                }}>                    
                </Box>
                <Box sx={{ 
                    gridColumn: '3/ span 9', 
                    gridRow: '7',
                    width: '100%',
                    height: '100vh',
                    '& > *': {
                        width: '100%',
                        height: '100%',
                        overflow: 'auto'
                    }
                }}>                    
                  
                    
                </Box>
                <Box sx={{ 
                    gridColumn: '12/ span 3', 
                    gridRow: '1',
                    width: '100%',
                    height: '65vh',
                    '& > *': {
                        width: '100%',
                        height: '100%',
                        overflow: 'auto'
                    }
                }}>   
                <AppointmentsPage />                 
                </Box>
                <Box sx={{ gridColumn: '1/ span 4', gridRow: '1' }}>
                    <TranscriptProvider>
                        <EventProvider>
                            <App />
                        </EventProvider>
                    </TranscriptProvider>
                </Box>
                
            </Box>
        </div>
        </>
    );
};

export default UnifiedDashboard;
