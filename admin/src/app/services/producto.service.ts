import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GLOBAL } from "./GLOBAL";

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  public url = GLOBAL.url;

  constructor(
    private _http:HttpClient
  ) { 
    console.log(this.url);
    
  }

  create_producto(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    const fd = new FormData();
    fd.append('titulo',data.titulo);
    fd.append('tipo',data.tipo);
    fd.append('categoria',data.categoria);
    fd.append('subcategoria',data.subcategoria);
    fd.append('descripcion',data.descripcion);
    fd.append('estado',data.estado);
    fd.append('genero',data.genero);
    fd.append('cantidad_contenedor',data.cantidad_contenedor);
    fd.append('composiciones',JSON.stringify(data.composiciones));
    fd.append('titulos',JSON.stringify(data.titulos));
    fd.append('variaciones',JSON.stringify(data.variaciones));
    data.galeria.unshift({
      file:data.portada,
      titulo:'Portada'
    });
    if(data.galeria.length >= 1){
      fd.append('galeria',JSON.stringify(data.galeria));
      data.galeria.forEach((file:any) => { fd.append('files[]', file.file); });
    }
    console.log(fd);
    
    
    return this._http.post(this.url+'create_producto',fd,{headers:headers});
  }

  create_ropa(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    const fd = new FormData();
    fd.append('titulo',data.titulo);
    fd.append('tipo',data.tipo);
    fd.append('portada',data.portada);
    fd.append('categoria',data.categoria);
    fd.append('subcategoria',data.subcategoria);
    fd.append('descripcion',data.descripcion);
    fd.append('etiquetas',JSON.stringify(data.etiquetas));
    fd.append('estado',data.estado);
    fd.append('genero',data.genero);
    fd.append('composiciones',JSON.stringify(data.composiciones));
    fd.append('titulos',JSON.stringify(data.titulos));
    fd.append('variaciones',JSON.stringify(data.variaciones));
    if(data.galeria.length >= 1){
      fd.append('galeria',JSON.stringify(data.galeria));
      data.galeria.forEach((file:any) => { fd.append('files[]', file.file); });
    }
    
    return this._http.post(this.url+'create_ropa',fd,{headers:headers});
  }

  get_productos(filtro:any,page:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_productos/'+filtro+'/'+page,{headers:headers});
  }

  get_productos_papelera(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_productos_papelera/'+filtro,{headers:headers});
  }

  get_ropas(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ropas/'+filtro,{headers:headers});
  }

  get_productos_programaciones(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_productos_programaciones/'+filtro,{headers:headers});
  }

  get_productos_programaciones_ropas(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_productos_programaciones_ropas/'+filtro,{headers:headers});
  }

  get_productos_ventas(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_productos_ventas/'+filtro,{headers:headers});
  }

  get_productos_ventas_con_precios(tipo:any,filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_productos_ventas_con_precios/'+tipo+'/'+filtro,{headers:headers});
  }

  get_producto_ventas_con_precios(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_producto_ventas_con_precios/'+id,{headers:headers});
  }

  get_productos_ropas(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_productos_ropas/'+filtro,{headers:headers});
  }

  get_producto(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_producto/'+id,{headers:headers});
  }

  get_programaciones_producto(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_programaciones_producto/'+id,{headers:headers});
  }
  

  update_sku_color(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'update_sku_color/'+id,{headers:headers});
  }

  get_producto_composiciones(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_producto_composiciones/'+id,{headers:headers});
  }

  get_producto_titulos(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_producto_titulos/'+id,{headers:headers});
  }

  get_producto_etiquetas(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_producto_etiquetas/'+id,{headers:headers});
  }

  get_producto_variaciones(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_producto_variaciones/'+id,{headers:headers});
  }

  get_producto_imagenes(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_producto_imagenes/'+id,{headers:headers});
  }

  add_composicion(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'add_composicion',data,{headers:headers});
  }

  add_variacion(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'add_variacion',data,{headers:headers});
  }

  get_productos_filter_advanced(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'get_productos_filter_advanced',data,{headers:headers});
  }

  duplicar_producto(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'duplicar_producto/'+id,{headers:headers});
  }

  update_producto(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    if(data.portada != undefined){
      const fd = new FormData();
      fd.append('titulo',data.titulo);
      fd.append('tipo',data.tipo);
      fd.append('portada',data.portada);
      fd.append('categoria',data.categoria);
      fd.append('descripcion',data.descripcion);
      fd.append('cantidad_contenedor',data.cantidad_contenedor);
      fd.append('estado',data.estado);
      fd.append('genero',data.genero);
      return this._http.put(this.url+'update_producto/'+id,fd,{headers:headers});
    }else{
      let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
      return this._http.put(this.url+'update_producto/'+id,data,{headers:headers});
    }
  }

  get_Composiciones():Observable<any>{
    return this._http.get('./assets/composiciones.json');
  }

  get_Categorias():Observable<any>{
    return this._http.get('./assets/categorias.json');
  }
  
  update_precio_producto_color(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_precio_producto_color/'+id,data,{headers:headers});
  }

  delete_variacion(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'delete_variacion/'+id,{headers:headers});
  }

  update_precio_ropa_variacion(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_precio_ropa_variacion/'+id,data,{headers:headers});
  }

  get_ropa_tallas(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ropa_tallas/'+id,{headers:headers});
  }

  update_precio_global_color(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_precio_global_color/'+id,data,{headers:headers});
  }

  update_valores_producto_color(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_valores_producto_color/'+id,data,{headers:headers});
  }

  update_valores_ropa_variacion(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_valores_ropa_variacion/'+id,data,{headers:headers});
  }

  delete_composicion(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_composicion/'+id,{headers:headers});
  }
  
  add_titulo(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'add_titulo',data,{headers:headers});
  }

  delete_titulo(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_titulo/'+id,{headers:headers});
  }
  
  add_etiqueta(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'add_etiqueta',data,{headers:headers});
  }

  add_etiqueta_color(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'add_etiqueta_color',data,{headers:headers});
  }

  get_colores_ropas(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_colores_ropas',{headers:headers});
  }

  delete_etiqueta(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_etiqueta/'+id,{headers:headers});
  }

  delete_etiqueta_color(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_etiqueta_color/'+id,{headers:headers});
  }

  create_color_producto(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_color_producto',data,{headers:headers});
  }

  set_estado_variacion(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'set_estado_variacion/'+id,data,{headers:headers});
  }

  edit_color(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'edit_color/'+id,data,{headers:headers});
  }

  add_imagen(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    const fd = new FormData();
    fd.append('titulo',data.titulo);
    fd.append('producto',data.producto);
    fd.append('files[]',data.imagen);
    return this._http.post(this.url+'add_imagen',fd,{headers:headers});
  }

  delete_imagen(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.delete(this.url+'delete_imagen/'+id,{headers:headers});
  }

  get_productos_cantidades(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_productos_cantidades/'+filtro,{headers:headers});
  }

  get_ropas_cantidades(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ropas_cantidades/'+filtro,{headers:headers});
  }

  get_productos_cantidades_filter_advanced(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'get_productos_cantidades_filter_advanced',data,{headers:headers});
  }

  delete_producto(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'delete_producto/'+id,{headers:headers});
  }

  importar_productos(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'importar_productos',data,{headers:headers});
  }

  importar_colores(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'importar_colores',data,{headers:headers});
  }

  importar_rollos(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'importar_rollos',data,{headers:headers});
  }

  update_cantidad_contenedor(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_cantidad_contenedor/'+id,data,{headers:headers});
  }
}
