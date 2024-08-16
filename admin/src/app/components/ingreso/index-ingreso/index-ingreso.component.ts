import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { PedidoService } from 'src/app/services/pedido.service';
declare var $:any;
declare var moment:any;
declare var toastr:any;

@Component({
  selector: 'app-index-ingreso',
  templateUrl: './index-ingreso.component.html',
  styleUrls: ['./index-ingreso.component.css']
})
export class IndexIngresoComponent implements OnInit {

  public ingresos : Array<any> = [];
  public const_ingresos : Array<any> = [];
  public token = localStorage.getItem('token');
  public page = 10;
  public load_data = true;

  public orden_id = '';
  public filter_estado = 'Todos';
  public filter_proveedor = '';

  public url = GLOBAL.url;

  public load_estado = false;

  public telas : Array<any> = [];
  public ropas : Array<any> = [];

  public load = 0;
  public tipo_option = 'Todos';
  public last_page = 0;
  public page_status = true;
  public todos = 0;
  public envios : Array<any> = [];
  public permisos : Array<any> = [];
  
  constructor(
    private _pedidoService:PedidoService,
    private _router:Router,
    private _route:ActivatedRoute
  ) { 

  }

  ngOnInit(): void {
    
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('7000')){
      this.init_todos();
      this.init_envios();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }


  click_matriculas(){
    this.page = this.page + 10;
    this.init_todos();

  }

  init_envios(){
    this._pedidoService.get_envios_pedido(this.token).subscribe(
      response=>{
        this.envios = response.data;
        console.log(this.envios);
      }
    );
  }

  init_todos(){
    this.load++;
    if(this.load==0) this.load_data = true;
    this._pedidoService.get_ingresos(this.page,this.token).subscribe(
      response=>{
        this.todos = response.todos;
        this.ingresos = response.data;
        this.const_ingresos = this.ingresos;
        this.last_page = this.ingresos.length;
        this.load_data = false;
      }
    );
  }

  search(){
    let str_proveedor = new RegExp(this.filter_proveedor,'i');
    let data = [];
    if(this.orden_id){
      data = this.const_ingresos.filter(item=>item.pedido.serie == this.orden_id);
    }else{
      data = this.const_ingresos;
    }

    if(this.filter_estado == 'Todos'){
      data = data;
    }else{
      data = data.filter(item=>item.pedido.estado == this.filter_estado);
    }

   

    this.ingresos = data;
  }

  reset(){

    this.filter_estado = 'Todos';
    this.filter_proveedor = '';
    this.orden_id = '';

    this.init_todos();
  }

  redirect(id:any){
    $('#nuevoIngreso').modal('hide');
    this._router.navigate([id]);
  }

  set_tipo(tipo:any){
    
  }

  redirect_envio(id:any){
    this._router.navigate(['/ingresos/proveedor'],{queryParams: {envio:id}}).then(()=>{
      $('#modalEnvios').modal('hide');
    });
  }
}
