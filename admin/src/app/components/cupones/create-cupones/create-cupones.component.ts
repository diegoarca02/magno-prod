import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
import { VentaService } from 'src/app/services/venta.service';
declare var $:any;
declare var toastr:any;

@Component({
  selector: 'app-create-cupones',
  templateUrl: './create-cupones.component.html',
  styleUrls: ['./create-cupones.component.css']
})
export class CreateCuponesComponent implements OnInit {

  public cupon:any = {
    tipo_pago: '',
    tipo: '',
    descuento_credito: false,
  };
  public filtro_cliente = '';
  public load_clientes = false;
  public clientes : Array<any> = [];
  public token = localStorage.getItem('token');

  public url = GLOBAL.url;
  public load_productos = false;
  public load_ropas = false;
  public filtro_producto = '';
  public productos : Array<any> = [];
  public ropas : Array<any> = [];
  public colores : Array<any> = [];

  public cupon_compradores : Array<any> = [];
  public colores_cupon : Array<any> = [];
  public variaciones_cupon : Array<any> = [];
  
  public parameters = JSON.parse(localStorage.getItem('parameters')!);

  public permisos = {
    cupon_dos : false,
  }
  

  constructor(
    private _clienteService:ClienteService,
    private _productoService:ProductoService,
    private _ventaService:VentaService,
    private _router:Router
  ) { 
    for(var item of this.parameters){
      if(item.permiso == 'cupon_dos'){
        this.permisos.cupon_dos = true;
      }
    }
  }

  ngOnInit(): void {
    if(this.permisos.cupon_dos){
      this.generar_codigo();
      
    }else{
      this._router.navigate(['/dashboard']);
    }
 
  }

  init_clientes(){
    if(this.filtro_cliente.trim()){
      if(this.filtro_cliente.length >= 3){
        this.load_clientes = true;
        this._clienteService.get_empresa_clientes(this.filtro_cliente,this.token).subscribe(
          response=>{
            this.clientes = response.data;
            this.load_clientes = false;
          }
        );
      }
    }else{
      this.clientes = [];
    }
  }

  generar_codigo(){
    this.cupon.codigo = this.getRandomStrInclusive(2) +''+ this.getRandomIntInclusive(100000,9999999) +''+this.getRandomStrInclusive(2);
  }
  
  getRandomIntInclusive(min:any, max:any) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  getRandomStrInclusive(value:any) {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
    let posicionActual = caracteres.length;

    while (0 !== posicionActual) {
      const posicionAleatoria = Math.floor(Math.random() * posicionActual);
      posicionActual--;
      //"truco" para intercambiar los valores sin necesidad de una variable auxiliar
      [caracteres[posicionActual], caracteres[posicionAleatoria]] = [
        caracteres[posicionAleatoria], caracteres[posicionActual]];
    }
    return caracteres.slice(0,value).join("").toUpperCase();
  }

  select_cliente(item:any){
    let exist = this.cupon_compradores.filter(c_item=>c_item.cliente == item._id);
    if(exist.length == 0){
      this.cupon_compradores.push({
        tipo_usuario: 'Cliente natural',
        fullnames: item.nombres.split(' ')[0]+' '+item.apellidos.split(' ')[0],
        cliente: item._id
      });
    }
    
  }

  select_empresa(item:any){
    let exist = this.cupon_compradores.filter(c_item=>c_item.empresa_rs == item._id);
    if(exist.length == 0){
      this.cupon_compradores.push({
        tipo_usuario: 'Empresa',
        fullnames: item.razon_social,
        empresa_rs: item._id,
        empresa : item.empresa._id
      });
    }
  }

  remove_comprador(idx:any){
    this.cupon_compradores.splice(idx,1)
  }

  search_productos(){
    if(this.filtro_producto){
      this.init_productos(this.filtro_producto);
    }else{
      this.init_productos('Todos');
    }
  }


