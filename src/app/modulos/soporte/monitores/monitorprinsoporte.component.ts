import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TabStripComponent } from '@progress/kendo-angular-layout';
import { PanelBarExpandMode, PanelBarItemModel } from '@progress/kendo-angular-layout';

import { NetsolinApp } from '../../../shared/global';
import { MantbasicaService } from '../../../services/mantbasica.service';
import { MantablasLibreria } from '../../../services/mantbasica.libreria';
import { varGlobales } from '../../../shared/varGlobales';
import { environment } from '../../../../environments/environment';
import { NetsolinService } from '../../../services/netsolin.service';
import {
  DialogService,
  DialogRef,
  DialogCloseResult
} from '@progress/kendo-angular-dialog';

//Firebase Oct 4 18
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
// import { NetsolinService } from '../../../../netsolinlibrerias/servicios/netsolin.service';
import { process, State, CompositeFilterDescriptor,filterBy, FilterDescriptor,distinct } from '@progress/kendo-data-query';
import {GridComponent,GridDataResult,PageChangeEvent,DataStateChangeEvent} from '@progress/kendo-angular-grid';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { EditService } from '../../../services/Editsoporte.service';
import { Usuarioreg } from '../modeldatousuarioreg';
// import { Usuarioreg } from './model';
import { error } from 'util';
@Component({
  selector: 'app-monitorprinsoporte',
  templateUrl: './monitorprinsoporte.component.html',
  styleUrls: ['./monitorprinsoporte.component.css']
})
export class MonitorPrinSoporteComponent implements OnInit {
  @ViewChild('tabstrip') public tabstrip: TabStripComponent;
  @Input() vparcaptura: string;
  @Input() vid: any;
//Registusuar
  cargo_registusuar = true;
  regisusuarpen: any;
  regisusuaractivos: any;
  public state: State = {
    skip: 0,
    take: 30
  };
  public statecerrados: State = {
    skip: 0,
    take: 30
  };
    ejengoninit = false;
public multiple = true;
public allowUnsort = true;
public sort: SortDescriptor[] = [{
    field: 'fecha',
    dir: 'desc'
}];
public sortcerrados: SortDescriptor[] = [{
  field: 'fecha',
  dir: 'desc'
}];
segper_consultar = false;
segper_adicionar = false;
segper_modificar = false;
segper_eliminar = false;
public filter: CompositeFilterDescriptor;
public filtercerrados: CompositeFilterDescriptor;

// public gridData: GridDataResult;
public gridData: any[] = filterBy(this.regisusuarpen, this.filter);
public gridDataactivos: any[] = filterBy(this.regisusuaractivos, this.filtercerrados);
public editDataItem: Usuarioreg;
public isNew: boolean;
public editService: EditService;
public resultalert;

  subtitle = '(Monitor)';
  varParam: string;
  rutamant: string;
  id: string;
  enerror = false;
  enlistaerror = false;
  listaerrores: any[] = [];
  message = "";
  cargando = false;
  resultados = false;
  nom_empre: string;
  cargousuario = false;
  regUsuario: any;
  // Manejo panel de informacion
  infopanelselec: string;
  mostrarmensaje=false;
  puedecrearusuarioreg= true;

  pruebavininumbuscombog:string = "";
  llamabusqueda = false;
  pruellegallabusque:string="";
  llaveEmail = '';
  listDirec: any[] = [];
  clienteActual: any;
  

