import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from 'src/app/services/venta.service';
declare var $:any;
declare var toastr:any;
declare var KTApp:any;
declare var moment:any;
import domtoimage from 'dom-to-image';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { Template, BLANK_PDF, generate } from '@pdfme/generator';
import { invoice_ts } from 'src/app/templates_pdf/invoice/invoice_';
var inputs_uno : any = [];
var schemas_uno : any = [];
var columns_uno : any = [];
var inputs_dos : any = [];
var schemas_dos : any = [];
var columns_dos : any = [];


@Component({
  selector: 'app-detalle-venta',
  templateUrl: './detalle-venta.component.html',
  styleUrls: ['./detalle-venta.component.css']
})
export class DetalleVentaComponent implements OnInit {

  public user = JSON.parse(localStorage.getItem('user_data')!);
  public token = localStorage.getItem('token');
  public id = '';
  public load_btn = false;
  public load_data = true;
  public data = false;

  public venta: any = {};
  public docs_envios:Array<any> = [];
  public detalles_almacen :Array<any> = [];
  public detalles_camino :Array<any> = [];
  public arr_colores_sep:Array<any> = [];
  public arr_variaciones_sep:Array<any> = [];
  public futureStock : Array<any> = [];
  public programaciones:Array<any> = [];
  public load_confirmacion = false;

  public nuevo_estado = '';
  public count_envio = 0;

  public file : File|any = undefined;
  public file_formato : any = '';
  public url = GLOBAL.url;

  public estados : Array<any> = [];
  public doc_venta : any = {};
  public bt_doc_venta = false;

  public fecha_pagare = '';
  public tt_today = Date.parse(new Date().toString())/1000;
  public tt_venta :any = '';
  public load_cancelacion = false;
  public metro_to_yrd = 1.09361;
  public yrd_to_metro = 0.9144;
  public str_portada = '';
  public dias_vencidas = 0;

  public solicitud : any = {};
  public tipo_usuario = '';
  public id_comprador = '';
  public limit_days : any = '';

  public permisos : Array<any> = [];

  constructor(
    private _route:ActivatedRoute,
    private _router:Router,
    private _ventaService:VentaService
  ) { 
   
  }

