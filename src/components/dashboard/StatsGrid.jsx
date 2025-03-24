import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';

// Import your CustomerContextDisplay
import { CustomerContextDisplay } from '../customer/CustomerContextDisplay';
// Import useAppointmentsRedux
import useAppointmentsRedux from '../../hooks/useAppointmentsRedux';
import useServiceRecordsRedux from '../../hooks/useServiceRecordsRedux';
import { useCustomer } from '../../context/CustomerContext';

export default function StatsGrid() {
  const navigate = useNavigate();

  // Replace appointments state with Redux hook
  const { appointments, isLoading: appointmentsLoading } = useAppointmentsRedux();
  
  // Replace service records state with Redux hook
  const { 
    serviceRecords,
    isLoading: serviceLoading,
    getVehiclesInService,
    getPendingInvoices
  } = useServiceRecordsRedux();

  // Expand/collapse states for each card
  const [showAppointments, setShowAppointments] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [showCustomerContext, setShowCustomerContext] = useState(false);

  // If you want a quick summary for the 5th card (e.g., name, phone),
  // you can pull them from the context:
  const { selectedCustomer, selectedVehicle } = useCustomer();

  // Filter today's appointments
  const todaysAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return appointments.filter(
      (apt) => apt.start >= today && apt.start < tomorrow
    );
  }, [appointments]);

  // Get counts using Redux selectors
  const appointmentsTodayCount = todaysAppointments.length;
  const vehiclesInService = getVehiclesInService();
  const vehiclesInServiceCount = vehiclesInService.length;
  const pendingInvoices = getPendingInvoices();
  const pendingInvoicesCount = pendingInvoices.length;

  // 4) Low stock items (placeholder)
  const lowStockCount = 12;

  // For styling borders & text color
  const getBorderColor = (color) => {
    const colors = {
      blue: 'border-blue-500 hover:border-blue-400',
      green: 'border-green-500 hover:border-green-400',
      yellow: 'border-yellow-500 hover:border-yellow-400',
      red: 'border-red-500 hover:border-red-400',
      purple: 'border-purple-500 hover:border-purple-400',
    };
    return colors[color] || colors.blue;
  };

  const getTextColor = (color) => {
    const colors = {
      blue: 'text-blue-400',
      green: 'text-green-400',
      yellow: 'text-yellow-400',
      red: 'text-red-400',
      purple: 'text-purple-400',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-gray-900 bg-opacity-75 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-blue-400 mb-6">
        Dashboard Overview
      </h2>

      {/* 5 columns on large screens so we can have a 5th item for the customer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* ---------- 1) Appointments Today ---------- */}
        <div
          className={`bg-gray-800 bg-opacity-50 rounded-lg p-6 border-l-4
                      transition-all ${getBorderColor('blue')}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-3xl mr-2">📅</span>
              <div>
                <h3 className="text-3xl font-semibold text-white">
                  Appointments Today
                </h3>
                <p className="text-gray-400 text-sm">
                  Scheduled appointments for today
                </p>
              </div>
            </div>
            <span className={`text-3xl font-bold ${getTextColor('blue')}`}>
              {appointmentsLoading ? '...' : appointmentsTodayCount}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAppointments((prev) => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
          >
            {showAppointments ? 'Hide' : 'Show'} All Appointments
          </button>

          {showAppointments && (
            <div className="mt-4 max-h-48 overflow-auto">
              {appointmentsLoading ? (
                <p className="text-gray-400">Loading appointments...</p>
              ) : appointments.length === 0 ? (
                <p className="text-gray-400">No appointments found.</p>
              ) : (
                <ul className="space-y-2">
                  {appointments.map((apt) => (
                    <li
                      key={apt._id}
                      className="bg-gray-700 p-2 rounded text-white text-sm"
                    >
                      <p className="font-bold">
                        {apt.customerName || 'Unknown Customer'}
                      </p>
                      {apt.vehicle && (
                        <p>
                          {apt.vehicle.year} {apt.vehicle.make}{' '}
                          {apt.vehicle.model}
                        </p>
                      )}
                      <p className="text-gray-400">
                        {apt.start.toLocaleString()} -{' '}
                        {apt.end.toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* ---------- 2) Vehicles In Service ---------- */}
        <div
          className={`bg-gray-800 bg-opacity-50 rounded-lg p-6 border-l-4
                      transition-all ${getBorderColor('green')}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-3xl mr-2">🚗</span>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Vehicles In Service
                </h3>
                <p className="text-gray-400 text-sm">
                  Currently being serviced
                </p>
              </div>
            </div>
            <span className={`text-3xl font-bold ${getTextColor('green')}`}>
              {serviceLoading ? '...' : vehiclesInServiceCount}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowVehicles((prev) => !prev)}
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
          >
            {showVehicles ? 'Hide' : 'Show'} Details
          </button>

          {showVehicles && (
            <div className="mt-4 max-h-48 overflow-auto">
              {serviceLoading ? (
                <p className="text-gray-400">Loading vehicles...</p>
              ) : vehiclesInService.length === 0 ? (
                <p className="text-gray-400">No vehicles in service.</p>
              ) : (
                <ul className="space-y-2">
                  {vehiclesInService.map((rec) => (
                    <li
                      key={rec._id}
                      className="bg-gray-700 p-2 rounded text-white text-sm"
                    >
                      <p className="font-bold">
                        {rec.customerName || 'Unknown Customer'}
                      </p>
                      {rec.vehicle && (
                        <p>
                          {rec.vehicle.year} {rec.vehicle.make}{' '}
                          {rec.vehicle.model}
                        </p>
                      )}
                      <p className="text-gray-400">
                        Invoice #{rec.invoiceNumber}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* ---------- 3) Pending Invoices ---------- */}
        <div
          className={`bg-gray-800 bg-opacity-50 rounded-lg p-6 border-l-4
                      transition-all ${getBorderColor('yellow')}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-3xl mr-2">📄</span>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Pending Invoices
                </h3>
                <p className="text-gray-400 text-sm">Awaiting completion</p>
              </div>
            </div>
            <span className={`text-3xl font-bold ${getTextColor('yellow')}`}>
              {pendingInvoicesCount}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowPending((prev) => !prev)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm"
          >
            {showPending ? 'Hide' : 'Show'} Details
          </button>

          {showPending && (
            <div className="mt-4 max-h-48 overflow-auto">
              {pendingInvoices.length === 0 ? (
                <p className="text-gray-400">No pending invoices.</p>
              ) : (
                <ul className="space-y-2">
                  {pendingInvoices.map((inv) => (
                    <li
                      key={inv._id}
                      className="bg-gray-700 p-2 rounded text-white text-sm"
                    >
                      <p className="font-bold">
                        {inv.customerName || 'Unknown Customer'}
                      </p>
                      {inv.vehicle && (
                        <p>
                          {inv.vehicle.year} {inv.vehicle.make}{' '}
                          {inv.vehicle.model}
                        </p>
                      )}
                      <p>Invoice #{inv.invoiceNumber}</p>
                      <p className="text-gray-400">Total: ${inv.total}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* ---------- 4) Low Stock Items ---------- */}
        <div
          className={`bg-gray-800 bg-opacity-50 rounded-lg p-6 border-l-4
                      transition-all ${getBorderColor('red')}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-3xl mr-2">⚠️</span>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Low Stock Items
                </h3>
                <p className="text-gray-400 text-sm">Items needing reorder</p>
              </div>
            </div>
            <span className={`text-3xl font-bold ${getTextColor('red')}`}>
              {lowStockCount}
            </span>
          </div>
        </div>

        {/* ---------- 5) Customer Context ---------- */}
        <div
          className={`bg-gray-800 bg-opacity-50 rounded-lg p-6 border-l-4
                      transition-all ${getBorderColor('white')}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-2">👥</span>
              <h3 className={`text-3xl font-bold ${getTextColor('white')}`}>
                Customer
              </h3>
            </div>

            {/* Expand/Collapse Button for the Customer context */}
            <button
              type="button"
              onClick={() => setShowCustomerContext((prev) => !prev)}
              className="bg-purple-600 hover:bg-green-700 text-white px-2 py-1 rounded text-lg"
            >
              {showCustomerContext ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {!showCustomerContext ? (
            // Collapsed state: Quick summary or fallback
            selectedCustomer ? (
              <div>
                <p className="text-white text-xl font-semibold">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </p>
                <p className="text-gray-400 text-xl">
                  {selectedCustomer.phoneNumber || 'No Phone'}
                </p>
                {selectedVehicle && (
                  <p className="text-white text-xl mt-2">
                    {selectedVehicle.year} {selectedVehicle.make}{' '}
                    {selectedVehicle.model}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-400">No Customer Selected</p>
            )
          ) : (
            // Expanded state: Full CustomerContextDisplay
            <div className="mt-3">
              <CustomerContextDisplay />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
