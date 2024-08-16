import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GLOBAL } from "./GLOBAL";
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  public url = GLOBAL.url;
  public eventClientCredito = new EventEmitter<any>();

  constructor(
    private _http:HttpClient
  ) { 
    console.log(this.url);
    
  }

  
  eventToClientCredito(){
    this.eventClientCredito.emit(true);
  }


  create_cliente(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_cliente',data,{headers:headers});
  }

  create_cliente_facturacion(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_cliente_facturacion',data,{headers:headers});
  }

  add_cliente_facturacion(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'add_cliente_facturacion',data,{headers:headers});
  }

  get_pagos_clientes(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_pagos_clientes/'+id,{headers:headers});
  }

  get_ventas_clientes(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ventas_clientes/'+id,{headers:headers});
  }

  delete_cliente_facturacion(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_cliente_facturacion/'+id,{headers:headers});
  }

  
  get_clientes_latest(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_clientes_latest',{headers:headers});
  }

  get_clientes_admin(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_clientes_admin/'+filtro,{headers:headers});
  }

  get_clientes_facturacion_cliente(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_clientes_facturacion_cliente/'+id,{headers:headers});
  }

  get_clientes_facturacion_empresa(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_clientes_facturacion_empresa/'+id,{headers:headers});
  }

  get_clientes_facturacion(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_clientes_facturacion',{headers:headers});
  }

  get_empresa_rs_admin(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_empresa_rs_admin/'+filtro,{headers:headers});
  }

  get_empresa_clientes(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_empresa_clientes/'+filtro,{headers:headers});
  }

  get_empresa_clientes_todos(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_empresa_clientes_todos/'+filtro,{headers:headers});
  }

  get_empresas_admin(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_empresas_admin/'+filtro,{headers:headers});
  }

  set_status_cliente(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'set_status_cliente/'+id,data,{headers:headers});
  }

  set_status_empresa(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'set_status_empresa/'+id,data,{headers:headers});
  }

  get_cliente_admin(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_cliente_admin/'+id,{headers:headers});
  }

  get_creditos_cliente(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_creditos_cliente/'+id,{headers:headers});
  }

  get_solicitudes_cliente(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_solicitudes_cliente/'+id,{headers:headers});
  }

  get_cliente_cobranza_admin(id:any,tipo:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_cliente_cobranza_admin/'+id+'/'+tipo,{headers:headers});
  }

  update_tiempo_credito_cliente(id:any,tipo:any,limit_days:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'update_tiempo_credito_cliente/'+id+'/'+tipo+'/'+limit_days,{headers:headers});
  }

  set_solicitud_credito(id:any,estado:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'set_solicitud_credito/'+id+'/'+estado,{headers:headers});
  }

  get_data_empresa(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_data_empresa/'+id,{headers:headers});
  }

  update_cliente(data:any,id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_cliente/'+id,data,{headers:headers});
  }

  update_cliente_umedida(data:any,id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_cliente_umedida/'+id,data,{headers:headers});
  }

  update_cliente_credito(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'update_cliente_credito',data,{headers:headers});
  }

  update_reduccion_cliente_credito(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'update_reduccion_cliente_credito',data,{headers:headers});
  }

  get_credito_cliente(id:any,tipo:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_credito_cliente/'+id+'/'+tipo,{headers:headers});
  }

  verification_email_cliente(tipo:any,token:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'verification_email_cliente/'+tipo+'/'+token,{headers:headers});
  }

  get_ubicaciones_clientes(id:any,tipo:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ubicaciones_clientes/'+id+'/'+tipo,{headers:headers});
  }

  get_ubicaciones_empresa(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ubicaciones_empresa/'+id,{headers:headers});
  }

  create_ubicacion_clientes(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_ubicacion_clientes',data,{headers:headers});
  }

  create_ubicacion_empresa(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_ubicacion_empresa',data,{headers:headers});
  }

  add_cliente_empresa_rs(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'add_cliente_empresa_rs',data,{headers:headers});
  }

  add_empresa_rs(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'add_empresa_rs',data,{headers:headers});
  }

  update_ubicacion_cliente(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_ubicacion_cliente/'+id,data,{headers:headers});
  }

  get_ubicacion_cliente(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ubicacion_cliente/'+id,{headers:headers});
  }

  delete_ubicacion_cliente(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'delete_ubicacion_cliente/'+id,{headers:headers});
  }

  remove_cliente_agente(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'remove_cliente_agente/'+id,{headers:headers});
  }

  agregar_cliente_agente(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'agregar_cliente_agente',data,{headers:headers});
  }

  obtener_envios_notas(page:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'obtener_envios_notas/'+page,{headers:headers});
  }

  obtener_clientes_notas(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'obtener_clientes_notas',{headers:headers});
  }

  obtener_deudas_comprador(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'obtener_deudas_comprador/'+id,{headers:headers});
  }

  get_ip():Observable<any>{
    return this._http.get('https://api.ipify.org/?format=json');
  }

  get_location(ip:any):Observable<any>{
    return this._http.get('https://ipapi.co/'+ip+'/json');
  }
}
