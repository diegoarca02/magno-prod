import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var $:any;

declare var toastr:any;

@Component({
  selector: 'app-credito-clientes',
  templateUrl: './credito-clientes.component.html',
  styleUrls: ['./credito-clientes.component.css']
})
export class CreditoClientesComponent implements OnInit {

  public token = localStorage.getItem('token');
  public id = '';
  public creditos :Array<any> = [];
  public load_creditos = true;
  public amplitud : any = {};
  public reduccion : any = {};
  public btn_credito = false;

  constructor(
    private _clienteService:ClienteService,
    private _router:Router,
    private _route:ActivatedRoute,
    private _adminService:AdministradorService
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
        this.init_datos();
      }
    );
  }

  init_datos(){
    this.load_creditos = true;
    this._clienteService.get_creditos_cliente(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        this.creditos = response.data;
        this.load_creditos = false;
      }
    );
  }

  update_credito(){
    if(!this.amplitud.monto){
      toastr.error("El monto del crédito es requerido.");
    }else{
      this.btn_credito = true;
      this.amplitud.cliente = this.id;
      this.amplitud.tipo_usuario = 'Cliente';
      this.amplitud.estado = 'Aprobado';
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
      this.reduccion.cliente = this.id;
      this.reduccion.tipo_usuario = 'Cliente';
      this.reduccion.estado = 'Aprobado';
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
}
