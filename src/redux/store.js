import { configureStore } from '@reduxjs/toolkit';
import vehicleReducer from './slices/vehicleSlice';
import appointmentReducer from './slices/appointmentSlice';
import serviceRecordReducer from './slices/serviceRecordSlice';

export const store = configureStore({
    reducer: {
        vehicle: vehicleReducer,
        appointment: appointmentReducer,
        serviceRecord: serviceRecordReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these paths in the state
                ignoredPaths: [
                    'appointment.appointments',
                    'serviceRecord.serviceRecords'
                ],
                // Ignore these field paths in all actions
                ignoredActionPaths: [
                    'payload.start',
                    'payload.end',
                    'payload.time',
                    'payload.date',
                    'meta.arg.start',
                    'meta.arg.end',
                    'meta.arg.time',
                    'meta.arg.date',
                    'payload.*.start',
                    'payload.*.end',
                    'payload.*.time',
                    'payload.*.date',
                    'payload.0.start',
                    'payload.0.end',
                    'payload.0.time',
                    'payload.0.date'
                ],
            },
        }),
});

export default store; 