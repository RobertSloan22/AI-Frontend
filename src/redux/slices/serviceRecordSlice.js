import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    serviceRecords: [],
    isLoading: false,
    error: null
};

const serviceRecordSlice = createSlice({
    name: 'serviceRecord',
    initialState,
    reducers: {
        setServiceRecords: (state, action) => {
            state.serviceRecords = action.payload;
        },
        addServiceRecord: (state, action) => {
            state.serviceRecords.push(action.payload);
        },
        updateServiceRecord: (state, action) => {
            const index = state.serviceRecords.findIndex(record => record._id === action.payload._id);
            if (index !== -1) {
                state.serviceRecords[index] = action.payload;
            }
        },
        deleteServiceRecord: (state, action) => {
            state.serviceRecords = state.serviceRecords.filter(record => record._id !== action.payload);
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
    setServiceRecords,
    addServiceRecord,
    updateServiceRecord,
    deleteServiceRecord,
    setLoading,
    setError
} = serviceRecordSlice.actions;

export default serviceRecordSlice.reducer; 