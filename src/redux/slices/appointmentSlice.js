// create an appointmentSlice
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    appointments: [],
    currentAppointment: null,
    isLoading: false,
    error: null
};

const appointmentSlice = createSlice({
    name: 'appointment',
    initialState,
    reducers: {
        setAppointments: (state, action) => {
            state.appointments = action.payload;
        },
        setCurrentAppointment: (state, action) => {
            state.currentAppointment = action.payload;
        },
        addAppointment: (state, action) => {
            state.appointments.push(action.payload);
        },
        updateAppointment: (state, action) => {
            const index = state.appointments.findIndex(apt => apt._id === action.payload._id);
            if (index !== -1) {
                state.appointments[index] = action.payload;
            }
        },
        deleteAppointment: (state, action) => {
            state.appointments = state.appointments.filter(apt => apt._id !== action.payload);
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setAppointments,
    setCurrentAppointment,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    setLoading,
    setError
} = appointmentSlice.actions;

export default appointmentSlice.reducer; 