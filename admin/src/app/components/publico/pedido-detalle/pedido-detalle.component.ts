import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
declare var $:any;
declare var toastr:any;
import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-pedido-detalle',
  templateUrl: './pedido-detalle.component.html',
  styleUrls: ['./pedido-detalle.component.css']
})
export class PedidoDetalleComponent implements OnInit {

  public token = localStorage.getItem('token');
  public id = '';
  public load_btn = false;
  public load_data = true;
  public data = false;

  public pedido: any = {};
  public detalles :Array<any> = [];

  constructor(
    private _pedidoService:PedidoService,
    private _route:ActivatedRoute,
    private _router:Router
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
    this.load_data = true;
    this._pedidoService.get_pedido_public(this.id).subscribe(
      response=>{
        console.log(response);
        
        if(response.data == undefined){
          this.data = false;
        }else{
          this.pedido = response.pedido;
          this.detalles = response.detalles;
          this.data = true;
        }
        this.load_data = false;
      }
    );
  }

  download(){
    try {
      var elm : any = document.getElementById('toPDF');
      domtoimage.toJpeg(elm, { quality: 0.95 })
      .then(function (dataUrl:any) {
          var link = document.createElement('a');
          link.download = new Date().getTime()+'.jpeg';
          link.href = dataUrl;
          link.click();
      });
    } catch (error) {
      console.log(error);
      
    }
  }

}
