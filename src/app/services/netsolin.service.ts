import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
// import { Http, Response, Headers, RequestOptions } from '@angular/http';
// import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { catchError, map, tap } from 'rxjs/operators';
import { NetsolinApp } from '../shared/global';
import { environment } from '../../environments/environment';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';

import { pipe } from '@angular/core/src/render3/pipe';
// import { Observable } from 'rxjs';
import { Usuarioreg } from '../modulos/soporte/modeldatousuarioreg';

@Injectable()
export class NetsolinService {
	public cargo_ruta = false;
	public error_cargarruta = false;
	public men_errorcargarruta = "";
	public cargoidperiodo = false;
	public id_periodo: string;
	public id_ruta: number = 0;
	public oappNetsolin: any;
	public empreFb: any;
	public usuarFb: any;
	public cargo_empre = false;
	public cargo_usuar = false;

	public cargoparametrosb = false;
	public nivelescriticidad: any[] = [];
	public productosprin: any[] = [];
	public modulos: any[] = [];
	public consultores: any[] = [];
	public clientes: any[] = [];
	public linsegproceso = '';
	public lineasaact: any[] = [];

	constructor(private http: HttpClient,
		private afStorage: AngularFireStorage,
		private fbDb: AngularFirestore) {
	}

	//Consulta en Netsolin el usuario con la fecha para saber que ruta y periodo le corresponde
	cargaPeriodoUsuar(pcod_usuar) {
		return new Promise((resolve) => {
			if (this.cargoidperiodo) {
				resolve(true);
			}
			NetsolinApp.objenvrest.filtro = pcod_usuar;
			let url = NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=IDRUTAPERAPP";
			this.http.post(url, NetsolinApp.objenvrest)
				.subscribe((data: any) => {
					console.log('cargo periodo en netsolin', data);
					if (data.error) {
						console.error(" cargaPeriodoUsuar ", data.error);
						//   this._parempre.reg_log('Error en cargaPeriodoUsuar por netsolin ', 'data.error');
						this.cargoidperiodo = false;
						this.cargo_ruta = false;
						this.error_cargarruta = true;
						this.men_errorcargarruta = data.men_error;
						resolve(false);
					} else {
						// this._parempre.reg_log('coer', 'cargaPeriodoUsuar por netsolin ');
						this.cargoidperiodo = true;
						this.id_ruta = data.datos_ruta[0].id_ruta;
						this.id_periodo = data.datos_periodo[0].id_per;
						resolve(true);
					}
				});
		});
	}



	getNetsolinArchIni() {
	}
	getNetsolinhtmlbase(): Observable<any> {
		// return this.http.get(this.baseUrl+'todo2s.csvc').map(res => res.json());
		console.log('a netsolinbase traer');
		console.log('netsolinbase urlNetsolin NetsolinApp: ' + NetsolinApp.urlNetsolin);
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "netsolinhtmlgenbase.csvc?VRprod=ENPROD";
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolinhtmlgenbase.csvc?VRprod=NOPROD";
		}

