
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GENERAL } from 'src/app/services/GENERAL';
import { PedidoService } from 'src/app/services/pedido.service';
import { SettinsService } from 'src/app/services/settins.service';
declare var $:any;
declare var toastr:any;

@Component({
  selector: 'app-create-ingreso',
  templateUrl: './create-ingreso.component.html',
  styleUrls: ['./create-ingreso.component.css']
})
export class CreateIngresoComponent implements OnInit {

  public token = localStorage.getItem('token');
  public load_btn = false;
  public pedido : any = {};
  public envios : Array<any> = [];
  public detalles : Array<any> = [];
  public detalles_ingreso : Array<any> = [];
  public detalle_selected : any = {};
  public filtro_pedido = '';
  public load_detalles = false;

  public ingreso : any = {
    unidad: 'Mtr',
    tipo: 'Tela',
    almacen: '',
    tipo_registro: ''
  };

  public detalle : any = {
    cantidad: '',
    codigo: ''
  }
  public producto: any = {};
  public producto_variacion: any = {};

  public cantidad = 0;

  public almacenes : Array<any> = [];
  public variaciones :Array<any> = [];
  public variacion_active = '';
  public arr_variaciones : Array<any> = [];

  public pedido_active = '';
  public arr_pedidos : Array<any> = [];
  public permisos : Array<any> = [];

