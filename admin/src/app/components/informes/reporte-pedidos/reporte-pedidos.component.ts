import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { InformeService } from 'src/app/services/informe.service';
declare var toastr:any;
import { io } from "socket.io-client";


@Component({
  selector: 'app-reporte-pedidos',
  templateUrl: './reporte-pedidos.component.html',
  styleUrls: ['./reporte-pedidos.component.css'],
})
export class ReportePedidosComponent implements OnInit {

  public socket = io("http://localhost:4201",{transports: ['websocket']});
  public id = '';
  public data : Array<any> = [];
  public pedidos : Array<any> = [];
  public pedido : any = {};
  public clientes_pedido : Array<any> = [];
  public producto : any = {};
  public token = localStorage.getItem('token');
  public url = GLOBAL.url;
  public option = 1;
  public load_data = true;
  public load_pedido = true;
  public min_new_tag = GLOBAL.min_new_tag;
  public today_now : any= new Date();
  public permisos : Array<any> = [];


  constructor(
    private _informeService:InformeService,
    private _route:ActivatedRoute,
    private _router:Router
  ) { }

  handlePermisos(event:any){
    this.permisos = event;

    if(this.permisos.includes('6000')){
      this._route.params.subscribe(params=>{
        this.id = params['id'];
        if(!this.id) this.id = 'Todos';
        console.log(this.id);
        this.init_informe();
      });
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    this.socket.on('emit-create-producto',(data:any)=>{
      console.log(data);
      this.socket_init_informe();
      toastr.success('Nuevo producto ingresado.');     
    });

    
  }
  
  init_informe(){
    this.load_data = true;
    this._informeService.inf_pedidos_completo(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        for(var item of response.data){
          let create :any = new Date(item.producto.createdAt);
          if(this.id == 'Todos') item.visible = false;
          if(this.id != 'Todos') item.visible = true;
          item.producto.minutos_pasados = (this.today_now - create)/60000;
        }
        this.data = response.data;
        for(var item of this.data){
          item.arr_variaciones.sort((a:any, b:any) => parseInt(b.stock_free) - parseInt(a.stock_free));
        }
        console.log(this.data);
        this.load_data = false;
      }
    );
  }

  socket_init_informe(){
    this._informeService.inf_pedidos_completo(this.id,this.token).subscribe(
      response=>{
        for(var item of response.data){
          let create :any = new Date(item.producto.createdAt);
          if(this.id == 'Todos') item.visible = false;
          if(this.id != 'Todos') item.visible = true;
          item.producto.minutos_pasados = (this.today_now - create)/60000;
        }
        this.data = response.data;
      }
    );
  }


  init_pedido(id:any){
    this.load_pedido = true;
    this.option = 2;
    this._informeService.inf_pedido_clientes(id,this.token).subscribe(
      response=>{
        this.pedidos = response.data;
        this.pedido = response.pedido;
        this.clientes_pedido = response.clientes;
        this.load_pedido = false;
      }
    );
  }

  setMenu(value:any){
    if(value == 1){
      this.pedidos = [];
      this.pedido = {};
      this.clientes_pedido = [];
    }
    this.option = value;
  }

  show_detalles(idx:any){
    if(!this.data[idx].visible){
      this.data[idx].visible = true;
    }else{
      this.data[idx].visible = false;
    } 
  }
}
