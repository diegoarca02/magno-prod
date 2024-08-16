import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GLOBAL } from "./GLOBAL";


@Injectable({
  providedIn: 'root'
})
export class KpiService {

  public url = GLOBAL.url;

  constructor(
    private _http:HttpClient
  ) { 
    console.log(this.url);
    
  }

  get_cobranza_semanal(month:any,year:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_cobranza_semanal/'+month+'/'+year,{headers:headers});
  }

  get_cobranza_cliente(inicio:any,hasta:any,cliente:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_cobranza_cliente/'+inicio+'/'+hasta+'/'+cliente,{headers:headers});
  }

  get_cobranza_million(inicio:any,hasta:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_cobranza_million/'+inicio+'/'+hasta,{headers:headers});
  }


  get_pagos_mensuales_cliente(year:any,month:any,cliente:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_pagos_mensuales_cliente/'+year+'/'+month+'/'+cliente,{headers:headers});
  }

  get_ventas_productos(inicio:any,hasta:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ventas_productos/'+inicio+'/'+hasta,{headers:headers});
  }

  get_pagos_productos(inicio:any,hasta:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_pagos_productos/'+inicio+'/'+hasta,{headers:headers});
  }

  get_pagos_agente(inicio:any,hasta:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_pagos_agente/'+inicio+'/'+hasta,{headers:headers});
  }

  get_ventas_agente(inicio:any,hasta:any,token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
    return this._http.get(this.url+'get_ventas_agente/'+inicio+'/'+hasta,{headers:headers});
  }
}
