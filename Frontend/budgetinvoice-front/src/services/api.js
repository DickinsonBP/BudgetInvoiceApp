import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

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
        return response.data;
    }catch(error){
        console.error('Error fetching budget:',error);
        throw error;
    }
} 

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
        return response.data;
    }catch(error){
        console.error('Error fetching invoices:',error);
        throw error;
    }
} 

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