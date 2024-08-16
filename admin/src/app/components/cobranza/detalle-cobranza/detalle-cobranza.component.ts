import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
declare var $:any;

declare var toastr:any;

@Component({
  selector: 'app-detalle-cobranza',
  templateUrl: './detalle-cobranza.component.html',
  styleUrls: ['./detalle-cobranza.component.css']
})
export class DetalleCobranzaComponent implements OnInit {

  public token = localStorage.getItem('token');
  public cliente: any = {
  }
  public empresa: any = {
  }
  public id = '';
  public tipo = '';
  public load_data = true;
  public data = false;
  public option_menu = 1;
  public amplitud : any = {};
  public reduccion : any = {};
  public limit_days = '';
  public btn_credito = false;
  public historial : Array<any> = [];
  public solicitudes : Array<any> = [];
  public page = 1;
  public pageSize = 15;
  public pageSol = 1;
  public pageSizeSol = 15;

  public parameters = JSON.parse(localStorage.getItem('parameters')!);

  public permisos = {
    cobranza_tres: false,
    cobranza_cuatro : false,
    cobranza_cinco : false,
  }

  constructor(
    private _clienteService:ClienteService,
    private _router:Router,
    private _route:ActivatedRoute,
    private _adminService:AdministradorService
  ) { 
    for(var item of this.parameters){
      if(item.permiso == 'cobranza_tres'){
        this.permisos.cobranza_tres = true;
      }else if(item.permiso == 'cobranza_cuatro'){
        this.permisos.cobranza_cuatro = true;
      }else if(item.permiso == 'cobranza_cinco'){
        this.permisos.cobranza_cinco = true;
      }
    }
  }

  ngOnInit(): void {
    if(this.permisos.cobranza_tres){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.tipo = params['tipo'];
          this.init_datos();
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
    
  }


  init_datos(){
    this.load_data = true;
    this._clienteService.get_cliente_cobranza_admin(this.id,this.tipo,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data == undefined){
          this.data = false;
        }else{
          if(response.data.tipo == 'Cliente'){
            this.cliente = response.data;
            if(!this.cliente.limit_days) this.limit_days = this.cliente.cliente.limit_days;
          }
          else if(response.data.tipo == 'Empresa'){
            this.empresa = response.data;
            this.limit_days = this.empresa.limit_days;
            if(!this.empresa.limit_days) this.limit_days = this.empresa.empresa.limit_days;
          }
          this.historial = response.data.historial;
          this.solicitudes = response.data.solicitudes;
          this.data = true;
        }
        this.load_data = false;
        
      }
    );
  }

  update_credito(){
    if(!this.amplitud.monto){
      toastr.error("El monto del crédito es requerido.");
    }else{
      this.btn_credito = true;
      if(this.tipo == 'cliente'){
        this.amplitud.cliente = this.cliente.cliente._id;
        this.amplitud.tipo_usuario = 'Cliente';
        this.amplitud.estado = 'Aprobado';
      }else if(this.tipo == 'empresa'){
        this.amplitud.empresa_rs = this.empresa.empresa._id;
        this.amplitud.empresa = this.empresa.empresa.empresa._id;
        this.amplitud.tipo_usuario = 'Empresa';
        this.amplitud.estado = 'Aprobado';
      }
      this._clienteService.update_cliente_credito(this.amplitud,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Actualización completada.");
            $('#creditoModal').modal('hide');
            this.amplitud = {}
            this.init_datos();
          }else{
            toastr.error(response.message);
          }
          this.btn_credito = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          this.btn_credito = false;
        }
      );
    }
  }

  update_reduccion(){
    if(!this.reduccion.monto){
      toastr.error("El monto a reducir es requerida.");
    }else{
      this.btn_credito = true;
      if(this.tipo == 'cliente'){
        this.reduccion.cliente = this.cliente.cliente._id;
        this.reduccion.tipo_usuario = 'Cliente';
        this.reduccion.estado = 'Aprobado';
      }else if(this.tipo == 'empresa'){
        this.reduccion.empresa_rs = this.empresa.empresa._id;
        this.reduccion.empresa = this.empresa.empresa.empresa._id;
        this.reduccion.tipo_usuario = 'Empresa';
        this.reduccion.estado = 'Aprobado';
      }
      this._clienteService.update_reduccion_cliente_credito(this.reduccion,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Actualización completada.");
            $('#reducirModal').modal('hide');
            this.reduccion = {}
            this.init_datos();
          }else{
            toastr.error(response.message);
          }
          this.btn_credito = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          this.btn_credito = false;
        }
      );
    }
  }

  update_tiempo(){
    if(!this.limit_days){
      toastr.error("Seleccione el tiempo de crédito.");
    }else{
      let estado = '';
      if(this.tipo == 'cliente') estado = 'Cliente';
      if(this.tipo == 'empresa') estado = 'Empresa';
      this.btn_credito = true;
      this._clienteService.update_tiempo_credito_cliente(this.id,estado,this.limit_days,this.token).subscribe(
        response=>{
          toastr.error("Actualización completa.");
          $('#diasModal').modal('hide');
          this.init_datos();
          this.option_menu = 1;
          this.btn_credito = false;
        }
      );
    }
  }

  set_solicitud(id:any,estado:any){
    this.btn_credito = true;
    this._clienteService.set_solicitud_credito(id,estado,this.token).subscribe(
      response=>{
        toastr.success("Actualización completa.");
        $('#solicitudModal-'+id).modal('hide');
        this.init_datos();
        this.option_menu = 1;
        this.btn_credito = false;
      }
    );
  }
}
