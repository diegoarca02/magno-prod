import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GLOBAL } from "./GLOBAL";

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  public url = GLOBAL.url;

  constructor(
    private _http:HttpClient
  ) { 
    console.log(this.url);
    
  }

  create_pedido(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_pedido',data,{headers:headers});
  }

  create_pedido_ropa(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_pedido_ropa',data,{headers:headers});
  }

  get_pedidos(estado:any,page:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_pedidos/'+estado+'/'+page,{headers:headers});
  }

  eliminar_rollo_interno(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'eliminar_rollo_interno/'+id,{headers:headers});
  }

  get_pedido(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_pedido/'+id,{headers:headers});
  }

  get_envios_pedido(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_envios_pedido',{headers:headers});
  }

  get_envio_pedido(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_envio_pedido/'+id,{headers:headers});
  }

  get_pedido_serie(serie:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_pedido_serie/'+serie,{headers:headers});
  }

  get_pedido_serie_ropa(serie:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_pedido_serie_ropa/'+serie,{headers:headers});
  }

  get_pedido_public(id:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'get_pedido_public/'+id,{headers:headers});
  }

  update_estado_pedido(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_estado_pedido/'+id,data,{headers:headers});
  }

  get_detalle_pedido(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_detalle_pedido/'+id,{headers:headers});
  }

  obtener_pedidos_detalles_aprobados(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'obtener_pedidos_detalles_aprobados',{headers:headers});
  }

  verify_envio(id:any,tipo:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'verify_envio/'+id+'/'+tipo,{headers:headers});
  }

  send_email_pedido(id:any,email:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'send_email_pedido/'+id+'/'+email,{headers:headers});
  }

  set_confirmacion_pedido(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'set_confirmacion_pedido',data,{headers:headers});
  }

  set_cancelar_pedido(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'set_cancelar_pedido',data,{headers:headers});
  }

  set_confirmacion_pedidos(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'set_confirmacion_pedidos',data,{headers:headers});
  }

  set_cancelar_pedidos(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'set_cancelar_pedidos',data,{headers:headers});
  }

  set_proveedor_pedido(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'set_proveedor_pedido',data,{headers:headers});
  }

  send_email_programacion(id:any,proveedor:any,email:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'send_email_programacion/'+id+'/'+proveedor+'/'+email,{headers:headers});
  }

  create_ingreso(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_ingreso',data,{headers:headers});
  }


  create_envio_detalle(data:any,token:any):Observable<any>{
    if(data.files.length == 0){
      let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
      return this._http.post(this.url+'create_envio_detalle',data,{headers:headers});
    }else{
      let headers = new HttpHeaders({'Authorization':token});
      let fd = new FormData();
      fd.append('proveedor',data.proveedor);
      fd.append('tipo_envio',data.tipo_envio);
      fd.append('condicion_pago',data.condicion_pago);
      fd.append('tipo_transporte',data.tipo_transporte);
      fd.append('empresa_transporte',data.empresa_transporte);
      fd.append('aduanero_transporte',data.aduanero_transporte);
      fd.append('programacion_transporte',data.programacion_transporte);
      fd.append('costo_envio',data.costo_envio);
      fd.append('tracking',data.tracking);
      fd.append('costos_adicionales',data.costos_adicionales);
      fd.append('pedido_detalle',data.pedido_detalle);
      fd.append('pedido',data.pedido);
      fd.append('cantidad',data.cantidad);
      fd.append('pecio',data.pecio);
      fd.append('tipo',data.tipo);
      data.files.forEach((file:any) => { fd.append('files[]', file); });

      return this._http.post(this.url+'create_envio_detalle',fd,{headers:headers});
    }
  }

  create_envio_pedido(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
      return this._http.post(this.url+'create_envio_pedido',data,{headers:headers});
  }

  
  get_ingresos(page:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ingresos/'+page,{headers:headers});
  }

  get_ingreso(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ingreso/'+id,{headers:headers});
  }

  get_detalle_ingreso_by_color(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_detalle_ingreso_by_color/'+id,{headers:headers});
  }

  get_detalle_ingreso_by_variacion(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_detalle_ingreso_by_variacion/'+id,{headers:headers});
  }

  rollos_historico(id:any,periodo:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'rollos_historico/'+id+'/'+periodo,{headers:headers});
  }

  variaciones_historico(id:any,periodo:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'variaciones_historico/'+id+'/'+periodo,{headers:headers});
  }

  validar_color(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'validar_color/'+id,{headers:headers});
  }

  validar_variacion(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'validar_variacion/'+id,{headers:headers});
  }

  rollos_general(periodo:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'rollos_general/'+periodo,{headers:headers});
  }

  kpi_inventario(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'kpi_inventario',{headers:headers});
  }
}
