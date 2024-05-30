import { useNavigate } from "react-router-dom";
import React from 'react'; 
import SBlogo from '../../assets/images/logo.png';
import '../../styles/Nav.css';


import { Menubar } from 'primereact/menubar';

export default function Navbar() {
    const navigate = useNavigate();
    const items = [
        {
            label: 'Inicio',
            icon: 'pi pi-home',
            command: () => { navigate('/'); }
        },
        {
            label: 'Clientes',
            icon: 'pi pi-user',
            items : [
                {
                    label: 'Ver clientes',
                    icon: 'pi pi-list',
                    command: () => { navigate('/clients'); },
                },
                {
                    label: 'Nuevo cliente',
                    icon: 'pi pi-user-plus',
                    command: () => { navigate('/clients/new-client'); },
                } 
            ],
        },
        {
            label: 'Presupuestos',
            icon: 'pi pi-file',
            items : [
                {
                    label: 'Ver presupuestos',
                    icon: 'pi pi-list',
                    command: () => { navigate('/budgets'); }
                },
                {
                    label: 'Nuevo presupuesto',
                    icon: 'pi pi-file-edit',
                    command: () => { navigate('/budgets/new-budget'); },
                } 
            ],
        },
        {
            label: 'Facturas',
            icon: 'pi pi-receipt',
            items : [
                {
                    label: 'Ver facturas',
                    icon: 'pi pi-list',
                    command: () => { navigate('/invoices'); }
                },
                {
                    label: 'Nueva factura',
                    icon : 'pi pi-receipt',
                    command: () => { navigate('/invoices/new-invoice'); },
                } 
            ],
        }
    ];
    const start = <img alt="logo" src={SBlogo} height="40" className="mr-2" onClick={() => navigate('/')}></img>;

    return (
        <div className="nav">
            <Menubar model={items} start={start}/>
        </div>
    )
}
        