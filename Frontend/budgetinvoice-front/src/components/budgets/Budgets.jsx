import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getBudgets, createBudget, updateBudget, apiDeleteBudget, getClients, getClientByID } from '../../services/api';
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
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import saveAs from 'file-saver';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';

export default function Budgets() {
    const navigate = useNavigate();

    let emptyBudget = {
        id: null,
        title: '',
        data: '',
        price: '',
        client:''
    };

    const [data, setData] = useState(null);
    const [clients, setClients] = useState([]);
    const [budgetDialog, setBudgetDialog] = useState(false);
    const [deleteBudgetDialog, setDeleteBudgetDialog] = useState(false);
    const [budget, setBudget] = useState(emptyBudget);
    const [submitted, setSubmitted] = useState(false);
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
        const fetchData = async () => {
            try {
                const data = await getBudgets();
                const budgets = data.filter(item => item.id !== 0);
                setData(budgets);
                // console.table(data);
            } catch (error) {
                console.error('Error fetching budgets:', error);
            }
        };
        
        fetchData();
        fetchClients();
    }, []);

    const formatCurrency = (value) => {
        if (typeof value !== 'number') {
            value = parseFloat(value);
        }
        return value.toLocaleString('es-SP', { style: 'currency', currency: 'EUR' });
    };
    const openNew = () => {
        navigate('/budgets/new-budget');
        // setBudget(emptyBudget);
        // setSubmitted(false);
        // setBudgetDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setBudgetDialog(false);
    };

    const hideDeleteBudgetDialog = () => {
        setDeleteBudgetDialog(false);
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _budget = { ...budget };

        _budget[`${name}`] = val;

        setBudget(_budget);
    };

    const saveBudget = async (e) => {
        setSubmitted(true);
        if (budget.name.trim()) {
            let _budgets = [...data];
            let _budget = { ...budget };

            if (budget.id) {
                try{
                    const response = await updateBudget(budget.id, budget);
    
                    _budgets[budget.id] = _budget;
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Presupuesto Actualizado', life: 3000 });
                }catch(error){
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el presupuesto', life: 3000 });
                    console.error('Error while updating budget:',error);
                }
            } else {
                try{
                    const response = await createBudget(budget);
                    _budgets.push(_budget);
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Presupuesto Creado', life: 3000 });
                }catch(error){
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al crear un nuevo presupuesto', life: 3000 });
                    console.error('Error while creating a new user:',error);
                }
            }

            setData(_budgets);
            setBudgetDialog(false);
            setBudget(emptyBudget);
        }
    };

    const editBudget = (budget) => {
        // setBudget({ ...budget });
        // setSelectedClient(budget.client);
        // setBudgetDialog(true);
        navigate('/budgets/edit-budget', {state:{budget}});
    };

    const confirmDeleteBudget = (budget) => {
        setBudget(budget);
        setDeleteBudgetDialog(true);
    };

    const deleteBudget = async () => {
        try{
            await apiDeleteBudget(budget.id, budget);
            let _budgets = data.filter((val) => val.id !== budget.id);
    
            setData(_budgets);
            setDeleteBudgetDialog(false);
            setBudget(emptyBudget);
            toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Presupuesto eliminado', life: 3000 });
        } catch (error){
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al borrar el presupuesto', life: 3000 });
            console.error('Error deleting user:',error);
        }
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _budget = { ...budget };

        _budget[`${name}`] = val;

        setBudget(_budget);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo" icon="pi pi-plus" severity="success" raised onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Exportar" icon="pi pi-upload" raised className="p-button-help" onClick={exportCSV} />;
    };

    const actionBodyTemplate = (rowData) => {
        const showPdf = async () => {
            const client = await getClientByID(rowData.client);
            const blob = await pdf(<GeneratePDF document={rowData} doc_type='budget' client={client} />).toBlob();
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
                <Button icon="pi pi-pencil" rounded raised className="mr-2" onClick={() => editBudget(rowData)} />
                <Button icon="pi pi-trash" rounded raised className="mr-2" severity="danger" onClick={() => confirmDeleteBudget(rowData)} />
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

    const priceBodyTemplate = (rowData) => {
        return formatCurrency(rowData.price);
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestionar Presupuestos</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </IconField>
        </div>
    );
    const budgetDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveBudget} />
        </React.Fragment>
    );
    const deleteBudgetDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteBudgetDialog} />
            <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteBudget} />
        </React.Fragment>
    );
    const budgetVatBodyTemplate = (rowData) => {
        let text = ``;
        if(rowData.vat === 0){
            text = `Sin IVA`;
        }else{
            text = `${rowData.vat}%`;
        }
        return text;
    };
    const budgetVatPriceBodyTemplate = (rowData) => {
        let vat_price = (rowData.price * rowData.vat)/100;
        return formatCurrency(parseFloat(rowData.price) + vat_price);
    };
    const clientBodyTemplate = (rowData) => {
        // return rowData.client.name;
        const matchingClient = clients.find((client) => client.id === rowData.client);
        return matchingClient ? matchingClient.name : '';
    };

    const dateBodyTemplate = (rowData) => {
        const formattedDate = rowData.date ? format(rowData.date, 'dd/MM/yyyy', { locale: es }) : '';
        return formattedDate;
    }

    const getSeverity = (data) => {
        switch (data.approved) {
            case true:
                return 'success';

            case false:
                return 'danger';

            default:
                return null;
        }
    };
    const statusBodyTemplate = (data) => {
        return <Tag value={data.approved === true ? "Aprobado":"Pendiente"} severity={getSeverity(data)}></Tag>;
    };

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable ref={dt} value={data} removableSort 
                        dataKey="id"  paginator rows={5} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} presupuestos" globalFilter={globalFilter} header={header}>
                    <Column field="title" header="Título" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="price" header="Precio" body={priceBodyTemplate}  sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="invoice_vat" header="IVA" body={budgetVatBodyTemplate}  sortable style={{ minWidth: '6rem' }}></Column>
                    <Column field="price" header="Precio con IVA" body={budgetVatPriceBodyTemplate}  sortable style={{ minWidth: '6rem' }}></Column>
                    <Column field="client" header="Cliente" body={clientBodyTemplate} sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="date" header="Fecha" body={dateBodyTemplate} sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="status" header="Estado" body={statusBodyTemplate}  sortable style={{ minWidth: '6rem' }}></Column>
                    <Column header="Acciones" body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem'}}></Column>
                </DataTable>
            </div>

            <Dialog visible={budgetDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Detalles del presupuesto" modal className="p-fluid" footer={budgetDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="title" className="font-bold">
                        Título
                    </label>
                    <InputText id="title" value={budget.title} onChange={(e) => onInputChange(e, 'title')} required autoFocus />
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
                        placeholder="Selecciona un cliente" 
                        className="w-full md:w-14rem" 
                    />
                </div>
                <div className="field">
                    <label htmlFor="price" className="font-bold">
                        Precio
                    </label>
                    <InputNumber id="price" value={budget.price} onValueChange={(e) => onInputNumberChange(e, 'price')} mode="currency" currency="EUR" locale="es-SP" />
                </div>
            </Dialog>

            <Dialog visible={deleteBudgetDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteBudgetDialogFooter} onHide={hideDeleteBudgetDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {budget && (
                        <span>
                            Estas seguro que queires borrar el presupuesto <b>{budget.title}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
        