  handlePermisos(event:any){
    this.permisos = event; 
    if(this.permisos.includes('10003')){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.init_data();
  
          if(this.user.avatar){
            this.str_portada = this.user.avatar;
          }else{
            this.str_portada = 'assets/images/blank2.svg';
          }
      
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    
  }

  init_data(){
    this.load_data = true;
    this._ventaService.get_venta(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data == undefined){
          this.data = false;
        }else{
          this.venta = response.venta;
          this.programaciones = response.programaciones;
          this.detalles_almacen = response.detalles_almacen;
          this.detalles_camino = response.detalles_camino;
          this.solicitud = response.solicitud;
       


          if(this.venta.tipo_usuario == 'Cliente natural'){
            this.tipo_usuario = 'cliente';
            this.id_comprador = this.venta.cliente._id;
            this.limit_days = this.venta.cliente.limit_days;
          } 
          if(this.venta.tipo_usuario == 'Empresa'){
            this.tipo_usuario = 'empresa';
            this.id_comprador = this.venta.empresa_rs._id;
            this.limit_days = this.venta.empresa_rs.limit_days;
          } 
          
          let created = new Date(this.venta.createdAt);
          created.setDate(created.getDate() + 15);
          this.fecha_pagare = moment(created).format('YYYY-MM-DD');

          //CALCULAR DIAS PASADOS
          if(this.limit_days){
            let fecha_vencimiento = moment(this.venta.createdAt).add(this.limit_days,'days');
    
            let inicio = moment(fecha_vencimiento);
            let fin = moment(new Date());

            this.dias_vencidas = fin.diff(inicio,'days'); 
          }

          this.docs_envios = response.docs_envios;
          this.init_detalles_variacion();
          this.data = true;
        }
        this.load_data = false;
      }
    );
  }

  update_file(file:any){
    this._ventaService.update_file_venta(this.venta._id,{file:file},this.token).subscribe(
      response=>{
        this.init_data();
      }
    );
  }

  calcular_total(){
    let total = 0;
    for(var item of this.detalles_almacen){
      total = total + (item.cantidad*item.precio);
    }
    for(var item of this.programaciones){
      if(item.estado != 'Finalizado'){
       
      }
      total = total + (item.cantidad*item.precio_unidad);
    }
    console.log(total);
    
    if(total != this.venta.monto_total){
      this._ventaService.update_total_venta(this.venta._id,{monto_total:total},this.token).subscribe(
        response=>{
        }
      );
    }
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


  init_detalles_variacion(){
    let colores = [];
    this.arr_colores_sep = [];
    
    for(var item of this.detalles_almacen){
      if(item.producto){
        if(item.tipo_detalle == 'En almacen'){
          if(colores.length == 0){
            colores.push({
              _id: item.producto_variacion._id,
              producto: item.producto.titulo,
              variacion_name: item.producto_variacion.variacion_name,
              color_name: item.producto_variacion.color_name,
              talla: item.producto_variacion.talla,
              tipo: item.producto_variacion.tipo,
              precio: item.precio,
              hxd: item.producto_variacion.hxd,
              detalles: [item]
            });
          }else{
            var colores_arr = colores.filter(subitem=> subitem._id == item.producto_variacion._id);
            if(colores_arr.length >= 1){
              colores_arr[0].detalles.push(item);
            }else{
              colores.push({
                _id: item.producto_variacion._id,
                producto: item.producto.titulo,
                variacion_name: item.producto_variacion.variacion_name,
                color_name: item.producto_variacion.color_name,
                talla: item.producto_variacion.talla,
                tipo: item.producto_variacion.tipo,
                precio: item.precio,
                hxd: item.producto_variacion.hxd,
                detalles: [item]
              });
            }
          }
        } 
      }
    }
    

    for(var sitem of colores){
      var total_cantidades = 0;
      var total_monto = 0;
      var total_precio = 0;

      for(var det of sitem.detalles){
        total_cantidades = total_cantidades + parseFloat(det.cantidad);
        total_monto = total_monto + (parseFloat(det.cantidad)*parseFloat(det.precio))
        total_precio = total_precio + det.precio;
      }

      this.arr_colores_sep.push({
        _id: item._id,
        producto: sitem.producto,
        variacion_name: sitem.variacion_name,
        color_name: item.color_name,
        talla: item.talla,
        tipo: item.tipo,
        hxd: sitem.hxd,
        total_cantidades: total_cantidades.toFixed(2),
        total_monto: total_monto.toFixed(2),
        unidades: sitem.detalles.length,
        precio: (total_precio/sitem.detalles.length).toFixed(2)
      })
    }

    console.log(this.arr_colores_sep);
  }


  set_estado(){
    this.load_confirmacion = true;
    this._ventaService.update_estado_venta(this.id,{
      estado:'Confirmado',
      venta: this.venta._id
    },this.token).subscribe(
      response=>{
        this.load_confirmacion = false;
        $('#confirmacion').modal('hide');
        toastr.success("Cambio de estado finalizado.");
        this.init_data();
        
      }
    );
  }

  set_cancelado(){
    this.load_cancelacion = true;
    this._ventaService.cancelar_venta(this.id,this.token).subscribe(
      response=>{
        this.load_cancelacion = false;
        $('#cancelacion').modal('hide');
        toastr.success("Cancelación realizada.");
        this.init_data();
        
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
          this.uploadDocEnvio();
        }else if(file.type == 'application/pdf'){
          this.file_formato = 'PDF';
          this.file = file;
          this.uploadDocEnvio();
        }else if(file.type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
          this.file_formato = 'Documento Word';
          this.file = file;
          this.uploadDocEnvio();
        }else if(file.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
          this.file_formato = 'Documento Excel';
          this.file = file;
          this.uploadDocEnvio();
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

  uploadDocEnvio(){
    this._ventaService.add_doc_venta(this.venta._id,{
      doc_envio: this.file,
      doc_format_envio: this.file_formato,
    },this.token).subscribe(
      response=>{
        if(response.data != undefined){
          toastr.success("Envío actualizado.");
          this.file = undefined;
          this.file_formato = '';
          $('#file').val('');
          this.init_data();
        }else{
          toastr.error(response.message);
        }
      }
    );
  }

  openEnvio(){
    this.doc_venta = {};
    if(this.venta.cliente_ubicacion.encargado){
      this.doc_venta.destinatario = this.venta.cliente_ubicacion.encargado;
    }
    
    if(this.venta.cliente_ubicacion){
      this.doc_venta.cliente_estado = this.venta.cliente_ubicacion.estado;
      this.doc_venta.cliente_ciudad = this.venta.cliente_ubicacion.ciudad;
      this.doc_venta.cliente_calle = this.venta.cliente_ubicacion.direccion;


    }


    this.doc_venta.rollos = this.detalles_almacen.length;
    this.doc_venta.lugar_expedicion = 'Zapotlanejo, Julisco';
  }

  save_doc_envio(){
    this.doc_venta.venta = this.venta._id;

    if(!this.doc_venta.destinatario){
      toastr.error("El destinatario es requerido.");
    }else if(!this.doc_venta.rollos){
      toastr.error("El número de rollos es requerido.");
    }else if(!this.doc_venta.lugar_expedicion){
      toastr.error("El lugar de expedición es requerido.");
    }else if(!this.doc_venta.monto){
      toastr.error("El monto es requerido.");
    }else if(!this.doc_venta.cliente_estado){
      toastr.error("El estado del cliente es requerido.");
    }else if(!this.doc_venta.cliente_ciudad){
      toastr.error("La ciudad del cliente es requerido.");
    }else if(!this.doc_venta.cliente_calle){
      toastr.error("La calle del cliente es requerido.");
    }else if(!this.doc_venta.paqueteria){
      toastr.error("La paqueteria es requerida.");
    }else{
      console.log(this.doc_venta);
      this._ventaService.create_doc_envio(this.doc_venta,this.token).subscribe(
        response=>{
          toastr.success("Se registró el documento.");
          $('#modalEnvio').modal('hide');
          setTimeout(() => {
            $('#select-estado-2').select2().val('').trigger("change");;
          }, 50);
          this.doc_venta = {};
          this.init_data();
        }
      );
    }
  }

  generar_pdf(){
    
  }
  
}
