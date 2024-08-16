import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from 'src/app/services/pedido.service';
declare var $:any;
declare var moment:any;
declare var toastr:any;

@Component({
  selector: 'app-index-pedido',
  templateUrl: './index-pedido.component.html',
  styleUrls: ['./index-pedido.component.css']
})
export class IndexPedidoComponent implements OnInit {

  public pedidos : Array<any> = [];
  public pedidos_estados : Array<any> = [];
  public const_pedidos : Array<any> = [];
  public token = localStorage.getItem('token');
  public page = 10;
  public load_data = true;

  public orden_id = '';
  public filter_estado = 'Todos';
  public filter_proveedor = '';

  public load_confirmacion = false;
  public nuevo_estado = '';
  public pedido_selected : any = {};
  public estados : any = {};

  public parameters = JSON.parse(localStorage.getItem('parameters')!);
  public load = 0;
  public tipo_option = 'Todos';
  public last_page = 0;
  public page_status = true;
  public todos = 0;
  public permisos : Array<any> = [];

  constructor(
    private _pedidoService:PedidoService,
    private _router:Router,
    private _route:ActivatedRoute
  ) { 
   
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('4000')){
      this.init_todos();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    this.init_todos();
  }

  click_matriculas(){
    this.page = this.page + 10;
    this.init_todos();
    if(this.pedidos.length == this.last_page){
      this.page_status = false;
    }
  }

  init_todos(){
    this.load++;
    if(this.load==0) this.load_data = true;
    this._pedidoService.get_pedidos('Todos',this.page,this.token).subscribe(
      response=>{
        console.log(response);

        this.pedidos = response.data;
        if(this.tipo_option != 'Todos'){
          this.pedidos.forEach(item => {
            let det = item.detalles.filter((subitem:any) => subitem.estado == this.tipo_option);
            item.detalles = det;
          });
        }

        this.pedidos = this.pedidos.filter(item=>item.detalles.length >= 1);
        this.last_page = this.pedidos.length;
        this.estados = response.estados;
        this.const_pedidos = this.pedidos;
        this.todos = response.todos;
        this.load_data = false;
      }
    );
  }

  show_detalles(idx:any){
    if(!this.pedidos[idx].visible){
      this.pedidos[idx].visible = true;
    }else{
      this.pedidos[idx].visible = false;
    } 
  }

  search(){
    let str_proveedor = new RegExp(this.filter_proveedor,'i');
    let data = [];
    if(this.orden_id){
      data = this.const_pedidos.filter(item=>item.pedido.serie == this.orden_id);
    }else{
      data = this.const_pedidos;
    }

    if(this.filter_estado == 'Todos'){
      data = data;
    }else{
      data = data.filter(item=>item.pedido.estado == this.filter_estado);
    }

    if(this.filter_proveedor){
      data = data.filter(item=>str_proveedor.test(item.pedido.proveedor.razon_social));
    }else{
      data = data;
    }

    this.pedidos = data;
  }

  reset(){

    this.filter_estado = 'Todos';
    this.filter_proveedor = '';
    this.orden_id = '';

    this.init_todos();
  }

  selected_set_estado(item:any){
    this.pedido_selected = item;
  }
  
  set_estado_chk(value:any){
    this.nuevo_estado = value; 
  }

  set_estado(){
    this.load_confirmacion = true;
    this._pedidoService.update_estado_pedido(this.pedido_selected._id,{estado:this.nuevo_estado},this.token).subscribe(
      response=>{
        
        $('#confirmacion').modal('hide');
        this.nuevo_estado = '';
        toastr.success("Cambio de estado finalizado.");
        this.init_todos();
        this.load_confirmacion = false;
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_confirmacion = false;
      }
    );
  }

  

  set_tipo(tipo:any){
    this.tipo_option = tipo;
    console.log(this.const_pedidos);
    
    this.pedidos = [];
 
    for(let item of this.const_pedidos){  
      let detalles = item.detalles.filter((subitem:any)=>subitem.estado == this.tipo_option);
      if(detalles.length >= 1){
        this.pedidos.push({
          visible: item.visible,
          detalles: detalles,
          pedido: item.pedido
        });
      }
      
    }

  }

  redirect(url:any){
    $('#nuevoPedido').modal('hide');
    this._router.navigate([url]);
  }

}
