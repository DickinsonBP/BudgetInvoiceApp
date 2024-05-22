/**
 * React imports
 */
import React, { useState, useEffect, useRef } from 'react';
import { createInvoice, getClients, getBudgets } from '../../services/api';
import { useNavigate } from 'react-router-dom';
/**
 * Styles
 */
import '../../styles/NewBudget.css';
import 'primeflex/primeflex.css';
/**
 * Components
 */
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';

export default function NewInvoice(){
    const navaigate = useNavigate();
    const toast = useRef(null);
    const [partidas, setPartidas] = useState([{ title: '', entries: [{ text: '', price: 0 }] }]);
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [status, setStatus] = useState(null);
    const [budgets, setBudgets] = useState([]);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [selectedVAT, setSelectedVAT] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const data = await getClients();
                const formattedClients = data.map(client => ({
                    label: client.name,
                    value: client.id
                }));
                setClients(formattedClients);
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };
        const fetchBudgets = async () => {
            try {
                const data = await getBudgets();
                const formattedBudget = data.map(budget => ({
                    label: budget.title,
                    value: budget.id
                }));
                setBudgets(formattedBudget);
            } catch (error) {
                console.error('Error fetching budgets:', error);
            }
        };
        
        fetchClients();
        fetchBudgets();
    }, []);

    useEffect(() => {
        const total = partidas.reduce((acc, partida) => {
            const partidaTotal = partida.entries.reduce((partidaAcc, entry) => partidaAcc + (entry.price || 0), 0);
            return acc + partidaTotal;
        }, 0);
        setPrice(total);
    }, [partidas]);

    const handleAddPartida = () => {
        setPartidas([...partidas, { title: '', entries: [{ text: '', price: 0 }] }]);
    };

    const handleAddEntry = (index) => {
        const newPartidas = [...partidas];
        newPartidas[index].entries.push({ text: '', price: 0 });
        setPartidas(newPartidas);
    };

    const handlePartidaTitleChange = (e, index) => {
        const newPartidas = [...partidas];
        newPartidas[index].title = e.target.value;
        setPartidas(newPartidas);
    };

    const handleEntryChange = (e, index, entryIndex, field) => {
        const newPartidas = [...partidas];
        newPartidas[index].entries[entryIndex][field] = field === 'price' ? e.value : e.target.value;
        setPartidas(newPartidas);
    };
    
    const handleCheckboxChange = (e) => {
        setStatus(e.target.checked);
    };

    const handleDeletePartida = (index) => {
        const newPartidas = partidas.filter((_, i) => i !== index);
        setPartidas(newPartidas);
    };

    const handleDeleteEntry = (partidaIndex, entryIndex) => {
        const newPartidas = [...partidas];
        newPartidas[partidaIndex].entries = newPartidas[partidaIndex].entries.filter((_, i) => i !== entryIndex);
        setPartidas(newPartidas);
    };

    const handleSubmit = async (e) => { 
        e.preventDefault();

        const invoiceData = {
            title: title,
            price: price,
            client: selectedClient,
            budget: selectedBudget,
            vat: selectedVAT,
            status: status ? status : false,
            data: partidas.reduce((acc, partida, index) => {
                acc[`partida${index + 1}`] = {
                    title: partida.title,
                    entries: partida.entries.map(entry => ({ text: entry.text, price: entry.price }))
                };
                return acc;
            }, {})
        };
        console.log('Form data:', invoiceData);
        try {
            await createInvoice(invoiceData);
            // console.log('Invoice created:', response);
            toast.current.show({ severity: 'success', summary: 'Felicidades!', detail: 'Factura creada correctamente', life: 3000 });
            navaigate('/invoices');
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se ha podido crear la factura. Campos obligatorios: Titulo, Cliente y Presupuesto', life: 3000 });
            console.error('Error creating invoice:', error);
        }
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <Card className='card-item'>    
                <h1>Nueva factura</h1>

                <div className='p-field'>
                    <h3 className='p-field-label'>Cuerpo de la factura</h3>
                    
                    <form>
                        <div className='formgrid grid'>
                            <div className='field col'>
                                <FloatLabel>
                                    <InputText 
                                        id="title" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        placeholder="Título" 
                                        className="w-full" 
                                    />
                                    <label htmlFor="title">Título</label>
                                </FloatLabel>
                            </div>
                            <div className="field col">
                                <FloatLabel>
                                    <InputNumber 
                                        id="price" 
                                        value={price} 
                                        // onValueChange={(e) => setPrice(e.value)} 
                                        mode="currency" 
                                        currency="EUR" 
                                        locale="es-ES" 
                                        placeholder="Precio total" 
                                        className="w-full" 
                                    />
                                    <label htmlFor="price">Precio total</label>
                                </FloatLabel>
                            </div>
                            <div className="field col">
                                <Dropdown 
                                    value={selectedClient} 
                                    options={clients} 
                                    onChange={(e) => setSelectedClient(e.value)} 
                                    placeholder="Selecciona un Cliente" 
                                    className="w-full" 
                                />
                            </div>
                            <div className="field col">
                                <Dropdown 
                                    value={selectedBudget} 
                                    options={budgets} 
                                    onChange={(e) => setSelectedBudget(e.value)} 
                                    placeholder="Selecciona un presupuesto" 
                                    className="w-full" 
                                />
                            </div>
                            <div className="field col">
                                <Dropdown 
                                    value={selectedVAT} 
                                    options={[
                                        { label: '10%', value: 10 },
                                        { label: '21%', value: 21 }
                                    ]} 
                                    onChange={(e) => setSelectedVAT(e.value)} 
                                    placeholder="Selecciona IVA" 
                                    className="w-full" 
                                />
                            </div>
                            <div className='field col'>
                                <Checkbox name='status' onChange={handleCheckboxChange} checked={status}></Checkbox>
                                <label className="ml-2">Pagada?</label>
                            </div>
                        </div>
                        {partidas.map((partida, index) => (
                            <Card key={index} className='p-mb-3'>
                                <div className='formgrid grid'>
                                    <div class="field col-12 md:col-10">
                                        <FloatLabel>
                                            <InputText
                                                value={partida.title}
                                                onChange={(e) => handlePartidaTitleChange(e, index)}
                                                placeholder="Título de Partida"
                                                className="w-full"
                                            />
                                            <label htmlFor={`partida-title-${index}`}>Título de Partida</label>
                                        </FloatLabel>
                                    </div>
                                    <div className="field col-12 md:col-2">
                                        <Button 
                                            label="Eliminar Partida"
                                            icon="pi pi-trash"
                                            className="p-button-sm p-button-danger"
                                            onClick={() => handleDeletePartida(index)}
                                        />
                                    </div>
                                    {partida.entries.map((entry, entryIndex) => (
                                        <React.Fragment key={entryIndex}>
                                            <div className="field col-12 md:col-10">
                                                <div className='formgroup-inline'>
                                                    <div className='field col-4'>
                                                        <FloatLabel>
                                                            <InputText
                                                                value={entry.text}
                                                                onChange={(e) => handleEntryChange(e, index, entryIndex, 'text')}
                                                                placeholder="Texto"
                                                                className='w-full'
                                                            />
                                                            <label htmlFor={`text-${index}-${entryIndex}`}>Texto</label>
                                                        </FloatLabel>
                                                    </div>
                                                    <div className='field col-3'>
                                                        <FloatLabel>
                                                            <InputNumber 
                                                                id="price" 
                                                                value={entry.price} 
                                                                onValueChange={(e) => handleEntryChange(e, index, entryIndex, 'price')}
                                                                mode="currency" 
                                                                currency="EUR" 
                                                                locale="es-ES" 
                                                                placeholder="Precio" 
                                                            />
                                                            <label htmlFor={`price-${index}-${entryIndex}`}>Precio</label>
                                                        </FloatLabel>
                                                    </div>
                                                    <div className='field col-2'>
                                                        <Button
                                                            label='Eliminar texto'
                                                            icon="pi pi-trash" 
                                                            severity='danger'
                                                            onClick={() => handleDeleteEntry(index, entryIndex)}
                                                            type='button'
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <Button 
                                        label="Añadir Texto"
                                        icon="pi pi-plus"
                                        severity='secondary'
                                        onClick={() => handleAddEntry(index)}
                                        type='button'
                                    />
                                </div>
                            </Card>
                        ))}
                        <div className='grid'>
                            <div className='col-2'>
                                <Button type="button" severity="secondary" raised label="Nueva Partida" icon="pi pi-plus" onClick={handleAddPartida} className="p-mt-2 p-button-sm" />
                            </div>
                            <div className='col-2'>
                                <Button type="button" severity="success" raised label="Guardar factura" icon="pi pi-check"  className="p-mt-2" onClick={handleSubmit} />
                            </div>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
};