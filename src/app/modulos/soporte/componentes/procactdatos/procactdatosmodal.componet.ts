// import { EventEmitter } from 'NodeJS';
import { Text } from '@angular/compiler/src/i18n/i18n_ast';
import { error } from 'util';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NetsolinService } from '../../../../services/netsolin.service';
import { NetsolinApp } from '../../../../shared/global';

@Component({
    selector: 'procactdatos',
    templateUrl: './procactdatosmodal.component.html',

})
export class Netsprocactdatos implements OnInit {    
    @Input() ptitulo: string;
    @Output() evenclose = new EventEmitter();
    enerror = false;
    message = "";
    cargoConfig = false;
    cargando = true;
    varparcaptura = "VPAR";
    enlistaerror = false;
    listaerrores: any[] = [];
    filtrovendedor: string;
    mostrarlistavendedor = false;
    filtrocliepoten: string;
    mostrarlistacliepoten = false;
    filtrocontacto: string;
    mostrarlistacontactos = false;
    busqueda = "";

    constructor(
        private service: NetsolinService
    ) {
    }

    ngOnInit() {
        // console.log('ngoninit netsadi modial');
        // console.log('titulo: '+this.ptitulo);
        // console.log('pvaparam: '+this.pvaparam);
        // console.log('pobjeto: '+this.pobjeto);
        this.cargando = false;
    }

    close() {
        // console.log('close vent cliente potencial');
        this.evenclose.emit(event);
    }
    eliminar_bdfirebase(){
        // this.service.deleteCatalogos().then((resp) =>{
          this.service.deleteSubtipos().then((respst) =>{
            this.service.deleteLineas().then((reslin) =>{
              this.service.deleteColores().then((reslin) =>{
                this.service.deleteCurvasLinea().then((reslin) =>{
                  this.service.deleteCurvas().then((reslin) =>{
                    this.service.deleteReferencias().then((reslin) =>{
                      //  this.actualizar_bdfirebase();
                        this.service.linsegproceso = 'Proceso Terminado';
                    });
                    });
                  });
                });
              });
            });
        // });
      }

    actualizar_bdfirebase(){
        this.service.subir_catalogosafb().then((resp) =>{
          this.service.subir_subtiposafb().then((respst) =>{
            this.service.subir_lineasafb().then((reslin) =>{
              this.service.subir_coloresafb().then((reslin) =>{
                this.service.subir_curvasLineaafb().then((reslin) =>{
                  this.service.subir_curvasafb().then((reslin) =>{
                        this.service.linsegproceso = 'Proceso Terminado';
                    });
                  });
                });
              });
            });
        });
      }

      actualizar_referencias(){
                    this.service.subir_referenciasafb().then((reslin) =>{
                        this.service.linsegproceso = 'Proceso Terminado';
                    });
      }

      actualizar_imagenlineasfirebase(){
            // this.service.traer_lineas_aactualizarfb().then((resp) =>{
            //    console.log('resp traerim¿glineasactualiar',resp);
            //     this.service.linsegproceso = 'Proceso Terminado';
            // });

        this.service.actualizar_linkimagenfb_lineas().then((resp) =>{
            this.service.actualizar_linkimagenfb_lineacolor().then((resp) =>{
                this.service.linsegproceso = 'Proceso Terminado';
            });
      });
    }
    
}

