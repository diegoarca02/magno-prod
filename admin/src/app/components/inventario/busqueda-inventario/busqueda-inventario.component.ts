import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
declare var $:any;
declare var toastr:any;

@Component({
  selector: 'app-busqueda-inventario',
  templateUrl: './busqueda-inventario.component.html',
  styleUrls: ['./busqueda-inventario.component.css']
})
export class BusquedaInventarioComponent implements OnInit {

  
  public token = localStorage.getItem('token');
  public id = '';
  public periodo = '';
  public filtro_producto = '';
  public load_productos = true;
  public data = true;
  public colores :Array<any> = [];
  public productos :Array<any> = [];
  public rollos :Array<any> = [];
  public rollos_const:Array<any> = [];
  public almacenes :Array<any> = [];
  public color: any = {};
  public total_yardas = 0;
  public metro_to_yrd = 1.09361;
  public load_rollos = false;
  public page = 1;
  public pageSize = 24;
  public url = GLOBAL.url;

  public producto_id = '';
  public producto_color_id = '';

  constructor(
    private _productoService:ProductoService,
    private _router:Router
  ) { 
    let today = new Date();
    let month :any = today.getMonth()+1;
    if(month<=9) month = '0'+month;
    this.periodo = today.getFullYear() +'-'+month;
  }

  ngOnInit(): void {
    this.init_productos('Todos');
  }

  search_productos(){
    if(this.filtro_producto){
      this.init_productos(this.filtro_producto);
    }else{
      this.init_productos('Todos');
    }
  }

  init_productos(filtro:any){
    this.load_productos = true;
    this._productoService.get_productos_ventas(filtro,this.token).subscribe(
      response=>{
        this.productos = response.data;
        this.load_productos = false;
      }
    );
  }

  selected_producto(item:any){
    $('#str_producto').val(item.producto.titulo);
    this.producto_id = item.producto._id;
    this.colores = item.colores;
  }

  
  selected_color(item:any){
    this.producto_id = item.producto._id;
    this.producto_color_id = item._id;
    setTimeout(() => {
      $("#radio-color-"+this.producto_color_id).prop("checked", true);
    }, 50);
  }

  buscar(){
    if(!this.periodo){
      toastr.error("El periodo es requerido");
    }else if(!this.producto_color_id){
      toastr.error("El color es requerido");
    }else{
      this._router.navigate(['/inventario/historial/'+this.producto_color_id+'/'+this.periodo]);
    } 
  }

}
