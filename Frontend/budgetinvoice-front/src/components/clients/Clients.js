
import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getClients, createClient, updateClient, apiDeleteClient } from '../../services/api';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

export default function Clients() {
    let emptyClient = {
        id: null,
        name: '',
        address: '',
        email: '',
        phone:''
    };

    const [data, setData] = useState(null);
    const [clientDialog, setClientDialog] = useState(false);
    const [deleteClientDialog, setDeleteClientDialog] = useState(false);
    const [client, setClient] = useState(emptyClient);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getClients();
                setData(data);
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };
        
        fetchData();
    }, []);

    const openNew = () => {
        setClient(emptyClient);
        setSubmitted(false);
        setClientDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setClientDialog(false);
    };

    const hideDeleteClientDialog = () => {
        setDeleteClientDialog(false);
    };

    const saveClient = async (e) => {
        setSubmitted(true);
        if (client.name.trim()) {
            let _clients = [...data];
            let _client = { ...client };

            if (client.id) {
                try{
                    const response = await updateClient(client.id, client);
    
                    _clients[client.id] = _client;
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cliente Actualizado', life: 3000 });
                }catch(error){
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el cliente', life: 3000 });
                    console.error('Error while updating client:',error);
                }
            } else {
                try{
                    const response = await createClient(client);
                    _clients.push(_client);
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cliente Creado', life: 3000 });
                }catch(error){
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al crear un nuevo cliente', life: 3000 });
                    console.error('Error while creating a new user:',error);
                }
            }

            setData(_clients);
            setClientDialog(false);
            setClient(emptyClient);
        }
    };

    const editClient = (client) => {
        setClient({ ...client });
        setClientDialog(true);
    };

    const confirmDeleteClient = (client) => {
        setClient(client);
        setDeleteClientDialog(true);
    };

    const deleteClient = async () => {
        try{
            await apiDeleteClient(client.id, client);
            let _clients = data.filter((val) => val.id !== client.id);
    
            setData(_clients);
            setDeleteClientDialog(false);
            setClient(emptyClient);
            toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cliente eliminado', life: 3000 });
        } catch (error){
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al borrar el cliente', life: 3000 });
            console.error('Error deleting user:',error);
        }
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _client = { ...client };

        _client[`${name}`] = val;

        setClient(_client);
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
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded raised className="mr-2" onClick={() => editClient(rowData)} />
                <Button icon="pi pi-trash" rounded raised severity="danger" onClick={() => confirmDeleteClient(rowData)} />
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestionar clientes</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </IconField>
        </div>
    );
    const clientDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveClient} />
        </React.Fragment>
    );
    const deleteClientDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteClientDialog} />
            <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteClient} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable ref={dt} value={data} removableSort 
                        dataKey="id"  paginator rows={5} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes" globalFilter={globalFilter} header={header}>
                    <Column field="nif" header="NIF" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="name" header="Nombre" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="address" header="Dirección" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="email" header="Email" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="phone" header="Teléfono" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column header="Acciones" body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem'}}></Column>
                </DataTable>
            </div>

            <Dialog visible={clientDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Detalles del cliente" modal className="p-fluid" footer={clientDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nif" className="font-bold">
                        NIF
                    </label>
                    <InputText id="nif" value={client.nif} onChange={(e) => onInputChange(e, 'nif')} required autoFocus />
                </div>
                <div className="field">
                    <label htmlFor="name" className="font-bold">
                        Nombre
                    </label>
                    <InputText id="name" value={client.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !client.name })} />
                    {submitted && !client.name && <small className="p-error">El nombre es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="address" className="font-bold">
                        Dirección
                    </label>
                    <InputText id="address" value={client.address} onChange={(e) => onInputChange(e, 'address')} required autoFocus />
                </div>
                <div className="field">
                    <label htmlFor="email" className="font-bold">
                        Email
                    </label>
                    <InputText id="email" value={client.email} onChange={(e) => onInputChange(e, 'email')} required autoFocus />
                </div>
                <div className="field">
                    <label htmlFor="phone" className="font-bold">
                        Teléfono
                    </label>
                    <InputText id="phone" value={client.phone} onChange={(e) => onInputChange(e, 'phone')} required autoFocus />
                </div>
            </Dialog>

            <Dialog visible={deleteClientDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteClientDialogFooter} onHide={hideDeleteClientDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {client && (
                        <span>
                            Estas seguro que queires borrar a <b>{client.name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
        