import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AppointmentForm from './AppointmentForm';
import enUS from 'date-fns/locale/en-US';
import { toast } from 'react-toastify';
import useAppointmentsRedux from '../../hooks/useAppointmentsRedux';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const AppointmentsDropdown = () => {
  const { 
    appointments, 
    isLoading, 
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refreshAppointments 
  } = useAppointmentsRedux();

  const [selectedAppointment, setSelectedAppointment] = useState({
    customerName: '',
    phoneNumber: '',
    vehicle: '',
    complaint: '',
    notes: '',
    time: new Date().toISOString().slice(0, 16),
    start: new Date(),
    end: new Date()
  });
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = ({ start, end }) => {
    setSelectedAppointment({
      ...selectedAppointment,
      time: start.toISOString().slice(0, 16),
      start,
      end
    });
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment(appointmentId);
        toast.success('Appointment deleted successfully');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Failed to delete appointment');
      }
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedAppointment(event);
    setShowAppointmentModal(true);
  };

  const handleSaveAppointment = async (appointment) => {
    try {
      const newAppointment = {
        ...appointment,
        title: `${appointment.customerName} - ${appointment.vehicle}`,
        start: new Date(appointment.time),
        end: new Date(new Date(appointment.time).setHours(new Date(appointment.time).getHours() + 1)),
        status: appointment.status || 'scheduled'
      };

      if (appointment._id) {
        await updateAppointment(appointment._id, newAppointment);
      } else {
        await createAppointment(newAppointment);
      }
      
      await refreshAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Failed to save appointment');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="bg-blue-600 text-white px-4 py-2 text-2xl rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <span>Appointments</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-[1600px] bg-gray-800 rounded-lg shadow-xl z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Appointments</h2>
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-xl"
              >
                Create Appointment
              </button>
            </div>

            {error && <div className="text-red-500 mb-4 text-xl">Error loading appointments: {error}</div>}
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="h-[1200px]">
                <Calendar
                  localizer={localizer}
                  events={appointments}
                  startAccessor="start"
                  endAccessor="end"
                  style={{
                    height: '100%',
                    width: '100%',
                    color: 'white',
                    backgroundColor: 'transparent',
                    fontSize: '1rem'
                  }}
                  selectable
                  onSelectSlot={handleSelect}
                  onSelectEvent={handleSelectEvent}
                  defaultView='month'
                  className="text-white"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {selectedAppointment._id ? 'Edit Appointment' : 'Create Appointment'}
              </h2>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="text-white hover:text-white"
              >
                ✕
              </button>
            </div>
            <AppointmentForm
              onSave={(appointment) => {
                handleSaveAppointment(appointment);
                setShowAppointmentModal(false);
              }}
              selectedAppointment={selectedAppointment}
              onClose={() => setShowAppointmentModal(false)}
              onDelete={handleDeleteAppointment}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsDropdown;
