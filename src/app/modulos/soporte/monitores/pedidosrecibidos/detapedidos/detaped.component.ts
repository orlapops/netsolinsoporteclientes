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
// interface Item {
//   text: string ,
//   value: number;
// }

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
  // cartera: any;
  totalpares = 0;
  totalpedido = 0;
  public notasped ='';
  public dirdespa: any;
  public listDirec: Array<{ text: string, value: number }> = [];


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
          // console.log('cliente cartera', this.cartera);
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
                    cod_linea: itemped.linea.trim() + ' | ' + lineavend.nom_linea.trim(),
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
                    cod_linea: itemped.linea.trim() + ' | ' + lineavend.nom_linea.trim(),
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

  public GrabarPedidos() {
    console.log('Grabando pedido notasped, dirdespa, gridData',this.notasped, this.dirdespa, this.gridData);
    
    return new Promise((resolve) => {
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
            this.direccionesclieact.forEach(itemreg =>{
                const litem= { text: itemreg.direccion, value: itemreg.id_direc };
                this.listDirec.push(litem);                
            });
            this.dirdespa = this.listDirec[0];
            console.log('listDirec', this.listDirec);
            this.clienteActual = data.datos_gen[0];
            this.lineaprecio = data.precxlinea;
            // this.cartera = data.cartera;
            // console.log(this.clienteActual);
            resolve(true);
          }
        });
    })
  }
  handleDirecChange(value) {
  }


}



