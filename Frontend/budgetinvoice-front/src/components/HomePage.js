/**
 * React imports
 */
import React, { useState, useEffect } from 'react';
import { getNumberOfClients, getNumberOfBudgets, getNumberOfInvoices } from '../services/api';
/**
 * Styles
*/
import '../styles/Clients.css';
import 'primeflex/primeflex.css';
/**
 * Components
*/
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import { locale, addLocale } from "primereact/api";


addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    today: 'Hoy',
    clear: 'Limpiar'
});

export default function HomePage(){
    const [date, setDate] = useState(null);
    const [clients, setClients] = useState(null);
    const [budgets, setBudgets] = useState(null);
    const [invoices, setInvoices] = useState(null);
    
    locale('es');

    useEffect(() => {
        const fetchNumberOfClients = async () => {
            try {
                const clients = await getNumberOfClients();
                setClients(clients);
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };
        const fetchNumberOfBudgets = async () => {
            try {
                const budgets = await getNumberOfBudgets();
                setBudgets(budgets);                // console.log(data);
            } catch (error) {
                console.error('Error fetching budgets:', error);
            }
        };
        const fetchNumberOfInvoices = async () => {
            try {
                const invoices = await getNumberOfInvoices();
                setInvoices(invoices);
            } catch (error) {
                console.error('Error fetching budgets:', error);
            }
        };
        
        fetchNumberOfClients();
        fetchNumberOfBudgets();
        fetchNumberOfInvoices();
    }, []);

    const numberOfClients_text = `Número de clientes: ${clients ? clients.length : 0}`;
    const numberOfBudgets_text = `Número de presupuestos: ${budgets ? budgets.length : 0}`;
    const numberOfInvoices_text = `Número de facturas: ${invoices ? invoices.length : 0}`;
    
    return(
        <div>
            <div className='grid'>
                <div className='col'>
                    <Card>
                        <h1>{numberOfClients_text}</h1>
                    </Card>
                </div>
                <div className='col'>
                    <Card>
                    <h1>{numberOfBudgets_text}</h1>
                    </Card>
                </div>
                <div className='col'>

                    <Card>
                        <h1>{numberOfInvoices_text}</h1>
                    </Card>
                </div>
            </div>
            <div className="card flex justify-content-center">
                <Calendar value={date} onChange={(e) => setDate(e.value)} inline dateFormat='dd/mm/yy'/>
            </div>
        </div>
    );
};