		// return this.http.get(NetsolinApp.urlNetsolin + "netsolinhtmlgenbase.csvc")
		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					return resul;
				})
			);

	}

	private handleError(error: HttpErrorResponse) {
		// console.error('Error en servidor:', error);
		if (error.error instanceof Error) {
			let errMessage = error.error.message;
			return Observable.throw(errMessage);
			// Use the following instead if using lite-server
			//return Observable.throw(err.text() || 'backend server error');
		}
		return Observable.throw(error || 'Node.js server error');
	}

	getNetsolinslide(): Observable<any> {
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=MTB";
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=MTB";
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					// console.log('map get');
					//  console.log(resul);
					return resul;
				}),
				catchError(this.handleError)
			);
	}


	getNetsolinMonitores(): Observable<any> {
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=CRMI";
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=CRMI";
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					// console.log('map getNetsolinMonitores');
					//  console.log(resul);
					return resul;
				})
			);
	}

	getNetsolinMantbas(ptipo, pmodulo): Observable<any> {
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=" + ptipo + "&VRModulo=" + pmodulo;
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=" + ptipo + "&VRModulo=" + pmodulo;
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					// console.log('map getNetsolinMantbas');
					//  console.log(resul);
					return resul;
				})
			);
	}

	//Traer un cliente de Netsolin con datos basicos y direcciones
	getClienteNetsolin(cod_tercer: string, datosped: any): Observable<any> {
		console.log('gerCliente url:',NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=RESTDATCLIEAPP");		
		NetsolinApp.objenvrest.filtro = cod_tercer;
		let paramgrab = {
			items_pedido: datosped,
			usuario: NetsolinApp.oapp.cuserid
		  };
		NetsolinApp.objenvrest.parametros = paramgrab;
		console.log('NetsolinApp.objenvrest.parametros:',NetsolinApp.objenvrest.parametros);		 
		var url: string = "";
		if (environment.production) {
			url =NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=RESTDATCLIEAPP";
		} else {
			url = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=RESTDATCLIEAPP";
		}
		console.log('NetsolinApp.objenvrest:',NetsolinApp.objenvrest);			   
		return this.http.post( url, NetsolinApp.objenvrest)
			.pipe(
				map(resul => {
					console.log('map getClienteNetsolin');
					 console.log(resul);
					return resul;
				})
			);
	}
	
	getNetsolinAlertas(): Observable<any> {
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=ALER";
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=ALER";
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					console.log('map getNetsolinAlertas');
					console.log(resul);
					return resul;
				})
			);
	}
	getNetsolinUsuar(): Observable<any> {
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=USUAR";
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=USUAR";
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					// console.log('map getNetsolinAlertas');
					//  console.log(resul);
					return resul;
				})
			);
	}

	getNetsolinRecordatorio(): Observable<any> {
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=SEG";
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=SEG";
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					return resul;
				})
			);
	}

	getNetsolinProcesos(): Observable<any> {
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=PROC";
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=PROC";
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					// console.log('map getNetsolinProcesos');
					//  console.log(resul);
					return resul;
				})
			);
	}
	getNetsolinSolicitudes(): Observable<any> {
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=SOLI";
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=SOLI";
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					// console.log('map getNetsolinSolicitudes');
					//  console.log(resul);
					return resul;
				})
			);
	}


	getNetsolinMessages(): Observable<any> {
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=MENS";
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=MENS";
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					// console.log('map getNetsolinMessages');
					//  console.log(resul);
					return resul;
				})
			);
	}
	getNetsolinSolic(): Observable<any> {
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=SOLI";
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolinmenu.csvc?VRTipo=SOLI";
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					return resul;
				})
			);
	}
	/**************************************************/
	getNetsolinDictabla(ptabla, paplica, pobjeto): Observable<any> {
		NetsolinApp.objenvrestddtabla.usuario = NetsolinApp.oapp.cuserid;
		NetsolinApp.objenvrestddtabla.psw = NetsolinApp.oapp.cuserpsw;
		NetsolinApp.objenvrestddtabla.prefijobd = NetsolinApp.oapp.prefijo_sqlbd;
		NetsolinApp.objenvrestddtabla.tabla = ptabla;
		NetsolinApp.objenvrestddtabla.aplica = paplica;
		NetsolinApp.objenvrestddtabla.objeto = pobjeto;
		// console.log('getNetsolinDictabla ant enviar ');	
		// console.log(NetsolinApp.objenvrestddtabla);
		return this.http.post(NetsolinApp.urlNetsolin + "Ejeservi_rest.csvc?VRCod_obj=RESTCONDDCAMTAB", NetsolinApp.objenvrestddtabla)
			.pipe(
				map(resul => {
					// console.log('getNetsolinDictabla resaulta');
					// console.log(resul);
					return resul;
				})
			);
	}
	//seguridad objeto en netsolin 
	getNetsolinSegObj(pobjeto): Observable<any> {
		NetsolinApp.objenvrestddtabla.usuario = NetsolinApp.oapp.cuserid;
		NetsolinApp.objenvrestddtabla.psw = NetsolinApp.oapp.cuserpsw;
		NetsolinApp.objenvrestddtabla.prefijobd = NetsolinApp.oapp.prefijo_sqlbd;
		NetsolinApp.objenvrestddtabla.tabla = "GENERAL";
		NetsolinApp.objenvrestddtabla.aplica = 0;
		NetsolinApp.objenvrestddtabla.objeto = pobjeto;
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "Ejeservi_rest.csvc?VRCod_obj=RESTCONSEGOBJ", NetsolinApp.objenvrestddtabla;
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "Ejeservi_rest.csvc?VRCod_obj=RESTCONSEGOBJ", NetsolinApp.objenvrestddtabla;
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					// console.log('map getNetsolinSegObj');
					//  console.log(resul);
					//  console.log(resul[0]);
					return resul[0];
					// return resul;
				})
			);
	}
	//Lee objeto para mant tabla basica
	getNetsolinObjmantbasica(pobjeto): Observable<any> {
		NetsolinApp.objenvrestddtabla.usuario = NetsolinApp.oapp.cuserid;
		NetsolinApp.objenvrestddtabla.psw = NetsolinApp.oapp.cuserpsw;
		NetsolinApp.objenvrestddtabla.prefijobd = NetsolinApp.oapp.prefijo_sqlbd;
		NetsolinApp.objenvrestddtabla.tabla = "GENERAL";
		NetsolinApp.objenvrestddtabla.aplica = 0;
		NetsolinApp.objenvrestddtabla.objeto = pobjeto;
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "Ejeservi_rest.csvc?VRCod_obj=RESTOBJMANTBASICA", NetsolinApp.objenvrestddtabla;
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "Ejeservi_rest.csvc?VRCod_obj=RESTOBJMANTBASICA", NetsolinApp.objenvrestddtabla;
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					// console.log('map getNetsolinObjmantbasica');
					//  console.log(resul);
					return resul;
					//  return resul[0]; 
					// return resul;
				})
			);
	}



	//Verifica si variable VPAR... que se usa como parametros en localsotrage este creada si no la crea
	//ejemplo para llamado en monitores sin que tengan que ingresar primero a la tabla basica
	verificaVpar(pobjeto, pvarParam): Observable<any> {
		NetsolinApp.objenvrestddtabla.usuario = NetsolinApp.oapp.cuserid;
		NetsolinApp.objenvrestddtabla.psw = NetsolinApp.oapp.cuserpsw;
		NetsolinApp.objenvrestddtabla.prefijobd = NetsolinApp.oapp.prefijo_sqlbd;
		NetsolinApp.objenvrestddtabla.tabla = "GENERAL";
		NetsolinApp.objenvrestddtabla.aplica = 0;
		NetsolinApp.objenvrestddtabla.objeto = pobjeto;
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "Ejeservi_rest.csvc?VRCod_obj=RESTOBJMANTBASICA", NetsolinApp.objenvrestddtabla;
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+"Ejeservi_rest.csvc?VRCod_obj=RESTOBJMANTBASICA", NetsolinApp.objenvrestddtabla;
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(result => {
					// console.log('map getNetsolinObjmantbasica');
					//  console.log(resul);
					var result0 = result[0];
					console.log(result0);
					// if (typeof (result.isCallbackError) != "undefined") {
					// 	var  orespuesta: any = {respuesta: "Error"};
					// 	return orespuesta;
					// }

					NetsolinApp.objpartablabas.aplica = parseInt(result0.aplica);
					NetsolinApp.objpartablabas.tabla = result0.tabla;
					NetsolinApp.objpartablabas.campollave = result0.campollave;
					NetsolinApp.objpartablabas.clase_val = result0.clase_val;
					NetsolinApp.objpartablabas.clase_nbs = result0.clase_nbs;
					NetsolinApp.objpartablabas.camponombre = result0.camponombre;
					NetsolinApp.objpartablabas.titulo = result0.title;
					NetsolinApp.objpartablabas.subtitulo = "";
					NetsolinApp.objpartablabas.objeto = pobjeto;
					NetsolinApp.objpartablabas.rutamant = "mantbasica/" + pobjeto;
					NetsolinApp.objpartablabas.prefopermant = result0.prefomant;
					if (result0.campos_lista.length > 2) {
						let var3 = JSON.parse(result0.campos_lista);
						if (typeof (var3) == 'object') {
							NetsolinApp.objpartablabas.campos_lista = var3;
						}
					}
					let var1 = JSON.stringify(NetsolinApp.objpartablabas);
					localStorage.setItem("VPAR" + result0.tabla, var1);

					return result;
					//  return resul[0]; 
					// return resul;
				})
			);
	}

	verificaVparMal(pobjeto, pvarParam): Observable<any> {
		let lvart: any;
		lvart = localStorage.getItem(pvarParam);
		if (lvart) {
			// console.log('Existe');
			var orespuesta: any = { respuesta: "Existe" };
			return orespuesta;
		}
		NetsolinApp.objenvrestddtabla.usuario = NetsolinApp.oapp.cuserid;
		NetsolinApp.objenvrestddtabla.psw = NetsolinApp.oapp.cuserpsw;
		NetsolinApp.objenvrestddtabla.prefijobd = NetsolinApp.oapp.prefijo_sqlbd;
		NetsolinApp.objenvrestddtabla.tabla = "GENERAL";
		NetsolinApp.objenvrestddtabla.aplica = 0;
		NetsolinApp.objenvrestddtabla.objeto = pobjeto;
		this.getNetsolinObjmantbasica(pobjeto)
			.subscribe(result => {
				var result0 = result[0];
				console.log(result0);
				if (typeof (result.isCallbackError) != "undefined") {
					var orespuesta: any = { respuesta: "Error" };
					return orespuesta;
				}
				NetsolinApp.objpartablabas.aplica = parseInt(result0.aplica);
				NetsolinApp.objpartablabas.tabla = result0.tabla;
				NetsolinApp.objpartablabas.campollave = result0.campollave;
				NetsolinApp.objpartablabas.clase_val = result0.clase_val;
				NetsolinApp.objpartablabas.clase_nbs = result0.clase_nbs;
				NetsolinApp.objpartablabas.camponombre = result0.camponombre;
				NetsolinApp.objpartablabas.titulo = result0.title;
				NetsolinApp.objpartablabas.subtitulo = "";
				NetsolinApp.objpartablabas.objeto = pobjeto;
				NetsolinApp.objpartablabas.rutamant = "mantbasica/" + pobjeto;
				NetsolinApp.objpartablabas.prefopermant = result0.prefomant;
				if (result0.campos_lista.length > 2) {
					let var3 = JSON.parse(result0.campos_lista);
					if (typeof (var3) == 'object') {
						NetsolinApp.objpartablabas.campos_lista = var3;
					}
				}
				let var1 = JSON.stringify(NetsolinApp.objpartablabas);
				localStorage.setItem("VPAR" + result0.tabla, var1);
				var orespuesta: any = { respuesta: "Creado" };
				return orespuesta;
			});
	}

	//llama busqueda por objeto envia objeto objenvrest
	getNetsolinObjbusqueda(pobjeto, pcadbus, pfiltroadi): Observable<any> {
		// console.log('getNetsolinObjbusqueda pobjeto:'+pobjeto+' pcadbus:'+pcadbus+' pfiltroadi: '+pfiltroadi);
		NetsolinApp.objenvrestsolcomobog.usuario = NetsolinApp.oapp.cuserid;
		NetsolinApp.objenvrestsolcomobog.psw = NetsolinApp.oapp.cuserpsw;
		NetsolinApp.objenvrestsolcomobog.prefijobd = NetsolinApp.oapp.prefijo_sqlbd;
		NetsolinApp.objenvrestsolcomobog.tabla = "GENERAL";
		NetsolinApp.objenvrestsolcomobog.aplica = 0;
		NetsolinApp.objenvrestsolcomobog.filtro = pcadbus;
		NetsolinApp.objenvrestsolcomobog.filtroadi = pfiltroadi;
		var paramSolicitud: string = "";

		if (environment.production) {
			paramSolicitud = NetsolinApp.urlNetsolin + "Ejeservi_rest.csvc?VRCod_obj=" + pobjeto, NetsolinApp.objenvrestsolcomobog;
		} else {
			paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+"Ejeservi_rest.csvc?VRCod_obj=" + pobjeto, NetsolinApp.objenvrestsolcomobog;
		}

		return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					// console.log('map getNetsolinObjbusqueda');
					//  console.log(resul);
					var result0 = resul[0];
					//  console.log(result0);
					//si hay error retorna lista de errores sino el registro solicitado
					if (typeof (result0) == "undefined") {
						return resul;
					} else {
						return resul;
					}
				})
			);
	}
	//Ejecuta servicio rest en Netsolin con un objeto pparam que lleva parametros
	//retorna errores o cursor con resultado
	//Ejemplo de uso para retornar precio d eventa objeto: RESTCONLISTPREC
	///con parametro de llamado: "parametros":{"lista": "V01","cod_refven": "100    ","cod_tercer": "",
	///            "proc_ven": "016 ", "cantidad":10 }
	getNetsolinObjconParametros(pobjeto, pparam: any): Observable<any> {
		// console.log('getNetsolinObjconParametros pobjeto:'+pobjeto);
		NetsolinApp.objenvrest.usuario = NetsolinApp.oapp.cuserid;
		NetsolinApp.objenvrest.psw = NetsolinApp.oapp.cuserpsw;
		NetsolinApp.objenvrest.prefijobd = NetsolinApp.oapp.prefijo_sqlbd;
		NetsolinApp.objenvrest.filtro = "";
		NetsolinApp.objenvrest.parametros = pparam;
		if (NetsolinApp.objenvrest.tiporet != "OBJ")
			NetsolinApp.objenvrest.tiporet = "CON";
			var paramSolicitud: string = "";

			if (environment.production) {
				paramSolicitud = NetsolinApp.urlNetsolin + "Ejeservi_rest.csvc?VRCod_obj=" + pobjeto, NetsolinApp.objenvrest;
			} else {
				paramSolicitud = 'https://cors-anywhere.herokuapp.com/'+"Ejeservi_rest.csvc?VRCod_obj=" + pobjeto, NetsolinApp.objenvrest;
			}
	
			return this.http.get(paramSolicitud)
			.pipe(
				map(resul => {
					// console.log('map getNetsolinObjconParametros');
					//  console.log(resul);
					var result0 = resul[0];
					//  console.log(result0);
					//si hay error retorna lista de errores sino el registro solicitado
					if (typeof (result0) == "undefined") {
						return resul;
					} else {
						return resul;
					}
				})
			);
	}
	//cadena formato AAAAMMDD A FECHA TIEMPO 0
	cadafecha(cfecha) {
		let ano = cfecha.slice(0, 4);
		let mes = cfecha.slice(4, 6);
		let dia = cfecha.slice(6, 8);

		let dfecha = new Date(ano, mes, dia, 0, 0, 0);
		return dfecha;
	}

	//recibe hora militar como numero y retorna cadena formato HH:MM AM/PM
	cadhoramil(nhora) {
		let ch = nhora.toString();
		let chh = '';
		let cmm = '';
		let campm = '';
		let nnh = 0;
		if (nhora < 1000) {
			chh = ch.slice(0, 1);
			cmm = ch.slice(1, 3);
		} else {
			chh = ch.slice(0, 2);
			cmm = ch.slice(2, 4);
		}
		if (nhora < 1200) {
			campm = 'AM';
		} else {
			nnh = parseInt(chh) - 12;
			chh = nnh.toString();
			campm = 'PM';
		}

		return chh + ':' + cmm + ' ' + campm;
	}
	//fecha a string para monitor en netsolin dd/mm/aa
	fechacad(fechaf) {
		console.log(fechaf);
		// console.log(typeof(fechaf);	
		// console.log(fechaf.toDate());	
		// const fecha= fechaf.toDate();
		// console.log(fecha);
		// const dia = fecha.getDate();
		// const mes = fecha.getMonth() + 1;
		// const ano = fecha.getFullYear();

		const cfecha = fechaf.substring(8, 10) + '/' + fechaf.substring(5, 7) + '/' + fechaf.substring(0, 4);
		console.log(cfecha);
		return cfecha;
	}
	//verifica empresa actual en firebase si no existe la crea
	public VeriExisteEmpresaActualFb(id) {
		return new Promise((resolve) => {
			console.log(id);
			const ref: AngularFirestoreDocument<any> = this.fbDb.collection(`empresas`).doc(id);
			ref.get().subscribe(snap => {
				if (snap.exists) {
					console.log('Existe', id);
					this.fbDb.collection(`/empresas`)
						.doc(id).update({ datosoapp: this.oappNetsolin });
					// this.empreFb = ref.valueChanges();
					// this.cargo_empre = true;
					// console.log(this.empreFb);
					resolve(true);
				} else {
					const objempre = {
						nit: NetsolinApp.oapp.nit_empresa,
						nombre: NetsolinApp.oapp.nom_empresa,
						datosoapp: this.oappNetsolin
					}
					this.fbDb.collection(`/empresas`)
						.doc(id).set(objempre);
					console.log('no existe crear', id);
					resolve(true);
				}
			});
		});
	}
	//Se suscribe a empresa para traerla de FB
	public getEmpreFB(Id: string) {
		console.log('en getEmpreFB');
		return this.fbDb
			.collection(`/empresas`)
			.doc(Id).valueChanges();
	}
	//Verifica usuario actual en firebase si no existe la crea
	public VeriUsuarioaActualFb(idusuar) {
		return new Promise((resolve) => {
			console.log(idusuar);
			const ref: AngularFirestoreDocument<any> = this.fbDb.collection(`clientes/${NetsolinApp.oapp.nit_empresa}/usuarios`).doc(idusuar);
			ref.get().subscribe(snap => {
				if (snap.exists) {
					console.log('Existe usuario', idusuar);
					// this.fbDb.collection(`/clientes`)
					// .doc(id).update({datosoapp: this.oappNetsolin});
					resolve(true);
				} else {
					console.log('no existe usuario crear', idusuar, NetsolinApp, this.oappNetsolin);
					const objempre = {
						id: NetsolinApp.oapp.cuserid,
						email: this.oappNetsolin.email_usuar,
						nombre: this.oappNetsolin.nomusuar,
						superusuar: this.oappNetsolin.superusuar,
						reportanetsolin: false
					}
					console.log('usuario a crea', idusuar, objempre);
					this.fbDb.collection(`/clientes/${NetsolinApp.oapp.nit_empresa}/usuarios`)
						.doc(idusuar).set(objempre);
					// this.usuarFb = ref.valueChanges();
					// this.cargo_usuar = true;
					// console.log(this.usuarFb);
					console.log('no existe crear', idusuar);
					resolve(true);
				}
			});
		});
	}
	//Verifica usuario actual existe como consultor
	public VeriConsultorActualFb(idusuar) {
		return new Promise((resolve) => {
			console.log(idusuar);
			const ref: AngularFirestoreDocument<any> = this.fbDb.collection(`consultores`).doc(idusuar);
			ref.get().subscribe(snap => {
				if (snap.exists) {
					console.log('Existe usuario', idusuar);
					// this.fbDb.collection(`/clientes`)
					// .doc(id).update({datosoapp: this.oappNetsolin});
					resolve(true);
				} else {
					console.log('no existe consultor crear', idusuar, NetsolinApp, this.oappNetsolin);
					const objempre = {
						id: NetsolinApp.oapp.cuserid,
						email: this.oappNetsolin.email_usuar,
						nombre: this.oappNetsolin.nomusuar,
						superusuar: this.oappNetsolin.superusuar
					}
					console.log('usuario a crea', idusuar, objempre);
					this.fbDb.collection(`/consultores`)
						.doc(idusuar).set(objempre);
					console.log('no existe crear', idusuar);
					resolve(true);
				}
			});
		});

	}
	//Se suscribe a empresa para traerla de FB
	public getUsuarFB(Id: string) {
		console.log('en getUsuarFB', Id);
		return this.fbDb
			.collection(`/consultores`)
			.doc(Id).valueChanges();
	}


	//Se suscribe a consultores
	public getConsultoresFB() {
		console.log('en getConsultoresFB');
		return this.fbDb
			.collection(`/consultores`)
			.valueChanges();
	}
	//Se suscribe a clientes
	public getClientesFB() {
		console.log('en getClientesFB');
		return this.fbDb
			.collection(`/clientes`)
			.valueChanges();
	}

	//Se suscribe a empresa para traerla de FB
	public getNivelescriticidadFB() {
		console.log('en getNivelescriticidadFB');
		return this.fbDb
			.collection(`/parametros/tablas/criticidad`)
			.valueChanges();
	}
	//Se suscribe a productos principales
	public getProductosFB() {
		console.log('en getProductosFB');
		return this.fbDb
			.collection(`/parametros/tablas/prodprincipales`)
			.valueChanges();
	}
	//Se suscribe a modulos
	public getModulosFB() {
		console.log('en getModulosFB');
		return this.fbDb
			.collection(`/parametros/tablas/modulos`)
			.valueChanges();
	}
	//Se suscribe a causales clientes
	public getCausalesclientesFB() {
		console.log('en getCausalesclientesFB');
		return this.fbDb
			.collection(`/parametros/tablas/causalescliente`)
			.valueChanges();
	}
	//Se suscribe a causales netsolin
	public getCausalesnetsolinFB() {
		console.log('en getCausalesnetsolinFB');
		return this.fbDb
			.collection(`/parametros/tablas/causalesnetsolin`)
			.valueChanges();
	}




	public generanumTicket() {
		const now = new Date();
		const dia = now.getDate();
		const mes = now.getMonth() + 1;
		const ano = now.getFullYear();
		const hora = now.getHours();
		const minutos = now.getMinutes();
		const segundos = now.getSeconds();
		const numaleator = Math.round(Math.random() * (1000 - 1999) + 1000);
		const numticket = ano.toString() + mes.toString() + dia.toString() + hora.toString() + minutos.toString() + segundos.toString() + numaleator.toString();
		return numticket;
	}
	public addUsuarioregFb(idt, objusuarioreg) {
		console.log('addusuarioreg ', idt, objusuarioreg);
		// this.fbDb.collection(`/clientes/${NetsolinApp.oapp.nit_empresa}/usuarioregs`)
		this.fbDb.collection(`/usuarioregs`)
			.doc(idt).set(objusuarioreg);
	}

	public AntaddArchivoUsuarioregFb(pticket, idt, objarch) {
		console.log('addArchivoUsuarioregFb ', idt, objarch);
		this.fbDb.collection(`/usuarioregs/${pticket}/archivos`)
			.doc(idt).set(objarch);
	}
	public addArchivoUsuarioregFb(pticket, idt, nombre, nomarch, imageURL): Promise<any> {
		console.log('addArchivoUsuarioregFb', pticket, idt, nombre, nomarch, imageURL);
		const now = new Date();
		const dia = now.getDate();
		const mes = now.getMonth() + 1;
		const ano = now.getFullYear();
		const hora = now.getHours();
		const minutos = now.getMinutes();
		const segundos = now.getSeconds();
		const idimg = ano.toString() + mes.toString() + dia.toString() + hora.toString() + minutos.toString() + segundos.toString();

		const storageRef: AngularFireStorageReference = this.afStorage.ref(`/usuarioregs/${pticket}/archivos/${nomarch}/`);
		// console.log('en actualizafotosVisitafirebase idclie,iddirec: ', idclie, idvisita);
		return storageRef
			.put(imageURL)
			.then(() => {
				console.log('a grabar registro en firebase ');
				return storageRef.getDownloadURL().subscribe((linkref: any) => {
					console.log(linkref);
					const objarch = {
						id: idt,
						nombre: nombre,
						nomarch: nomarch,
						fecha: new Date(),
						usuarcrea: this.usuarFb.nombre,
						linkarch: linkref
					}
					this.fbDb.collection(`/usuarioregs/${pticket}/archivos`)
						.doc(idt).set(objarch);
					// console.log(`/personal/${this._parempre.usuario.cod_usuar}/rutas/
					// ${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${idvisita}/fotos`);
					// this.fbDb
					// // tslint:disable-next-line:max-line-length
					// .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${idvisita}/fotos`)
					// .add({link_foto: linkref});
				});
			});
	}

	public actUsuarioregFb(idt, objusuarioreg) {
		console.log('actUsuarioregFb ', idt, objusuarioreg);
		this.fbDb.collection(`/usuarios`)
			.doc(idt).update(objusuarioreg);
	}

	public deleteUsuarioregFb(idt) {
		// console.log('deleteUsuarioregFb ', idt);
		this.fbDb.collection(`/usuarioregs`)
			.doc(idt).delete();
	}

	public deleteLogUsuarioregFb(pticket, idt) {
		this.fbDb.collection(`/usuarioregs/${pticket}/log`)
			.doc(idt).delete();
	}


	public getregistrosusuarPendientesFB() {
		return this.fbDb
			.collection(`/usuarios`
				, ref => ref.where('Vista', '==', false))
			.valueChanges()
			.pipe(
				map(actions =>
					actions.map((a: any) => {
						// console.log(a);
						// a.fecha = a.fecha.toDate();
						// a.fechaevalua = a.fechaevalua.toDate();
						// a.fecharepornetsolin= a.fecharepornetsolin.toDate();
						// a.fechasolucionado = a.fechasolucionado.toDate();
						return a;

					})
				)
			);
	}
	public getregistrosusuarActivosFB() {
		// .collection(`/clientes/${NetsolinApp.oapp.nit_empresa}/usuarioregs`
		return this.fbDb
			.collection(`/usuarios`
				, ref => ref.where('Vista', '==', true))
			.valueChanges()
			.pipe(
				map(actions =>
					actions.map((a: any) => {
						// console.log(a);
						// a.fecha = a.fecha.toDate();
						// a.fechaevalua = a.fechaevalua.toDate();
						// a.fecharepornetsolin= a.fecharepornetsolin.toDate();
						// a.fechasolucionado = a.fechasolucionado.toDate();
						return a;

					})
				)
			);
	}
	public getPedRecibPendientesFB() {
		return this.fbDb
			.collection(`/pedidos`
				, ref => ref.where('verificado', '==', false))
			.valueChanges()
			.pipe(
				map(actions =>
					actions.map((a: any) => {
						const ref: AngularFirestoreDocument<any> = this.fbDb.collection(`usuarios`).doc(a.email);
						ref.get().subscribe(snap => {
							// console.log('dat empresa asociada',snap);
							if (snap.exists) {
								const datempre= snap.data();
								// console.log('Existe empresa data', snap.data());
								a.nom_empresa = datempre.Empresa; 
							} 
						});						
						console.log('retorna dato a:',a);
						return a;
						// console.log(a);
						// a.fecha = a.fecha.toDate();
						// a.fechaevalua = a.fechaevalua.toDate();
						// a.fecharepornetsolin= a.fecharepornetsolin.toDate();
						// a.fechasolucionado = a.fechasolucionado.toDate();

					})
				)
			);
	}
	public getPedidoFB(idped) {
		return this.fbDb
			.collection(`/pedidos`).doc(idped)
			.valueChanges();			
	}
	public getClienteFB(id) {
		return this.fbDb
			.collection(`/empresas`).doc(id)
			.valueChanges();			
	}

	public grabarusuarioregFb(data: any, isNew?: boolean) {
		console.log('save fb ', data, isNew);
		if (isNew) {
			this.fbDb.collection(`/usuarioregs`)
				.doc(data.ticket).set(data);
		} else {
			this.fbDb.collection(`/usuarioregs`)
				.doc(data.ticket).update(data);
		}
	}



	public regLogusuarioregFb(usuarioreg: any, accion: string, seguimiento: string) {
		const now = new Date();
		const dia = now.getDate();
		const mes = now.getMonth() + 1;
		const ano = now.getFullYear();
		const hora = now.getHours();
		const minutos = now.getMinutes();
		const segundos = now.getSeconds();
		const numaleator = Math.round(Math.random() * (1000 - 1999) + 1000);
		const idlog = ano.toString() + mes.toString() + dia.toString() + hora.toString() + minutos.toString() + segundos.toString() + numaleator.toString();

		const reglog = {
			id: idlog,
			fecha: now,
			accion: accion,
			nombrereporta: NetsolinApp.oapp.nomusuar,
			seguimiento: seguimiento
		}
		console.log('save fb ', reglog);
		this.fbDb.collection(`/usuarios/${usuarioreg.Email}/log`)
			.doc(idlog).set(reglog);
	}



	public regChatusuarioregFb(usuarioreg: any, texto: string) {
		//En libreria cliente maninterno siempre en falso ya que solo se maneja en lado de Netsolin
		const now = new Date();
		const dia = now.getDate();
		const mes = now.getMonth() + 1;
		const ano = now.getFullYear();
		const hora = now.getHours();
		const minutos = now.getMinutes();
		const segundos = now.getSeconds();
		const numaleator = Math.round(Math.random() * (1000 - 1999) + 1000);
		const idchat = ano.toString() + mes.toString() + dia.toString() + hora.toString() + minutos.toString() + segundos.toString() + numaleator.toString();

		const regchat = {
			id: idchat,
			fecha: now,
			cliente: false,
			usuario: this.usuarFb.nombre,
			texto: texto,
			leido: false
		}
		// console.log('save fb ', regchat);
		this.fbDb.collection(`/usuarioregs/${usuarioreg.ticket}/chat`)
			.doc(idchat).set(regchat);
		//registro chat por usuarioreg ultimo para alertas
		const idchatult = 'IN' + usuarioreg.nit_empre.trim() + usuarioreg.ticket;
		const regchatult = {
			tipo: 'I',
			id: idchat,
			fecha: now,
			cliente: false,
			usuario: this.usuarFb.nombre,
			texto: texto,
			ticket: usuarioreg.ticket,
			nit_empre: usuarioreg.nit_empre,
			leido: false
		}
		console.log('save chat en result fb ', regchatult);
		this.fbDb.collection(`/chat`)
			.doc(idchatult).set(regchatult);
	}
	public getChatnoleidosFB(ptipo, pticket, pnit_empre) {
		return this.fbDb
			.collection(`/chat`, ref => ref.where('nit_empre', '==', pnit_empre).where('tipo', '==', ptipo)
				.where("ticket", "==", pticket).where("cliente", "==", true))
			.snapshotChanges()
			.pipe(
				map(actions =>
					actions.map((a: any) => {
						// console.log(a);
						const data = a.payload.doc.data();
						const id = a.payload.doc.id;
						// console.log(id,data);
						return { id }
					})
				)
			);
	}
	public darleidoresumchatFb(pid) {
		console.log('a acutualizar item ', pid);
		this.fbDb.doc(`chat/${pid}`).update({ leido: true });
	}

	// public darleidoresumchat(ptipo,pticket,pnit_empre){
	// 	const idchatult = ptipo+pnit_empre.trim()+pticket;
	// 	// console.log('darleidoresumchat',idchatult);
	// 	this.getChatnoleidosFB(ptipo,pticket,pnit_empre)
	// 		 .subscribe((items: any) =>{
	// 			//  console.log('items',items);
	// 						items.forEach(job=>{
	// 							console.log('a acutualizar item ',job,job.id);
	// 								this.fbDb.doc(`chat/${job.id}`).update({leido: true});
	// 						})
	// 				});					
	// }
	public getChatResumFB() {
		return this.fbDb
			.collection(`/chat`, ref => ref
				.where("leido", "==", false).where("cliente", "==", true))
			.valueChanges()
			.pipe(
				map(actions =>
					actions.map((a: any) => {
						const fecha = a.fecha.toDate();
						const fechastr = fecha.toLocaleDateString()
						const horastr = fecha.toLocaleTimeString()
						const fechachat = a.fecha.toDate();
						return { fechachat, fechastr, horastr, ...a };
					})
				)
			);
	}

	public regChatrequerimientoFb(requer: any, texto: string) {
		//En libreria cliente maninterno siempre en falso ya que solo se maneja en lado de Netsolin
		const now = new Date();
		const dia = now.getDate();
		const mes = now.getMonth() + 1;
		const ano = now.getFullYear();
		const hora = now.getHours();
		const minutos = now.getMinutes();
		const segundos = now.getSeconds();
		const numaleator = Math.round(Math.random() * (1000 - 1999) + 1000);
		const idchat = ano.toString() + mes.toString() + dia.toString() + hora.toString() + minutos.toString() + segundos.toString() + numaleator.toString();

		const regchat = {
			id: idchat,
			fecha: now,
			cliente: false,
			usuario: this.usuarFb.nombre,
			texto: texto,
			leido: false
		}
		// console.log('save fb ', regchat);
		this.fbDb.collection(`/requerimientos/${requer.idrequer}/chat`)
			.doc(idchat).set(regchat);
		//registro chat por requerimiento ultimo para alertas
		const idchatult = 'RN' + requer.nit_empre.trim() + requer.idrequer;
		const regchatult = {
			tipo: 'R',
			id: idchat,
			fecha: now,
			cliente: false,
			usuario: this.usuarFb.nombre,
			texto: texto,
			ticket: requer.idrequer,
			nit_empre: requer.nit_empre,
			leido: false
		}
		console.log('save chat en result fb req ', regchatult);
		this.fbDb.collection(`/chat`)
			.doc(idchatult).set(regchatult);
	}

	public actLogusuarioregFb(idlog, maninterno: boolean, usuarioreg: any, cliente: boolean, accion: string, seguimiento: string, soluciona: boolean) {

		const reglog = {
			id: idlog,
			regcliente: cliente,
			maninterno: maninterno,
			accion: accion,
			nombrereporta: this.usuarFb.nombre,
			seguimiento: seguimiento,
			soluciona: soluciona
		}
		console.log('save fb ', reglog);
		this.fbDb.collection(`/usuarioregs/${usuarioreg.ticket}/log`)
			.doc(idlog).update(reglog);
	}


	public getLogUsuarioregFB(pticket) {
		// .collection(`/clientes/${NetsolinApp.oapp.nit_empresa}/usuarioregs`
		return this.fbDb
			.collection(`/usuarioregs/${pticket}/log`)
			.valueChanges()
			.pipe(
				map(actions =>
					actions.map((a: any) => {
						const fecha = a.fecha.toDate();
						const fechastr = fecha.toLocaleDateString()
						const horastr = fecha.toLocaleTimeString()
						const fechalog = a.fecha.toDate();
						// const dia = now.getDate();
						// const mes = now.getMonth() + 1;
						// const ano = now.getFullYear();
						// const hora = now.getHours();
						// const minutos = now.getMinutes();
						// const segundos = now.getSeconds();
						// const data = a.payload.doc.data();
						// const id = a.payload.doc.id;
						return { fechalog, fechastr, horastr, ...a };
					})
				)
			);
	}
	public getChatUsuarioregFB(pticket) {
		return this.fbDb
			.collection(`/usuarioregs/${pticket}/chat`)
			.valueChanges()
			.pipe(
				map(actions =>
					actions.map((a: any) => {
						const fecha = a.fecha.toDate();
						const fechastr = fecha.toLocaleDateString()
						const horastr = fecha.toLocaleTimeString()
						const fechachat = a.fecha.toDate();
						// const dia = now.getDate();
						// const mes = now.getMonth() + 1;
						// const ano = now.getFullYear();
						// const hora = now.getHours();
						// const minutos = now.getMinutes();
						// const segundos = now.getSeconds();
						// const data = a.payload.doc.data();
						// const id = a.payload.doc.id;
						return { fechachat, fechastr, horastr, ...a };
					})
				)
			);
	}


	public getLogRequerimientoFB(pid) {
		return this.fbDb
			.collection(`/requerimientos/${pid}/log`)
			.valueChanges()
			.pipe(
				map(actions =>
					actions.map((a: any) => {
						const fecha = a.fecha.toDate();
						const fechastr = fecha.toLocaleDateString()
						const horastr = fecha.toLocaleTimeString()
						const fechalog = a.fecha.toDate();
						return { fechalog, fechastr, horastr, ...a };
					})
				)
			);
	}


	//Trae catalogos de tabla en NEtsolin y los pasa a firebase
	subir_catalogosafb() {
		return new Promise((resolve, reject) => {
			let url = '';			
			if (environment.production) {
				url =NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETCATALOGS";
			} else {
				url = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETCATALOGS"
			}
	
			console.log('Entro a subir_catalogosafb url:', NetsolinApp.urlNetsolin, url);
			this.linsegproceso = 'Procesando Catalogos: ';
			this.http.post(url, NetsolinApp.objenvrest)
				.subscribe((data: any) => {
					console.log('subir_catalogosafb', data);
					if (data.error) {
						console.error(" subir_catalogosafb ", data.error);
						this.linsegproceso = 'Procesando Catalogos: Error: ' + data.error;
						resolve(false);
					} else {
						//reccorrer y grabar en fb
						data.catalogos.forEach((itemcat) => {
							let larchivo = '/img_catalogos/' + itemcat.ima_boton.trim();
							const ref = this.afStorage.ref(larchivo);
							console.log('subir_catalogos: ', itemcat.cod_catalogo);
							var gdsuscri = ref.getDownloadURL().subscribe((url: any) => {
								gdsuscri.unsubscribe();
								itemcat.link_img = url;
								this.linsegproceso = 'Procesando Catalogos: ' + itemcat.cod_catalogo;
								this.fbDb.collection('catalogos').doc(itemcat.cod_catalogo.trim()+itemcat.version.trim()).set(itemcat);
							},
								err => {
									gdsuscri.unsubscribe();
									this.linsegproceso = 'Procesando Catalogos: ' + itemcat.cod_catalogo;
									this.fbDb.collection('catalogos').doc(itemcat.cod_catalogo.trim()+itemcat.version.trim()).set(itemcat);
								});
						});
						this.linsegproceso = '';
						resolve(true);
					}
				});
		});
	}
