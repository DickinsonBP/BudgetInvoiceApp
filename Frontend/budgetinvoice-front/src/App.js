import './App.css';

import { Routes, Route } from 'react-router-dom';

/*Components*/
import Navbar  from './components/other/Navbar';
import HomePage from './components/other/HomePage';
import Clients from './components/clients/Clients';
import Budgets from './components/budgets/Budgets';
import NewBudget from './components/budgets/NewBudget';
import Invoices from './components/invoices/Invoices';
import NewInvoice from './components/invoices/NewInvoice';
import EditInvoice from './components/invoices/EditInvoice';

function App() {
  return (
    <div className='App'>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/clients' element={<Clients />} />
        <Route path='/budgets' element={<Budgets />} />
        <Route path='/budgets/new-budget' element={<NewBudget />} />
        <Route path='/invoices' element={<Invoices />} />
        <Route path='/invoices' element={<Invoices />} />
        <Route path='/invoices/new-invoice' element={<NewInvoice />} />
        <Route path='/invoices/edit-invoice' element={<EditInvoice />} />
      </Routes>
    </div>
  );
}

export default App;
