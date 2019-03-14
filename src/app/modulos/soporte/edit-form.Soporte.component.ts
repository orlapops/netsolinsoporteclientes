import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Incidente } from './modeldatoincidente';
import { NetsolinService } from '../../services/netsolin.service';

@Component({
    selector: 'kendo-grid-edit-form',
    styles: [
        'input[type=text] { width: 100%; }'
      ],
      templateUrl: "./edit-form.Soporte.component.html",
  })

export class GridEditFormComponent {
    public active = false;
    public editForm: FormGroup = new FormGroup({
        'asunto': new FormControl('', Validators.required),
        'detalle': new FormControl('', Validators.required),
        'productoprin': new FormControl('netwin', Validators.required),
        'prioridad': new FormControl('Baja', Validators.required),
        'nivelcriticidad': new FormControl('05', Validators.required)
    });
    
    @Input() public isNew = false;

    @Input() public set model(incidente: Incidente) {
        this.editForm.reset(incidente);

        this.active = incidente !== undefined;
    }

    @Output() cancel: EventEmitter<any> = new EventEmitter();
    @Output() save: EventEmitter<Incidente> = new EventEmitter();
    public listprioridades: Array<string> = [
        'Baja', 'Media', 'Alta'
    ];
  
    cargoparametrosb = false;
    nivelescriticidad: any[] = [];
    productosprin: any[] = [];
    constructor(
        public service: NetsolinService,
    ){
        this.cargaparametrosbasicos();
    }
    cargaparametrosbasicos(){
        this.cargoparametrosb = false;
        this.service.getNivelescriticidadFB().subscribe((datos:any) =>{
          console.log('getNivelescriticidadFB leidos ', datos);
          if (datos){
            this.nivelescriticidad = datos;
            console.log(this.nivelescriticidad);            
            this.service.getProductosFB().subscribe((datos:any) =>{
                console.log('getProductosFB leidos ', datos);
                if (datos){
                  this.cargoparametrosb = true;
                  this.productosprin = datos;
                  console.log(this.nivelescriticidad);            
                }
              });
      
          }
        });
      
      }
    public onSave(e): void {
        e.preventDefault();
        this.save.emit(this.editForm.value);
        this.active = false;
    }

    public onCancel(e): void {
        e.preventDefault();
        this.closeForm();
    }

    private closeForm(): void {
        this.active = false;
        this.cancel.emit();
    }
}
