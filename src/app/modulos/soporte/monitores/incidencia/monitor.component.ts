import { Component, OnInit, Input, ViewChild } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators
} from "@angular/forms";
import {
  DialogService,
  DialogRef,
  DialogCloseResult
} from '@progress/kendo-angular-dialog';
import { Router, ActivatedRoute, Params } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { TabStripComponent } from "@progress/kendo-angular-layout";
import {
  PanelBarExpandMode,
  PanelBarItemModel
} from "@progress/kendo-angular-layout";
import { SortDescriptor, orderBy, groupBy, process, State, CompositeFilterDescriptor,filterBy, FilterDescriptor,distinct } from '@progress/kendo-data-query';
import {GridComponent,PageChangeEvent,DataStateChangeEvent} from '@progress/kendo-angular-grid';
import { pipe } from '@angular/core/src/render3/pipe';
import { catchError, map, tap } from 'rxjs/operators';

import { NetsolinApp } from "../../../../shared/global";
import { MantbasicaService } from "../../../../services/mantbasica.service";
import { MantablasLibreria } from "../../../../services/mantbasica.libreria";
import { varGlobales } from "../../../../shared/varGlobales";
import { NetsolinService } from "../../../../services/netsolin.service";
import { DomSanitizer } from "@angular/platform-browser";
// import { SoporteService } from '../../../../services/soporte.service';
import { AngularFirestore } from "@angular/fire/firestore";
// import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from "rxjs";
import { FileRestrictions, SelectEvent, ClearEvent, RemoveEvent, FileInfo } from '@progress/kendo-angular-upload';

// import { NetsolinService } from '../../../../netsolinlibrerias/servicios/netsolin.service';
import { Incidente } from '../../modeldatoincidente';
import { Archivoinc } from "../../modeldatoarchivo";

@Component({
  selector: "monitor-incidencia",
  templateUrl: "./monitor.component.html",
  styleUrls: ["./monitor.component.css"]
})
export class MonitorIncidenciaComponent implements OnInit {
  @ViewChild("tabstrip") public tabstrip: TabStripComponent;
  @Input() nit_empresa: string;
  @Input() ticket: string;
  public editForm: FormGroup = new FormGroup({
    'asunto': new FormControl('', Validators.required),
    'detalle': new FormControl('', Validators.required),
    'productoprin': new FormControl('netwin', Validators.required),
    'prioridad': new FormControl('Baja', Validators.required),
    'accion': new FormControl('Solucionada', Validators.required),
    'solucion': new FormControl(''),
    'nivelcriticidad': new FormControl('05', Validators.required)
});

public listprioridades: Array<string> = [
  'Baja', 'Media', 'Alta'
];

public listacciones: Array<string> = [
  'Solucionada', 'Reportar Netsolin'
];
public resultalert;
public state: State = {
  skip: 0,
  take: 30
};
public sort: SortDescriptor[] = [{
  field: 'fecha',
  dir: 'desc'
}];

  pnit_empresa: string;
  pticket: string;
  chatmensaje: string = '';
  title: string;
  subtitle = "(Monitor)";
  varParam: string;
  soportemant: string;
  enerror = false;
  enlistaerror = false;
  listaerrores: any[] = [];
  message = "";
  cargando = false;
  resultados = false;
  init = false;
  incidencia: any= {};
  logincidencias: Array<any> = [];
  archivosincidencias: Array<any> = [];
  public filter: CompositeFilterDescriptor;
  public gridDataArch: any[] = filterBy(this.archivosincidencias, this.filter);
  public editDataItem: Incidente;
  public isNew: boolean;
  
  chatincidencias: Array<any> = [];
  // Manejo panel de informacion
  infopanelselec: string;
  mostrarmensaje = false;
  collapse = false;
  esconder = false;
  cargo_incidencia = false;
  cargo_log = false;
  cargo_chat = false;
  cargo_archivos = false;
  classxestado: string;
  public textnivelcriticidad:string = '';
  public textproducto:string = '';

