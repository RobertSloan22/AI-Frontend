import { Link } from 'react-router-dom';
import useAppointmentsRedux from '../../hooks/useAppointmentsRedux';

const AppointmentList = () => {
    const { 
        appointments, 
        isLoading,
        error,
        deleteAppointment 
    } = useAppointmentsRedux();

    if (error) {
        return (
            <div className="text-red-500">
                Error loading appointments: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6 w-[50vw]">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Appointments</h2>
                <Link
                    to="/appointments/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    New Appointment
                </Link>
            </div>

            {isLoading ? (
                <div className="text-white">Loading appointments...</div>
            ) : (
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {appointments.map((appointment) => (
                                <tr key={appointment._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                        {new Date(appointment.start).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                        {appointment.customerName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                        {appointment.complaint || 'No service specified'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                            appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'}`}>
                                            {appointment.status || 'scheduled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <div className="flex space-x-4">
                                            <Link
                                                to={`/appointments/${appointment._id}`}
                                                className="text-blue-400 hover:text-blue-300"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this appointment?')) {
                                                        deleteAppointment(appointment._id);
                                                    }
                                                }}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AppointmentList; 