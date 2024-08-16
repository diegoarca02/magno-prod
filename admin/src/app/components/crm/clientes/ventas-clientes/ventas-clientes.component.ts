import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-ventas-clientes',
  templateUrl: './ventas-clientes.component.html',
  styleUrls: ['./ventas-clientes.component.css']
})
export class VentasClientesComponent implements OnInit {

  public load_ventas= false;
  public token = localStorage.getItem('token');
  public id = '';
  public ventas :Array<any> = [];

  constructor(
    private _clienteService:ClienteService,
    private _router:Router,
    private _route:ActivatedRoute,
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
    this.load_ventas = true;
    this._clienteService.get_ventas_clientes(this.id,this.token).subscribe(
      response=>{
        this.ventas = response.data;
        console.log(this.ventas);
        this.load_ventas = false;
      }
    );
  }

}
