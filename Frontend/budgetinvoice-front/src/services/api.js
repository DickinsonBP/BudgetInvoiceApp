import axios from 'axios';

const API_URL = 'http://192.168.1.55:8000/api';
//const API_URL = 'http://localhost:8000/api';

/**
 * Clients Backend connections
 */
/**
 * Function to GET clients from Backend
 * @returns 
 */
export const getClients = async() => {
    try{
        const response = await axios.get(`${API_URL}/clients`);
        return response.data;
    }catch(error){
        console.error('Error fetching clients:',error);
        throw error;
    }
}

export const getClientByID = async(id) =>{
    try{
        const response = await axios.get(`${API_URL}/clients/${id}`);
        return response.data;
    }catch(error){
        console.error('Error fecthing client by id:',error);
        throw error;
    }
}

/**
 * Function to create (POST) a new client
 * @param {*} client 
 * @returns 
 */
export const createClient = async (client) => {
    try {
        const response = await axios.post(`${API_URL}/clients`, client);
        return response.data;
    } catch (error) {
        console.error('Error creating client:', error);
        throw error;
    }
};

export const apiDeleteClient = async (id, client) => {
    try{
        const response = await axios.delete(`${API_URL}/clients/${id}`,client);
        return response;
    } catch(error){
        console.error('Error while deleting client:',error);
        throw error;
    }
}

/**
 * Function to UPDATE an existing client
 * @param {*} id 
 * @param {*} client 
 * @returns 
 */
export const updateClient = async (id, client) => {
    try {
        const response = await axios.put(`${API_URL}/clients/${id}`, client);
        return response.data;
    } catch (error) {
        console.error('Error updating client:', error);
        throw error;
    }
};

/**
 * Budgets Backend connections
*/
/**
 * Function to GET clients from Backend
 * @returns 
 */
export const getBudgets = async() => {
    try{
        const response = await axios.get(`${API_URL}/budgets`);
        return response.data.sort((a, b) => new Date(b.date) - new Date(a.date)).sort((a,b) => (parseInt(b.doc_number)) - (parseInt(a.doc_number)));
    }catch(error){
        console.error('Error fetching budget:',error);
        throw error;
    }
} 

export const getBudgetsLastId = async() => {
    try {
        const response = await axios.get(`${API_URL}/budgets`);
        const budgets = response.data;

        if (budgets.length === 0) {
            throw new Error('No invoices found');
        }

        // Ordena las facturas por fecha descendente
        const sortedBudgets = budgets.sort((a, b) => new Date(b.date) - new Date(a.date)).sort((a,b) => (parseInt(b.doc_number)) - (parseInt(a.doc_number)) );
	
        // Devuelve el ID de la última factura (la más reciente)
        return sortedBudgets[0].doc_number;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

/**
 * Function to create (POST) a new budget
 * @param {*} budget 
 * @returns 
 */
export const createBudget = async (budget) => {
    try {
        console.log(budget);
        const response = await axios.post(`${API_URL}/budgets`, budget);
        return response.data;
    } catch (error) {
        console.error('Error creating budget:', error);
        throw error;
    }
};

/**
 * Function to UPDATE an existing budget
 * @param {*} id 
 * @param {*} budget 
 * @returns 
 */
export const updateBudget = async (id, budget) => {
    try {
        const response = await axios.put(`${API_URL}/budgets/${id}`, budget);
        return response.data;
    } catch (error) {
        console.error('Error updating budget:', error);
        throw error;
    }
};

export const apiDeleteBudget = async (id, budget) => {
    try{
        const response = await axios.delete(`${API_URL}/budgets/${id}`,budget);
        return response;
    } catch(error){
        console.error('Error while deleting budget:',error);
        throw error;
    }
}



/**
 * Invoices Backend connections
*/
export const getInvoices = async() => {
    try{
        const response = await axios.get(`${API_URL}/invoices`);
        return response.data.sort((a, b) => new Date(b.date) - new Date(a.date)).sort((a,b) => (parseInt(b.doc_number)) - (parseInt(a.doc_number)));
    }catch(error){
        console.error('Error fetching invoices:',error);
        throw error;
    }
}

export const getInvoicesLastId = async() => {
    try {
        const response = await axios.get(`${API_URL}/invoices`);
        const invoices = response.data;

        if (invoices.length === 0) {
            throw new Error('No invoices found');
        }

        // Ordena las facturas por fecha descendente
        const sortedInvoices = invoices.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Devuelve el ID de la última factura (la más reciente)
        return sortedInvoices[0].doc_number;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

export const createInvoice = async (invoice) => {
    try {
        const response = await axios.post(`${API_URL}/invoices`, invoice);
        return response.data;
    } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
    }
};

export const apiDeleteInvoice = async (id, invoice) => {
    try{
        const response = await axios.delete(`${API_URL}/invoices/${id}`,invoice);
        return response;
    } catch(error){
        console.error('Error while deleting invoice:',error);
        throw error;
    }
}

export const updateInvoice = async (id, invoice) => {
    try {
        const response = await axios.put(`${API_URL}/invoices/${id}`, invoice);
        return response.data;
    } catch (error) {
        console.error('Error updating invoice:', error);
        throw error;
    }
};


/**
 * OTHER FUNCTIONS
 */

/**
 * Export invoice to PDF
 */
export const exportInvoiceToPDF = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/invoices/${id}/pdf`);
        return response.data;
    } catch (error) {
        console.error('Error exporting invoice to pdf:', error);
        throw error;
    }
}

export const exportBudgetToPDF = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/budgets/${id}/pdf`);
        return response.data;
    } catch (error) {
        console.error('Error exporting budget to pdf:', error);
        throw error;
    }
}


/**
 * OTHER FUNCTIONS
 */

export const calculateId = (docId) => {
    const newId = String(docId).padStart(3,'0');
    const date = String(new Date().getFullYear());
    const onlyYear = date.substring(date.length - 2);

    return `${onlyYear}${newId}`;
}