  //TELAS
  init_productos(filtro:any){
    this.load_productos = true;
    this._productoService.get_productos_ventas(filtro,this.token).subscribe(
      response=>{
        this.productos = response.data;
        this.load_productos = false;
      }
    );
  }

   //ROPAS
   init_ropas(filtro:any){
    this.load_ropas = true;
    this._productoService.get_productos_ropas(filtro,this.token).subscribe(
      response=>{
        this.ropas = response.data;
        this.load_ropas = false;
      }
    );
  }

  selected_producto(item:any){
    this.colores_cupon = [];
    $('#str_producto').val(item.producto.titulo);
    this.cupon.producto = item.producto._id;

    for(var subitem of item.colores){
      this.colores_cupon.push({
        variante: subitem.variante,
        producto_color: subitem._id,
        precio_venta: subitem.precio_venta,
        precio_ahora: 0,
        hxd: subitem.hxd,
      });
    }
  }

  selected_ropa(item:any){
    this.variaciones_cupon = [];
    $('#str_producto').val(item.producto.titulo);
    this.cupon.producto = item.producto._id;

    for(var subitem of item.variaciones){
      this.variaciones_cupon.push({
        talla: subitem.talla,
        color: subitem.color,
        ropa_variacion: subitem._id,
        precio_venta: subitem.precio_venta,
        precio_ahora: 0,
        hxd: subitem.hxd,
      });
    }
  }

  selected_color(item:any){
    this.colores_cupon = [];
    this.cupon.producto_color = item._id;
    this.cupon.precio = item.precio_venta;

    setTimeout(() => {
      $("#radio-color-"+this.cupon.producto_color).prop("checked", true);
    }, 50);

    this.colores_cupon.push({
      variante: item.variante,
      producto_color: item._id,
      precio_venta: item.precio_venta,
      precio_ahora: 0,
      hxd: item.hxd,
    });
  }

  remove_color(idx:any){
    this.colores_cupon.splice(idx,1);
  }

  remove_variacion(idx:any){
    this.variaciones_cupon.splice(idx,1);
  }

  create(){
    let error_validate = false;

    for(var item of this.colores_cupon){
      item.precio_ahora = item.precio_ahora.toString();
      if(!item.precio_ahora){
        error_validate = true;
      }else if(parseFloat(item.precio_ahora) < 0){
        error_validate = true;
      }
    }

   
    if(error_validate){
      toastr.error("Verificar los colores.");
    }else{
      if(!this.cupon.codigo){
        toastr.error("El cupón es requerido.");
      }else if(!this.cupon.tipo){
        toastr.error("El tipo de producto es requerido.");
      }else if(this.cupon_compradores.length == 0){
        toastr.error("Los clientes son requeridos.");
      }else if(!this.cupon.tipo_pago){
        toastr.error("El tipo de pago es requerido.");
      }else if(!this.cupon.producto){
        toastr.error("El producto es requerido.");
      }else{
        this.cupon.cupon_compradores = this.cupon_compradores;
        this.cupon.colores = this.colores_cupon;
        this.cupon.variaciones = this.variaciones_cupon;
        this._ventaService.create_cupon(this.cupon,this.token).subscribe(
          response=>{
            if(response.data != undefined){
              toastr.success('Cupón registrado');
              this._router.navigate(['/cupones']);
            }else{
              toastr.error(response.message);
            }
          }
        );
      }
    }
  }

  aplicar_todos_tela(price:any){
    if(this.colores_cupon.length >= 2){
      for(var item of this.colores_cupon){
        item.precio_ahora = price;
      }
    }
  }

  aplicar_todos_ropa(price:any){
    if(this.variaciones_cupon.length >= 2){
      for(var item of this.variaciones_cupon){
        item.precio_ahora = price;
      }
    }
  }

  setTipo(){
    if(this.cupon.tipo == 'Tela'){
      this.init_productos('Todos');
    }else if(this.cupon.tipo == 'Ropa'){
      this.init_ropas('Todos');
    }
  }
}
