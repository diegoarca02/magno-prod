import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GLOBAL } from "./GLOBAL";
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService {

  public url = GLOBAL.url;

  constructor(
    private _http:HttpClient
  ) { 
    console.log(this.url);
    
  }

  create_colaborador(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_colaborador',data,{headers:headers});
  }

  update_permiso_colaborador(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'update_permiso_colaborador',data,{headers:headers});
  }

  create_colaborador_public(data:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.post(this.url+'create_colaborador_public',data,{headers:headers});
  }

  create_colaborador_google(data:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.post(this.url+'create_colaborador_google',data,{headers:headers});
  }
  
  LoginWithGoogle(credentials: string): Observable<any> {
    const header = new HttpHeaders().set('Content-type', 'application/json');
    return this._http.post(this.url + "LoginWithGoogle", JSON.stringify(credentials), { headers: header, withCredentials: true });
  }

  update_colaborador(data:any,id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_colaborador/'+id,data,{headers:headers});
  }

  update_colaborador_modal(data:any,id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_colaborador_modal/'+id,data,{headers:headers});
  }

  actualizar_avatar_colaborador(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Authorization':token});
    const fd = new FormData();
    fd.append('files[]',data.avatar);
    return this._http.post(this.url+'actualizar_avatar_colaborador',fd,{headers:headers});
  }

  update_password(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_password/'+id,data,{headers:headers});
  }

  reset_colaborador_password(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'reset_colaborador_password/'+id,{headers:headers});
  }

  obtener_permisos_colaborador(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'obtener_permisos_colaborador/'+id,{headers:headers});
  }

  update_remuneracion_colaborador(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_remuneracion_colaborador/'+id,data,{headers:headers});
  }

  update_acceso_colaborador(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_acceso_colaborador/'+id,data,{headers:headers});
  }

  set_status_colaborador(data:any,id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'set_status_colaborador/'+id,data,{headers:headers});
  }

  get_colaboradores_admin(filtro:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_colaboradores_admin/'+filtro,{headers:headers});
  }

  get_colaboradores_cliente_admin(filtro:any,id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_colaboradores_cliente_admin/'+filtro+'/'+id,{headers:headers});
  }

  get_colaborador_admin(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_colaborador_admin/'+id,{headers:headers});
  }

  signin_colaborador(data:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.post(this.url+'signin_colaborador',data,{headers:headers});
  }

  reenviar_codigo_login(id:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'reenviar_codigo_login/'+id,{headers:headers});
  }

  validar_codigo_colaborador(data:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.post(this.url+'validar_codigo_colaborador',data,{headers:headers});
  }

  verify_token(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'verify_token',{headers:headers});
  }

  obtener_tareas_colaborador(periodo:any,estado:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'obtener_tareas_colaborador/'+periodo+'/'+estado,{headers:headers});
  }

  cancelar_tarea_colaborador(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'cancelar_tarea_colaborador/'+id,{headers:headers});
  }

  crear_tarea_colaborador(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'crear_tarea_colaborador',data,{headers:headers});
  }

  marcar_tarea_colaborador(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'marcar_tarea_colaborador/'+id,{headers:headers});
  }

  posponer_tarea_colaborador(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'posponer_tarea_colaborador/'+id,data,{headers:headers});
  }

  obtener_tareas_pendientes_colaborador(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'obtener_tareas_pendientes_colaborador',{headers:headers});
  }

  isAuthenticate(){
    const token : any = localStorage.getItem('token');

    try {
      const helper = new JwtHelperService();
      var decodedToken = helper.decodeToken(token);

      if(!token){
        localStorage.removeItem('parameters');
        return false;
      }

      if(!decodedToken){
        localStorage.removeItem('user_data');
        return false;
      }

      if(helper.isTokenExpired(token)){
        localStorage.removeItem('token');
        return false;
      }

    } catch (error) {
      localStorage.removeItem('_id');
      return false;
    }

    return true;
  }
}