  constructor(
    // @Inject(EditService) editServiceFactory: any,
    private mantbasicaService: MantbasicaService,
    public vglobal: varGlobales,
    private libmantab: MantablasLibreria,
    private pf: FormBuilder,
    private router: Router,
    private activatedRouter: ActivatedRoute,
    public service: NetsolinService,
    private sanitizer: DomSanitizer,
    private dialogService: DialogService,
    private httpc: HttpClient,
    db: AngularFirestore,
    

  ) {
    console.log('constructor');
    // this.editService = editServiceFactory();
    this.vglobal.mostrarbreadcrumbs = false;
  }
  public dataStateChange(state: DataStateChangeEvent): void {
    console.log(" dataStateChange");
    this.state = state;
    // this.gridData = process(this.regisusuarpen, this.state);
}
public dataStateChangecerrados(state: DataStateChangeEvent): void {
  this.statecerrados = state;
}

public filterChange(filter: CompositeFilterDescriptor): void {
  this.filter = filter;
  this.gridData = filterBy(this.regisusuarpen, filter);
}

public distinctPrimitive(fieldName: string): any {
  // console.log('distinctPrimitive this.regisusuarpen:',this.regisusuarpen,fieldName);
return distinct(this.regisusuarpen, fieldName).map(item => item[fieldName]);
}
public distinctPrimitiveCerrrados(fieldName: string): any {
  // console.log('distinctPrimitiveCerrrados this.regisusuaractivos:',this.regisusuaractivos,fieldName);
return distinct(this.regisusuaractivos, fieldName).map(item => item[fieldName]);
}

public filterChangecerrados(filter: CompositeFilterDescriptor): void {
  this.filtercerrados = filter;
  this.gridDataactivos = filterBy(this.regisusuaractivos, filter);
}

public distinctPrimitivecerrados(fieldName: string): any {
return distinct(this.regisusuaractivos, fieldName).map(item => item[fieldName]);
}

  public onPanelChange(data: Array<PanelBarItemModel>): boolean {

    // // public onPanelChange(event: any) { 
    // //console.log("onPanelChange: ", event); 
    // //console.log("onPanelChange");
    // let focusedEvent: PanelBarItemModel = data.filter(item => item.focused === true)[0];
    // //console.log("focusedEvent.id: "+focusedEvent.id);
    // this.infopanelselec = focusedEvent.id;
    // if (focusedEvent.id !== "info") {
    //    this.selectedId = focusedEvent.id;
    //    //console.log("selec id: ")+this.selectedId;
    //   //  this.router.navigate(["/" + focusedEvent.id]);
    // }

    return false;
  }
  public stateChange(data: Array<PanelBarItemModel>): boolean {
    //console.log("stateChange");
    let focusedEvent: PanelBarItemModel = data.filter(item => item.focused === true)[0];
    //console.log("focusedEvent.id: "+focusedEvent.id);

    if (focusedEvent.id !== "info") {
      //  this.selectedId = focusedEvent.id;
       //console.log("selec id: ")+this.selectedId;
      //  this.router.navigate(["/" + focusedEvent.id]);
    }

    return false;
}


  ngOnInit() {
    this.cargando = true;
    console.log("en ngOnInit editregCliepotecial");
    this.activatedRouter.params
      .subscribe(parametros => {
        // this.varParam = parametros['varParam'];
        // this.id = parametros['id'];
        this.id = NetsolinApp.oapp.cuserid;
          console.log('a inicializar');
          this.inicializaMonitor();
          // this.editService.read();

      });
  }

  inicializaMonitor() {
    console.log('en inicializar');
    //Mientras prueba
    if (!environment.production) {
      // cbus='NETSOLIN   '
    }
    // this.cargaparametrosbasicos();
    // this.generaticket();
    this.service.getregistrosusuarPendientesFB().subscribe((datos:any) =>{
      console.log('Registusuar leidos ', datos);
      if (datos){
        this.regisusuarpen = datos;
        this.gridData = filterBy(this.regisusuarpen, this.filter);
        console.log(this.regisusuarpen);            
        this.service.getregistrosusuarActivosFB().subscribe((datos:any) =>{
          console.log('Registusuar cerrados ', datos);
          if (datos){
            this.cargando = false;
            this.resultados = true;
             this.cargo_registusuar = true;
            this.regisusuaractivos = datos;
            this.gridDataactivos = filterBy(this.regisusuaractivos, this.filtercerrados);
            console.log(this.regisusuaractivos);            
          }
        });
    
      }
    });
  }
  //Si cambia el codigo del tercero llenar el nit con el mismo si este esta vacio
  onChanges(): void {
  }

  retornaRuta() {
    // console.log(this.rutamant);
    return '/' + this.rutamant;
  }

