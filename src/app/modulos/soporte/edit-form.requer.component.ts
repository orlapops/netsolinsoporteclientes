import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Incidente } from './modeldatoincidente';
import { NetsolinService } from '../../services/netsolin.service';
import { NetsolinApp } from '../../shared/global';

@Component({
    selector: 'kendo-grid-editrequer-form',
    styles: [
        'input[type=text] { width: 100%; }'
      ],
      templateUrl: "./edit-form.requer.component.html",
  })

export class GridEditFormRequerComponent {
    public active = false;
    public encliente = true;
    public reqact: any;
    public editForm: FormGroup = new FormGroup({
        'nit_empre': new FormControl(NetsolinApp.oapp.nit_empresa),
        'nom_empre': new FormControl(''),        
        'nomusuarsolicita': new FormControl('', Validators.required),
        'asunto': new FormControl('', Validators.required),
        'asignadoa': new FormControl(''),
        'detalle': new FormControl('', Validators.required),
        'impacto': new FormControl(''),
        'productoprin': new FormControl('netwin', Validators.required),
        'prioridad': new FormControl('Baja', Validators.required),
        'tipo': new FormControl('Requerimiento', Validators.required),
        'evaluado': new FormControl(false),
        'iniciotrabajo': new FormControl(false),
        'interno': new FormControl(false),
        'modulo': new FormControl('', Validators.required)
    });
    @Input() public isNew = false;

    @Input() public set model(incidente: Incidente) {
        this.editForm.reset(incidente);
        this.reqact = incidente;
        console.log(this.reqact);
        this.active = incidente !== undefined;
    }

    @Output() cancel: EventEmitter<any> = new EventEmitter();
    @Output() save: EventEmitter<Incidente> = new EventEmitter();
    public listprioridades: Array<string> = [
        'Baja', 'Media', 'Alta'
    ];
    public listtipos: Array<string> = [
        'Requerimiento', 'Sol. Cambio'
    ];
  
    cargoparametrosb = false;
    productosprin: any[] = [];
    modulos: any[] = [];
    constructor(
        public service: NetsolinService,
    ){
        console.log('this.active ',this.active);
        this.cargaparametrosbasicos();
    }
    cargaparametrosbasicos(){
        this.cargoparametrosb = false;
        this.service.getModulosFB().subscribe((datos:any) =>{
          console.log('getModulosFB leidos ', datos);
          if (datos){
            this.modulos = datos;
            console.log(this.modulos);            
            this.service.getProductosFB().subscribe((datos:any) =>{
                console.log('getProductosFB leidos ', datos);
                if (datos){
                  this.cargoparametrosb = true;
                  this.productosprin = datos;
                  console.log(this.productosprin);            
                }
              });      
          }
        });      
      }
    public onSave(e): void {
        e.preventDefault();
        console.log('onsave',e, this.editForm.value);
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
    public handleChange(value) {
        const clieact =  this.service.clientes.filter(reg => reg.Nit === value);
        this.editForm.value.nom_empre = clieact[0].Empresa;
        console.log('change 1', value, this.editForm.value,this.editForm, this.editForm.controls);

      }
  
}
