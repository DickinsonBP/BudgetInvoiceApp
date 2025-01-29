/**
 * React imports
 */
import React, { useState, useEffect } from 'react';
import { createBudget, getClients, getBudgetsLastId, calculateId } from '../../services/api';
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
import { Calendar } from 'primereact/calendar';
import { AutoComplete } from "primereact/autocomplete";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { format } from 'date-fns';
import es from 'date-fns/locale/es';

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,
    background: isDragging ? "lightgrey" : "grey",
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? "lightgrey" : "lightgrey",
    padding: grid,
    width: "100%"
});


export default function NewBudget(){
    const navigate = useNavigate();
    const [partidas, setPartidas] = useState([{ title: '', entries: [{ text: '', price: 0 }] }]);
    const [title, setTitle] = useState('');
    const [budgetDate, setBudgetDate] = useState(null);
    const [price, setPrice] = useState('');
    const [includeTotal, setIncludeTotal] = useState(true);
    const [clients, setClients] = useState([]);
    const [approved, setApproved] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedVAT, setSelectedVAT] = useState(null);
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState([{text:''}]);
    const [docNumber, setDocNumber] = useState('');

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
        const fetchDocNumber = async () => {
            try{
                const lastId = await getBudgetsLastId();
                setDocNumber(parseInt(lastId) + 1);
            }catch(error){
                console.error('Error setting up new budget number:',error);
            }

        }
        
        fetchClients();
        fetchDocNumber();
    }, []);

    useEffect(() => {
      if (includeTotal) {
          const total = partidas.reduce((acc, partida) => {
              const partidaTotal = partida.entries.reduce((partidaAcc, entry) => partidaAcc + (entry.price || 0), 0);
              return acc + partidaTotal;
          }, 0);
          setPrice(total.toFixed(2));
      } else {
          setPrice('0.00');
      }
    }, [partidas, includeTotal]);  

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

    const handleDeletePartida = (index) => {
        const newPartidas = partidas.filter((_, i) => i !== index);
        setPartidas(newPartidas);
    };

    const handleDeleteEntry = (partidaIndex, entryIndex) => {
        const newPartidas = [...partidas];
        newPartidas[partidaIndex].entries = newPartidas[partidaIndex].entries.filter((_, i) => i !== entryIndex);
        setPartidas(newPartidas);
    };
    const handleCheckboxChange = (e) => {
        setApproved(e.target.checked);
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

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = reorder(partidas, result.source.index, result.destination.index);
        setPartidas(items);
    };

    const handleSubmit = async (e) => { 
        e.preventDefault();
        const formattedDate = budgetDate ? format(budgetDate, 'yyyy-MM-dd', { locale: es }) : '';
        const budgetData = {
          title: title,
          price: includeTotal ? price : '0.00',
          client: selectedClient,
          vat: selectedVAT.value,
          approved: approved ? approved : false,
          date: formattedDate,
          doc_number: docNumber,
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
            const response = await createBudget(budgetData);
            navigate('/budgets');
        } catch (error) {
            console.error('Error creating budget:', error);
        }
    };

    const handleReturn = () => {
        navigate('/budgets');
    } 

    const search = (event) => {
      // Verifica que haya texto en la búsqueda
      const query = event.query.toLowerCase(); // Convierte a minúsculas para una comparación insensible a mayúsculas
      const filteredClients = clients.filter(client => 
          client.label.toLowerCase().includes(query) // Filtra los clientes cuyo nombre incluye el texto de búsqueda
      );
  
      // Actualiza las sugerencias con los clientes filtrados
      setClients(filteredClients);
  };
  

    return (
        <div className="card">
          <Card className="card-item">
            <Button
              type="button"
              severity="secondary"
              raised
              label="Volver"
              icon="pi pi-chevron-left"
              className="p-mt-2"
              onClick={handleReturn}
            />
            <h1>Nuevo presupuesto</h1>
    
            <div className="p-field">
              <h3 className="p-field-label">Cuerpo del presupuesto</h3>
    
              <form>
                <div className="grid">
                  <div className="col-2">
                    <Button
                      type="button"
                      severity="secondary"
                      raised
                      label="Nueva Partida"
                      icon="pi pi-plus"
                      onClick={handleAddPartida}
                      className="p-mt-2 p-button-sm"
                    />
                  </div>
                  <div className="col-2">
                    <Button
                      type="button"
                      severity="success"
                      raised
                      label="Guardar presupuesto"
                      icon="pi pi-check"
                      className="p-mt-2"
                      onClick={handleSubmit}
                    />
                  </div>
                </div>
                <div className="formgrid grid">
                  <div className="field col">
                    <InputText
                      id="title"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Título"
                      className="w-full"
                    />
                  </div>
                  <div className="field col">
                    <InputText
                      id="doc_number"
                      value={docNumber}
                      onChange={e => setDocNumber(e.target.value)}
                      placeholder="Número de presupuesto"
                      className="w-full"
                    />
                  </div>
                  <div className="field col">
                    <ToggleButton
                        checked={includeTotal}
                        onChange={(e) => setIncludeTotal(e.value)}
                        onLabel="Incluir Total"
                        offLabel="Excluir Total"
                        onIcon="pi pi-check"
                        offIcon="pi pi-times"
                    />
                  </div>
                  {includeTotal && (
                      <div className="field col">
                          <InputNumber
                              id="price"
                              value={price}
                              mode="currency"
                              currency="EUR"
                              locale="es-ES"
                              placeholder="Precio total"
                              className="w-full"
                              disabled
                          />
                      </div>
                  )}
                  <div className="field col">
                    <Dropdown
                      value={selectedClient}
                      options={clients}
                      onChange={e => setSelectedClient(e.value)}
                      placeholder="Selecciona un Cliente"
                      className="w-full"
                      editable
                    />
                  </div>
                  <div className="field col">
                    <Dropdown
                      value={selectedVAT}
                      options={[
                        { label: 10, value: 10 },
                        { label: 21, value: 21 },
                        { label: 0, value: 0 },
                      ]}
                      onChange={e => setSelectedVAT(e.value)}
                      placeholder="Selecciona IVA"
                      className="w-full"
                    />
                  </div>
                  <div className="field col">
                    <Calendar
                      value={budgetDate}
                      onChange={e => setBudgetDate(e.value)}
                      showIcon
                      locale="es"
                      dateFormat="dd/mm/yy"
                    />
                  </div>
                  <div className="field col">
                    <Checkbox name="approved" onChange={handleCheckboxChange} checked={approved}></Checkbox>
                    <label className="ml-2">Aprobado?</label>
                  </div>
                </div>
    
                {/* Drag and Drop para las partidas */}
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="partidas">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}
                      >
                        {partidas.map((partida, index) => (
                          <Draggable key={`partida-${index}`} draggableId={`partida-${index}`} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                              >
                                <Card className="p-mb-3">
                                  <div className="formgrid grid">
                                    <div className="field col-12 md:col-10">
                                      <FloatLabel>
                                        <InputText
                                          value={partida.title}
                                          onChange={e => handlePartidaTitleChange(e, index)}
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
                                          <div className="formgroup-inline">
                                            <div className="field col-4">
                                              <InputText
                                                value={entry.text}
                                                onChange={e => handleEntryChange(e, index, entryIndex, 'text')}
                                                placeholder="Texto"
                                                className="w-full"
                                              />
                                            </div>
                                            <div className="field col-3">
                                              <InputNumber
                                                id="price"
                                                value={entry.price}
                                                onValueChange={e => handleEntryChange(e, index, entryIndex, 'price')}
                                                mode="currency"
                                                currency="EUR"
                                                locale="es-ES"
                                                placeholder="Precio"
                                              />
                                            </div>
                                            <div className="field col-2">
                                              <Button
                                                label="Eliminar texto"
                                                icon="pi pi-trash"
                                                severity="danger"
                                                onClick={() => handleDeleteEntry(index, entryIndex)}
                                                type="button"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </React.Fragment>
                                    ))}
                                    <Button
                                      label="Añadir Texto"
                                      icon="pi pi-plus"
                                      severity="secondary"
                                      onClick={() => handleAddEntry(index)}
                                      type="button"
                                    />
                                  </div>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
    
                <div>
                  <ToggleButton
                    checked={showNotes}
                    onChange={e => setShowNotes(e.value)}
                    onLabel="Añadir Nota"
                    offLabel="Ocultar Nota"
                    onIcon="pi pi-check"
                    offIcon="pi pi-times"
                  />
                </div>
                {showNotes && (
                  <div>
                    {notes.map((note, index) => (
                      <div className="grid" key={index}>
                        <div className="col">
                          <InputText
                            id={`note-${index}`}
                            value={note.text}
                            onChange={e => handleNoteChange(e, index)}
                            placeholder="Añadir Nota"
                            className="w-full"
                          />
                        </div>
                        <div className="col-fixed">
                          <Button
                            label="Eliminar Nota"
                            icon="pi pi-trash"
                            severity="danger"
                            onClick={() => handleDeleteNote(index)}
                            type="button"
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      label="Añadir Nota"
                      icon="pi pi-plus"
                      severity="secondary"
                      onClick={handleAddNote}
                      type="button"
                    />
                  </div>
                )}
              </form>
            </div>
          </Card>
        </div>
    );
};