  onSubmit() {
    this.enerror = false;
    // this.grabo = false;
   }
 
  showError(msg) {
    this.message = msg;
    this.enerror = true;
    // console.log(this.message);
  }

  showMensaje(msg) {
    this.message = msg;
    this.enerror = false;
    // console.log(this.message);
  }

  retornaRutaAcampana() {
    // addregtbasica/VPARCOMPETENCIA
  }


 
 
  openconsulta(ptipo){
    if (ptipo == 'llamabusqueda') {
      this.llamabusqueda = true;
    }   
    
  }
  public closeconsulta(ptipo) {
  }
  public closebusquellama(event){
    // console.log('en moni cliepote llega sde bus prod:'+event);
    this.pruellegallabusque=event;
    this.llamabusqueda = false;

  }

  openeditar(ptipo){
    console.log('openeditar', ptipo);
    
  }
  public closeeditar(ptipo) {
    console.log('closeeditar', ptipo);
  }
  
  //maneja el control para llamado adicion de tablas
  openadicion(ptipo) {
    console.log('openeditar', ptipo);
    if (ptipo == 'cotiza') {
      // this.crearcotiza = true;
    } 
  }
  //maneja el control para cerrar

  public closeadicion(ptipo) {
    if (ptipo == 'cotiza') {
      // this.crearcotiza = false;
    } 
  }

  
  

  editClick(event){
    console.log('editClick', event);

  }
  public monitorClick(dataItem): void {
    console.log('monitorclick ', dataItem);
    var pruta = `/monitorincidencia/${dataItem.nit_empre}/${dataItem.ticket}/`;
    console.log("ir a monitor usuarioreg:" + pruta);
    this.router.navigate([pruta]);
  }

public verRegK(dataItem): void {

  // var vpref = ((this.prefopermant == '') ? 'basica' : this.prefopermant);
  // var pruta = '/verregt' + vpref + '/' + this.varparcaptura;
  // // console.log("pruta:" + pruta);
  // // console.log("pvalc:"+pvalc);
  // // var pvalc= this.retornaValcampo(this.gridData.data[rowIndex],'C');
  // var pvalc = this.retornaValcampo(dataItem, 'C');
  // // console.log("verregk pvalc:" + pvalc);
  // this.router.navigate([pruta, pvalc]);
  // // console.log("verregk antes evenclose:" );
  // // this.evenclose.emit("");

}
public sortChange(sort: SortDescriptor[]): void {
  this.sort = sort;
  this.gridData = orderBy(this.regisusuarpen, this.sort);
  // this.gridData = filterBy(this.regisusuarpen, this.filter);
  // this.loadProducts();
}
public sortChangecerrados(sort: SortDescriptor[]): void {
  this.sortcerrados = sort;
  this.gridDataactivos = orderBy(this.regisusuaractivos, this.sortcerrados);
}
public colorxinitrabajo(code: boolean): SafeStyle {
  let result;

  switch (code) {
   case true :
     result = '#B2F699';
     break;
  //  case false :
  //    result = '#FFBA80';
  //    break;
   default:
     result = 'transparent';
     break;
  }
  return this.sanitizer.bypassSecurityTrustStyle(result);
  }

public colorCode(code: boolean): SafeStyle {
  let result;

  switch (code) {
   case true :
     result = '#FFBA80';
     break;
   case false :
     result = '#B2F699';
     break;
   default:
     result = 'transparent';
     break;
  }
  return this.sanitizer.bypassSecurityTrustStyle(result);
  }

