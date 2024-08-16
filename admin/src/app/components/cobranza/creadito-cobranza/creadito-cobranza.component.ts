import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
declare var toastr:any;
declare var $:any;

@Component({
  selector: 'app-creadito-cobranza',
  templateUrl: './creadito-cobranza.component.html',
  styleUrls: ['./creadito-cobranza.component.css']
})
export class CreaditoCobranzaComponent implements OnInit {

  public token = localStorage.getItem('token');
  public clientes :Array<any> = [];
  public filtro_cliente = '';
  public load_data = true;
  public load_btn = false;
  public page = 1;
  public pageSize = 24;
  public btn_credito = false;

  public credito : any = {
    _id: '',
    limit_days: '',
    limit_credito: ''
  }

  public parameters = JSON.parse(localStorage.getItem('parameters')!);

  public permisos = {
    cobranza_dos : false,
    cobranza_cuatro : false,
    cobranza_cinco : false,
  }

  constructor(
    private _clienteService:ClienteService,
    private _router:Router,
    private _route:ActivatedRoute
  ) { 
    for(var item of this.parameters){
      if(item.permiso == 'cobranza_dos'){
        this.permisos.cobranza_dos = true;
      }else if(item.permiso == 'cobranza_cuatro'){
        this.permisos.cobranza_cuatro = true;
      }else if(item.permiso == 'cobranza_cinco'){
        this.permisos.cobranza_cinco = true;
      }
    }
  }

  ngOnInit(): void {
    if(this.permisos.cobranza_dos){
      this._route.queryParams.subscribe(
        (params: any)=>{
          this.filtro_cliente = params.filtro;
          if(this.filtro_cliente){
            this.init_clientes();
          }else{
            this.init_todos();
          }
        }
      )
    }else{
      this._router.navigate(['/dashboard']);
    }
    
  }

  init_clientes(){
    if(this.filtro_cliente){
      if(this.filtro_cliente.length >= 3){
        this.load_data = true;
        this._clienteService.get_empresa_clientes_todos(this.filtro_cliente,this.token).subscribe(
          response=>{
            this.clientes = response.data;
            
            
            this.load_data = false;
          }
        );
      }
    }else{
      this.clientes = [];
    }
  }

  init_todos(){
    this.load_data = true;
    this._clienteService.get_empresa_clientes_todos('Todos',this.token).subscribe(
      response=>{
        this.clientes = response.data;
        console.log( this.clientes);
        this.load_data = false;
      }
    );
  }

  selected_cliente(item:any){
    if(item.tipo == 'Cliente'){
      this.credito = {
        _id: item.cliente._id,
        tipo: 'Cliente',
        limit_days: item.cliente.limit_days,
        limit_credito: item.cliente.limit_credito
      } 
    }else if(item.tipo == 'Empresa'){
      this.credito = {
        _id: item.empresa._id,
        tipo: 'Empresa',
        limit_days: item.empresa.limit_days,
        limit_credito: item.empresa.limit_credito
      } 
    }
  }

  filtro_func():any{
    if(this.filtro_cliente){
      this._router.navigate(['/cobranzas/creditos'], { queryParams: { filtro: this.filtro_cliente } });
    }else{
      this._router.navigate(['/cobranzas/creditos']);
    }
  }


  update(){
    
  }

}
