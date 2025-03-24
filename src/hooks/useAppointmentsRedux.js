import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../utils/axiosConfig';
import {
    setAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    setLoading,
    setError
} from '../redux/slices/appointmentSlice';

const useAppointmentsRedux = () => {
    const dispatch = useDispatch();
    const { appointments, isLoading, error } = useSelector((state) => state.appointment);

    const fetchAppointments = async () => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const response = await axiosInstance.get('/appointments');
            const formattedAppointments = response.data.map(apt => ({
                ...apt,
                start: new Date(apt.start),  // Convert to Date object
                end: new Date(apt.end),      // Convert to Date object
                time: new Date(apt.start).toISOString().slice(0, 16),
                title: `${apt.customerName} - ${apt.vehicle}`
            }));
            dispatch(setAppointments(formattedAppointments));
        } catch (err) {
            dispatch(setError(err.message));
            console.error('Error fetching appointments:', err);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const createAppointment = async (appointmentData) => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const response = await axiosInstance.post('/appointments', appointmentData);
            const formattedAppointment = {
                ...response.data,
                start: new Date(response.data.start),
                end: new Date(response.data.end),
                time: new Date(response.data.start).toISOString().slice(0, 16),
                title: `${response.data.customerName} - ${response.data.vehicle}`
            };
            dispatch(addAppointment(formattedAppointment));
            return formattedAppointment;
        } catch (err) {
            dispatch(setError(err.message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const updateExistingAppointment = async (id, appointmentData) => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const response = await axiosInstance.put(`/appointments/${id}`, appointmentData);
            const formattedAppointment = {
                ...response.data,
                start: new Date(response.data.start),
                end: new Date(response.data.end),
                time: new Date(response.data.start).toISOString().slice(0, 16),
                title: `${response.data.customerName} - ${response.data.vehicle}`
            };
            dispatch(updateAppointment(formattedAppointment));
            return formattedAppointment;
        } catch (err) {
            dispatch(setError(err.message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const deleteExistingAppointment = async (id) => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            await axiosInstance.delete(`/appointments/${id}`);
            dispatch(deleteAppointment(id));
        } catch (err) {
            dispatch(setError(err.message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    // Fetch appointments on component mount
    useEffect(() => {
        fetchAppointments();
    }, []);

    return {
        appointments,
        isLoading,
        error,
        refreshAppointments: fetchAppointments,
        createAppointment,
        updateAppointment: updateExistingAppointment,
        deleteAppointment: deleteExistingAppointment
    };
};

export default useAppointmentsRedux; 