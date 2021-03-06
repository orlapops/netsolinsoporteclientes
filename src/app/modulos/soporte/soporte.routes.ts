import { RouterModule, Routes } from '@angular/router';

import { SoporteComponent } from './soporte.component';
import { MonitorPrinSoporteComponent } from './monitores/monitorprinsoporte.component';
import { NopagesfoundComponent } from '../../shared/nopagesfound/nopagesfound.component';


import { MonitorObjetotablaComponent } from './monitores/objetotabla/monitor.component';
import { MonitorGeneralComponent } from './monitores/general/monitor.component';
import { Netssoportebusqueda } from './componentes/soportebusqueda/soportebusquedamodal.componet';
import { MantBasicaComponent } from '../../mantablasbasicas/tbasica/mantbasica.component';
import { AddregtbasicaComponent } from '../../mantablasbasicas/tbasica/adicionar/adicionar.component';
import { VerregtbasicaComponent } from '../../mantablasbasicas/tbasica/ver/ver.component';
import { EditregtbasicaComponent } from '../../mantablasbasicas/tbasica/editar/editar.component';
import { MenuTbasComponent } from '../../mantablasbasicas/tbasica/menumtablas/menumtablas.component';
import { MonitorPedRecibidosComponent } from './monitores/pedidosrecibidos/monitorpedrecib.component';
import { DetaPedidoComponent } from './monitores/pedidosrecibidos/detapedidos/detaped.component';

//Op marzo 7 18 Modelo soporte del modulo principal
//cambiar palabra modelo
//Incluya las soporte hijas

const soporteRoutes: Routes = [
    {
        path: '',
        component: SoporteComponent,
        children: [
            { path: 'home', component: MonitorPrinSoporteComponent, data: { titulo: 'Monitor Principal' } },
            { path: 'pedidos', component: MonitorPedRecibidosComponent, data: { titulo: 'Monitor Pedidos' } },            
            { path: 'pedidodeta/:id_ped', component: DetaPedidoComponent, data: { titulo: 'Monitor Pedidos' } },            
            {path: 'menutbas', component: MenuTbasComponent, data: { titulo: 'Menu Principal' }},
            { path: 'monitorprinsoporte', component: MonitorPrinSoporteComponent, data: { titulo: 'Monitor Principal' } },           
            { path: 'mantbasica/:objeto', component: MantBasicaComponent, data: { titulo: 'Mantenimiento' }},
            { path: 'addregtbasica/:varParam', component: AddregtbasicaComponent, data: { titulo: 'Adicionar registro' }},
            { path: 'verregtbasica/:varParam/:id', component: VerregtbasicaComponent, data: { titulo: 'Consultar registro' }},
            { path: 'editregtbasica/:varParam/:id', component: EditregtbasicaComponent, data: { titulo: 'Editar registro' }},
            { path: 'monitorgeneral', component: MonitorGeneralComponent, data: { titulo: 'Monitor General' }}, 
            { path: 'monitorobjtabla/:varParam/:id', component: MonitorObjetotablaComponent, data: { titulo: 'Monitor panel tabla' }}, 
            {path: '', redirectTo: '/home', pathMatch: 'full'},
            { path: '**', component: NopagesfoundComponent }
            // { path: '', redirectTo: '/monitorprinsoporte', pathMatch: 'full' }
        ]
    }
];


export const SOPOR_ROUTES = RouterModule.forChild( soporteRoutes);
