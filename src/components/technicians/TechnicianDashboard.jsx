import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import  MaintenanceReminders  from '../maintenance/MaintenanceReminders';
import DiagnosticReports  from '../diagnostics/DiagnosticReports';
import { CustomerContextDisplay } from '../customer/CustomerContextDisplay';
import  VehicleDetails  from '../vehicles/VehicleDetails';
import  VehicleSelectionModal  from '../vehicles/VehicleSelectionModal';
import { styled } from '@mui/material/styles';
import ServiceHistory from '../service/ServiceHistory';
import ServiceCalendar from '../scheduling/ServiceCalendar';
import {
    Box,
    Paper,
    Typography,
    Avatar,
    Card,
    CardContent,
    Grid,
    Chip,
    LinearProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Build as BuildIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosConfig';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: 'transparent',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    color: theme.palette.text.primary,
}));

const TechnicianCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
}));

const JobCard = styled(Paper)(({ isDragging }) => ({
    margin: '8px 0',
    padding: '16px',
    backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
}));

const TechnicianDashboard = () => {
    const [technicians, setTechnicians] = useState([]);
    const [assignments, setAssignments] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [techResponse, servicesResponse] = await Promise.all([
                    axiosInstance.get('/technicians'),
                    axiosInstance.get('/services')
                ]);

                setTechnicians(techResponse.data);
                
                // Organize services by technician
                const assignmentsByTech = techResponse.data.reduce((acc, tech) => {
                    acc[tech._id] = servicesResponse.data.filter(
                        service => service.technician?._id === tech._id
                    );
                    return acc;
                }, {});
                
                setAssignments(assignmentsByTech);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;
        
        // If dropped in the same list and same position, do nothing
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) return;

        try {
            // Update the service assignment in the backend
            await axiosInstance.put(`/services/${draggableId}`, {
                technician: destination.droppableId
            });

            // Update local state
            const newAssignments = { ...assignments };
            
            // Remove from source
            const [movedJob] = newAssignments[source.droppableId].splice(source.index, 1);
            
            // Add to destination
            newAssignments[destination.droppableId].splice(destination.index, 0, movedJob);
            
            setAssignments(newAssignments);
        } catch (error) {
            console.error('Error updating assignment:', error);
            // You might want to show an error message to the user here
        }
    };

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <>
           <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: '35vh 45vh 10vh',
            gap: 2,
            padding: 2
          }}>
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Technician Dashboard
            </Typography>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Grid container spacing={3}>
                    {technicians.map((technician) => (
                        <Grid item xs={12} md={6} lg={4} key={technician._id}>
                            <TechnicianCard>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar
                                            src={technician.avatar}
                                            sx={{ width: 56, height: 56, mr: 2 }}
                                        />
                                        <Box>
                                            <Typography variant="h6">
                                                {technician.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {technician.specialization}
                                            </Typography>
                                            <Box sx={{ mt: 1 }}>
                                                <Chip
                                                    size="small"
                                                    label={`${assignments[technician._id]?.length || 0} Active Jobs`}
                                                    color="primary"
                                                    icon={<AssignmentIcon />}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Droppable droppableId={technician._id}>
                                        {(provided, snapshot) => (
                                            <Box
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                sx={{
                                                    minHeight: 200,
                                                    backgroundColor: snapshot.isDraggingOver
                                                        ? 'rgba(255, 255, 255, 0.05)'
                                                        : 'transparent',
                                                    transition: 'background-color 0.2s ease',
                                                    padding: 1
                                                }}
                                            >
                                                {assignments[technician._id]?.map((job, index) => (
                                                    <Draggable
                                                        key={job._id}
                                                        draggableId={job._id}
                                                        index={index}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <JobCard
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                isDragging={snapshot.isDragging}
                                                            >
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Typography variant="subtitle1">
                                                                        {job.serviceType}
                                                                    </Typography>
                                                                    <Chip
                                                                        size="small"
                                                                        label={job.status}
                                                                        color={
                                                                            job.status === 'completed' ? 'success' :
                                                                            job.status === 'in-progress' ? 'warning' :
                                                                            'default'
                                                                        }
                                                                    />
                                                                </Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {job.notes?.split('\n')[0]}
                                                                </Typography>
                                                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                                                    <Tooltip title="View Details">
                                                                        <IconButton size="small">
                                                                            <BuildIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Mark Complete">
                                                                        <IconButton size="small">
                                                                            <CheckCircleIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Reschedule">
                                                                        <IconButton size="small">
                                                                            <ScheduleIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </JobCard>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </Box>
                                        )}
                                    </Droppable>
                                </CardContent>
                            </TechnicianCard>
                        </Grid>
                    ))}
                </Grid>
            </DragDropContext>
        </Box>
        <Box sx={{ gridColumn: '1 / span 6', gridRow: '2 / span 2' }}>
        <CustomerContextDisplay />
  
            </Box>         

    </Box>


 </>
                    
    );
};

export default TechnicianDashboard; 