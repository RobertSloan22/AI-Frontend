import { useState, useEffect } from 'react';
import CustomerSearch from '../customers/CustomerSearch';
import NewCustomerForm from '../customers/NewCustomerForm';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const AppointmentForm = ({ selectedAppointment, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    email: '',
    vehicle: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    vehiclePlate: '',
    complaint: '',
    notes: '',
    time: new Date().toISOString().slice(0, 16),
    status: 'scheduled'
  });

  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const location = useLocation();
  const customerData = location.state?.customerData;

  // Initialize form with customer data if available
  useEffect(() => {
    if (customerData) {
      setFormData(prevData => ({
        ...prevData,
        customerName: customerData.customerName,
        phoneNumber: customerData.phoneNumber,
        email: customerData.email
      }));
    }
  }, [customerData]);

  // Update form when selectedAppointment changes
  useEffect(() => {
    if (selectedAppointment) {
      setFormData({
        customerName: selectedAppointment.customerName || '',
        phoneNumber: selectedAppointment.phoneNumber || '',
        vehicle: selectedAppointment.vehicle || '',
        complaint: selectedAppointment.complaint || '',
        notes: selectedAppointment.notes || '',
        time: selectedAppointment.time || new Date().toISOString().slice(0, 16)
      });
    }
  }, [selectedAppointment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      _id: selectedAppointment?._id // Include _id if it exists (for updates)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({
      ...prev,
      customerName: `${customer.firstName} ${customer.lastName}`,
      phoneNumber: customer.phoneNumber,
      email: customer.email,
      vehicle: customer.vehicles?.[0] ? `${customer.vehicles[0].year} ${customer.vehicles[0].make} ${customer.vehicles[0].model}` : '',
      vehicleYear: customer.vehicles?.[0]?.year || '',
      vehicleMake: customer.vehicles?.[0]?.make || '',
      vehicleModel: customer.vehicles?.[0]?.model || '',
      vehiclePlate: customer.vehicles?.[0]?.licensePlate || ''
    }));
  };

  const handleNewCustomerSuccess = (newCustomer) => {
    handleCustomerSelect(newCustomer);
    setShowNewCustomerForm(false);
    toast.success('New customer created successfully');
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 w-[1000px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-3xl font-semibold text-white">Edit Appointment</h3>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowNewCustomerForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-2xl"
              >
                New Customer
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 text-3xl font-light"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="mb-6">
            <CustomerSearch onCustomerSelect={handleCustomerSelect} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-2xl font-medium text-white">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-700 text-white h-[60px] text-2xl px-4"
                  required
                />
              </div>

              <div>
                <label className="block text-2xl font-medium text-white">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-700 text-white h-[60px] text-2xl px-4"
                  required
                />
              </div>

              <div>
                <label className="block text-2xl font-medium text-white">Vehicle</label>
                <input
                  type="text"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-700 text-white h-[60px] text-2xl px-4"
                  required
                />
              </div>

              <div>
                <label className="block text-2xl font-medium text-white">Time</label>
                <input
                  type="datetime-local"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-700 text-white h-[60px] text-2xl px-4"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-2xl font-medium text-white">Complaint</label>
              <textarea
                name="complaint"
                value={formData.complaint}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-700 text-white h-[120px] text-2xl p-4"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-2xl font-medium text-white">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-700 text-white h-[120px] text-2xl p-4"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-2xl font-medium text-white">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-700 text-white h-[60px] text-2xl px-4"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-4 text-2xl text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              {selectedAppointment ? 'Update Appointment' : 'Create Appointment'}
            </button>
          </form>

          {/* New Customer Form Modal */}
          {showNewCustomerForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-3xl font-bold text-white">New Customer</h2>
                  <button
                    onClick={() => setShowNewCustomerForm(false)}
                    className="text-white hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>
                <NewCustomerForm onSuccess={handleNewCustomerSuccess} />
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default AppointmentForm;
