
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GLOBAL } from "./GLOBAL";
import { EventEmitter, Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class VentaService {

  public url = GLOBAL.url;

  constructor(
    private _http:HttpClient
  ) { 
    console.log(this.url);
    
  }


  create_venta(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    const fd = new FormData();
    fd.append('data_facturacion',JSON.stringify(data.data_facturacion));
    fd.append('cliente',data.cliente);
    fd.append('cliente_ubicacion',data.cliente_ubicacion);
    fd.append('credito_solicitado',data.credito_solicitado);
    fd.append('descuento',data.descuento);
    fd.append('detalles',JSON.stringify(data.detalles));
    fd.append('entidad',data.entidad);
    fd.append('estado',data.estado);
    fd.append('fe_fin',data.fe_fin);
    fd.append('fe_inicio',data.fe_inicio);
    fd.append('limit_days',data.limit_days);
    fd.append('metodo',data.metodo);
    fd.append('metodo_envio',data.metodo_envio);
   
    fd.append('tipo_compra',data.tipo_compra);
    fd.append('tipo_pago',data.tipo_pago);
    fd.append('tipo_usuario',data.tipo_usuario);
    fd.append('total_venta',data.total_venta);
    fd.append('total_camino',data.total_camino);
    fd.append('total_programacion',data.total_programacion);
    fd.append('monto_total',data.monto_total);
    fd.append('cantidad_total',data.cantidad_total);
    fd.append('tipo',data.tipo);
    fd.append('unidad',data.unidad);
    fd.append('firma',data.firma);
    return this._http.post(this.url+'create_venta',fd,{headers:headers});
  }

  create_venta_ropa(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_venta_ropa',data,{headers:headers});
  }

  update_file_venta(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    const fd = new FormData();
    fd.append('files[]',data.file);
    return this._http.put(this.url+'update_file_venta/'+id,fd,{headers:headers});
  }

  update_file_entrega_envio(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    const fd = new FormData();
    fd.append('files[]',data.file_entrega);
    return this._http.put(this.url+'update_file_entrega_envio/'+id,fd,{headers:headers});
  }

  update_firma_envio(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_firma_envio/'+id,data,{headers:headers});
  }

  update_file_envio_venta(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    const fd = new FormData();
    fd.append('files[]',data.file);
    return this._http.put(this.url+'update_file_envio_venta/'+id,fd,{headers:headers});
  }

  update_total_venta(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_total_venta/'+id,data,{headers:headers});
  }

  update_file_programacion(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    const fd = new FormData();
    fd.append('files[]',data.file);
    return this._http.put(this.url+'update_file_programacion/'+id,fd,{headers:headers});
  }

  cancelar_programacion(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'cancelar_programacion/'+id,{headers:headers});
  }

  cancelar_detalle_programacion(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'cancelar_detalle_programacion/'+id,{headers:headers});
  }

  confirmar_programacion(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'confirmar_programacion/'+id,{headers:headers});
  }

  create_programaciones(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    const fd = new FormData();
    fd.append('cliente',data.cliente);
    fd.append('cliente_ubicacion',data.cliente_ubicacion);
    fd.append('credito_solicitado',data.credito_solicitado);
    fd.append('descuento',data.descuento);
    fd.append('programaciones',JSON.stringify(data.programaciones));
    fd.append('entidad',data.entidad);
    fd.append('estado',data.estado);
    fd.append('fe_fin',data.fe_fin);
    fd.append('fe_inicio',data.fe_inicio);
    fd.append('files[]',data.file);
    fd.append('limit_days',data.limit_days);
    fd.append('metodo',data.metodo);
    fd.append('metodo_envio',data.metodo_envio);
    fd.append('metraje_cantidad',data.metraje_cantidad);
    fd.append('tipo_pago',data.tipo_pago);
    fd.append('tipo_usuario',data.tipo_usuario);
    fd.append('total',data.total);
    fd.append('unidad',data.unidad);
    fd.append('tipo',data.tipo);
    fd.append('firma',data.firma);
    return this._http.post(this.url+'create_programaciones',fd,{headers:headers});
  }

  create_programaciones_ropas(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    const fd = new FormData();
    if(data.tipo_usuario == 'Cliente natural'){
      fd.append('cliente',data.cliente);
    }
    if(data.tipo_usuario == 'Empresa'){
      fd.append('empresa',data.empresa);
      fd.append('empresa_rs',data.empresa_rs);
    }
    fd.append('cliente_ubicacion',data.cliente_ubicacion);
    fd.append('credito_solicitado',data.credito_solicitado);
    fd.append('descuento',data.descuento);
    fd.append('detalles',JSON.stringify(data.detalles));
    fd.append('programaciones',JSON.stringify(data.programaciones));
    fd.append('entidad',data.entidad);
    fd.append('estado',data.estado);
    fd.append('fe_fin',data.fe_fin);
    fd.append('fe_inicio',data.fe_inicio);
    fd.append('file', data.file);
    fd.append('limit_days',data.limit_days);
    fd.append('metodo',data.metodo);
    fd.append('metodo_envio',data.metodo_envio);
    fd.append('tipo_pago',data.tipo_pago);
    fd.append('tipo_usuario',data.tipo_usuario);
    fd.append('total',data.total);
    console.log(data);
    return this._http.post(this.url+'create_programaciones_ropas',fd,{headers:headers});
  }

  get_productos_programaciones_pedido(filtro:any,tipo:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_productos_programaciones_pedido/'+filtro+'/'+tipo,{headers:headers});
  }

  get_ventas_serie(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ventas_serie/'+filtro,{headers:headers});
  }

  get_venta_pagos(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_venta_pagos/'+id,{headers:headers});
  }

  get_programacion(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_programacion/'+id,{headers:headers});
  }

  add_detalle_venta(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'add_detalle_venta/'+id,data,{headers:headers});
  }

  get_ventas(estado:any,page:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ventas/'+estado+'/'+page,{headers:headers});
  }

  get_ventas_envios(estado:any,page:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ventas_envios/'+estado+'/'+page,{headers:headers});
  }

  get_programaciones_range(estado:any,page:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_programaciones_range/'+estado+'/'+page,{headers:headers});
  }

  get_last_ventas(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_last_ventas',{headers:headers});
  }

  get_pagos(page:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_pagos/'+page,{headers:headers});
  }

  get_programaciones(tipo:any,id:any,estado:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_programaciones/'+tipo+'/'+id+'/'+estado,{headers:headers});
  }

  get_programaciones_color(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_programaciones_color/'+id,{headers:headers});
  }

  remove_detalle_venta(id:any,venta:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'remove_detalle_venta/'+id+'/'+venta,{headers:headers});
  }

  get_venta(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_venta/'+id,{headers:headers});
  }

  get_venta_cobranza(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_venta_cobranza/'+id,{headers:headers});
  }

  download_cfdi(id:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'download_cfdi/'+id,{headers:headers});
  }

  aprobar_pago(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'aprobar_pago/'+id,{headers:headers});
  }

  timbrar_borrador_pago(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'timbrar_borrador_pago/'+id,{headers:headers});
  }

  cancelar_pago(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'cancelar_pago/'+id,{headers:headers});
  }

  get_detalle_ingreso_by_color_venta(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_detalle_ingreso_by_color_venta/'+id,{headers:headers});
  }

  get_detalle_ingreso_by_variacion_venta(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_detalle_ingreso_by_variacion_venta/'+id,{headers:headers});
  }

  update_estado_venta(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_estado_venta/'+id,data,{headers:headers});
  }

  confirmar_estado_venta(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'confirmar_estado_venta/'+id,data,{headers:headers});
  }

  cancelar_venta(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'cancelar_venta/'+id,{headers:headers});
  }

  confirmar_entrega_venta(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'confirmar_entrega_venta/'+id,{headers:headers});
  }

  get_envios_venta(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_envios_venta/'+id,{headers:headers});
  }

  get_venta_guest(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_venta_guest/'+id,{headers:headers});
  }

  get_envios_procesados(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_envios_procesados',{headers:headers});
  }

  obtener_solicitudes_abiertas(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'obtener_solicitudes_abiertas',{headers:headers});
  }


  add_doc_venta(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    const fd = new FormData();
    fd.append('tipo',data.tipo);
    fd.append('files[]',data.archivo);
    if(data.tipo == 'Envio') fd.append('doc_format_envio',data.doc_format_envio);

    return this._http.post(this.url+'add_doc_venta/'+id+'/'+data.tipo,fd,{headers:headers});
  }

  create_doc_envio(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_doc_envio',data,{headers:headers});
  }

  crear_pago(data:any,token:any):Observable<any>{
    if(data.comprobante == undefined){
      let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
      return this._http.post(this.url+'crear_pago',data,{headers:headers});
    }else{
      let headers = new HttpHeaders({'Authorization':token});
      let fd = new FormData();
      fd.append('files[]',data.comprobante);
      
      fd.append('data_facturacion',data.data_facturacion);
      fd.append('tipo_usuario',data.tipo_usuario);
      fd.append('venta',data.venta);
      fd.append('metodo',data.metodo);
      fd.append('monto',data.monto);
      if(data.tipo_usuario == 'Cliente natural'){
        fd.append('cliente',data.cliente);
      }else if(data.tipo_usuario == 'Empresa'){
        fd.append('empresa_rs',data.empresa_rs);
        fd.append('empresa',data.empresa);
      }
      return this._http.post(this.url+'crear_pago',fd,{headers:headers});
    }
  }

  create_cupon(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_cupon',data,{headers:headers});
  }

  get_cupones(codigo:any,estado:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_cupones/'+codigo+'/'+estado,{headers:headers});
  }

  get_cupon(codigo:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_cupon/'+codigo,{headers:headers});
  }

  cancelar_comprador_cupon(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'cancelar_comprador_cupon/'+id,{headers:headers});
  }

  obtener_ventas_en_camino(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'obtener_ventas_en_camino',{headers:headers});
  }

  actualizar_prioridades_ventas(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'actualizar_prioridades_ventas',data,{headers:headers});
  }

  get_ventas_confirmadas(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ventas_confirmadas',{headers:headers});
  }

  get_detalles_venta(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_detalles_venta/'+id,{headers:headers});
  }

  unidades_disponibles_productos(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'unidades_disponibles_productos',data,{headers:headers});
  }
}
