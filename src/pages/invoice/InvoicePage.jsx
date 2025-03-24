import InvoiceCreate from '../../components/invoice/InvoiceCreate';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Invoice from './invoice';
import InvoiceList from './InvoiceList';
import InvoiceApt from './InvoiceApt';
import UnifiedDashboard from '../dashboard/UnifiedDashboard';
import EstimateBuilder from '../../components/invoicing/EstimateBuilder';
import DiagnosticReports from '../../components/diagnostics/DiagnosticReports'
import CustomerContextDisplay from '../../components/customer/CustomerContextDisplay';
import Activant from '../activant/Activant'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: 'transparent',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.primary,
  position: 'relative',
  '& .dtc-container': {
    position: 'relative',
    zIndex: 9999,
  },
  '& .console-container': {
    position: 'relative',
    zIndex: 1,
  },
}));

const InvoicePage = () => {
  return (
    <>
    <div className="w-[100vw] h-[100vh] overflow-y-auto bg-gray-700/80">
      <div className="grid grid-cols-12 gap-4 p-4 h-full">
        {/* Left Column - Customer Context */}
        <div className="col-span-3 bg-gray-800 rounded-lg p-4 bg-opacity-75">
          <CustomerContextDisplay />
        </div>

        {/* Middle Column - Invoice List */}
        <div className="col-span-5 flex flex-col gap-4">
          <div className="bg-gray-800 rounded-lg p-4 bg-opacity-75 flex-grow overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">
              Active Invoices
            </h2>
            <InvoiceList />
          </div>
        </div>

        {/* Right Column - Invoice Create */}
        <div className="col-span-4 bg-gray-800 rounded-lg p-4 bg-opacity-75 overflow-y-auto">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">
            Create Invoice
          </h2>
          <InvoiceCreate />
        </div>
      </div>
    </div>
    <div className="col-span-12 bg-gray-700/80 w-full h-full overflow-y-auto">
      <Activant />
    </div>
    </>
  );
};

export default InvoicePage;
