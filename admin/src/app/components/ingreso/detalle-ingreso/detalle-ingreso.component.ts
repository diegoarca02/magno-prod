import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
declare var $:any;
declare var toastr:any;
declare var KTApp:any;
import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-detalle-ingreso',
  templateUrl: './detalle-ingreso.component.html',
  styleUrls: ['./detalle-ingreso.component.css']
})
export class DetalleIngresoComponent implements OnInit {

  public token = localStorage.getItem('token');
  public id = '';
  public load_btn = false;
  public load_data = true;
  public data = false;

  public ingreso: any = {};
  public pedido: any = {};
  public detalles :Array<any> = [];
  public load_confirmacion = false;

  public nuevo_estado = '';
  public count_envio = 0;
  public resumen_ingreso :Array<any> = [];


  constructor(
    private _pedidoService:PedidoService,
    private _route:ActivatedRoute,
    private _router:Router
  ) {
    
   }

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
    this._pedidoService.get_ingreso(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data == undefined){
          this.data = false;
        }else{
          this.pedido = response.pedido;
          this.ingreso = response.ingreso;
          this.detalles = response.detalles;
          this.init_resumen_response();
          this.data = true;
        }
        this.load_data = false;
      }
    );
  }

  init_resumen_response(){
    let variaciones : any= [];
    this.resumen_ingreso = [];

    for(var item of this.detalles){
      if(variaciones.length == 0){
        variaciones.push({
          _id: item.producto_variacion._id,
          producto: item.producto.titulo,
          variacion_name: item.producto_variacion.variacion_name,
          color_name: item.producto_variacion.color_name,
          talla: item.producto_variacion.talla,
          tipo: item.producto_variacion.tipo,
          unidad: item.unidad,
          hxd: item.producto_variacion.hxd,
          precio:item.producto_variacion.precio_venta,
          detalles: [item]
        });
      }else{
        var variaciones_arr = variaciones.filter((subitem:any)=> subitem._id == item.producto_variacion._id);
        if(variaciones_arr.length >= 1){
          variaciones_arr[0].detalles.push(item);
        }else{
          variaciones.push({
            _id: item.producto_variacion._id,
            producto: item.producto.titulo,
            variacion_name: item.producto_variacion.variacion_name,
            color_name: item.producto_variacion.color_name,
            talla: item.producto_variacion.talla,
            tipo: item.producto_variacion.tipo,
            unidad: item.unidad,
            hxd: item.producto_variacion.hxd,
            precio:item.producto_variacion.precio_venta,
            detalles: [item]
          });
        }
      }
    }

    for(var variacion of variaciones){
      variacion.cantidades = 0;
      variacion.show = false;
    }

    for(var variacion of variaciones){
      for(var subitem of variacion.detalles){
        variacion.cantidades = variacion.cantidades + subitem.cantidad;
      }
    }
    console.log(variaciones);
    this.resumen_ingreso = variaciones;
  }

  setShow(idx:any){
    let item = this.resumen_ingreso[idx];

    if(item.show){
      this.resumen_ingreso[idx].show = false;
    }else{
      this.resumen_ingreso[idx].show = true;
    }
  }
}
