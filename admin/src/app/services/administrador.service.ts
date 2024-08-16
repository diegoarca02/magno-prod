import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GLOBAL } from "./GLOBAL";
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {

  public url = GLOBAL.url;

  constructor(
    private _http:HttpClient
  ) { 
    console.log(this.url);
    
  }

  get_Permisos():Observable<any>{
    return this._http.get('./assets/permisos.json');
  }

  get_Codes():Observable<any>{
    return this._http.get('./assets/codes-phone.json');
  }

  create_rol(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_rol',data,{headers:headers});
  }

  get_roles(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_roles',{headers:headers});
  }

  get_only_roles(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_only_roles',{headers:headers});
  }

  get_rol(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_rol/'+id,{headers:headers});
  }

  update_permisos_rol(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_permisos_rol/'+id,data,{headers:headers});
  }

  get_agentes_admin(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_agentes_admin',{headers:headers});
  }

  edit_titulo_rol(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'edit_titulo_rol/'+id,data,{headers:headers});
  }

  delete_rol(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'delete_rol/'+id,{headers:headers});
  }
}
