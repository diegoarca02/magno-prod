import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var $:any;

declare var toastr:any;

@Component({
  selector: 'app-solicitud-clientes',
  templateUrl: './solicitud-clientes.component.html',
  styleUrls: ['./solicitud-clientes.component.css']
})
export class SolicitudClientesComponent implements OnInit {

  public token = localStorage.getItem('token');
  public id = '';
  public solicitudes :Array<any> = [];
  public load_solicitudes = true;
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
    this.load_solicitudes = true;
    this._clienteService.get_solicitudes_cliente(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        this.solicitudes = response.data;
        this.load_solicitudes = false;
      }
    );
  }

  set_solicitud(id:any,estado:any){
    this.btn_credito = true;
    this._clienteService.set_solicitud_credito(id,estado,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          toastr.success("Actualización completa.");
          if(estado == 'Denegar') $('#solicitudDenegarModal-'+id).modal('hide');
          else if(estado == 'Confirmar') $('#solicitudAprobarModal-'+id).modal('hide');
          this.init_datos();
          this._clienteService.eventToClientCredito();
        }
        this.btn_credito = false;
      }
    );
  }
}
