import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var $:any;

declare var toastr:any;

@Component({
  selector: 'app-pagos-clientes',
  templateUrl: './pagos-clientes.component.html',
  styleUrls: ['./pagos-clientes.component.css']
})
export class PagosClientesComponent implements OnInit {

  public token = localStorage.getItem('token');
  public id = '';
  public transacciones :Array<any> = [];
  public load_transacciones = true;

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
    this.load_transacciones = true;
    this._clienteService.get_pagos_clientes(this.id,this.token).subscribe(
      response=>{
        this.transacciones = response.data;
        console.log(response);
        this.load_transacciones = false;
      }
    );
  }
}