  public addHandler() {
    this.editDataItem = new Usuarioreg();
    // this.editDataItem.ticket = this.service.generanumTicket();
    // this.editDataItem.fecha = new Date();
    // this.editDataItem.nit_empre = '';
    // this.editDataItem.nom_empre = '';
    // this.editDataItem.cusuareporta = '';
    // this.editDataItem.nomusuarreporta = '';

    this.isNew = true;
}

public editHandler({dataItem}) {
  console.log('editHandler ', dataItem);
  this.editDataItem = dataItem;
    this.llaveEmail = dataItem.Email;
    this.isNew = false;
}

public cancelHandler() {
    this.editDataItem = undefined;
}

public saveHandler(usuarioreg: Usuarioreg) {
    console.log('a grabar ',usuarioreg,this.isNew, this.editDataItem);
      this.editDataItem.id_empresa = usuarioreg.id_empresa;
      this.editDataItem.Empresa = usuarioreg.Empresa;  
      this.editDataItem.Nombre = usuarioreg.Nombre;  
      this.editDataItem.Vista = usuarioreg.Vista;  
      this.editDataItem.Pedido = usuarioreg.Pedido;  
      this.editDataItem.Email = this.llaveEmail;  
      this.editDataItem.Version = usuarioreg.Version;  
      this.editDataItem.ver_basicas = usuarioreg.ver_basicas;        
      this.editDataItem.ver_stock = usuarioreg.ver_stock;  
      console.log('saveHandler ', this.editDataItem);
      const copiaeditDataItem = this.editDataItem;
      this.cargaDireccionesClienteNetsolin(this.editDataItem.id_empresa).then(() => {       
        console.log('saveHandler 1 ', this.clienteActual, this.editDataItem, copiaeditDataItem);
        this.editDataItem = copiaeditDataItem;
        console.log('saveHandler 2 ', this.clienteActual, this.editDataItem, copiaeditDataItem);
        const DataEmpresa  = {
          nit: this.editDataItem.id_empresa,
          nombre: this.clienteActual.cliente,
          inactivo: this.clienteActual.inactivo,
          cod_lista: this.clienteActual.cod_lista,
          lista: this.clienteActual.lista,
          cod_fpago: this.clienteActual.cod_fpago,
          for_pago: this.clienteActual.for_pago,
          direcciones: this.listDirec
        }
          console.log('a grabr actEmpresaFb',this.editDataItem.id_empresa, DataEmpresa);
          this.service.actEmpresaFb(this.editDataItem.id_empresa, DataEmpresa);
          this.service.actUsuarioregFb(this.llaveEmail, this.editDataItem);
          this.service.regLogusuarioregFb(this.editDataItem,'Modificado','Se modifico usuario registrado y act datos empresa');
      })
    // this.service.grabarusuarioregFb(this.editDataItem, this.isNew);
    this.editDataItem = undefined;
}
  cargaDireccionesClienteNetsolin(cod_tercer: string) {
    return new Promise((resolve, reject) => {
      this.clienteActual = null;
      
      this.service.getDireccionesClienteNetsolin(cod_tercer).subscribe(
        (data: any) => {
          console.log(" cargaDireccionesClienteNetsolin 3 data:",data);
          if (data.error) {
            console.error('Erro en getDireccionesClienteNetsolin ',data.error);
            resolve(false);
          } else {
            const direccliente = data.direcciones;
            console.log('direccliente:',direccliente);            
            direccliente.forEach(itemreg =>{
                const litem= { direccion: itemreg.direccion, id_direc: itemreg.id_direc };
                this.listDirec.push(litem);                
            });
            console.log('listDirec', this.listDirec);
            this.clienteActual = data.datos_gen[0];
            resolve(true);
          }
        });
    });
  }
public removeHandler({dataItem}) {
    // this.editService.remove(dataItem);
    if (dataItem.solucionado || dataItem.seasignocons ){
      this.showAlerta('Advertencia', 'No se puede eliminar si esta asignado o cerrado');
    } else {
    this.service.deleteUsuarioregFb(dataItem.ticket);
    }
}
public showAlerta(ptitulo, palerta) {
  const dialog: DialogRef = this.dialogService.open({
      title: ptitulo,
      content: palerta,
      actions: [
          { text: 'Ok', primary: true }
      ],
      width: 450,
      height: 200,
      minWidth: 250
  });

  dialog.result.subscribe((result) => {
      if (result instanceof DialogCloseResult) {
          console.log('close');
      } else {
          console.log('action', result);
      }

      this.resultalert = JSON.stringify(result);
  });
}

}
