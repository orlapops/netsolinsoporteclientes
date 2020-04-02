import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TabStripComponent } from '@progress/kendo-angular-layout';
import { PanelBarExpandMode, PanelBarItemModel } from '@progress/kendo-angular-layout';

import { NetsolinApp } from '../../../../shared/global';
import { MantbasicaService } from '../../../../services/mantbasica.service';
import { MantablasLibreria } from '../../../../services/mantbasica.libreria';
import { varGlobales } from '../../../../shared/varGlobales';
import { environment } from '../../../../../environments/environment';
import { NetsolinService } from '../../../../services/netsolin.service';
import {
  DialogService,
  DialogRef,
  DialogCloseResult
} from '@progress/kendo-angular-dialog';

//Firebase Oct 4 18
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
// import { NetsolinService } from '../../../../netsolinlibrerias/servicios/netsolin.service';
import { process, State, CompositeFilterDescriptor, filterBy, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { GridComponent, GridDataResult, PageChangeEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
// import { Usuarioreg } from './model';
@Component({
  selector: 'app-monitorpedrecib',
  templateUrl: './monitorpedrecib.component.html',
  styleUrls: ['./monitorpedrecib.component.css']
})
export class MonitorPedRecibidosComponent implements OnInit {
  @ViewChild('tabstrip') public tabstrip: TabStripComponent;
  @Input() vparcaptura: string;
  @Input() vid: any;
  cargo_predrecibidos = true;
  pedrecibpend: any;
  predrecibverificados: any;
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
  public gridData: any[] = filterBy(this.pedrecibpend, this.filter);
  public gridDataactivos: any[] = filterBy(this.predrecibverificados, this.filtercerrados);
  public isNew: boolean;
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
  mostrarmensaje = false;
  puedecrearusuarioreg = true;

  pruebavininumbuscombog: string = "";
  llamabusqueda = false;
  pruellegallabusque: string = "";
  llaveEmail = '';



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
    // this.gridData = process(this.pedrecibpend, this.state);
  }
  public dataStateChangecerrados(state: DataStateChangeEvent): void {
    this.statecerrados = state;
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;
    this.gridData = filterBy(this.pedrecibpend, filter);
  }

  public distinctPrimitive(fieldName: string): any {
    // console.log('distinctPrimitive this.pedrecibpend:',this.pedrecibpend,fieldName);
    return distinct(this.pedrecibpend, fieldName).map(item => item[fieldName]);
  }
  public distinctPrimitiveCerrrados(fieldName: string): any {
    // console.log('distinctPrimitiveCerrrados this.predrecibverificados:',this.predrecibverificados,fieldName);
    return distinct(this.predrecibverificados, fieldName).map(item => item[fieldName]);
  }

  public filterChangecerrados(filter: CompositeFilterDescriptor): void {
    this.filtercerrados = filter;
    this.gridDataactivos = filterBy(this.predrecibverificados, filter);
  }

  public distinctPrimitivecerrados(fieldName: string): any {
    return distinct(this.predrecibverificados, fieldName).map(item => item[fieldName]);
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
    this.service.getPedRecibPendientesFB().subscribe((datos: any) => {
      console.log('Regist pedidos leidos ', datos);
      if (datos) {
        this.pedrecibpend = datos;
        this.gridData = filterBy(this.pedrecibpend, this.filter);
        console.log(this.pedrecibpend);
        this.service.getregistrosusuarActivosFB().subscribe((datos: any) => {
          console.log('Registusuar cerrados ', datos);
          if (datos) {
            this.cargando = false;
            this.resultados = true;
            this.cargo_predrecibidos = true;
            this.predrecibverificados = datos;
            this.gridDataactivos = filterBy(this.predrecibverificados, this.filtercerrados);
            console.log(this.predrecibverificados);
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




  openconsulta(ptipo) {
    if (ptipo == 'llamabusqueda') {
      this.llamabusqueda = true;
    }

  }
  public closeconsulta(ptipo) {
  }
  public closebusquellama(event) {
    // console.log('en moni cliepote llega sde bus prod:'+event);
    this.pruellegallabusque = event;
    this.llamabusqueda = false;

  }

  openeditar(ptipo) {
  }
  public closeeditar(ptipo) {
  }

  //maneja el control para llamado adicion de tablas
  openadicion(ptipo) {
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




  editClick(event) {

  }
  public monitorClick(dataItem): void {
    console.log('monitorclick ', dataItem);
    var pruta = `/pedidodeta/${dataItem.id_pedido}/`;
    console.log("ir a monitor deta pedido:" + pruta);
    this.router.navigate([pruta]);
  }


  public verRegK(dataItem): void {


  }
  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.gridData = orderBy(this.pedrecibpend, this.sort);
    // this.gridData = filterBy(this.pedrecibpend, this.filter);
    // this.loadProducts();
  }
  public sortChangecerrados(sort: SortDescriptor[]): void {
    this.sortcerrados = sort;
    this.gridDataactivos = orderBy(this.predrecibverificados, this.sortcerrados);
  }
  public colorxinitrabajo(code: boolean): SafeStyle {
    let result;

    switch (code) {
      case true:
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
      case true:
        result = '#FFBA80';
        break;
      case false:
        result = '#B2F699';
        break;
      default:
        result = 'transparent';
        break;
    }
    return this.sanitizer.bypassSecurityTrustStyle(result);
  }


  public editHandler({ dataItem }) {
    // this.editDataItem = dataItem;
    // this.llaveEmail = dataItem.Email;
    // this.isNew = false;
  }

  public cancelHandler() {
    // this.editDataItem = undefined;
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
