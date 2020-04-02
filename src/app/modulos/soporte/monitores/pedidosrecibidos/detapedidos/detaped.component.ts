import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  DialogService,
  DialogRef,
} from '@progress/kendo-angular-dialog';
import { GroupDescriptor, DataResult, process, State, CompositeFilterDescriptor, filterBy, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { GridComponent, GridDataResult, PageChangeEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Pedido } from './modeldatodetaped';
import { NetsolinService } from '../../../../../services/netsolin.service';
import { IntlService } from '@progress/kendo-angular-intl';
import { TemplateParseError } from '@angular/compiler';

// import { CrudBasicoComponent } from 'src/app/shared/components/crudtablabasica/crudbasico.component';

// import { MultiCheckFilterComponent } from 'src/app/shared/filtromultiplegrid/multicheck-filter.component';
const createFormGroup = dataItem => new FormGroup({
  'cod_linea': new FormControl(dataItem.cod_linea, Validators.required),
  'cod_color': new FormControl(dataItem.cod_color, Validators.required),
  'cod_curva': new FormControl(dataItem.cod_curva),
  'talla': new FormControl(dataItem.talla),
  'cantidad': new FormControl(dataItem.cantidad, Validators.compose([Validators.required, Validators.pattern('^[1-9]{1,3}')])),
});

@Component({
  selector: 'app-detaped',
  templateUrl: './detaped.component.html',
  styleUrls: ['./detaped.component.scss']
})
export class DetaPedidoComponent implements OnInit {
  @Input() id_tipo: any;
  //kendo grid
  prulabeltitulo = 'Titulo label info';

  public editDataItem: Pedido;
  public isNew: boolean;
  datospedido: Array<any> = [];
  datoscliepedido: any;
  id_pedido: any;
  log: Array<any> = [];
  loggroup: Array<any> = [];
  cargo_datos = false;
  cargoclienteNetsolin = false;
  clienteActual: any;
  direccionesclieact: any;
  lineaprecio: any;
  cartera: any;
  totalpares = 0;
  totalpedido = 0;


  public filter: CompositeFilterDescriptor;
  // public gridData: any[] = filterBy(this.datospedido, this.filter);
  // public groups: GroupDescriptor[] = [{ field: 'Agrupamiento' }];
  public gridData: DataResult;
  public aggregates: any[] = [{ field: 'cod_linea', aggregate: 'count' }, { field: 'tpares', aggregate: 'sum' }, { field: 'total', aggregate: 'sum' }];
  public state: State = {
    skip: 0,
    take: 30,
    group: [{ field: 'Agrupamiento', aggregates: this.aggregates }]
  };
  public sort: SortDescriptor[] = [{
    field: 'fecha',
    dir: 'desc'
  }];
  
  resultados = false;
  // linkFb =  'clientes/'+this.oapp.datosEmpre.id+'/cargos/';
  // linkFblog =  'clientes/'+this.oapp.datosEmpre.id+'/cargos_log/';
  // linkFbPersonal =  'clientes/'+this.oapp.datosEmpre.id+'/personal/';
  public formGroup: FormGroup;
  private editedRowIndex: number;

  constructor(private curService: NetsolinService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private router: Router) { }

  //Init se ejeucta despues del constructor llama a inicializar
  ngOnInit() {
    console.log('a inicializar');
    this.route.params.subscribe(parametros => {
      this.id_pedido = parametros["id_ped"];
      console.log('this.id_tipo', this.id_tipo);
      this.cargadatosbasicos().then(() => {
        this.inicializa();
        //cargar log
        // this.curService.getLogFB(this.linkFblog,'id_ref',this.id_tipo)
        // .subscribe((datoslog: any) => {
        //   // this.getLogIncidencia(this.pticket).subscribe((datoslog: any) => {
        //   console.log("datoslog", datoslog);
        //   // this.log = orderBy(datoslog,  [{ field: "fecha", dir: "desc"}]);
        //   this.log = orderBy(datoslog,  [{ field: "fecha", dir: "desc"}]);
        //   this.loggroup = groupBy(datoslog, [
        //     { field: "fechastr", dir: "desc" },
        //     { field: "fecha", dir: "desc" }
        //   ]);
        //   console.log('this.log',this.log);
        //   console.log('this.loggroup',this.loggroup);
        //   this.cargo_datos = true;
        // });
        // resolve(true);
      });

    });
    // this.inicializa();
  }
  cargadatosbasicos() {
    return new Promise(resolve => {
      this.curService.cargoparametrosb = false;
      // this.curService.getProductosFB().subscribe((datos:any) =>{
      //   if (datos){
      // this.curService.cargoparametrosb = true;
      // this.curService.productos = datos;
      // console.log(this.curService.productos);     
      resolve(true);
      //     }
      //   });
    });
  }
  inicializa() {
    console.log('en inicializar');
    this.cargo_datos = false;
    this.curService.getPedidoFB(this.id_pedido).subscribe((datos: any) => {
      console.log('datos leidos ', datos);
      if (datos) {
        this.cargoclienteNetsolin = false;
        this.cargaClienteNetsolin(datos.id_empresa, datos.items).then(() => {
          console.log('cliente actual', this.clienteActual);
          console.log('cliente cartera', this.cartera);
          console.log('cliente lineaprecio', this.lineaprecio);
          //Organizar pedido de acuerdo a curvas y tallas
          datos.items.forEach(itemped => {
            console.log('Item pedido:', itemped);
            const lineavend = this.lineaprecio.find(element => element.cod_linea === itemped.linea);
            console.log('lineavend: ', lineavend);
            if (itemped.t_curvas > 0) {
              itemped.curvas.forEach(itemcurva => {
                if (itemcurva.cantidad > 0) {
                  const areg = {
                    cod_linea: itemped.linea,
                    cod_color: itemped.color,
                    cod_curva: itemcurva.curva,
                    talla: '',
                    curva: itemped.curva,
                    cod_refven: itemped.linea.trim() + itemped.color.trim() + itemcurva.curva.trim(),
                    cantidad: itemcurva.cantidad,
                    tpares: itemcurva.cantidad * itemcurva.pares,
                    precio: lineavend.precio,                    
                    total: itemcurva.cantidad * itemcurva.pares * lineavend.precio,
                    cod_vended: lineavend.cod_vended,
                    cod_procve: lineavend.cod_procve,
                    Agrupamiento: 'Linea: '+lineavend.cod_linea + ' Vendedor: ' + lineavend.vendedor.trim() + ' Proc: ' + lineavend.procedimiento.trim();
                  }
                  this.totalpares += areg.tpares;
                  this.totalpedido += areg.total;

                  // console.log('reg adi curva', areg);
                  this.datospedido.push(areg);
                }
              });
            }
            if (itemped.t_tallas > 0) {
              itemped.tallas.forEach(itemtalla => {
                if (itemtalla.cantidad > 0) {
                  const areg = {
                    cod_linea: itemped.linea,
                    cod_color: itemped.color,
                    cod_curva: '',
                    talla: itemtalla.talla,
                    cod_refven: itemped.linea.trim() + itemped.color.trim() + '_' + itemtalla.talla.trim(),
                    cantidad: itemtalla.cantidad,
                    tpares: itemtalla.cantidad,
                    precio: lineavend.precio,
                    total: itemtalla.cantidad * lineavend.precio,
                    cod_vended: lineavend.cod_vended,
                    cod_procve: lineavend.cod_procve,
                    Agrupamiento: 'Linea: '+lineavend.cod_linea + ' Vendedor: ' + lineavend.vendedor.trim() + ' Proc: ' + lineavend.procedimiento.trim();
                  }
                  // console.log('reg adi talla', areg);
                  this.totalpares += areg.tpares;
                  this.totalpedido += areg.total;
                  this.datospedido.push(areg);
                }
              });
            }
          });
          // this.datospedido = datos;        
          // this.gridData = filterBy(this.datospedido, this.filter);
          this.loadProducts();
          this.cargo_datos = true;
          console.log(this.gridData);
          // this.curService.getClienteFB(datos.id_empresa).subscribe((datosemp:any) =>{
          //   // this.datoscliepedido = datosemp;
          //   this.cargo_datos = true;
          // });
        }
        );
      
        // this.curService.getLogsinCondiFB(this.linkFblog)
        // .subscribe((datoslog: any) => {
        //   // this.getLogIncidencia(this.pticket).subscribe((datoslog: any) => {
        //   console.log("datoslog", datoslog);
        //   // this.log = orderBy(datoslog,  [{ field: "fecha", dir: "desc"}]);
        //   this.log = orderBy(datoslog,  [{ field: "fecha", dir: "desc"}]);
        //   console.log('this.log',this.log);
        // });                           
      }
    });
  }

  public totaliza(ptipo){
    let total = 0;
    // const regrupo = this.datospedido. filter((item: any) => item.Agrupamiento === pagrupa);

    this.datospedido.forEach(itemreg => {
      if (ptipo='P')
        total += itemreg.tpares;
      else
      total += itemreg.total;
    });
    return total;

  }

  // public groupChange(groups: GroupDescriptor[]): void {
  //   this.groups = groups;
  //   this.loadProducts();
  // }

  private loadProducts(): void {
    // this.gridData = process(this.datospedido, { group: this.groups });
    this.gridData = process(this.datospedido, this.state);

    // this.gridView = process(products, { group: this.groups });
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    if (state && state.group) {
      state.group.map(group => group.aggregates = this.aggregates);
    }

    this.state = state;

    this.gridData = process(this.datospedido, this.state);
  }
  //Kendo
  // public sortChange(sort: SortDescriptor[]): void {
  //   this.sort = sort;
  //   this.gridData = orderBy(this.datospedido, this.sort);
  // }
  // public filterChange(filter: CompositeFilterDescriptor): void {
  //   this.filter = filter;
  //   this.gridData = filterBy(this.datospedido, filter);
  // }
  // public editHandler({dataItem}) {
  //   console.log('editHandler dataItem:',dataItem);
  //   this.editDataItem = dataItem;
  //   this.isNew = false;
  // }

  protected editHandler({ sender, rowIndex, dataItem }) {
    this.closeEditor(sender);

    this.formGroup = createFormGroup(dataItem);

    this.editedRowIndex = rowIndex;
    this.editDataItem = dataItem;

    sender.editRow(rowIndex, this.formGroup);


    // // define all editable fields validators and default values
    // console.log('editHandler',sender, rowIndex, dataItem,this.editDataItem);
    // // this.editDataItem = dataItem;
    // const group = new FormGroup({
    //     'cod_cargo': new FormControl(dataItem.cod_cargo),
    //     'name': new FormControl(dataItem.name, Validators.required)
    // });

    // // put the row in edit mode, with the `FormGroup` build above
    // sender.editRow(rowIndex, group);
  }

  // public addHandler() {
  //   this.editDataItem = new Cargo();
  //   this.editDataItem.cod_cargo = '';
  //   this.editDataItem.name = '';
  //   this.isNew = true;
  // }
  // public distinctPrimitive(fieldName: string): any {
  //   // console.log('distinctPrimitive this.incidentespen:',this.incidentespen,fieldName);
  // return distinct(this.datospedido, fieldName).map(item => item[fieldName]);
  // }
  protected addHandler({ sender }) {
    this.closeEditor(sender);

    this.formGroup = createFormGroup({
      'cod_cargo': '',
      'name': ''
    });

    sender.addRow(this.formGroup);
    // // define all editable fields validators and default values
    // const group = new FormGroup({
    //     'cod_cargo': new FormControl(),
    //     'name': new FormControl("", Validators.required)
    // });

    // // show the new row editor, with the `FormGroup` build above
    // sender.addRow(group);
  }
  protected cancelHandler({ sender, rowIndex }) {
    // close the editor for the given row
    this.closeEditor(sender, rowIndex);
    // sender.closeRow(rowIndex)
  }
  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }
  public async removeHandler({ dataItem }) {
    console.log('removeHandler dataItem', dataItem);
    await this.validaexistenCargo(dataItem.cod_cargo).then((resp: any) => {
      console.log('llega promesa resp:', resp)
      if (resp) {
        // this.toastr.error('Cargo: '+dataItem.cod_cargo+' Tiene registros en cargos. No eliminada!');
      } else {
        // this.curService.deleteDocFb(this.linkFb,dataItem.id_reg);
        // this.curService.regLogFb(this.linkFblog, dataItem, dataItem.id_reg,'Eliminado','Se elimino cargo: '+dataItem.cod_cargo);
        // this.showDelete();
      }
    });
  }

  showDelete() {
    // this.toastr.error('Registro Eliminado !');
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
  }

  public monitorClick(dataItem): void {
  }

  protected async saveHandler({ sender, rowIndex, formGroup, isNew }) {
    // collect the current state of the form
    // `formGroup` arguments is the same as was provided when calling `editRow`
    console.log('saveHandler', sender, rowIndex, formGroup, isNew);
    // const product: Product = formGroup.value;

    // update the data source
    if (isNew) {
      const datospedidog = {
        cod_cargo: formGroup.value.cod_cargo.toUpperCase(),
        name: formGroup.value.name,
      };
      console.log('a grabar', formGroup.value, datospedidog);
      await this.validaexistecodigo(datospedidog.cod_cargo).then((resp: any) => {
        console.log('llega promesa resp:', resp)
        if (resp) {
          // this.toastr.error('Cargo: '+datospedidog.cod_cargo+' ya se encunetra. No adicionado!');
        } else {
          // this.curService.addDocConIdFb( datospedidog.cod_cargo,this.linkFb,datospedidog);      
          // this.curService.regLogFb(this.linkFblog,datospedidog,datospedidog.cod_cargo,'Adicionado','Se adiciono Cargo: '+datospedidog.cod_cargo);  
        }
      });
    } else {
      console.log('a modificar', formGroup.value, this.editDataItem);
      this.editDataItem.name = formGroup.value.name;
      // this.curService.actDocFb(this.editDataItem.id_reg, this.linkFb, this.editDataItem);
      // this.curService.regLogFb(this.linkFblog, this.editDataItem, this.editDataItem.id_reg, 'Modificado','Se modifico Cargo: '+this.editDataItem.cod_cargo);
      console.log('editar ', this.editDataItem);
    }
    // this.editService.save(product, isNew);

    // close the editor, that is, revert the row back into view mode
    sender.closeRow(rowIndex);
  }
  public async saveHandler1(datostp: Pedido) {
    console.log('a grabar ', datostp, this.isNew, this.editDataItem);
    if (this.isNew) {
      const datospedidog = {
        cod_cargo: datostp.cod_cargo.toUpperCase(),
        name: datostp.name,
      };
      console.log('a grabar', datostp);
      await this.validaexistecodigo(datospedidog.cod_cargo).then((resp: any) => {
        console.log('llega promesa resp:', resp)
        if (resp) {
          // this.toastr.error('Tipo personal: '+datospedidog.cod_cargo+' ya se encunetra. No adicionado!');
        } else {
          // this.curService.addDocConIdFb( datospedidog.cod_cargo,this.linkFb,datospedidog);      
          // this.curService.regLogFb(this.linkFblog,datospedidog,datospedidog.cod_cargo,'Adicionado','Se adiciono Cargo: '+datospedidog.cod_cargo);  
        }
      });
    } else {
      this.editDataItem.name = datostp.name;
      // this.curService.actDocFb(this.editDataItem.id_reg, this.linkFb, this.editDataItem);
      // this.curService.regLogFb(this.linkFblog, this.editDataItem, this.editDataItem.id_reg, 'Modificado','Se modifico Cargo: '+this.editDataItem.cod_cargo);
      console.log('editar ', this.editDataItem);
    }
    this.editDataItem = undefined;
  }

  public validaexistecodigo(pcodigo) {
    return new Promise((resolve) => {
      // console.log('validaexistecodigo 1',pcodigo,this.linkFb);
      // this.curService.consultaCollectionWhereValFb(this.linkFb,'cod_cargo',pcodigo).subscribe( (data:any) =>{
      //   console.log('validaexistecodigo',data);
      //   if (data.length){
      //       console.log('exsite logn >0',data);
      //       resolve(true); 
      //   } else {
      //     console.log('no exsite logn 0');
      //     resolve(false); 
      //   }
      // }); 
    });
  }
  //Verifica en el detalle de un tipo de personal si tiene personal asignado
  public validaexistenCargo(pcodigo) {
    return new Promise((resolve) => {
      console.log('validaexistenregenpersonaldetalle 1', pcodigo);
      // this.curService.consultaCollectionWhereFb(this.linkFbPersonal,'cod_cargo',pcodigo).subscribe( (data:any) =>{
      //   console.log('validaexistenregenpersonaldetalle',data);
      //   if (data.length){
      //       console.log('exsite logn >0',data);
      //       resolve(true); 
      //   } else {
      //     console.log('no exsite logn 0');
      //     resolve(false); 
      //   }
      // }); 
    });
  }

  //Carga un cliente de Netsolin 
  cargaClienteNetsolin(cod_tercer: string, datosped: any) {
    return new Promise((resolve, reject) => {
      this.clienteActual = null;
      this.curService.getClienteNetsolin(cod_tercer, datosped).subscribe(
        (data: any) => {
          console.log(" cargaClienteNetsolin 3");
          console.log(data);
          if (data.error) {
            this.cargoclienteNetsolin = false;
            //    this.menerror_usuar="Error llamando servicio cargaClienteNetsolin en Netsolin "+data.menerror;
            this.clienteActual = null;
            resolve(false);
          } else {
            // console.log(" cargaClienteNetsolin 32");
            // console.log(data);
            // console.log(data.datos_gen[0]);
            // console.log(data.datos_gen[0].cod_tercer);
            this.cargoclienteNetsolin = true;
            // console.log('en llamar cliente por metodo directo fb ', this.clienteActual);
            // this.clienteactualA = this.fbDb.doc(`/clientes/${data.datos_gen[0].cod_tercer}`);

            this.direccionesclieact = data.direcciones;
            console.log('Direcciones traidas', this.direccionesclieact);
            this.clienteActual = data.datos_gen[0];
            this.lineaprecio = data.precxlinea;
            this.cartera = data.cartera;
            // console.log(this.clienteActual);
            resolve(true);
          }
        });
    })
  }


}