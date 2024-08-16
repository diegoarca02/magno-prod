import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GLOBAL } from "./GLOBAL";

@Injectable({
  providedIn: 'root'
})
export class SettinsService {

  public url = GLOBAL.url;

  constructor(
    private _http:HttpClient
  ) { 
    console.log(this.url);
    
  }


  create_almacen(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_almacen',data,{headers:headers});
  }

  get_almacenes(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_almacenes',{headers:headers});
  }

  delete_almacen(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_almacen/'+id,{headers:headers});
  }

  ///////////////////////////////////////////////////////////////////////////////////

  create_categoria(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_categoria',data,{headers:headers});
  }

  get_categorias(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_categorias',{headers:headers});
  }

  delete_categoria(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_categoria/'+id,{headers:headers});
  }

  update_categoria(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_categoria/'+id,data,{headers:headers});
  }

  set_status_categoria(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'set_status_categoria/'+id,data,{headers:headers});
  }
  
  ///////////////////////////////////////////////////////////////////////////////////

  create_composicion(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_composicion',data,{headers:headers});
  }

  get_composiciones(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_composiciones',{headers:headers});
  }

  delete_composicion_sett(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_composicion_sett/'+id,{headers:headers});
  }

   ///////////////////////////////////////////////////////////////////////////////////

  create_color(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_color',data,{headers:headers});
  }

  get_colores(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_colores',{headers:headers});
  }

  delete_color_sett(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_color_sett/'+id,{headers:headers});
  }

  ///////////////////////////////////////////////////////////////////////////////////

  create_talla(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_talla',data,{headers:headers});
  }

  get_tallas(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_tallas',{headers:headers});
  }

  delete_talla_sett(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_talla_sett/'+id,{headers:headers});
  }

  ///////////////////////////////////////////////////////////////////////////////////

  create_transporte(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_transporte',data,{headers:headers});
  }

  get_transportes(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_transportes',{headers:headers});
  }

  delete_transporte(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_transporte/'+id,{headers:headers});
  }
  ///////////////////////////////////////////////////////////////////////////////////+
  get_pesos(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_pesos',{headers:headers});
  }

  ///////////////////////////////////////////////////////////////////////////////////

  create_entidad(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_entidad',data,{headers:headers});
  }

  get_entidades(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_entidades',{headers:headers});
  }

  delete_entidad(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_entidad/'+id,{headers:headers});
  }

   ///////////////////////////////////////////////////////////////////////////////////

  create_longitud(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_longitud',data,{headers:headers});
  }

  get_longitudes(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_longitudes',{headers:headers});
  }

  delete_longitud(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_longitud/'+id,{headers:headers});
  }

  ///////////////////////////////////////////////////////////////////////////////////

  create_pago(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_pago',data,{headers:headers});
  }

  get_pagos(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_pagos',{headers:headers});
  }

  delete_pago(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_pago/'+id,{headers:headers});
  }

  ///////////////////////////////////////////////////////////////////////////////////

  create_envio(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_envio',data,{headers:headers});
  }

  get_envios(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_envios',{headers:headers});
  }

  delete_envio(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_envio/'+id,{headers:headers});
  }

  get_categoria(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_categoria/'+id,{headers:headers});
  }


}
