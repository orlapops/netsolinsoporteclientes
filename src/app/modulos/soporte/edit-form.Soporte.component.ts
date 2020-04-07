import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Usuarioreg } from './modeldatousuarioreg';
import { NetsolinService } from '../../services/netsolin.service';
import { MantablasLibreria } from '../../services/mantbasica.libreria';
import { MantbasicaService } from '../../services/mantbasica.service';

@Component({
    selector: 'kendo-grid-edit-form',
    styles: [
        'input[type=text] { width: 100%; }'
      ],
      templateUrl: "./edit-form.Soporte.component.html",
  })
export class GridEditFormComponent   implements OnInit {
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
        'Version': new FormControl('', Validators.required),
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
    labelcliente: string = "";
    cargocliente = false;
    consultacliente = false;
    enerror = false;
    message = '';
    codtercerant = '';
    cargando = true;

    constructor(
        private mantbasicaService: MantbasicaService,
        public service: NetsolinService,
        public libmantab: MantablasLibreria,
        ){
        // this.cargaparametrosbasicos();
    }
    ngOnInit(){
        console.log(' implements OnInit');
        this.labelcliente ='';
        console.log('editForm', this.editForm);      
        this.onChanges();
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log('ngOnChanges', changes, this.editForm, this.labelcliente);
        //verificar el cliente en Netsolin
            //cargar cliente
            this.cargocliente = false;
            this.labelcliente = '';
            this.mantbasicaService.getregTabla(this.editForm.value.id_empresa,"TERCEROS","0","cod_tercer","","","nombre")
              .subscribe(regTabla => {
                console.log('regTabla',regTabla);                
                if (typeof regTabla != "undefined") {
                  this.labelcliente = regTabla.nombre;
                  this.libmantab.asignaValorcampoform(this.editForm,'id_empresa',regTabla.cod_tercer);
                  this.libmantab.asignaValorcampoform(this.editForm,'Empresa',regTabla.nombre);
                  this.codtercerant = regTabla.cod_tercer;
                  //   this.regCliente = regTabla;
                } else {
                    this.labelcliente = '';
                    this.libmantab.asignaValorcampoform(this.editForm,'id_empresa','');
                    this.libmantab.asignaValorcampoform(this.editForm,'Empresa','');
                    this.codtercerant = '';
                }
                this.cargocliente = true;
            });
      }
  //Si cambia el codigo del cliente llenar el campo estado a Nuevo
  onChanges(): void {
      console.log('onChanges');      
    this.editForm.get("id_empresa").valueChanges.subscribe(val => {
        console.log('onChanges id_empresa val:',val);      
        var lcontrol: any;
      lcontrol = this.editForm.get("id_empresa");
      console.log('onChanges id_empresa lcontrol.value:',lcontrol.value);      
      if (lcontrol.value) {
        console.log("set validar id_empresa  "+lcontrol.value);
        if (this.codtercerant != lcontrol.value){
            this.validaCliente(lcontrol.value);
        }
      } else {
        // lcontrol.setValue("0");
      }
    });
  }        
  
  validaCliente(valor) {
    //ptipo id: buscar id_cuentacrm solo al iniciar de resto trabaja con cod cod_tercer
    //se valida por codigo de tercero y se guarda codigo y id
    // var lvalor: any;
    // var lcuentaant: string;
    // var lcambiadatoscue = false;
    var lcampobusca: string;
    const lvalor = valor;
    this.enerror=false;
    this.message="";
    //guardar tercero antes cambio para saber si cambio y cambia datos relacionados
    // lcuentaant = lcontrolcampo.value;
    //se toma tercero anterior valido
    // lcuentaant = this.codtercerant;
    // console.log("validacuenta 3");
    lcampobusca = "cod_tercer";
    // if (lvalor != lcuentaant || this.cargando) {
    //   // console.log("validacuenta Cambiar datos");
    //   lcambiadatoscue = true;
    // }
    //traer el tercero
    this.cargocliente = false;
    this.labelcliente = '';
    // console.log("validacuenta ant getregtabla:" + lvalor);
    // if (lvalor) {
      this.mantbasicaService
        .getregTabla(lvalor, "TERCEROS", "0", lcampobusca, "", "", "nombre")
        .subscribe(regTabla => {
            console.log('regTabla',regTabla);                
            if (typeof regTabla != "undefined") {
                if (regTabla.isCallbackError){
                    this.labelcliente = regTabla.messages[0].menerror;
                    this.libmantab.asignaValorcampoform(this.editForm,'Empresa','');
                    this.codtercerant = lvalor;
                    this.enerror = true;
                    this.cargocliente = true;
                } else {
                    this.labelcliente = regTabla.nombre;
                    this.libmantab.asignaValorcampoform(this.editForm,'id_empresa',regTabla.cod_tercer);
                    this.libmantab.asignaValorcampoform(this.editForm,'Empresa',regTabla.nombre);
                    this.codtercerant = regTabla.cod_tercer;
                    this.cargocliente = true;
                }
            } else {
                this.enerror = true;
                // this.labelcliente = '';
                this.libmantab.asignaValorcampoform(this.editForm,'id_empresa',this.codtercerant);
                // this.libmantab.asignaValorcampoform(this.editForm,'Empresa','');
            }
        });
    // } else {
    //     this.labelcliente = '';
    //     this.libmantab.asignaValorcampoform(this.editForm,'id_empresa','');
    //     this.libmantab.asignaValorcampoform(this.editForm,'Empresa','');
    // }
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
        console.log('closeForm editForm', this.editForm);      
        this.active = false;
        this.cancel.emit();
    }
    public handleChange(value) {
        console.log('handleChange editForm', this.editForm);      
        const clieact =  this.service.clientes.filter(reg => reg.Nit === value);
        this.editForm.value.nom_empre = clieact[0].Empresa;
        console.log('change 1', value, this.editForm.value,this.editForm, this.editForm.controls);

      }

      openconsulta() {
        console.log('openconsulta editForm', this.editForm);      
          this.consultacliente = true;
      }
      public closeconsulta() {
        console.log('closeconsulta editForm', this.editForm);      
          this.consultacliente = false;
        this.titulobreadcrumbs();
      }

      public titulobreadcrumbs() {
        //   this.vglobal.titulopag = "Aqui titulo...";
        }
}
