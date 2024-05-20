import './App.css';

import { Routes, Route } from 'react-router-dom';

/*Components*/
import Navbar  from './components/Navbar';
import HomePage from './components/HomePage';
import Clients from './components/Clients';
import Budgets from './components/Budgets';
import NewBudget from './components/NewBudget';
import Invoices from './components/Invoices';
import NewInvoice from './components/NewInvoice';
import EditInvoice from './components/EditInvoice';

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
