import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
import { SettinsService } from 'src/app/services/settins.service';
declare var toastr:any;
declare var $:any;
declare var KTApp:any;
import { io } from "socket.io-client";

@Component({
  selector: 'app-index-etiquetado',
  templateUrl: './index-etiquetado.component.html',
  styleUrls: ['./index-etiquetado.component.css']
})
export class IndexEtiquetadoComponent implements OnInit {

  public socket = io("http://localhost:4201",{transports: ['websocket']});
  public load_ropas = true;
  public load_data = true;
  public productos : Array<any> = [];
  public ropas : Array<any> = [];
  public token = localStorage.getItem('token');
  public filtro :any = '';
  public url = GLOBAL.url;

  public filter_estado = 'Todos';
  public filter_tipo = 'Todos'
  public filter_color = '';

  public composiciones_selected :Array<any> = [];
  public load_valores = false;
  public longitudes:Array<any> = [];

  public valor_min = '';
  public valor_max = '';
  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public metro_to_yrd = 1.09361;
  public periodo = '';

  public tipo_option = 'Telas';
  public today_now : any= new Date();
  public min_new_tag = GLOBAL.min_new_tag;
  public permisos : Array<any> = [];

  constructor(
    private _router:Router,
    private _route:ActivatedRoute,
    private _productoService:ProductoService,
    private _settingsService:SettinsService
  ) { 
    let today = new Date();
    let month :any = today.getMonth()+1;
    if(month<=9) month = '0'+month;
    this.periodo = today.getFullYear() +'-'+month;

  }

  ngOnInit(): void {

    this.socket.on('emit-create-producto',(data:any)=>{
      console.log(data);
      this.socket_init_todos();
      toastr.success('Nuevo producto ingresado.');     
    });
    
    this.tipo_option = 'Telas';
    this.init_todos();
  }

  handlePermisos(event:any){
    this.permisos = event;

    if(this.permisos.includes('3011')){
      this.load_data = true;
      this.filtro = '';
      this._productoService.get_productos_cantidades('Todos',this.token).subscribe(
        response=>{
          console.log(response);
          for(var item of response.data){
            item.visible = true;
            let create :any = new Date(item.producto.createdAt);
            item.producto.minutos_pasados = (this.today_now - create)/60000;
          }
          this.productos = response.data;
          this.load_data = false;
          console.log(this.productos);
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  init_todos(){
    
  }

  socket_init_todos(){
    this._productoService.get_productos_cantidades('Todos',this.token).subscribe(
      response=>{
        for(var item of response.data){
          let create :any = new Date(item.producto.createdAt);
          item.producto.minutos_pasados = (this.today_now - create)/60000;
        }
        this.productos = response.data;
        console.log(this.productos);
        
      }
    );
  }

  init_productos(){
    if(this.filtro){
      this.load_data = true;
      this._productoService.get_productos_cantidades(this.filtro,this.token).subscribe(
        response=>{
          this.productos = response.data;
          console.log(this.productos);

          this.load_data = false;
        }
      );
    }else{
      this.init_todos();
    }
  }

  show_detalles(idx:any){
    if(!this.productos[idx].visible){
      this.productos[idx].visible = true;
    }else{
      this.productos[idx].visible = false;
    } 
  }

  redirect_detail(id:any,tipo:any){
    this._router.navigate(['/inventario/detail/'+tipo+'/'+id]);
  }

  
  filter_advanced(){
    let data = {
      estado: this.filter_estado,
      tipo: this.filter_tipo,
      color: this.filter_color,
      composiciones: this.composiciones_selected
    };
    this._productoService.get_productos_cantidades_filter_advanced(data,this.token).subscribe(
      response=>{
        console.log(response);
        this.productos = response.data;
      }
    );
  }

  reset(){
    this.filter_estado = 'Todos';
    this.filter_tipo = 'Todos'
    this.filter_color = '';
    this.filtro = '';
    this.init_todos();
  }

  select_valor(item:any){
    this.valor_min = item.yrds_min;
    this.valor_max = item.yrds_max;
  }

  set_valores(idcolor:any){
    if(!this.valor_min){
      toastr.error('El valor mínimo es requerido.');
    }else if(!this.valor_max){
      toastr.error('El valor maximo es requerido.');
    }else if(this.valor_min > this.valor_max){
      toastr.error('El valor minimo no puede ser mayor al maximo.');
    }else if(this.valor_max < this.valor_min){
      toastr.error('El valor maximo no puede ser menor al minimo.');
    }else{
      this.load_valores = true;
      this._productoService.update_valores_producto_color(idcolor,{
        yrds_min:this.valor_min,
        yrds_max:this.valor_max
      },this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Valores actualizados.");
            $('#valoresModal-'+idcolor).modal('hide');
            this.init_todos();
          }else{
            toastr.error(response.message);
          }
          
          this.load_valores = false;
        }
      );
    }
  }

  set_tipo(tipo:any){
    this.tipo_option = tipo;
    if(this.tipo_option == 'Telas'){
      this._router.navigate(['/etiquetado/telas']);
    }else if(this.tipo_option == 'Ropas'){
      this._router.navigate(['/etiquetado/ropas']);
    }
  }
}
