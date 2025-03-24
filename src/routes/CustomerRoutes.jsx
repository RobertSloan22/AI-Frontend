import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerList from '../pages/customers/CustomerList';
import CustomerDetails from '../pages/customers/CustomerDetails';
import CustomersPage from '../pages/customers/CustomersPage';
// import all the components from the folder in src/components/customers/
import CustomerDetailsModal from '../components/customers/CustomerDetails'
import CustomerForm from '../components/customers/CustomerForm'
import EditCustomer from '../components/customers/EditCustomer'
import NewCustomer from '../components/customers/NewCustomer'
import NewCustomerForm from '../components/customers/NewCustomerForm'

const CustomerRoutes = () => {
    return (
        <CustomersPage>
            <Routes>
                <Route index element={<CustomerList />} />
                <Route path=":id" element={<CustomerDetails />} />
                <Route path="new" element={<NewCustomer />} />
                <Route path=":id/edit" element={<EditCustomer />} />
                <Route path=":id/details" element={<CustomerDetailsModal />} />
                <Route path=":id/form" element={<CustomerForm />} />

            </Routes>
        </CustomersPage>
    );
};

export default CustomerRoutes; 