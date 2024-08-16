import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InformeService } from 'src/app/services/informe.service';

@Component({
  selector: 'app-pedidos-inventario',
  templateUrl: './pedidos-inventario.component.html',
  styleUrls: ['./pedidos-inventario.component.css']
})
export class PedidosInventarioComponent implements OnInit {

  public id = '';
  public data : any = {};
  public producto : any = {};
  public token = localStorage.getItem('token');

  constructor(
    private _informeService:InformeService,
    private _route:ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
        this.init_data();
      }
    );
    
  }

  init_data(){
    this._informeService.inf_pedidos(this.id,this.token).subscribe(
      response=>{
        this.producto = response.producto;
        this.data = response.data;
      }
    );
  }
}
