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
import { ToggleButton } from 'primereact/togglebutton';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';

import { format } from 'date-fns';
import es from 'date-fns/locale/es';

export default function NewInvoice(){
    const navigate = useNavigate();
    const toast = useRef(null);
    const [partidas, setPartidas] = useState([{ title: '', entries: [{ text: '', price: 0 }] }]);
    const [title, setTitle] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(null);
    const [price, setPrice] = useState('');
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [status, setStatus] = useState(null);
    const [budgets, setBudgets] = useState([]);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [selectedVAT, setSelectedVAT] = useState(null);
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState([{text:''}]);

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

    const handleAddNote = () => {
        setNotes([...notes, {text:''}]);
    }
    const handleNoteChange = (e, index) => {
        const newNotes = [...notes];
        newNotes[index].text = e.target.value;
        setNotes(newNotes);
    };
    const handleDeleteNote = (index) => {
        const newNotes = notes.filter((_, i) => i !== index);
        setNotes(newNotes);
    };

    const handleSubmit = async (e) => { 
        e.preventDefault();
        const formattedDate = invoiceDate ? format(invoiceDate, 'yyyy-MM-dd', { locale: es }) : '';
        const invoiceData = {
            title: title,
            price: price,
            client: selectedClient,
            budget: selectedBudget,
            vat: selectedVAT,
            date: formattedDate,
            status: status ? status : false,
            data: {
                ...partidas.reduce((acc, partida, index) => {
                    acc[`partida${index + 1}`] = {
                        title: partida.title,
                        entries: partida.entries.map(entry => ({ text: entry.text, price: entry.price }))
                    };
                    return acc;
                }, {}),
                notes: notes.map(note => note.text)
            }
        };
        try {
            await createInvoice(invoiceData);
            toast.current.show({ severity: 'success', summary: 'Felicidades!', detail: 'Factura creada correctamente', life: 3000 });
            navigate('/invoices');
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se ha podido crear la factura. Campos obligatorios: Titulo, Cliente y Presupuesto', life: 3000 });
            console.error('Error creating invoice:', error);
        }
    };

    const handleReturn = () => {
        navigate('/invoices');
    } 

    return (
        <div className="card">
            <Toast ref={toast} />
            <Card className='card-item'>    
                <Button type="button" severity="secondary" raised label="Volver" icon="pi pi-chevron-left"  className="p-mt-2" onClick={handleReturn} />
                <h1>Nueva factura</h1>

                <div className='p-field'>
                    <h3 className='p-field-label'>Cuerpo de la factura</h3>
                    
                    <form>
                        <div className='grid'>
                            <div className='col-2'>
                                <Button type="button" severity="secondary" raised label="Nueva Partida" icon="pi pi-plus" onClick={handleAddPartida} className="p-mt-2 p-button-sm" />
                            </div>
                            <div className='col-2'>
                                <Button type="button" severity="success" raised label="Guardar factura" icon="pi pi-check"  className="p-mt-2" onClick={handleSubmit} />
                            </div>
                        </div>
                        <div className='formgrid grid'>
                            <div className='field col'>
                                <InputText 
                                    id="title" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    placeholder="Título" 
                                    className="w-full" 
                                />
                            </div>
                            <div className="field col">
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
                                <Calendar value={invoiceDate} onChange={(e) => setInvoiceDate(e.value)} showIcon locale='es' dateFormat="dd/mm/yy"/>
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
                                                        <InputText
                                                            value={entry.text}
                                                            onChange={(e) => handleEntryChange(e, index, entryIndex, 'text')}
                                                            placeholder="Texto"
                                                            className='w-full'
                                                        />
                                                    </div>
                                                    <div className='field col-3'>
                                                        <InputNumber 
                                                            id="price" 
                                                            value={entry.price} 
                                                            onValueChange={(e) => handleEntryChange(e, index, entryIndex, 'price')}
                                                            mode="currency" 
                                                            currency="EUR" 
                                                            locale="es-ES" 
                                                            placeholder="Precio" 
                                                        />
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
                        <div>
                            <ToggleButton 
                                checked={showNotes}
                                onChange={(e) => setShowNotes(e.value)}
                                onLabel='Añadir Nota'
                                offLabel='Ocultar Nota'
                                onIcon="pi pi-check" 
                                offIcon="pi pi-times"
                            />
                        </div>
                        {showNotes && (
                            <div>
                                {notes.map((note, index) => (
                                    <div className='grid' key={index}>
                                        <div className='col'>
                                            <InputText 
                                                id={`note-${index}`} 
                                                value={note.text} 
                                                onChange={(e) => handleNoteChange(e, index)} 
                                                placeholder="Añadir Nota" 
                                                className="w-full" 
                                                />
                                        </div>
                                        <div className='col-fixed'>
                                            <Button
                                                label='Eliminar Nota'
                                                icon="pi pi-trash" 
                                                severity='danger'
                                                onClick={() => handleDeleteNote(index)}
                                                type='button'
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button 
                                    label="Añadir Nota"
                                    icon="pi pi-plus"
                                    severity='secondary'
                                    onClick={handleAddNote}
                                    type='button'
                                />
                            </div>
                        )}
                    </form>
                </div>
            </Card>
        </div>
    );
};