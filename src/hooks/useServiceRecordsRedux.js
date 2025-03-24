import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../utils/axiosConfig';
import {
    setServiceRecords,
    addServiceRecord,
    updateServiceRecord,
    deleteServiceRecord,
    setLoading,
    setError
} from '../redux/slices/serviceRecordSlice';

const useServiceRecordsRedux = () => {
    const dispatch = useDispatch();
    const { serviceRecords, isLoading, error } = useSelector((state) => state.serviceRecord);

    const fetchServiceRecords = async () => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const { data: invoiceData } = await axiosInstance.get('/invoices/all');
            const formattedRecords = Array.isArray(invoiceData)
                ? invoiceData.map((inv) => ({
                    _id: inv._id,
                    invoiceNumber: inv.invoiceNumber || 'N/A',
                    customerName: inv.customerName,
                    vehicle: inv.vehicle || {},
                    total: inv.total || 0,
                    date: inv.date || new Date().toISOString(),
                    status: inv.status || 'draft',
                }))
                : [];
            dispatch(setServiceRecords(formattedRecords));
        } catch (err) {
            dispatch(setError(err.message));
            console.error('Error fetching service records:', err);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const createServiceRecord = async (recordData) => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const response = await axiosInstance.post('/invoices', recordData);
            dispatch(addServiceRecord(response.data));
            return response.data;
        } catch (err) {
            dispatch(setError(err.message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const updateExistingServiceRecord = async (id, recordData) => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const response = await axiosInstance.put(`/invoices/${id}`, recordData);
            dispatch(updateServiceRecord(response.data));
            return response.data;
        } catch (err) {
            dispatch(setError(err.message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const deleteExistingServiceRecord = async (id) => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            await axiosInstance.delete(`/invoices/${id}`);
            dispatch(deleteServiceRecord(id));
        } catch (err) {
            dispatch(setError(err.message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    // Get vehicles in service (not billed)
    const getVehiclesInService = () => {
        return serviceRecords.filter(record => record.status !== 'billed');
    };

    // Get pending invoices (draft status)
    const getPendingInvoices = () => {
        return serviceRecords.filter(record => record.status === 'draft');
    };

    // Fetch service records on component mount
    useEffect(() => {
        fetchServiceRecords();
    }, []);

    return {
        serviceRecords,
        isLoading,
        error,
        refreshServiceRecords: fetchServiceRecords,
        createServiceRecord,
        updateServiceRecord: updateExistingServiceRecord,
        deleteServiceRecord: deleteExistingServiceRecord,
        getVehiclesInService,
        getPendingInvoices
    };
};

export default useServiceRecordsRedux; 