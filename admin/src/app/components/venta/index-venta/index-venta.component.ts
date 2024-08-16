import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { VentaService } from 'src/app/services/venta.service';
declare var $:any;
declare var moment:any;
declare var toastr:any;

@Component({
  selector: 'app-index-venta',
  templateUrl: './index-venta.component.html',
  styleUrls: ['./index-venta.component.css']
})
export class IndexVentaComponent implements OnInit {

  public ventas : Array<any> = [];
  public const_ventas : Array<any> = [];
  public token = localStorage.getItem('token');
  public page = 10;
  public load_data = true;
  public load = 0;

  public orden_id = '';
  public filter_estado = 'Todos';
  public filter_proveedor = '';

  public load_confirmacion = false;
  public load_doc_envio = false;

  public venta_select : any = {};
  public file : File|any = undefined;
  public file_formato : any = '';
  public url = GLOBAL.url;

  public filtro_cliente = '';
  public filtro_agente = 'Todos';
  public filtro_estado = 'Todos';
  public filtro_envio = '';
  public monto_max = 0;
  public monto_max_const = 0;
  public monto_min = 0;
  public sort = 'Defecto';

  public agentes : Array<any> = [];
  public totales : Array<any> = [];

  public tipo_option = 'Todos';
  public estados : any = {};
  public last_page = 0;
  public page_status = true;
  public todos = 0;
  public permisos : Array<any> = [];

  constructor(
    private _ventaService:VentaService,
    private _adminService:AdministradorService,
    private _route:ActivatedRoute,
    private _router:Router
  ) { 
    var date = new Date();
  }

  init_agentes(){
    this._adminService.get_agentes_admin(this.token).subscribe(
      response=>{
        this.agentes = response.data;
      }
    );
    
  }