  public widtharchivos = '100%';
  public heightarchivos = '500px';
  public active = false;
  public editDataItemArch: Archivoinc;
  
  constructor(
    private mantbasicaService: MantbasicaService,
    public vglobal: varGlobales,
    private libmantab: MantablasLibreria,
    public service: NetsolinService,
    private pf: FormBuilder,
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private httpc: HttpClient,
    private sanitizer: DomSanitizer,
    private dialogService: DialogService,
    // private storage: AngularFireStorage,
    private db: AngularFirestore
  ) {
    this.vglobal.mostrarbreadcrumbs = false;
  }


  public onPanelChange(data: Array<PanelBarItemModel>): boolean {
    console.log("onPanelChange: ", event, data);
    return false;
  }
  public stateChange(data: Array<PanelBarItemModel>): boolean {
    console.log("stateChange", data);
    return false;
  }
  public dataStateChange(state: DataStateChangeEvent): void {
    console.log(" dataStateChange");
    this.state = state;
    // this.gridData = process(this.incidentespen, this.state);
}
  ngOnInit() {
    console.log("en ngOnInit incidencia", this.nit_empresa, this.ticket);
    this.cargando = true;
    this.resultados = false;
    this.activatedRouter.params.subscribe(parametros => {
      this.pnit_empresa = parametros['nit_empresa'];
      this.pticket = parametros['ticket'];
      console.log(this.pnit_empresa, this.pticket);
      //cargar incidencia
      this.db
      .collection(`/incidentes`)
      .doc(this.pticket)
      .valueChanges()
      .subscribe( ( data: any ) => {
        console.log('trae incidencia de firebase', data);
        this.incidencia = data;   
        this.editForm.reset(this.incidencia);
        this.editDataItem = this.incidencia;
        this.active =  this.incidencia !== undefined;
        this.textnivelcriticidad = this.retornanivelcriticidad(data);
        this.textproducto = this.retornaproducto(data);
                //Si esta solucionada
                if (data.solucionado){
                  this.classxestado = "bg-success";
                } else if (data.evaluado && data.reportadoanetsolin && !data.iniciotrabajo){
                  this.classxestado = "bg-warning";
                } else if (data.evaluado && data.reportadoanetsolin && !data.iniciotrabajo){
                  this.classxestado = "bg-primary";
                } else {
                  this.classxestado = "bg-info";
                }
                
        this.cargando = false;
        this.resultados = true;        
        //cargar log
        this.service.getLogIncidenteFB(this.pticket).subscribe((datoslog: any) => {
          // this.getLogIncidencia(this.pticket).subscribe((datoslog: any) => {
            console.log('datoslog', datoslog);
          // this.logincidencias = orderBy(datoslog,  [{ field: "fecha", dir: "desc"}]); 
          this.logincidencias = groupBy(datoslog, [{ field: "fechastr", dir: "desc" },{ field: "fecha", dir: "desc" }]);
          // console.log(result);
          this.cargo_incidencia = true;
          // console.log(JSON.stringify(this.logincidencias, null, 2));
          // console.log('getLogIncidencia cargada ', this.logincidencias);
        });        
          //cargar  chat incidencia
          this.service.getChatIncidenteFB(this.pticket).subscribe((datoschat: any) => {
            this.chatincidencias = orderBy(datoschat,  [{ field: "fecha", dir: "asc"}]);
            this.cargo_chat = true;
            console.log("chatincidencias cargada ", this.chatincidencias);
          });
        //cargar  archivos incidencia
        console.log('a traer archivos', this.pticket);
        this.getArchivosincidencia(this.pticket).subscribe((datosarch: any) => {
          console.log('archivos traidos ',datosarch);
          this.archivosincidencias = datosarch;
          this.cargo_archivos = true;
          this.gridDataArch = filterBy(this.archivosincidencias, this.filter);

          console.log('archivosincidencias cargada ', this.archivosincidencias, this.filter);
        });        
       });
    });
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;
    this.gridDataArch = filterBy(this.archivosincidencias, filter);
  }
  public distinctPrimitive(fieldName: string): any {
    return distinct(this.archivosincidencias, fieldName).map(item => item[fieldName]);
    }
  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.gridDataArch = orderBy(this.archivosincidencias, this.sort);
  }
  //Trae Log incidencia  actual firebase
  public getLogIncidencia(id: string) {    
    return this.db
    .collection(`/incidentes/${id}/log`)
    .valueChanges();
  }

  //Trae chat incidencia  actual firebase
  public getChatincidencia(id: string) {    
    return this.db
    .collection(`/incidentes/${id}/chat`)
    .valueChanges();
  }
  //Trae archivos incidencia  actual firebase
  public getArchivosincidencia(id: string) {    
    return this.db
    .collection(`/incidentes/${id}/archivos`)
    .valueChanges()
    .pipe(
			map(actions =>
				actions.map((a: any) => {
					// console.log(a);
					a.fecha = a.fecha.toDate();
					return a;

				})
			)
		 );

  }

  //Si cambia el codigo del tercero llenar el nit con el mismo si este esta vacio
  onChanges(): void {}

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

  retornaSoporteAcampana() {
    // addregtbasica/VPARCOMPETENCIA
  }

  openconsulta(ptipo) {
    if (ptipo == "llamabusqueda") {
      // this.llamabusqueda = true;
    }
  }
  public closeconsulta(ptipo) {}
  public closebusquellama(event) {
    console.log("en moni cliepote llega sde bus prod:" + event);
    // this.pruellegallabusque = event;
    // this.llamabusqueda = false;
  }

  openeditar(ptipo) {}
  public closeeditar(ptipo) {}

  //maneja el control para llamado adicion de tablas
  openadicion(ptipo) {
    if (ptipo == "cotiza") {
      // this.crearcotiza = true;
    }
  }
  //maneja el control para cerrar

  public closeadicion(ptipo) {
    if (ptipo == "cotiza") {
      // this.crearcotiza = false;
    }
  }

  conmutacollapse() {
    this.collapse = !this.collapse;
  }
  esconderpanel() {
    this.esconder = true;
  }

  cleanURL(oldURL: string) {
    return this.sanitizer.bypassSecurityTrustUrl(oldURL);
  }
  retornaproducto(datai) {
    // console.log(this.service.productosprin);
    const rfiltro = this.service.productosprin.filter(reg => reg.id === datai.productoprin);
    // console.log(rfiltro, datai);
    if (rfiltro){
      return  rfiltro[0].nombre;
    } else {
      return 'ND';
    }
  }
  retornanivelcriticidad(datai){
    const rfiltro = this.service.nivelescriticidad.filter(reg => reg.nivel === datai.nivelcriticidad);    
    return  rfiltro[0].descripcion;

  }
  private closeForm(): void {
    this.active = false;
  }
  public onSave(e): void {
    e.preventDefault();
    const incidente = this.editForm.value;
    console.log('a grabar ',e, this.incidencia , this.editForm, this.editDataItem);
    this.editDataItem.asunto = incidente.asunto;
    this.editDataItem.detalle = incidente.detalle;  
    this.editDataItem.prioridad = incidente.prioridad;  
    this.editDataItem.nivelcriticidad = incidente.nivelcriticidad;  
    this.editDataItem.productoprin = incidente.productoprin;  
    this.editDataItem.canaling = 'web';  
    this.editDataItem.usuarevalua = this.service.usuarFb.nombre;
    this.editDataItem.evaluado = true;  
    this.editDataItem.fechaevalua = new Date();
    if (incidente.accion === 'Solucionada') {
      if (incidente.solucion === '') {
        this.showAlerta('Advertencia','Debe ingresar detalle de la solución dada.');
      } else {
      this.editDataItem.solucionaevaluador = true;  
      this.editDataItem.fechasolucionado = new Date();          
      this.editDataItem.solucion = incidente.solucion;  
      this.editDataItem.solucionado = true;  
      this.service.actIncidenteFb(this.editDataItem.ticket, this.editDataItem);
      this.service.regLogincidenteFb(this.editDataItem, true, 'Evaluado','Se evaluo y soluciono', true);
    }
    } else {
      this.editDataItem.solucionaevaluador = false;  
      this.editDataItem.reportadoanetsolin = true;  
      this.editDataItem.reportarnetsolin = true;  
      this.editDataItem.fecharepornetsolin = new Date();          
      this.editDataItem.solucionado = false;  
      this.editDataItem.solucion = '';  
      this.service.actIncidenteFb(this.editDataItem.ticket, this.editDataItem);
      this.service.regLogincidenteFb(this.editDataItem, true, 'Evaluado','Se evaluo y se reporta a Netsolin', false);
    }
    // console.log('editar ', this.editDataItem);
    // this.active = false;
    // this.editDataItem = undefined;
}

