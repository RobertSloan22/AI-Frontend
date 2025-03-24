import { useState } from 'react';
import { format } from 'date-fns';
import axiosInstance from '../../utils/axiosConfig';

const AppointmentsDrawer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchAppointments();
        }
    };

    const fetchAppointments = async () => {
        try {
            const { data } = await axiosInstance.get('/appointments');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todaysAppointments = data.filter(apt => 
                new Date(apt.start) >= today && new Date(apt.start) < tomorrow
            );
            setAppointments(todaysAppointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={toggleDrawer}
                className={`
                    fixed right-0 top-1/2 -translate-y-1/2 
                    bg-gray-800 text-white px-4 py-8 
                    rounded-l-lg shadow-lg hover:bg-gray-700 
                    transition-all duration-300 z-50
                    ${isOpen ? 'translate-x-0' : 'translate-x-2'}
                `}
            >
                {isOpen ? '▶' : '◀'}
            </button>

            {/* Drawer Panel */}
            <div className={`
                fixed top-0 right-0 h-full w-1/3 
                bg-gray-800 shadow-xl 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                z-40
            `}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Todays Appointments</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="text-gray-400">Loading appointments...</div>
                        ) : appointments.length === 0 ? (
                            <div className="text-gray-400">No appointments scheduled for today</div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map(appointment => (
                                    <div key={appointment._id} 
                                        className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-white font-medium">
                                                    {format(new Date(appointment.start), 'h:mm a')} - {appointment.customerName}
                                                </p>
                                                <p className="text-gray-400">{appointment.vehicle}</p>
                                                {appointment.notes && (
                                                    <p className="text-gray-400 mt-1">Notes: {appointment.notes}</p>
                                                )}
                                            </div>
                                            <span className="text-blue-400">
                                                {appointment.status || 'scheduled'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AppointmentsDrawer; 