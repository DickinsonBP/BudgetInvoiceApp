import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getInvoices, createInvoice, updateInvoice, apiDeleteInvoice, getClients, getClientByID, getBudgets } from '../../services/api';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';

import GeneratePDF from '../other/GeneratePDF';
import { pdf } from '@react-pdf/renderer';
// import saveAs from 'file-saver';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';

import '../../styles/Invoice.css';

export default function Invoices() {
    let emptyInvoice = {
        id: null,
        title: '',
        data: '',
        status: '',
        client:'',
        budget: '',
    };
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [clients, setClients] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [invoiceDialog, setInvoiceDialog] = useState(false);
    const [deleteInvoiceDialog, setDeleteInvoiceDialog] = useState(false);
    const [invoice, setInvoice] = useState(emptyInvoice);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfVisible, setPdfVisible] = useState(false);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const clients = await getClients();
                setClients(clients);
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };
        const fetchBudgets = async () => {
            try {
                const budget = await getBudgets();
                setBudgets(budget);
            } catch (error) {
                console.error('Error fetching budgets:', error);
            }
        };
        const fetchData = async () => {
            try {
                const data = await getInvoices();
                setData(data);
            } catch (error) {
                console.error('Error fetching invoices:', error);
            }
        };
        
        fetchData();
        fetchClients();
        fetchBudgets();
    }, []);

    const formatCurrency = (value) => {
        if (typeof value !== 'number') {
            value = parseFloat(value);
        }
        return value.toLocaleString('es-SP', { style: 'currency', currency: 'EUR' });
    };

    const openNew = () => {
        navigate('/invoices/new-invoice');
        // setInvoice(emptyInvoice);
        // setSubmitted(false);
        // setInvoiceDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setInvoiceDialog(false);
    };

    const hideDeleteInvoiceDialog = () => {
        setDeleteInvoiceDialog(false);
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _invoice = { ...invoice };

        _invoice[`${name}`] = val;

        setInvoice(_invoice);
    };

    const saveInvoice = async (e) => {
        setSubmitted(true);
        if (invoice.name.trim()) {
            let _invoices = [...data];
            let _invoice = { ...invoice };

            if (invoice.id) {
                try{
                    const response = await updateInvoice(invoice.id, invoice);
    
                    _invoices[invoice.id] = _invoice;
                    toast.current.show({ severity: 'success', summary: 'Felicidades!', detail: 'Factura Actualizada', life: 3000 });
                }catch(error){
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al actualizarla factura', life: 3000 });
                    console.error('Error while updating invoice:',error);
                }
            } else {
                try{
                    const response = await createInvoice(invoice);
                    _invoices.push(_invoice);
                    toast.current.show({ severity: 'success', summary: 'Felicidades!', detail: 'Presupuesto Creado', life: 3000 });
                }catch(error){
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al crear una nueva factura', life: 3000 });
                    console.error('Error while creating a new invoice:',error);
                }
            }

            setData(_invoices);
            setInvoiceDialog(false);
            setInvoice(emptyInvoice);
        }
    };

    const editInvoice = (invoice) => {
        // setInvoice({ ...invoice });
        // setSelectedClient(invoice.client);
        // setInvoiceDialog(true);
        navigate('/invoices/edit-invoice', {state:{invoice}});
    };

    const confirmDeleteInvoice = (invoice) => {
        setInvoice(invoice);
        setDeleteInvoiceDialog(true);
    };

    const deleteInvoice = async () => {
        try{
            await apiDeleteInvoice(invoice.id, invoice);
            let _invoices = data.filter((val) => val.id !== invoice.id);
    
            setData(_invoices);
            setDeleteInvoiceDialog(false);
            setInvoice(emptyInvoice);
            toast.current.show({ severity: 'success', summary: 'Felicidades!', detail: 'Factura eliminada', life: 3000 });
        } catch (error){
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al borrar la factura', life: 3000 });
            console.error('Error deleting user:',error);
        }
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _invoice = { ...invoice };

        _invoice[`${name}`] = val;

        setInvoice(_invoice);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nueva" icon="pi pi-plus" severity="success" raised onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Exportar" icon="pi pi-upload" raised className="p-button-help" onClick={exportCSV} />;
    };

    
    const actionBodyTemplate = (rowData) => {

        const showPdf = async () => {
            const client = await getClientByID(rowData.client);
            const blob = await pdf(<GeneratePDF document={rowData} doc_type='invoice' client={client} />).toBlob();
            const pdfUrl = URL.createObjectURL(blob);
            setPdfUrl(pdfUrl);
            console.log("PDFURL: ",pdfUrl);
            setPdfVisible(true);
        };
    
        const hidePdf = () => {
            setPdfVisible(false);
            URL.revokeObjectURL(pdfUrl);
        };

        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded raised className="mr-2" onClick={() => editInvoice(rowData)} />
                <Button icon="pi pi-trash" rounded raised className="mr-2" severity="danger" onClick={() => confirmDeleteInvoice(rowData)} />
                <Button icon="pi pi-search" rounded raised className="mr-2" severity="secondary" onClick={showPdf} />
                <Dialog visible={pdfVisible} onHide={hidePdf} style={{ width: '100vw', maxWidth: '900px' }}>
                    <iframe src={pdfUrl} style={{ width: '100%', height: 'calc(80vh - 80px)' }} title="PDF Viewer" />
                    <footer>
                        <Button label="Cerrar" onClick={hidePdf} />
                    </footer>
                </Dialog>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestionar Facturas</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </IconField>
        </div>
    );
    const invoiceDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveInvoice} />
        </React.Fragment>
    );
    const deleteInvoiceDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteInvoiceDialog} />
            <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteInvoice} />
        </React.Fragment>
    );

    
    const invoicePriceBodyTemplate = (rowData) => {
        return formatCurrency(rowData.price);
    };
    
    const invoiceVatBodyTemplate = (rowData) => {
        return rowData.vat;
    };
    
    const budgetPriceBodyTemplate = (rowData) => {
        const matchingBudget = budgets.find((budget) => budget.id === rowData.budget);
        return formatCurrency(matchingBudget ? matchingBudget.price : '');
    };
    
    const invoiceVatPriceBodyTemplate = (rowData) => {
        let vat_price = (rowData.price * rowData.vat)/100;
        return formatCurrency(parseFloat(rowData.price) + vat_price);
    };

    const dateBodyTemplate = (rowData) => {
        const formattedDate = rowData.date ? format(rowData.date, 'dd/MM/yyyy', { locale: es }) : '';
        return formattedDate;
    }

    const clientBodyTemplate = (rowData) => {
        const matchingClient = clients.find((client) => client.id === rowData.client);
        return matchingClient ? matchingClient.name : '';
    };
    const budgetBodyTemplate = (rowData) => {
        const matchingBudget = budgets.find((budget) => budget.id === rowData.budget);
        return matchingBudget ? matchingBudget.title : '';
    };
    const getSeverity = (data) => {
        switch (data.status) {
            case true:
                return 'success';

            case false:
                return 'danger';

            default:
                return null;
        }
    };
    const statusBodyTemplate = (data) => {
        return <Tag value={data.status === true ? "Pagada":"Por pagar"} severity={getSeverity(data)}></Tag>;
    };

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable ref={dt} value={data} removableSort size='small'
                        dataKey="id"  paginator rows={5} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} facturas" globalFilter={globalFilter} header={header}>
                    <Column field="title" header="Título" sortable style={{ minWidth:'6rem' }}></Column>
                    <Column field="client" header="Cliente" body={clientBodyTemplate} sortable style={{ minWidth: '6rem' }}></Column>
                    <Column field="budget" header="Presupuesto" body={budgetBodyTemplate} sortable style={{ minWidth: '6rem' }}></Column>
                    {/* <Column field="budget_price" header="Precio del presupuesto" body={budgetPriceBodyTemplate}  sortable style={{ minWidth: '6rem' }}></Column> */}
                    <Column field="invoice_price" header="Precio de la factura" body={invoicePriceBodyTemplate}  sortable style={{ minWidth: '6rem' }}></Column>
                    <Column field="invoice_vat" header="IVA" body={invoiceVatBodyTemplate}  sortable style={{ minWidth: '6rem' }}></Column>
                    <Column field="price" header="Precio con IVA" body={invoiceVatPriceBodyTemplate}  sortable style={{ minWidth: '6rem' }}></Column>
                    <Column field="date" header="Fecha" body={dateBodyTemplate}  sortable style={{ minWidth: '6rem' }}></Column>
                    <Column field="status" header="Estado" body={statusBodyTemplate}  sortable style={{ minWidth: '6rem' }}></Column>
                    <Column header="Acciones" body={actionBodyTemplate} exportable={false} style={{ minWidth: '2rem'}}></Column>
                </DataTable>
            </div>

            <Dialog visible={invoiceDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Detalles de la factura" modal className="p-fluid" footer={invoiceDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="title" className="font-bold">
                        Título
                    </label>
                    <InputText id="title" value={invoice.title} onChange={(e) => onInputChange(e, 'title')} required autoFocus />
                </div>
                <div className="field">
                    <label htmlFor="client" className="font-bold">
                        Cliente
                    </label>
                    <Dropdown 
                        value={selectedClient} 
                        onChange={(e) => setSelectedClient(e.value)} 
                        options={clients} 
                        optionLabel="name" 
                        placeholder="Select a Client" 
                        className="w-full md:w-14rem" 
                    />
                </div>
                <div className="field">
                    <label htmlFor="price" className="font-bold">
                        Precio
                    </label>
                    <InputNumber id="price" value={invoice.price} onValueChange={(e) => onInputNumberChange(e, 'price')} mode="currency" currency="EUR" locale="es-SP" />
                </div>
            </Dialog>

            <Dialog visible={deleteInvoiceDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteInvoiceDialogFooter} onHide={hideDeleteInvoiceDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {invoice && (
                        <span>
                            Estas seguro que queires borrar el presupuesto <b>{invoice.title}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
        