  handlePermisos(event:any){
    this.permisos = event; 
    if(this.permisos.includes('10000')){
      this.init_agentes();
      this.init_todos();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {

  }


  click_matriculas(){
    this.page = this.page + 10;
    this.init_todos();
  }

  init_todos(){
    this.load++;
    if(this.load==0) this.load_data = true;
    this._ventaService.get_ventas(this.tipo_option,this.page,this.token).subscribe(
      response=>{
        console.log(response);
        if(response.data.length == this.last_page){
          this.page_status = false;
        }
        this.ventas = response.data;
        this.last_page = this.ventas.length;
        this.estados = response.estados;
        this.todos = response.todos;
        this.const_ventas = this.ventas;
        for(var item of this.const_ventas){
          if(item.tipo == 'Venta'){
            this.totales.push(item.venta.total);
          }
        }
        this.monto_max = Math.max(...this.totales);
        this.monto_max_const = this.monto_max;
        this.load_data = false;
      }
    );
  }

  show_detalles(idx:any){
    if(!this.ventas[idx].visible){
      this.ventas[idx].visible = true;
    }else{
      this.ventas[idx].visible = false;
    } 
  }

  search(){
    let str_proveedor = new RegExp(this.filter_proveedor,'i');
    let data = [];
    if(this.orden_id){
      data = this.const_ventas.filter(item=>item._id == this.orden_id);
    }else{
      data = this.const_ventas;
    }

    if(this.filter_estado == 'Todos'){
      data = data;
    }else{
      data = data.filter(item=>item.estado == this.filter_estado);
    }

   

    this.ventas = data;
  }

  reset(){

    this.filter_estado = 'Todos';
    this.orden_id = '';
    this.init_todos();
  }

  set_estado(id:any,estado:any){
    this.load_confirmacion = true;
    this._ventaService.update_estado_venta(id,{
      estado:estado,
      venta: id
    },this.token).subscribe(
      response=>{
        this.load_confirmacion = false;
        $('#conf-pedido-'+id).modal('hide');
        $('#conf-envio-'+id).modal('hide');
        $('#conf-entrega-'+id).modal('hide');
        toastr.success("Cambio de estado finalizado.");
        
        this.init_todos();
        
      }
    );
  }

  fileChangeEvent(event:any):void{
    var file : any;
    if(event.target.files && event.target.files[0]){
      file = <File>event.target.files[0];
    }else{
      toastr.error("La imagen no puede ser subida.");
    }

    try {
      if(file.size <= 1000000){
        if(file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg'){
          this.file_formato = 'Imagen';
          this.file = file;
        }else if(file.type == 'application/pdf'){
          this.file_formato = 'PDF';
          this.file = file;
        }else if(file.type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
          this.file_formato = 'Documento Word';
          this.file = file;
        }else if(file.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
          this.file_formato = 'Documento Excel';
          this.file = file;
        }else{
          toastr.error("Solo se aceptan imagenes.");
          this.file = undefined;
          this.file_formato = '';
        }
      }else{
        toastr.error("La imagen no debe pesar menos de 2Mbs.");
        this.file = undefined;
        this.file_formato = '';
      }
    } catch (error) {
    }
  }

  set_envioUpload(item:any){
    this.venta_select = item;
  }

  uploadDocEnvio(){
    this.load_doc_envio = true;
    this._ventaService.add_doc_venta(this.venta_select._id,{
      doc_envio: this.file,
      doc_format_envio: this.file_formato,
    },this.token).subscribe(
      response=>{

        if(response.data != undefined){
          toastr.success("Envío actualizado.");
          this.file = undefined;
          this.file_formato = '';
          $('#file_input').val('');
          $('#docEnvio').modal('hide');
          this.init_todos();
        }else{
          toastr.error(response.message);
        }
        this.load_doc_envio = false;
      }
    );
  }

  set_filter(){
    this.load_data = true;
    //Cliente
    console.log(this.const_ventas);
    
    var arr_cliente_uno = [];
    if(this.filtro_cliente){
      var test_cliente = new RegExp(this.filtro_cliente,'i');
      for(var item of this.const_ventas){
        if(item.tipo == 'Venta'){
          if(item.venta.tipo_usuario == 'Empresa'){
            if(test_cliente.test(item.venta.empresa_rs.razon_social)) arr_cliente_uno.push(item);
          }else if(item.venta.tipo_usuario == 'Cliente natural'){
            if(test_cliente.test(item.venta.cliente.nombres) || test_cliente.test(item.venta.cliente.apellidos)) arr_cliente_uno.push(item);
          }
        }
      }
    }else{
      arr_cliente_uno = this.const_ventas;
    }

    var arr_cliente_dos = [];
    if(this.filtro_agente != 'Todos'){
      arr_cliente_dos = arr_cliente_uno.filter(item=> item.venta.colaborador._id == this.filtro_agente);
    }else{
      arr_cliente_dos = arr_cliente_uno;
    }

    var arr_cliente_tres = [];
    if(this.filtro_estado != 'Todos'){
      arr_cliente_tres = arr_cliente_dos.filter(item=> item.venta.estado == this.filtro_estado);
    }else{
      arr_cliente_tres = arr_cliente_dos;
    }
  
    var arr_cliente_cuatro = [];
    if(this.monto_min >= 0){
      arr_cliente_cuatro = arr_cliente_tres.filter(item=> item.venta.total >= this.monto_min);
    }else{
      this.monto_min = 0;
    }


    var arr_cliente_cinco = [];
    if(this.monto_max  > this.monto_min){
      arr_cliente_cinco = arr_cliente_cuatro.filter((item)=> item.venta.total <= this.monto_max);
    }else{
      this.monto_max = this.monto_min+1;
    }

    this.load_data = false;
    this.ventas = arr_cliente_cinco;
  }

  valid_montos(tipo:any){
    if(tipo == 'min'){
      if(this.monto_min){
        if(this.monto_min < 0) this.monto_min = 0;
      }else{
        this.monto_min = 0;
      }
    }else if(tipo == 'max'){
      if(this.monto_max){
        if(this.monto_max < 0) this.monto_max = 0;
        else if(this.monto_max  < this.monto_min) this.monto_max = this.monto_min;
      }else{
        this.monto_max = 0;
      }
    }
  }

  reset_filtros(){
    this.filtro_cliente = '';
    this.filtro_agente = 'Todos';
    this.filtro_estado = 'Todos';
    this.filtro_envio = '';
    this.monto_max = this.monto_max_const;
    this.monto_min = 0;
    this.ventas = this.const_ventas;
  }

  sort_matriculas(){
    if(this.sort == 'Menor precio'){
      this.ventas = this.ventas.sort((a, b) => a.venta.total - b.venta.total);
    }else if(this.sort == 'Mayor precio'){
      this.ventas = this.ventas.sort((a, b) => b.venta.total - a.venta.total);
    }else if(this.sort == 'Defecto'){
      this.ventas = this.const_ventas;
    }
  }

  redirect(url:any){
    $('#nuevaVenta').modal('hide');
    this._router.navigate([url]);
  }

  set_tipo(tipo:any){
    this.tipo_option = tipo;
    console.log(this.const_ventas);
    
    if(this.tipo_option != 'Todos'){
      this.ventas = this.const_ventas.filter(item=> item.venta.estado == this.tipo_option);
    }else{
      this.ventas = this.const_ventas;
    }
  }
}
