import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  public url = GLOBAL.url;

  constructor(
    private _http:HttpClient
  ) { 
    console.log(this.url);
    
  }

  create_cuenta(data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.post(this.url+'create_cuenta',data,{headers:headers});
  }

  get_cuentas(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_cuentas',{headers:headers});
  }

  get_cuentas_destacadas(token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_cuentas_destacadas',{headers:headers});
  }

  get_cuenta(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_cuenta/'+id,{headers:headers});
  }

  get_transacciones_venta(id:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_transacciones_venta/'+id,{headers:headers});
  }

  update_cuenta(id:any,data:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.put(this.url+'update_cuenta/'+id,data,{headers:headers});
  }
}
