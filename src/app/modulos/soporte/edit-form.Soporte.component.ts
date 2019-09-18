import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Usuarioreg } from './modeldatousuarioreg';
import { NetsolinService } from '../../services/netsolin.service';
import { MantablasLibreria } from '../../services/mantbasica.libreria';

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
        'id_empresa': new FormControl('', Validators.required),
        'Empresa': new FormControl('', Validators.required),        
        'Nombre': new FormControl('', Validators.required),
        'Email': new FormControl({value: '', disabled: true}),
        'Pedido': new FormControl(false),
        'Vista': new FormControl(false),
        'ver_basicas': new FormControl(false),
        'ver_stock': new FormControl(false),
        'Version': new FormControl(''),
        'Admin': new FormControl(false)
    });
    @Input() public isNew = false;

    @Input() public set model(usuarioreg: Usuarioreg) {
        this.editForm.reset(usuarioreg);
        this.active = usuarioreg !== undefined;
    }

    @Output() cancel: EventEmitter<any> = new EventEmitter();
    @Output() save: EventEmitter<Usuarioreg> = new EventEmitter();
    cargoparametrosb = false;
    constructor(
        public service: NetsolinService,
        public libmantab: MantablasLibreria,
        ){
        // this.cargaparametrosbasicos();
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
