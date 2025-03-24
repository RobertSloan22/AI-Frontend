import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Overview from '../../pages/dashboard/Overview';
import AptOverview from '../../pages/dashboard/AptOverview';
import { FaUserCog, FaCar, FaTools, FaBoxes, FaFileInvoice, FaClipboardList } from 'react-icons/fa';

const QuickActions = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [showOverview, setShowOverview] = useState(false);
    const [showAptOverview, setShowAptOverview] = useState(false);

    useEffect(() => {
        console.log('showOverview state changed:', showOverview);
    }, [showOverview]);
    useEffect(() => {
        console.log('showAptOverview state changed:', showAptOverview);
    }, [showAptOverview]);
    

    const quickActions = [
        { label: 'ImagesAI', action: () => {
            console.log('AptOverview action clicked');
            setShowAptOverview(true);
            setIsOpen(false);
        }, icon: '📊' },
        { label: 'Invoices', action: () => navigate('/invoicepage'), icon: <FaFileInvoice className="w-5 h-5" /> },
        { label: 'AI-Dashboard', action: () => navigate('/backgrounddashboard'), icon: '🏠' },
    ];

    return (
        <>
            <div className="absolute top-0 left-1/4 transform -translate-x-1/2 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-gray-800 text-white  text-2xl px-6 py-2 rounded-b-lg shadow-lg hover:bg-gray-700 transition-colors"
                >
                    {isOpen ? '▲ Close' : '▼ Quick Actions'}
                </button>
                
                <div className={`
                    absolute top-full left-0 right-0 
                    bg-gray-800 rounded-b-lg shadow-xl 
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                    w-[50vw]
                `}>
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        action.action();
                                        setIsOpen(false); // Close panel after action
                                    }}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    <span className="text-2xl mb-2">{action.icon}</span>
                                    <span className="text-white text-sm text-center">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div 
                className={`
                    fixed inset-0 bg-black bg-opacity-50 
                    transition-opacity duration-300
                    ${showOverview ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                    z-[100]
                `}
                onClick={() => setShowOverview(false)}
            >
                <div 
                    className={`
                        fixed bottom-0 left-0 right-0 
                        bg-gray-800 rounded-t-lg shadow-xl 
                        transition-transform duration-300 ease-in-out
                        ${showOverview ? 'transform translate-y-0' : 'transform translate-y-full'}
                        h-[80vh] z-[101] overflow-hidden
                    `}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-4 flex justify-between items-center border-b border-gray-700">
                        <h2 className="text-white text-lg font-semibold">Overview</h2>
                        <button 
                            onClick={() => setShowOverview(false)}
                            className="text-white hover:text-gray-300"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="overflow-y-auto h-[calc(80vh-4rem)]">
                        {showOverview && <Overview />}
                    </div>
                </div>
            </div>

            {/* AptOverview Modal */}
            <div 
                className={`
                    fixed inset-0 bg-black bg-opacity-50 
                    transition-opacity duration-300
                    ${showAptOverview ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                    z-[100]
                `}
                onClick={() => setShowAptOverview(false)}
            >
                <div 
                    className={`
                        fixed bottom-0 left-0 right-0 
                        bg-gray-800 rounded-t-lg shadow-xl 
                        transition-transform duration-300 ease-in-out
                        ${showAptOverview ? 'transform translate-y-0' : 'transform translate-y-full'}
                        h-[80vh] z-[101] overflow-hidden
                    `}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-4 flex justify-between items-center border-b border-gray-700">
                        <h2 className="text-white text-lg font-semibold">AptOverview</h2>
                        <button 
                            onClick={() => setShowAptOverview(false)}
                            className="text-white hover:text-gray-300"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="overflow-y-auto h-[calc(80vh-4rem)]">
                        {showAptOverview && <AptOverview />}
                    </div>
                </div>
            </div>
        </>
    );
};

export default QuickActions; 