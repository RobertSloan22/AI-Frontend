import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import { 
    FaChartLine, 
    FaCalendarAlt, 
    FaUsers, 
    FaCar,
    FaFileInvoice,
    FaTools,
    FaBoxes,
    FaUserCog,
    FaChartBar,
    FaThLarge,
    FaHome,
    FaClipboardList,
    FaSearch,
    FaUserCircle,
    FaEnvelope,
    FaUserFriends,
    FaStickyNote
} from 'react-icons/fa';
// menu items needs to include the path for invoice, profile, HOME 
// The log out feature and button need to work 

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const location = useLocation();
    const { authUser } = useAuthContext();

    const menuItems = [
        { path: '/unified-dashboard', label: 'Dashboard', icon: <FaThLarge className="w-5 h-5" /> },
        { path: '/customers', label: 'Customers', icon: <FaUsers className="w-5 h-5" /> },
        { path: '/localai', label: 'Local AI', icon: <FaUserCog className="w-5 h-5" /> },
        { path: '/vehiclepage', label: 'Vehicles', icon: <FaCar className="w-5 h-5" /> },
        { path: '/service-records', label: 'Services', icon: <FaTools className="w-5 h-5" /> },
        { path: '/technician-dashboard', label: 'Technicians', icon: <FaUserCog className="w-5 h-5" /> },
        { path: '/parts', label: 'Parts', icon: <FaBoxes className="w-5 h-5" /> },
        { path: '/invoicepage', label: 'Invoices', icon: <FaFileInvoice className="w-5 h-5" /> },
        { path: '/reports', label: 'Reports', icon: <FaClipboardList className="w-5 h-5" /> },
        { path: '/backgrounddashboard', label: 'Dash2', icon: <FaClipboardList className="w-5 h-5" /> },
    ];

    return (
        <div className={`
            fixed 
            bottom-0            left-0 
            h-[50vh] 
            text-white 
            w-64
            transition-all 
            duration-300 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-56'}
            z-50
        `}>
            <div className="h-full flex flex-col justify-center">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-4 top-4 bg-gray-800 p-2 rounded-full"
                >
                    {isSidebarOpen ? '◀️' : '▶️'}
                </button>
                <nav className="space-y-2 p-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-3 text-white font-bold text-2xl hover:bg-green-700 rounded-lg transition-colors w-full max-w-[230px] ${
                                location.pathname === item.path ? 'bg-blue-700' : ''
                            }`}
                        >
                            <span className="mr-3">{item.icon}</span>
                            {isSidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

               
            </div>
        </div>
    );
};

export default Sidebar; 