  constructor(
    private _pedidoService:PedidoService,
    private _settingsService:SettinsService,
    private _router:Router,
    private _route:ActivatedRoute
  ) { 
    for(var item of GENERAL.almacenes){
      this.almacenes.push(item.name);
    }
  }


  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('7001')){
      this._route.queryParams.subscribe(
        params=>{
          if(params['envio']){
            this.select_envio(params['envio']);
          }
        }
      );
  
      this.init_envios();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }
  
  
  ngOnInit(): void {
  }

  init_envios(){
    this._pedidoService.get_envios_pedido(this.token).subscribe(
      response=>{
        this.envios = response.data;
        console.log(this.envios);
      }
    );
  }

  select_envio(id:any){
    this.load_detalles = true;
    this.setTipo();
    this._pedidoService.get_envio_pedido(id,this.token).subscribe(
      response=>{
        this.ingreso.pedido_envio = id;
        this.detalles = response.data;
        console.log(this.detalles);
        
        this.pedido_active = this.detalles[0]._id;
        this.arr_pedidos = [];
        for(var item of this.detalles){
          item.porcentaje = 0;
          this.arr_pedidos.push({
            producto: item.producto.titulo,
            hxd: item.producto_variacion.hxd,
            pedido: item._id,
            variante: item.producto_variacion.variacion_name,
            unidades: [],
            cantidad: 0,
          });
        }

        
        if(this.ingreso.tipo == 'Tela'){
          this.ingreso.unidad = 'Mtr';
        }else if(this.ingreso.tipo == 'Ropa'){
          this.ingreso.unidad = 'Unid';
        }else if(this.ingreso.tipo == 'Acero'){
          this.ingreso.unidad = 'Kg';
        }
     
        $('#modalEnvios').modal('hide');
        this.load_detalles = false;
      }
    );
  } 

  select_detalle(item:any){
    if(item.cupon){
      this.ingreso.cupon = item.cupon._id;
    }else{
      delete this.ingreso.cupon;
    } 
    this.detalle_selected = item;
    this.ingreso.pedido_detalle = item._id;
    this.ingreso.unidad = item.unidad;
    if(item.pedido_programacion) this.ingreso.pedido_programacion = item.pedido_programacion._id;
    this.producto = item.producto;
    this.producto_variacion = item.producto_variacion;
    console.log(item);
  }

  agregar_detalle(){
    if(!this.ingreso.pedido_envio){
      toastr.error("Seleccione el envío.");
    }else if(!this.ingreso.pedido_detalle){
      toastr.error("Seleccione el detalle de pedido.");
    }else if(!this.detalle.cantidad){
      toastr.error("La cantidad es requerida.");
    }else if(this.detalle.cantidad <= 0){
      toastr.error("La cantidad no puede ser negativa.");
    }else{
     console.log(this.detalle); 
      let str_almacen = this.ingreso.almacen.replace(/ /g, "").substr(0,3);
      let str_producto = this.producto.titulo.trim().substr(0,3);
      let str_variacion_name = this.producto_variacion.variacion_name.trim().substr(0,3);
      let str_cantidad = parseInt(this.detalle.cantidad);
      let str_index = this.detalles_ingreso.length+1;

      this.detalle.codigo = str_almacen+''+str_producto+''+str_variacion_name+''+str_cantidad+''+str_index +''+ this.getRandomArbitrary(100,999);
      this.cantidad = this.cantidad + parseFloat(this.detalle.cantidad);

      //
      this.detalle.pedido_envio = this.ingreso.pedido_envio;
      this.detalle.pedido = this.detalle_selected.pedido._id;
      this.detalle.pedido_detalle = this.detalle_selected._id;
      this.detalle.producto = this.producto._id;
      this.detalle.producto_variacion = this.producto_variacion._id;
      this.detalle.color = this.producto_variacion.color;
      this.detalle.producto_titulo = this.producto.titulo;
      this.detalle.hxd = this.producto_variacion.hxd;
      
      for(var item of this.arr_pedidos){
        if(item.pedido == this.detalle.pedido_detalle){
          
          item.cantidad = item.cantidad + this.detalle.cantidad;
          item.unidades.unshift(this.detalle);
        }
      }

      console.log(this.arr_pedidos);
      

      //ESTABLECER DETALLE ACTIVE
      this.pedido_active = this.detalle.pedido_detalle;
      let porcentaje = (this.detalle.cantidad/this.detalle_selected.cantidad)*100;
      for(var item of this.detalles){
        if(item._id == this.detalle_selected._id){
          item.porcentaje = item.porcentaje + porcentaje;
        }
        if(item.porcentaje >= 100){
          item.complete = true;
        }
      }
      this.detalle = {
        cantidad: '',
        codigo: ''
      }

    }
  }

  getRandomArbitrary(min:any, max:any) {
    console.log(Math.round(Math.random() * (max - min) + min));
    return Math.round(Math.random() * (max - min) + min);
  }

  validate(){

    //PREPARAR DETALLES
    this.detalles_ingreso = [];
    for(var item of this.arr_pedidos){
      for(var subitem of item.unidades){
        subitem.unidad = this.ingreso.unidad;
        subitem.tipo = this.ingreso.tipo;
        this.detalles_ingreso.push(subitem);
      }
    }


    let ingreso : any = {
      pedido : this.ingreso.pedido,
      almacen: this.ingreso.almacen,
      unidades: this.detalles_ingreso.length,
      cantidad: this.cantidad,
      unidad: this.ingreso.unidad,
      detalles: this.detalles_ingreso,
      arr_pedidos: this.arr_pedidos,
      pedido_envio: this.ingreso.pedido_envio
    }

    if(this.ingreso.cupon){
      ingreso.cupon = this.ingreso.cupon;
    }else{
      delete ingreso.cupon;
    }

    if(!this.ingreso.pedido_envio){
      toastr.error("Seleccione el envío.");
    }else if(!this.ingreso.almacen){
      toastr.error("El almacén es requerido.");
    }else if(ingreso.detalles.length == 0){
      toastr.error("El conteo de productos está vacio.");
    }else{
      this.load_btn = true;
      console.log(ingreso);
      this._pedidoService.create_ingreso(ingreso,this.token).subscribe(
        response=>{
          console.log(response);
          toastr.success("Ingreso creado.");
          this._router.navigate(['/ingresos/detail',response.data._id]);
          $('#confirmarModal').modal('hide');
          this.load_btn = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          $('#confirmarModal').modal('hide');
          this.load_btn = false;
        }
      );
    }
  }

  remove_detalle(idx1:any,idx2:any,cantidad:any){
    this.cantidad = 0;
    this.arr_pedidos[idx1].unidades.splice(idx2,1);

    for(let item of this.arr_pedidos){
      let cantidad = 0;
      for(let subitem of item.unidades){
        cantidad = cantidad + subitem.cantidad;
        this.cantidad =  this.cantidad + subitem.cantidad;
      }
      item.cantidad = cantidad;
    }

    let total = 0;
    for(let item of this.arr_pedidos[idx1].unidades){
      total = total + item.cantidad;
    }
    for(var item of this.detalles){
      if(item._id == this.arr_pedidos[idx1].pedido){
        let total = 0;
        for(var subitem of this.arr_pedidos[idx1].unidades){
          total = total + subitem.cantidad;
        }
        let porcentaje = (total/item.cantidad)*100;
        item.porcentaje = porcentaje;
      }

      if(item.porcentaje >= 100){
        item.complete = true;
      }
    }
  }

  setTipo(){
    this.cantidad = 0;
    this.variaciones = [];
    this.variacion_active = '';
    this.producto_variacion = {};
    this.arr_variaciones = [];
    this.detalles = [];
  }
}
