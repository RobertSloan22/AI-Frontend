import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentVehicle: null
};

const vehicleSlice = createSlice({
    name: 'vehicle',
    initialState,
    reducers: {
        setCurrentVehicle: (state, action) => {
            state.currentVehicle = action.payload;
        }
    }
});

export const { setCurrentVehicle } = vehicleSlice.actions;
export default vehicleSlice.reducer; 