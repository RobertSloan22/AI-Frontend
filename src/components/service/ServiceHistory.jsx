import { useState, useEffect } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import axiosInstance from '../../utils/axiosConfig';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    FormControl, 
    Select, 
    MenuItem, 
    Grid,
    Chip,
} from '@mui/material';
import { format } from 'date-fns';
import FilterListIcon from '@mui/icons-material/FilterList';

const ServiceHistory = () => {
    const { currentVehicle } = useCustomer();
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [filters, setFilters] = useState({
        dateRange: 'all',
        serviceType: 'all'
    });

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axiosInstance.get(`/services/vehicle/${currentVehicle._id}`);
                setServices(response.data);
                setFilteredServices(response.data);
            } catch (error) {   
                console.error('Error fetching services:', error);
            }
        };

        if (currentVehicle?._id) {
            fetchServices();
        }
    }, [currentVehicle?._id]);

    useEffect(() => {
        let filtered = [...services];

        if (filters.dateRange !== 'all') {
            const now = new Date();
            const monthsAgo = new Date();
            monthsAgo.setMonth(now.getMonth() - parseInt(filters.dateRange));
            
            filtered = filtered.filter(service => 
                new Date(service.serviceDate) >= monthsAgo
            );
        }

        if (filters.serviceType !== 'all') {
            filtered = filtered.filter(service => 
                service.serviceType === filters.serviceType
            );
        }

        setFilteredServices(filtered);
    }, [filters, services]);

    const getStatusColor = (status) => {
        const colors = {
            completed: 'success',
            scheduled: 'info',
            'in-progress': 'warning',
            cancelled: 'error'
        };
        return colors[status] || 'default';
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h1">
                    Service History
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small">
                        <Select
                            value={filters.dateRange}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                            displayEmpty
                            startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
                        >
                            <MenuItem value="all">All Time</MenuItem>
                            <MenuItem value="3">Last 3 Months</MenuItem>
                            <MenuItem value="6">Last 6 Months</MenuItem>
                            <MenuItem value="12">Last Year</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small">
                        <Select
                            value={filters.serviceType}
                            onChange={(e) => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
                            displayEmpty
                        >
                            <MenuItem value="all">All Services</MenuItem>
                            <MenuItem value="maintenance">Maintenance</MenuItem>
                            <MenuItem value="repair">Repair</MenuItem>
                            <MenuItem value="diagnostic">Diagnostic</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Grid container spacing={2}>
                {filteredServices.map((service) => (
                    <Grid item xs={12} key={service._id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="h6">
                                        {service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1)}
                                    </Typography>
                                    <Chip 
                                        label={service.status}
                                        color={getStatusColor(service.status)}
                                        size="small"
                                    />
                                </Box>
                                <Typography color="text.secondary" gutterBottom>
                                    {format(new Date(service.serviceDate), 'MMM dd, yyyy')}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {service.notes}
                                </Typography>
                                {service.technician && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Technician: {service.technician.name}
                                    </Typography>
                                )}
                                {service.parts && service.parts.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Parts Used:
                                        </Typography>
                                        {service.parts.map((part, index) => (
                                            <Chip
                                                key={index}
                                                label={part.partId.name}
                                                size="small"
                                                sx={{ mr: 0.5, mt: 0.5 }}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ServiceHistory; 