public addHandler() {
  this.editDataItemArch = new Archivoinc();
  this.editDataItemArch.id = this.service.generanumTicket();
  this.editDataItemArch.fecha = new Date();
  this.editDataItemArch.nombre = '';
  this.editDataItemArch.link = '';
  this.editDataItemArch.usuarcrea = this.service.usuarFb.id;
  this.isNew = true;
}

public editHandler({dataItem}) {
  this.editDataItemArch = dataItem;
  this.isNew = false;
}

public cancelHandlerArch() {
  this.editDataItemArch = undefined;
}

public saveHandlerArch(archivo: any) {
  console.log('a grabar archivo ',archivo,this.isNew, this.editDataItemArch);
  // incidentgrabar = new Incidente();
  if (this.isNew){
    let imagePreviews: FileInfo[] = [];
    const that = this;

    archivo.myUpload.forEach((file) => {
      const id = this.service.generanumTicket();
      console.log(`File selected: ${file.name}`);
      if (!file.validationErrors) {
        // const reader = new FileReader();
        // reader.onload = function (ev) {
        //   const image = {
        //     src: ev.target.result,
        //     uid: file.uid
        //   };
        //   console.log('imagen ', image);
        //   // that.imagePreviews.unshift(image);
        // };
        this.service.addArchivoIncidenteFb(this.pticket,id,archivo.nombre, file.name, file.rawFile);
        this.service.regLogincidenteFb(this.incidencia, true, 'Adjunto archivo','Se adjunto archivo: ' + file.name, false);
        // reader.readAsDataURL(file.rawFile);
        console.log('raw', file.rawFile);
      }
    });

    // const datosarchivo = {
    //   id: id,
    //   nombre: archivo.nombre,
    //   usuarcrea: this.service.usuarFb.nombre,
    //   fecha: new Date(),
    //   link: archivo.link
    // };
    // this.service.addArchivoIncidenteFb(this.pticket,id,datosarchivo);      
    // this.service.regLogincidenteFb(this.incidencia, true, 'Adjunto archivo','Se adiciono Archivo: '+archivo.nombre, false);
  } else {
    // console.log('a actualizar archivo',this.pticket, this.editDataItemArch.id, this.editDataItemArch);
    this.editDataItemArch.nombre = archivo.nombre;
    this.service.actArchivoIncidenteFb(this.pticket, this.editDataItemArch.id, this.editDataItemArch);
    this.service.regLogincidenteFb(this.incidencia, true, 'Modi. nom archivo','Se modifico archivo', false);
    // console.log('editar ', this.editDataItem);
  }

  // this.service.grabarincidenteFb(this.editDataItem, this.isNew);

  this.editDataItem = undefined;
}

public removeHandler({dataItem}) {
  this.service.deleteArchivoIncidenteFb(this.pticket, dataItem.id);
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
chatEnviamensaje(mensaje){
  console.log('mensaje a enviar', mensaje, this.chatmensaje);
  if (this.chatmensaje != ''){
    this.service.regChatincidenteFb(this.incidencia, this.chatmensaje);
    this.chatmensaje = '';
  }
}

}