deleteCatalogos() {
	return new Promise((resolve, reject) => {
		this.fbDb.collection(`catalogos`,
			ref => ref.orderBy('cod_catalogo')).snapshotChanges().subscribe(catal => {
				catal.map((cat: any) => {
					const data = cat.payload.doc.data() as any;
					const id = cat.payload.doc.id;
					// console.log('id',id);
					this.fbDb.collection('catalogos').doc(id).delete()
					.catch(error => {console.log(error);
						reject(); })
					.then(() => {
						this.linsegproceso = `Se elimino catalogo (${cat.id}) en Catalogos`;
						console.log(`Se elimino catalogo (${cat.id}) en Catalogos`)
					});
			});
		});
		resolve();
	});
}
	//Trae subtipos de tabla en NEtsolin y los pasa a firebase
	subir_subtiposafb() {
		return new Promise((resolve, reject) => {
			let url = '';			
			if (environment.production) {
				url =NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETSUBTIPO";
			} else {
				url = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETSUBTIPO";
			}

			console.log('Entro a subir_subtiposafb url:', url);
			this.linsegproceso = 'Procesando Subtipos Catalogo: ';
			this.http.post(url, NetsolinApp.objenvrest)
				.subscribe((data: any) => {
					console.log('subir_subtiposafb', data);
					if (data.error) {
						console.error(" subir_subtiposafb ", data.error);
						resolve(false);
						//   this._parempre.reg_log('Error en cargaPeriodoUsuar por netsolin ', 'data.error');
					} else {
						//reccorrer y grabar en fb
						data.datos.forEach((item) => {
							let larchivo = '/img_subtipos/' + item.imagen.trim();
							//   let larchivo = '/imagenes/ipname.png';
							const ref = this.afStorage.ref(larchivo);
							console.log('subir_subtiposafb: item;', item, item.cod_catalogo);
							var gdsuscri = ref.getDownloadURL().subscribe((url: any) => {
								gdsuscri.unsubscribe();
								item.link_img = url;
								// console.log('crear ',item,url);
								this.linsegproceso = 'Procesando Subtipos Catalogo: ' + item.cod_catalogo + item.sub_tipo;
								this.fbDb.collection('subtipos').doc(item.cod_catalogo + item.sub_tipo).set(item);
							},
								err => {
									gdsuscri.unsubscribe();
									// console.log('Error ',item,err);
									this.linsegproceso = 'Procesando Subtipos Catalogo: ' + item.cod_catalogo + item.sub_tipo;
									this.fbDb.collection('subtipos').doc(item.cod_catalogo + item.sub_tipo).set(item);
								});
						});
						this.linsegproceso = '';
						resolve(true);
					}
				});
		});
	}
	deleteSubtipos() {
		return new Promise((resolve, reject) => {
			this.fbDb.collection(`subtipos`,
				ref => ref.orderBy('cod_catalogo')).snapshotChanges().subscribe(catal => {
					catal.map((cat: any) => {
						const data = cat.payload.doc.data() as any;
						const id = cat.payload.doc.id;
						// console.log('id',id);
						this.fbDb.collection('subtipos').doc(id).delete()
						.catch(error => {console.log(error);
							reject(); })
						.then(() => {
							this.linsegproceso = `Se elimino subtipo (${cat.id}) en Subtipos`;
							console.log(`Se elimino subtipo (${cat.id}) en Subtipos`)
						});
				});
			});
			resolve();
		});
	}
	
	//Trae lineas de tabla en NEtsolin y los pasa a firebase
	subir_lineasafb() {
		return new Promise((resolve, reject) => {
			let url = '';			
			if (environment.production) {
				url =NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETARMACATL";
			} else {
				url = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETARMACATL";
			}
			console.log('Entro a subir_lineasafb url:', url);
			this.linsegproceso = 'Procesando Lineas Catalogo: ';
			var csuscri = this.http.post(url, NetsolinApp.objenvrest)
				.subscribe((data: any) => {
					csuscri.unsubscribe();
					console.log('subir_lineasafb', data);
					if (data.error) {
						console.error(" subir_lineasafb ", data.error);
						resolve(false);
						//   this._parempre.reg_log('Error en cargaPeriodoUsuar por netsolin ', 'data.error');
					} else {
						//reccorrer y grabar en fb
						data.datos.forEach(itemcat => {
							let larchivo = '/img_lineas/'+ itemcat.linea.trim() +'/' + itemcat.linea.trim()+'.jpg';
							const ref = this.afStorage.ref(larchivo);
							console.log('subir_linea: ', itemcat.linea);
							var gdsuscri = ref.getDownloadURL().subscribe((url: any) => {
								gdsuscri.unsubscribe();
								itemcat.link_img = url;
								this.linsegproceso = 'Procesando Linea: ' + itemcat.linea.trim()+itemcat.version.trim();
								this.fbDb.collection('armacatl').doc(itemcat.cod_catalogo.trim()+itemcat.linea.trim()+itemcat.version.trim()).set(itemcat);
							},
								err => {
									gdsuscri.unsubscribe();
									this.linsegproceso = 'Procesando Linea: ' + itemcat.cod_catalogo.trim()+itemcat.linea.trim()+itemcat.version.trim();
									this.fbDb.collection('armacatl').doc(itemcat.cod_catalogo.trim()+itemcat.linea.trim()+itemcat.version.trim()).set(itemcat);
								});
						});
						this.linsegproceso = '';
						resolve(true);
					}
				});
		});
	}
	deleteLineas() {
		return new Promise((resolve, reject) => {
			this.fbDb.collection(`armacatl`,
				ref => ref.orderBy('cod_catalogo')).snapshotChanges().subscribe(catal => {
					catal.map((cat: any) => {
						const data = cat.payload.doc.data() as any;
						const id = cat.payload.doc.id;
						// console.log('id',id);
						this.fbDb.collection('armacatl').doc(id).delete()
						.catch(error => {console.log(error);
							reject(); })
						.then(() => {
							this.linsegproceso = `Se elimino armacatl (${cat.id}) en lineas`;
							console.log(`Se elimino armacatl (${cat.id}) en lineas`);
						});
				});
			});
			resolve();
		});
	}

	//Trae colores de tabla en NEtsolin y los pasa a firebase
	subir_coloresafb() {
		return new Promise((resolve, reject) => {
			let url = '';			
			if (environment.production) {
				url =NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETARMACATLC";
			} else {
				url = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETARMACATLC";
			}
			console.log('Entro a subir_coloresafb url:', url);
			this.linsegproceso = 'Procesando Colores Catalogo: ';
			var csuscri = this.http.post(url, NetsolinApp.objenvrest)
				.subscribe((data: any) => {
					csuscri.unsubscribe();
					console.log('subir_coloresafb', data);
					if (data.error) {
						console.error(" subir_coloresafb ", data.error);
						resolve(false);
					} else {
						//reccorrer y grabar en fb
						data.datos.forEach(itemcat => {
							let larchivo =  '/img_lineas/'+ itemcat.linea.trim() +'/' + itemcat.linea.trim() + ' ' + itemcat.color.trim() + '.jpg';
							const ref = this.afStorage.ref(larchivo);
							console.log('subir_colores: ', itemcat.color);
							var gdsuscri = ref.getDownloadURL().subscribe((url: any) => {
								gdsuscri.unsubscribe();
								itemcat.link_img = url;
								this.linsegproceso = 'Procesando Color: ' +itemcat.cod_catalogo.trim()+itemcat.linea.trim()+itemcat.color.trim()+itemcat.version.trim();
								this.fbDb.collection('armacatlcol').doc(itemcat.cod_catalogo.trim()+itemcat.linea.trim()+itemcat.color.trim()+itemcat.version.trim()).set(itemcat);
							},
								err => {
									gdsuscri.unsubscribe();
									this.linsegproceso = 'Procesando Color: ' + itemcat.cod_catalogo.trim()+itemcat.linea.trim()+itemcat.color.trim()+itemcat.version.trim();
									this.fbDb.collection('armacatlcol').doc(itemcat.cod_catalogo.trim()+itemcat.linea.trim()+itemcat.color.trim()+itemcat.version.trim()).set(itemcat);
								});
						});
						this.linsegproceso = '';
						resolve(true);
					}
				});
		});
	}
	deleteColores() {
		return new Promise((resolve, reject) => {
			this.fbDb.collection(`armacatlcol`,
				ref => ref.orderBy('cod_catalogo')).snapshotChanges().subscribe(catal => {
					catal.map((cat: any) => {
						const data = cat.payload.doc.data() as any;
						const id = cat.payload.doc.id;
						// console.log('id',id);
						this.fbDb.collection('armacatlcol').doc(id).delete()
						.catch(error => {console.log(error);
							reject(); })
						.then(() => {
							this.linsegproceso = `Se elimino armacatlcol (${cat.id}) en linea-color`;
							console.log(`Se elimino armacatlcol (${cat.id}) en linea-color`)
						});
				});
			});
			resolve();
		});
	}

	//Trae curvaspor linea de tabla en NEtsolin y los pasa a firebase
	subir_curvasLineaafb() {
		return new Promise((resolve, reject) => {
			let url = '';			
			if (environment.production) {
				url =NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETCURVAS";
			} else {
				url = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETCURVAS";
			}
			console.log('Entro a subir_curvasLineaafb url:', url);
			this.linsegproceso = 'Procesando Curvas Catalogo: ';
			var csuscri = this.http.post(url, NetsolinApp.objenvrest)
				.subscribe((data: any) => {
					csuscri.unsubscribe();
					console.log('subir_curvasLineaafb', data);
					if (data.error) {
						console.error(" subir_curvasLineaafb ", data.error);
						resolve(false);
					} else {
						//reccorrer y grabar en fb
						data.datos.forEach(itemcat => {
							this.linsegproceso = 'Procesando Curva: ' + itemcat.cod_catalogo.trim()+itemcat.linea + '-' + itemcat.curva+'-'+ itemcat.version.trim();
							this.fbDb.collection('armacatlcur').doc(itemcat.cod_catalogo.trim()+itemcat.linea.trim() +itemcat.curva.trim()+itemcat.version.trim()).set(itemcat);
						});
						this.linsegproceso = '';
						resolve(true);
					}
				});
		});
	}

	deleteCurvasLinea() {
		return new Promise((resolve, reject) => {
			this.fbDb.collection(`armacatlcur`,
				ref => ref.orderBy('cod_catalogo')).snapshotChanges().subscribe(catal => {
					catal.map((cat: any) => {
						const data = cat.payload.doc.data() as any;
						const id = cat.payload.doc.id;
						// console.log('id',id);
						this.fbDb.collection('armacatlcur').doc(id).delete()
						.catch(error => {console.log(error);
							reject(); })
						.then(() => {
							this.linsegproceso = `Se elimino armacatlcur (${cat.id}) en linea-curvas`;
							console.log(`Se elimino armacatlcur (${cat.id}) en linea-curvas`)
						});
				});
			});
			resolve();
		});
	}

	//Trae curvas de tabla en NEtsolin y los pasa a firebase
	subir_curvasafb() {
		return new Promise((resolve, reject) => {
			let url = '';			
			if (environment.production) {
				url =NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETARCATLCUR";
			} else {
				url = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETARCATLCUR";
			}
			console.log('Entro a subir_curvasafb url:', url);
			this.linsegproceso = 'Procesando Curvas Catalogo: ';
			var csuscri = this.http.post(url, NetsolinApp.objenvrest)
				.subscribe((data: any) => {
					csuscri.unsubscribe();
					console.log('subir_curvasafb', data);
					if (data.error) {
						console.error(" subir_curvasafb ", data.error);
						resolve(false);
					} else {
						//reccorrer y grabar en fb
						data.datos.forEach((itemcat, i) => {
							console.log(i, '  subir_curvas: ', itemcat);
							this.linsegproceso = 'Procesando Curva: ' + itemcat.linea + '-' + itemcat.curva;
							if (itemcat.cod_curva.indexOf("/") == -1)
								this.fbDb.collection('curvas').doc(itemcat.cod_curva).set(itemcat);
						});
						this.linsegproceso = '';
						resolve(true);
					}
				});
		});
	}
	deleteCurvas() {
		return new Promise((resolve, reject) => {
			this.fbDb.collection(`curvas`,
				ref => ref.orderBy('cod_curva')).snapshotChanges().subscribe(catal => {
					catal.map((cat: any) => {
						const data = cat.payload.doc.data() as any;
						const id = cat.payload.doc.id;
						// console.log('id',id);
						this.fbDb.collection('curvas').doc(id).delete()
						.catch(error => {console.log(error);
							reject(); })
						.then(() => {
							this.linsegproceso = `Se elimino curvas (${cat.id}) en curvas`;
							console.log(`Se elimino curvas (${cat.id}) en curvas`)
						});
				});
			});
			resolve();
		});
	}

	//Trae referencias x linea color de tabla en NEtsolin y los pasa a firebase
	subir_referenciasafb() {
		return new Promise((resolve, reject) => {
			let url = '';			
			if (environment.production) {
				url =NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETREFXLINCO";
			} else {
				url = 'https://cors-anywhere.herokuapp.com/'+NetsolinApp.urlNetsolin + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETREFXLINCO";
			}
			console.log('Entro a subir_curvasafb url:', url);
			this.linsegproceso = 'Procesando Referencias Catalogo: ';
			var csuscri = this.http.post(url, NetsolinApp.objenvrest)
				.subscribe((data: any) => {
					csuscri.unsubscribe();
					console.log('subir_curvasafb', data);
					if (data.error) {
						console.error(" subir_curvasafb ", data.error);
						resolve(false);
					} else {
						//reccorrer y grabar en fb
						let num = 0;
						data.datos.forEach((itemcat, i) => {
							if (itemcat.cod_refinv == "") {
								itemcat.cod_refinv = itemcat.codlincolo + "" + itemcat.talla;
							}
							itemcat.cod_refinv = itemcat.cod_refinv.replace("/", "_");
							console.log(i, "   ", itemcat.cod_refinv)
							this.linsegproceso = 'Procesando Referencia: ' + itemcat.cod_refinv;
							this.fbDb.collection('refxlincol').doc(itemcat.cod_refinv).set(itemcat).then(() => {
								num++;
								this.linsegproceso = 'Procesando Referencia: ' + itemcat.cod_refinv;
								console.log("ha subido ", num);
							});
						});
						// this.linsegproceso = '';
						resolve(true);
					}
				});
		});
	}
	deleteReferencias() {
		return new Promise((resolve, reject) => {
			this.fbDb.collection(`refxlincol`,
				ref => ref.orderBy('cod_refinv')).snapshotChanges().subscribe(catal => {
					catal.map((cat: any) => {
						const data = cat.payload.doc.data() as any;
						const id = cat.payload.doc.id;
						// console.log('id',id);
						this.fbDb.collection('refxlincol').doc(id).delete()
						.catch(error => {console.log(error);
							reject(); })
						.then(() => {
							this.linsegproceso = `Se elimino refxlincol (${cat.id}) en referencias`;
							console.log(`Se elimino refxlincol (${cat.id}) en referencias`)
						});
				});
			});
			resolve();
		});
	}

	traer_lineas_aactualizarfb(){
		return new Promise((resolve, reject) => {
			var linesuscrip = this.fbDb.collection('armacatl').valueChanges()
				.subscribe((data) => {
						this.lineasaact = data;
						console.log('LINEAS A ACTUALIZAR IMAGEN:',this.lineasaact);
						linesuscrip.unsubscribe();			
				})
			})
	}

	actualizar_linkimagenfb_lineas() {
		return new Promise((resolve, reject) => {
			var catlsuscribe = this.fbDb.collection('armacatl').valueChanges()
				.subscribe((data: any) => {
					console.log("DATA lineas a recoorer para act link imagen", data);
					catlsuscribe.unsubscribe();
					//reccorrer y grabar en fb
					this.linsegproceso = 'Actualizando imagen: ';
					var lnumlineas = data.length;
					var lnumitem = 0;
					data.forEach((itemcat: any) => {
						lnumitem += 1;
						//solo las que no tienen imagen por velocidad
						console.log('Verificando '+lnumitem +' de '+ lnumlineas);
						console.log('recorriendo ',itemcat.linea);
						if (itemcat.link_img === '') {
							let larchivo = '/img_lineas/'+ itemcat.linea.trim() +'/' + itemcat.linea.trim()+'.jpg';
							const ref = this.afStorage.ref(larchivo);
							var refsusc = ref.getDownloadURL().subscribe((url: any) => {
								refsusc.unsubscribe();
								itemcat.link_img = url;
								console.log('Se actualiza imagen para linea: ' + itemcat.linea, itemcat.link_img);
								this.linsegproceso = 'Actualizando imagen ' +lnumitem +' de '+ lnumlineas+' linea: '+ itemcat.linea.trim() + '.jpg';
								this.fbDb.collection('armacatl').doc(itemcat.cod_catalogo.trim()+itemcat.linea.trim()+itemcat.version.trim()).set(itemcat);
							},
								err => {
									refsusc.unsubscribe();
									this.linsegproceso = 'No se encontro imagen linea: ' + itemcat.linea.trim() + '.jpg';
									console.log('No hay imagen para linea: ' + itemcat.linea);
									itemcat.link_img = '';
									this.linsegproceso = 'Actualizando imagen ' +lnumitem +' de '+ lnumlineas+' linea: '+ itemcat.linea.trim() + '.jpg';
									this.fbDb.collection('armacatl').doc(itemcat.cod_catalogo.trim()+itemcat.linea.trim()+itemcat.version.trim()).set(itemcat);	
									// this.fbDb.collection('armacatl').doc(itemcat.linea).set(itemcat);                
								});
						}
					});
				},
					(err) => { console.log("Error en el data de Fb", err) }
				);
			resolve(true);
		});
	}

	actualizar_linkimagenfb_lineacolor() {
		return new Promise((resolve, reject) => {
			var catlcolsus = this.fbDb.collection('armacatlcol').valueChanges()
				.subscribe((data) => {
					catlcolsus.unsubscribe();
					console.log("DATA linea color a recoorer para act link imagen", data);
					//reccorrer y grabar en fb
					var lnumlineas = data.length;
					var lnumitem = 0;
					this.linsegproceso = 'Actualizando imagen: ';
					data.forEach((itemcat: any) => {
						lnumitem += 1;
						let larchivo =  '/img_lineas/'+ itemcat.linea.trim() +'/'  + itemcat.linea.trim()+' '+itemcat.color.trim() + '.jpg';
						const ref = this.afStorage.ref(larchivo);
						var refsusc =ref.getDownloadURL().subscribe((url: any) => {
							refsusc.unsubscribe();
							itemcat.link_img = url;
							console.log('Se actualiza imagen para color: ' + itemcat.color, itemcat.link_img);
							this.linsegproceso = 'Actualizando imagen ' +lnumitem +' de '+ lnumlineas+' linea color: ' + itemcat.color.trim() + '.jpg';
							this.fbDb.collection('armacatlcol').doc(itemcat.cod_catalogo.trim()+itemcat.linea.trim()+itemcat.color.trim()+itemcat.version.trim()).set(itemcat);
						},
							err => {
								refsusc.unsubscribe();
								console.log('No hay imagen para color: ' + itemcat.color);
								this.linsegproceso = 'No se encontro imagen ' +lnumitem +' de '+ lnumlineas+' color: ' + itemcat.color.trim() + '.jpg';
								itemcat.link_img = '';
								this.fbDb.collection('armacatlcol').doc(itemcat.cod_catalogo.trim()+itemcat.linea.trim()+itemcat.color.trim()+itemcat.version.trim()).set(itemcat);
									// this.fbDb.collection('armacatl').doc(itemcat.linea).set(itemcat);                
							});
					});
				},
					(err) => { console.log("Error en el data de Fb", err) }
				);
			resolve(true);
		});
	}



}



