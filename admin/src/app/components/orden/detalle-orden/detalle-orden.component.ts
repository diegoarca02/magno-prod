import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from 'src/app/services/venta.service';
declare var $:any;
declare var toastr:any;
declare var KTApp:any;
declare var moment:any;
import domtoimage from 'dom-to-image';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { SettinsService } from 'src/app/services/settins.service';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
declare function NumeroALetras(num:any):any;
import { Template, BLANK_PDF, generate } from '@pdfme/generator';
import { invoice_ts } from 'src/app/templates_pdf/invoice/invoice_';
import { envio_ts } from 'src/app/templates_pdf/envio/envio_';
import { GENERAL } from 'src/app/services/GENERAL';
import { io } from "socket.io-client";
import { PagoService } from 'src/app/services/pago.service';

@Component({
  selector: 'app-detalle-orden',
  templateUrl: './detalle-orden.component.html',
  styleUrls: ['./detalle-orden.component.css']
})
export class DetalleOrdenComponent implements OnInit {

  public token = localStorage.getItem('token');
  public user = JSON.parse(localStorage.getItem('user_data')!);
  public id = '';
  public load_btn = false;
  public load_data = true;
  public data = false;

  public venta: any = {};
  public envios:Array<any> = [];
  public detalles_xls:Array<any> = [];
  public arr_colores_sep:Array<any> = [];
  public arr_variaciones_sep :Array<any> = [];
  public detalles_almacen :Array<any> = [];
  public detalles_camino :Array<any> = [];
  public load_confirmacion = false;

  public nuevo_estado = '';
  public count_envio = 0;

  public file : File|any = undefined;
  public file_envio : File|any = undefined;
  public file_entrega : File|any = undefined;
  public file_formato : any = '';
  public url = GLOBAL.url;

  public estados : Array<any> = [];
  public doc_venta : any = {};
  public bt_doc_venta = false;

  public fecha_pagare = '';

  public load_btn_remove = false;
  public filtro_producto = '';
  public load_productos = false;
  public productos :Array<any> = [];
  public nuevo_rollo : any = {};
  public producto_selected: any = {};
  public color_selected: any = {};
  public colores :Array<any> = [];
  public rollos :Array<any> = [];
  public load_rollos = false;
  public almacenes:Array<any> = [];
  public configuracion : any = {
    cantidad: 0,
    unidad: 'Yrd',
  }
  public op_nuevo_rollo = false;
  public almacen_active = '';
  public total_cantidades = 0;
  public metro_to_yrd = 1.09361;
  public load_cancelacion = false;
  public yrd_to_metro = 0.9144;
  public schemas_envio : Array<any> = [];
  public str_portada = '';

  public count_en_camino = 0;
  public tracking : any = '';
  public programaciones : Array<any> = [];
  public option_envio = false;
  public ventas_envio : Array<any> = [];
  public confirmacion = false;
  public load_btn_entrega = false;
  public load_envios = true;
  @Output() eventUpdatedUnidades = new EventEmitter<void>();
  public socket = io(GLOBAL.socket,{transports: ['websocket']});
  public load_foto_envio = false;
  public solicitud : any = {};
  public transacciones : Array<any> = [];
  public load_transacciones = false;
  public resumen_ventas : Array<any> = [];
  public detalles : Array<any> = [];
  public cuentas_bancarias : Array<any> = [];
  public load_pdf = false;
  public envioOpen :any = {};

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private context: CanvasRenderingContext2D | null = null;
  private drawing = false;
  public isCanvasEmpty : boolean = true;
  public load_firma_envio = false;

  public cantidades_almacen = 0;
  public cantidades_camino = 0;
  public cantidades_programacion = 0;
  public permisos : Array<any> = [];
  public load_entrega_envio = false;

  constructor(
    private _route:ActivatedRoute,
    private _router:Router,
    private _ventaService:VentaService,
    private _productoService:ProductoService,
    private _pedidoService: PedidoService,
    private _settingsService:SettinsService,
    private _pagoService:PagoService,
  ) {
    
    
   }

  ngOnInit(): void {
   
    this.socket.on('emit-update-unidades',(data:any)=>{
      this.init_data();
    });

    
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('8004')){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.init_data();
          this.init_envios();
          this.init_almacenes();
          this.init_transacciones();
          this.init_cuentas_bancarias();
        }
      );
  
      if(this.user.avatar){
        this.str_portada = this.url+'mostrar_avatar_colaborador/'+this.user.avatar;
      }else{
        this.str_portada = 'assets/images/blank2.svg';
      }
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  init_cuentas_bancarias(){
    this._pagoService.get_cuentas_destacadas(this.token).subscribe(
      response=>{
        console.log(response);
        this.cuentas_bancarias = response.data;
      }
    );
  }

  init_envios(){
    this.load_envios = true;
    this._ventaService.get_envios_venta(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        this.envios = response.data;
        this.load_envios = false;
      }
    );
  }

  init_transacciones(){
    this.load_transacciones = true;
    this._pagoService.get_transacciones_venta(this.id,this.token).subscribe(
      response=>{
        this.transacciones = response.data;
        console.log(this.transacciones);
        this.load_transacciones = false;
      }
    );
  }

  setCHK(event:any){
    var checkbox = event.target;
    var valor = checkbox.value; // Puedes usar algún identificador único del elemento

    if (checkbox.checked) {
        // Si el checkbox está marcado, agregarlo al arreglo si no está presente
        if (this.ventas_envio.indexOf(valor) === -1) {
            this.ventas_envio.push(valor);
        }
    } else {
        // Si el checkbox no está marcado, quitarlo del arreglo si está presente
        var index = this.ventas_envio.indexOf(valor);
        if (index !== -1) {
            this.ventas_envio.splice(index, 1);
        }
    }
  }

  download_envio(item:any){
    console.log(item);
    
    let inputs :Array<any> = [
      {
        "encargado": item.destinatario,
        "direccion": item.cliente_ubicacion.place_name_es,
        "expedicion": item.lugar_expedicion,
        "estado": item.cliente_ubicacion.region,
        "ciudad": item.cliente_ubicacion.place,
        "transportista": item.paqueteria,
        "rollos": item.unidades.toString(),
        "precio_rollo": "--",
        "total_rollos": "--",
        "admin": this.user.nombres.split(' ')[0]+' '+this.user.apellidos.split(' ')[0],
        "fecha": moment(item.createdAt).format('YYYY-MM-DD'),
        "encargado_dos": item.destinatario,
        "expedicion_dos": item.lugar_expedicion,
        "estado_dos": item.cliente_ubicacion.region,
        "direccion_dos": item.cliente_ubicacion.place_name_es
      }
    ]

    var template : Template= {
      "schemas":   [
        {
          "encargado": {
            "type": "text",
            "position": {
              "x": 51.86,
              "y": 33.01
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "direccion": {
            "type": "text",
            "position": {
              "x": 51.6,
              "y": 40.89
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "expedicion": {
            "type": "text",
            "position": {
              "x": 51.6,
              "y": 48.3
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "estado": {
            "type": "text",
            "position": {
              "x": 51.6,
              "y": 55.3
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "ciudad": {
            "type": "text",
            "position": {
              "x": 51.6,
              "y": 62.3
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "transportista": {
            "type": "text",
            "position": {
              "x": 51.6,
              "y": 69.3
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "rollos": {
            "type": "text",
            "position": {
              "x": 51.6,
              "y": 75.6
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "precio_rollo": {
            "type": "text",
            "position": {
              "x": 81.23,
              "y": 98
            },
            "width": 35,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "total_rollos": {
            "type": "text",
            "position": {
              "x": 81.23,
              "y": 106.52
            },
            "width": 35,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "admin": {
            "type": "text",
            "position": {
              "x": 58.74,
              "y": 125.62
            },
            "width": 78.92,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "fecha": {
            "type": "text",
            "position": {
              "x": 156.63,
              "y": 125.35
            },
            "width": 47.7,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "encargado_dos": {
            "type": "text",
            "position": {
              "x": 38.58,
              "y": 190.85
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "expedicion_dos": {
            "type": "text",
            "position": {
              "x": 38.85,
              "y": 197.68
            },
            "width": 51.13,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "estado_dos": {
            "type": "text",
            "position": {
              "x": 126.59,
              "y": 197.97
            },
            "width": 75.47,
            "height": 6.99,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "direccion_dos": {
            "type": "text",
            "position": {
              "x": 38.58,
              "y": 204.88
            },
            "width": 163.58,
            "height": 12.03,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          }
        }
      ],
      "basePdf": envio_ts.base
    };
    generate({ template, inputs }).then((pdf) => {
      console.log(pdf);
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      window.open(URL.createObjectURL(blob));
    }).catch((error)=>{
      console.log(error);
      
    });
  }

  download_pagare(){    
    let client_name = '';
    let client_str = '';
    let client_email = '';
    if(this.venta.tipo_usuario == 'Empresa'){
      client_name = this.venta.empresa_rs.razon_social;
      client_str = 'Empresa';
      client_email = this.venta.empresa_rs.empresa.razon_social;
    }
    if(this.venta.tipo_usuario == 'Cliente natural'){
      client_name = this.venta.cliente.nombres.split(' ')[0] + ' ' + this.venta.cliente.apellidos.split(' ')[0];
      client_str = 'Cliente natural';
      client_email = this.venta.cliente.email
    }

    const inputs = [
      {
        "codigo": "#"+this.venta.year+'-'+this.venta.serie.toString().padStart(6,'000000'),
        "cliente": client_name,
        "email": client_email,
        "fecha": moment(this.venta.createdAt).format('YYYY-MM-DD'),
        "importe": this.venta.total+"MXN",
        "vencimiento": moment(this.fecha_pagare).format('YYYY-MM-DD'),
        "cliente_dos": 'J Guadalupe Marroquin Davalos',
        "importe_str": NumeroALetras(this.venta.total),
        "cliente_tres": client_name,
        "fecha_hoy": moment(new Date()).format('YYYY-MM-DD')
      }
    ];

    var template : Template= {
      "schemas":[
        {
          "codigo": {
            "type": "text",
            "position": {
              "x": 63.76,
              "y": 19.37
            },
            "width": 48.49,
            "height": 7,
            "alignment": "left",
            "fontSize": 19,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "cliente": {
            "type": "text",
            "position": {
              "x": 71.17,
              "y": 44.66
            },
            "width": 108.55,
            "height": 7,
            "alignment": "left",
            "fontSize": 11,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "email": {
            "type": "text",
            "position": {
              "x": 71.17,
              "y": 50.66
            },
            "width": 108.55,
            "height": 7,
            "alignment": "left",
            "fontSize": 11,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "fecha": {
            "type": "text",
            "position": {
              "x": 71.17,
              "y": 56.66
            },
            "width": 108.55,
            "height": 7,
            "alignment": "left",
            "fontSize": 11,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "importe": {
            "type": "text",
            "position": {
              "x": 71.17,
              "y": 62.66
            },
            "width": 108.55,
            "height": 7,
            "alignment": "left",
            "fontSize": 11,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "vencimiento": {
            "type": "text",
            "position": {
              "x": 71.17,
              "y": 68.66
            },
            "width": 108.55,
            "height": 7,
            "alignment": "left",
            "fontSize": 11,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "cliente_dos": {
            "type": "text",
            "position": {
              "x": 62.39,
              "y": 99.11
            },
            "width": 115.69,
            "height": 7,
            "alignment": "left",
            "fontSize": 11,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "importe_str": {
            "type": "text",
            "position": {
              "x": 30.2,
              "y": 122.32
            },
            "width": 149.56,
            "height": 7,
            "alignment": "center",
            "fontSize": 11,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "cliente_tres": {
            "type": "text",
            "position": {
              "x": 54.93,
              "y": 226.06
            },
            "width": 54.3,
            "height": 7,
            "alignment": "left",
            "fontSize": 11,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "fecha_hoy": {
            "type": "text",
            "position": {
              "x": 118.1,
              "y": 232.04
            },
            "width": 73.09,
            "height": 7,
            "alignment": "center",
            "fontSize": 11,
            "characterSpacing": 0,
            "lineHeight": 1
          }
        }
      ],
      "basePdf": invoice_ts.basePagare
    }

    console.log(inputs);
    
    console.log(template);
    

    generate({ template, inputs }).then((pdf) => {
      console.log(pdf);
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      window.open(URL.createObjectURL(blob));
    }).catch((error)=>{
      console.log(error);
      
    });
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
  
  init_data(){
    this.load_data = true;

    this._ventaService.get_venta(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data == undefined){
          this.data = false;
        }else{
          this.venta = response.venta;
          this.confirmacion = response.confirmacion;
          this.programaciones = response.programaciones;
          this.detalles_almacen = response.detalles_almacen;
          this.detalles_camino = response.detalles_camino;
          this.solicitud = response.solicitud;
          this.detalles = response.detalles;
          this.detalles_xls = [];
          this.cantidades_almacen = 0;
          this.cantidades_camino = 0;
          this.cantidades_programacion = 0;
          let cant :any = 0;
          
          for(var item of this.detalles_camino){
            this.cantidades_camino = this.cantidades_camino + parseFloat(item.cantidad);
          }

          for(var item of this.programaciones){
            this.cantidades_programacion = this.cantidades_programacion + parseFloat(item.cantidad);
          }

          console.log(this.cantidades_almacen);
          

          for(var item of this.detalles_almacen){
            let codigo = '';
            
            if(item.tipo_detalle == 'En camino'){
              this.count_en_camino++;
            }else if(item.tipo_detalle == 'En almacen'){
              if(!item.ingreso_detalle) codigo = '---';
              else codigo = item.ingreso_detalle.codigo;
            } 
            
            this.detalles_xls.push({
              producto: item.producto.titulo,
              tipo: item.producto_variacion.tipo,
              variacion_name: item.producto_variacion.variacion_name,
              color_name: item.producto_variacion.color_name,
              codigo:  codigo,
              unidad: item.unidad,
              cantidad: item.cantidad,
            });
            cant = cant + parseFloat(item.cantidad);
            this.cantidades_almacen = this.cantidades_almacen + parseFloat(item.cantidad);
          }
          console.log(this.detalles_almacen);
          console.log(this.cantidades_almacen);

          this.total_cantidades = cant;

          this.detalles_xls.push(
            {
              producto: 'Unidades',
              tipo: '',
              variacion_name: '',
              color_name: '',
              codigo:  '',
              unidad: '',
              cantidad: this.detalles_almacen.length
            },
            {
              producto: 'Cantidades',
              tipo: '',
              variacion_name: '',
              color_name: '',
              codigo:  '',
              unidad: '',
              cantidad: cant
            }
          );

          let created = new Date(this.venta.createdAt);
          created.setDate(created.getDate() + 15);
          this.fecha_pagare = moment(created).format('YYYY-MM-DD');
          this.data = true;
        }
        this.load_data = false;
      }
    );
  }

  set_estado(){
    this.load_confirmacion = true;
    this._ventaService.confirmar_estado_venta(this.id,{
      venta: this.venta._id
    },this.token).subscribe(
      response=>{
        console.log(response);
        this.load_confirmacion = false;
        $('#confirmacion').modal('hide');
        toastr.success("Cambio de estado finalizado.");
        this.init_data();
        this.init_transacciones();
      }
    );
  }


  uploadDocEnvio(tipo:any){
    
    this._ventaService.add_doc_venta(this.venta._id,{
      archivo: this.file,
      doc_format_envio: this.file_formato,
      tipo: tipo
    },this.token).subscribe(
      response=>{
        if(response.data != undefined){
          toastr.success("Envío actualizado.");
          this.file = undefined;
          this.file_formato = '';
          $('#file-envio').val('');
          this.init_data();
        }else{
          this.file = undefined;
          this.file_formato = '';
          $('#file-envio').val('');
          toastr.error(response.message);
        }
      }
    );
  }

  openEnvio(){
    this.doc_venta = {};
    this.doc_venta.paqueteria = this.venta.metodo_envio;
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
    this.doc_venta.cliente_ubicacion = this.venta.cliente_ubicacion._id;

    if(!this.doc_venta.destinatario){
      toastr.error("El destinatario es requerido.");
    }else if(!this.doc_venta.rollos){
      toastr.error("El número de rollos es requerido.");
    }else if(!this.doc_venta.lugar_expedicion){
      toastr.error("El lugar de expedición es requerido.");
    }else if(!this.doc_venta.monto){
      toastr.error("El monto es requerido.");
    }else if(!this.doc_venta.paqueteria){
      toastr.error("La paqueteria es requerida.");
    }else{
      console.log(this.doc_venta);
      this.doc_venta.detalles = this.ventas_envio;
      this.doc_venta.unidades = this.ventas_envio.length;
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

  remove_detalle(id:any){
    this.load_btn_remove = true;
    this._ventaService.remove_detalle_venta(id,this.venta._id,this.token).subscribe(
      response=>{
        this.init_data();
        this.init_transacciones();
        $('#removeDetalle-'+id).modal('hide');
        toastr.success("Eliminación completada.");
        this.load_btn_remove = false;
        this.socket.emit('send-update-unidades',true);
      },
      error=>{
        console.log(error);
        
      }
    );
  }

  //////////////////////////////////////////////

  init_almacenes(){
    for(var item of GENERAL.almacenes){
      this.almacenes.push({
        almacen : item.name,
        unidades : [],
        unidades_activos : 0,
      });
    }
    this.almacen_active = this.almacenes[0].almacen;
  }

  set_almacen_active(id:any){
    this.almacen_active = id;
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
    this._productoService.get_productos(filtro,1,this.token).subscribe(
      response=>{
        this.productos = response.data;
        this.load_productos = false;

      }
    );
  }


  selected_color(item:any){
    console.log(item);
    this.nuevo_rollo.producto = item.producto._id;
    this.nuevo_rollo.producto_title = item.producto.titulo;
    this.producto_selected = item.producto;

    this.color_selected = item;
    this.nuevo_rollo.sku = item.sku;
    this.nuevo_rollo.variante = item.variante;
    this.nuevo_rollo.hxd = item.hxd;
    this.nuevo_rollo.producto_variacion = item._id;
    //CARGAR ROLLOS
    this.load_rollos = true;
    this._ventaService.get_detalle_ingreso_by_color_venta(item._id,this.token).subscribe(
      response=>{
        this.rollos = response.detalles;
        console.log(this.rollos);
        for(var item of this.almacenes){
          item.rollos = this.rollos.filter(itm=>itm.ingreso.almacen == item.almacen);
          item.rollos_activos = item.rollos.length;
        }
        this.load_rollos = false;
      }
    );
  }


  downloadExcel(){
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Orden");

    worksheet.addRow(undefined);
    for (let x1 of this.detalles_xls){
      let x2=Object.keys(x1);

      let temp=[]
      for(let y of x2){
        temp.push(x1[y])
      }
      worksheet.addRow(temp)
    }

    //GENERAR EXCEL
    let fname='Orden #'+this.venta.year+'-'+this.venta.serie.toString().padStart(6,'000000');

    worksheet.columns = [
      { header: 'Producto', key: 'col1', width: 35, style: {border: 'thin'}},
      { header: 'Tipo', key: 'col2', width: 20},
      { header: 'Variación', key: 'col1', width: 25, style: {border: 'thin'}},
      { header: 'Color', key: 'col1', width: 25, style: {border: 'thin'}},
      { header: 'Codigo', key: 'col2', width: 25},
      { header: 'Unidad', key: 'col2', width: 25},
      { header: 'Cantidad', key: 'col2', width:25},
    ]as any;
    
    //add data and file name and download
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, fname+'.xlsx');
    });
  }

  set_cancelado(){
    this.load_cancelacion = true;
    this._ventaService.cancelar_venta(this.id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          $('#cancelacion').modal('hide');
          toastr.success("Cancelación realizada.");
          this.init_data();
        }else{
          toastr.error(response.message);
        }
        this.load_cancelacion = false;
      }
    );
  }
  
  set_envio(){
    this.load_confirmacion = true;
    this._ventaService.update_estado_venta(this.id,{
      estado:'Enviado',
      venta: this.venta._id,
      tracking: this.tracking,
    },this.token).subscribe(
      response=>{
        this.load_confirmacion = false;
        $('#conf-envio').modal('hide');
        toastr.success("Cambio de estado finalizado.");
        this.init_data();
      }
    );
  }

  openProductos(val:any){
    if(val){
      this.op_nuevo_rollo = val;
      this.init_productos('Todos');
    }{
      this.op_nuevo_rollo = val;
    }
  }

  confirmar_envio(item:any){
    this.load_btn_entrega = true;
    this._ventaService.confirmar_entrega_venta(item._id,this.token).subscribe(
      response=>{
        console.log(response);
        if(response.data != undefined){
          toastr.success("Envío confirmado.");
          $('#confirmarModal-'+item._id).modal('hide');
          this.init_envios();
          this.init_data();
        }
        this.load_btn_entrega = false;
      }
    );
  }

  download_entrega(item:any){
    let venta_envio = item;
    console.log(this.detalles_almacen);
    let arr_detalles = this.detalles_almacen.filter(subitem=> subitem.venta_envio?._id == item._id);
   
    
    let client_name = '';
    let client_str = '';
    let client_email = '';
    let client_telefono = '';
    let subtotal_seis,subtotal_cinco,subtotal_cero;
    let iva = this.venta.monto_total-this.venta.monto_total/1.16;
    let subtotal = (this.venta.monto_total/1.16);
    let idventa = "#VEN"+new Date().getFullYear()+this.venta.serie.toString().padStart(6,'000000');

    if(this.venta.tipo_usuario == 'Empresa'){
      client_name = this.venta.empresa.razon_social;
      client_str = 'Empresa';
      client_email = this.venta.empresa.email;
      client_telefono = 'Sin telefono';
    }
    if(this.venta.tipo_usuario == 'Cliente natural'){
      client_name = this.venta.cliente.nombres.split(' ')[0] + ' ' + this.venta.cliente.apellidos.split(' ')[0];
      client_str = 'Cliente natural';
      if(this.venta.cliente.email){
        client_email = this.venta.cliente.email
      }else{
        client_email = 'Correo no registrado'
      }

      client_telefono = this.venta.cliente.telefono;
    }

    let inputs :Array<any> = [
      {
        "cliente": client_name,
        "email": client_email,
        "telefono": client_telefono,
        "venta": idventa,
        "fecha": moment(new Date()).format('YYYY-MM-DD'),
        "text_es":  this.venta.cliente_ubicacion.text_es,
        "region": this.venta.cliente_ubicacion.region,
        "place": this.venta.cliente_ubicacion.place,
        "place_name_es": this.venta.cliente_ubicacion.place_name_es,
        "pagina_uno": idventa+" - Pagina 1/3 en el documento.",
        "pagina_dos": idventa+" - Pagina 2/3 en el documento.",
        "pagina_tres": idventa+" - Pagina 3/3 en el documento.",
        "firma_colaborador": this.user.nombres+' '+this.user.apellidos,
        "firma_cliente": item.firma,
        "banco_uno": "No especificado",
        "banco_dos": "No especificado",
      }
    ]

    if(this.cuentas_bancarias[0]){
      const cuenta = this.cuentas_bancarias[0];
      inputs[0].banco_uno = `BANCO: ${cuenta.banco}\nNOMBRES: ${cuenta.titular}\nSWIFT: ${cuenta.swift}\nN° CUENTA: ${cuenta.ncuenta}\nC. INTERBANCARIA: ${cuenta.cinter}`;
    }

    if(this.cuentas_bancarias[1]){
      const cuenta = this.cuentas_bancarias[1];
      inputs[0].banco_dos = `BANCO: ${cuenta.banco}\nNOMBRES: ${cuenta.titular}\nSWIFT: ${cuenta.swift}\nN° CUENTA: ${cuenta.ncuenta}\nC. INTERBANCARIA: ${cuenta.cinter}`;
    }


    let schemas : Array<any> = [
      {
        "cliente": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 35.61
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "email": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 41.17
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "telefono": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 46.79
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "venta": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 54.67
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "fecha": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 59.7
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "text_es": {
          "type": "text",
          "position": {
            "x": 127.95,
            "y": 35.61
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "region": {
          "type": "text",
          "position": {
            "x": 127.95,
            "y": 41.17
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "place": {
          "type": "text",
          "position": {
            "x": 127.95,
            "y": 46.73
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "place_name_es": {
          "type": "text",
          "position": {
            "x": 127.95,
            "y": 54.67
          },
          "width": 74.1,
          "height": 11.08,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "banco_uno": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 76.32
          },
          "width": 81.5,
          "height": 25.86,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "banco_dos": {
          "type": "text",
          "position": {
            "x": 120.95,
            "y": 75.47
          },
          "width": 81.5,
          "height": 25.86,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "pagina_uno": {
          "type": "text",
          "position": {
            "x": 9.79,
            "y": 268.82
          },
          "width": 195.28,
          "height": 6.56,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#424242",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        }
      },
      {
        "pagina_dos": {
          "type": "text",
          "position": {
            "x": 9.79,
            "y": 268.82
          },
          "width": 195.28,
          "height": 6.56,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#424242",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "firma_cliente": {
          "type": "image",
          "position": {
            "x": 12.7,
            "y": 220.55
          },
          "width": 56.14,
          "height": 15.13,
          "rotate": 0,
          "opacity": 1
        },
        "firma_colaborador": {
          "type": "text",
          "position": {
            "x": 159.76,
            "y": 230.55
          },
          "width": 45,
          "height": 6.56,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 13,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#000000",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        }
      },
      
    ]

    let columns : Array<any> =  [
      "cliente",
      "email",
      "telefono",
      "venta",
      "fecha",
      "text_es",
      "region",
      "place",
      "place_name_es",
      "banco_uno",
      "banco_dos",
      "pagina_uno",
      "pagina_dos",
      "grand_total",
    ]

    let count = 0;
    var y1_axis_uno = 118.74;
    var y1_axis_dos = 11.21;
    for(var item of arr_detalles){
      console.log(item);
      
      count++;
      if(count <= 19){
        inputs[0]["producto"+count] = item.producto.titulo.substr(0,15)+" - "+item.producto_variacion.variacion_name + " | " +item.ingreso_detalle.codigo;
        inputs[0]["cantidad"+count] = parseFloat(item.cantidad).toString() +' '+item.unidad;
        inputs[0]["precio"+count] = this.convertCurrency(item.precio) + ' MXN';
        inputs[0]["total"+count] = this.convertCurrency(parseFloat(item.cantidad)* item.precio)+ ' MXN';
        
        schemas[0]["producto"+count] = {
          "type": "text",
          "position": {
            "x": 10.58,
            "y": y1_axis_uno
          },
          "width": 100.03,
          "height": 5.23,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 10,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#000000",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[0]["cantidad"+count] = {
          "type": "text",
          "position": {
            "x": 113.93,
            "y": y1_axis_uno
          },
          "width": 22.77,
          "height": 5.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 10,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[0]["precio"+count] = {
          "type": "text",
          "position": {
            "x": 140.72,
            "y": y1_axis_uno
          },
          "width": 20.91,
          "height": 5.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 10,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[0]["total"+count] = {
          "type": "text",
          "position": {
            "x": 165.68,
            "y": y1_axis_uno
          },
          "width": 36.79,
          "height": 5.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 10,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },

        columns.push("producto"+count);
        columns.push("cantidad"+count);
        columns.push("precio"+count);
        columns.push("total"+count);
        y1_axis_uno = y1_axis_uno + 8.15;

      }else{
        inputs[0]["producto"+count] = item.producto.substr(0,15)+" - "+item.variacion_name + " | " +item.ingreso_detalle.codigo;
        inputs[0]["cantidad"+count] = parseFloat(item.cantidad).toString() +'\n'+item.unidad;
        inputs[0]["precio"+count] = this.convertCurrency(item.precio) + '\nMXN';
        inputs[0]["total"+count] = this.convertCurrency(parseFloat(item.cantidad)* item.precio)+ '\nMXN';
        
        schemas[1]["producto"+count] = {
          "type": "text",
          "position": {
            "x": 10.58,
            "y": y1_axis_dos
          },
          "width": 100.03,
          "height": 5.23,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 10,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#000000",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[1]["cantidad"+count] = {
          "type": "text",
          "position": {
            "x": 113.93,
            "y": y1_axis_dos
          },
          "width": 22.77,
          "height": 5.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[1]["precio"+count] = {
          "type": "text",
          "position": {
            "x": 140.72,
            "y": y1_axis_dos
          },
          "width": 20.91,
          "height": 5.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[1]["total"+count] = {
          "type": "text",
          "position": {
            "x": 165.68,
            "y": y1_axis_dos
          },
          "width": 36.79,
          "height": 5.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },


        columns.push("producto"+count);
        columns.push("cantidad"+count);
        columns.push("precio"+count);
        columns.push("total"+count);
        y1_axis_dos = y1_axis_dos + 8.15;
      }
    }

    console.log(inputs);
    console.log(schemas);
    console.log(columns);

    var template: Template= {
      "schemas": schemas,
      "basePdf": invoice_ts.base_entrega,
      "columns": columns
    };

    generate({ template, inputs }).then((pdf) => {
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      let str_1,str_2,str_3;
      str_2 = "serie-"+this.venta.serie;
      str_3 = moment(this.venta.createdAt).format('YYYY-MM-DD');

      if(this.venta.tipo_usuario == 'Empresa'){
        str_1 = this.venta.empresa.razon_social;
      }else if(this.venta.tipo_usuario == 'Cliente natural'){
        str_1 = this.venta.cliente.nombres;
      }

      let name_file = this.createSlug(str_1+"-"+str_2+"-"+str_3)
      console.log(name_file);
      
      var file = new File([blob], name_file+".pdf", {type: 'application/pdf'});
      
      this.load_entrega_envio = true;
      this._ventaService.update_file_entrega_envio(venta_envio._id,{file_entrega:file},this.token).subscribe(
        response=>{
          if(response.data != undefined){
            window.open(response.data.file_entrega, "_blank");
          }
          this.load_entrega_envio = false;
        }
      );
    }).catch(error=>{
      console.log(error);
      
    });
  }

  fileChangeEventEnvio(event:any):void{
    var file : any;
    if(event.target.files && event.target.files[0]){
      file = <File>event.target.files[0];
    }else{
      toastr.error("La imagen no puede ser subida.");
    }

    try {
      if(file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg'){
        this.file_envio = file;
        console.log(this.file_envio);
      }else{
        toastr.error("Solo se aceptan imagenes.");
        this.file_envio = undefined;
      }
    } catch (error) {
    }
  }

  upload_envio(id:any){
    if(this.file_envio != undefined){
      this.load_foto_envio = true;
      this._ventaService.update_file_envio_venta(id,{file:this.file_envio},this.token).subscribe(
        response=>{
          this.load_foto_envio = false;
          toastr.success("Se subió la foto.");
          $('#envioModal-'+id).modal('hide');
          this.init_envios();
        }
      );
    }else{
      toastr.error("Debes subir una foto.");
    }
  }

  init_resumen_response(){
    console.log(this.venta.firma);
    
    if(this.venta.firma != undefined || !this.venta.firma || this.venta.firma == 'undefined'){
      this.load_pdf = true;
      let variaciones = [];
      this.resumen_ventas = [];

      for(var item of this.detalles){
        if(item.tipo_detalle == 'En almacen'){
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
            var variaciones_arr = variaciones.filter(subitem=> subitem._id == item.producto_variacion._id);
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
      }
      for(var sitem of variaciones){
        var total_cantidades = 0;
        var total_monto = 0;

        for(var det of sitem.detalles){
          total_cantidades = total_cantidades + parseFloat(det.cantidad);
          total_monto = total_monto + (parseFloat(det.cantidad)*parseFloat(det.precio))
        }

        this.resumen_ventas.push({
          _id: sitem._id,
          precio: sitem.precio,
          producto: sitem.producto,
          codigo: item.producto.codigo,
          variacion_name: sitem.variacion_name,
          unidad: sitem.unidad,
          tipo: sitem.tipo,
          talla: sitem.talla,
          color_name: sitem.color_name,
          hxd: sitem.hxd,
          total_cantidades: total_cantidades.toFixed(2),
          total_monto: total_monto,
          tipo_detalle: 'Entrega',
          disponibilidad: 'inmediata',
          unidades: sitem.detalles.length
        })
      }


      for(var item of this.detalles){
        let inicio_camino = moment().add(1, 'months').format('YYYY-MM-DD');
        let fin_camino = moment().add(2, 'months').format('YYYY-MM-DD');

        let inicio_programacion = moment().add(3, 'months').format('YYYY-MM-DD');
        let fin_programacion = moment().add(4, 'months').format('YYYY-MM-DD');
    
        if(item.tipo_detalle == 'En camino'){
          this.resumen_ventas.push({
            _id: item._id,
            precio:item.producto_variacion.precio_venta,
            producto: item.producto.titulo,
            codigo: item.producto.codigo,
            variacion_name: item.producto_variacion.variacion_name,
            unidad: item.unidad,
            tipo: item.producto_variacion.tipo,
            talla: item.producto_variacion.talla,
            color_name: item.producto_variacion.color_name,
            hxd: item.producto_variacion.hxd,
            total_cantidades: item.cantidad,
            total_monto: item.cantidad * item.producto_variacion.precio_venta,
            tipo_detalle: 'Entrega',
            disponibilidad: inicio_camino+ " - "+fin_camino,
            unidades: '1'
          })
        }else if(item.tipo_detalle == 'Programación'){
          this.resumen_ventas.push({
            _id: item._id,
            precio:item.producto_variacion.precio_venta,
            producto: item.producto.titulo,
            codigo: item.producto.codigo,
            variacion_name: item.producto_variacion.variacion_name,
            unidad: item.unidad,
            tipo: item.producto_variacion.tipo,
            talla: item.producto_variacion.talla,
            color_name: item.producto_variacion.color_name,
            hxd: item.producto_variacion.hxd,
            total_cantidades: item.cantidad.toFixed(2),
            total_monto: item.cantidad * item.producto_variacion.precio_venta,
            tipo_detalle: 'Entrega',
            disponibilidad: inicio_programacion+" - "+fin_programacion,
            unidades: '1'
          })
        }
        
      }
      this.init_invoice();
    }else{
      toastr.success("La venta no tiene firma.");
    }
  }

  createSlug(str:any) {
    let slug = str.toLowerCase().replace(/\s+/g, '-');
    slug = slug.replace(/[^\w\-]+/g, '');
    const maxLength = 50;
    slug = slug.substring(0, maxLength).replace(/-$/, '');
    return slug;
  }
  
  convertCurrency(value: any): string {
    const opcionesDeFormato :any = {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
  
    const numeroFormateado = value !== 0
      ? new Intl.NumberFormat('es-MX', opcionesDeFormato).format(value)
      : '0';
  
    return numeroFormateado;
  }

  init_invoice(){
    let client_name = '';
    let client_str = '';
    let client_email = '';
    let client_telefono = '';
    let subtotal_seis,subtotal_cinco,subtotal_cero;
    let iva = this.venta.monto_total-this.venta.monto_total/1.16;
    let subtotal = (this.venta.monto_total/1.16);
    let idventa = "#VEN"+new Date().getFullYear()+this.venta.serie.toString().padStart(6,'000000');

    if(this.venta.tipo_usuario == 'Empresa'){
      client_name = this.venta.empresa.razon_social;
      client_str = 'Empresa';
      client_email = this.venta.empresa.email;
      client_telefono = 'Sin telefono';
    }
    if(this.venta.tipo_usuario == 'Cliente natural'){
      client_name = this.venta.cliente.nombres.split(' ')[0] + ' ' + this.venta.cliente.apellidos.split(' ')[0];
      client_str = 'Cliente natural';
      if(this.venta.cliente.email){
        client_email = this.venta.cliente.email
      }else{
        client_email = 'Correo no registrado'
      }

      client_telefono = this.venta.cliente.telefono;
    }

   
    subtotal_seis = this.venta.monto_total - ((this.venta.monto_total*6)/100);
    subtotal_cinco = this.venta.monto_total - ((this.venta.monto_total*5)/100);
    subtotal_cero = this.venta.monto_total+0;

    let inputs : Array<any> = [
      {
        "cliente": client_name,
        "email": client_email,
        "telefono": client_telefono,
        "venta": idventa,
        "fecha": moment(new Date()).format('YYYY-MM-DD'),
        "text_es":  this.venta.cliente_ubicacion.text_es,
        "region": this.venta.cliente_ubicacion.region,
        "place": this.venta.cliente_ubicacion.place,
        "place_name_es": this.venta.cliente_ubicacion.place_name_es,
        "pagina_uno": idventa+" - Pagina 1/3 en el documento.",
        "pagina_dos": idventa+" - Pagina 2/3 en el documento.",
        "pagina_tres": idventa+" - Pagina 3/3 en el documento.",
        "total_uno":  this.convertCurrency(subtotal_seis),
        "total_dos": this.convertCurrency(subtotal_cinco),
        "total_tres": this.convertCurrency(subtotal_cero),
        "subtotal": this.convertCurrency(subtotal),
        "impuestos":this.convertCurrency(iva),
        "grand_total": this.convertCurrency(this.venta.monto_total),
        "firma_colaborador": this.user.nombres+' '+this.user.apellidos,
        "firma_cliente": this.venta.firma,
        "banco_uno": "No especificado",
        "banco_dos": "No especificado",
      }
    ]

    if(this.cuentas_bancarias[0]){
      const cuenta = this.cuentas_bancarias[0];
      inputs[0].banco_uno = `BANCO: ${cuenta.banco}\nNOMBRES: ${cuenta.titular}\nSWIFT: ${cuenta.swift}\nN° CUENTA: ${cuenta.ncuenta}\nC. INTERBANCARIA: ${cuenta.cinter}`;
    }

    if(this.cuentas_bancarias[1]){
      const cuenta = this.cuentas_bancarias[1];
      inputs[0].banco_dos = `BANCO: ${cuenta.banco}\nNOMBRES: ${cuenta.titular}\nSWIFT: ${cuenta.swift}\nN° CUENTA: ${cuenta.ncuenta}\nC. INTERBANCARIA: ${cuenta.cinter}`;
    }


    let schemas : Array<any> = [
      {
        "cliente": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 35.61
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "email": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 41.17
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "telefono": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 46.79
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "venta": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 54.67
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "fecha": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 59.7
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "text_es": {
          "type": "text",
          "position": {
            "x": 127.95,
            "y": 35.61
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "region": {
          "type": "text",
          "position": {
            "x": 127.95,
            "y": 41.17
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "place": {
          "type": "text",
          "position": {
            "x": 127.95,
            "y": 46.73
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "place_name_es": {
          "type": "text",
          "position": {
            "x": 127.95,
            "y": 54.67
          },
          "width": 74.1,
          "height": 11.08,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "banco_uno": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 76.32
          },
          "width": 81.5,
          "height": 25.86,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "banco_dos": {
          "type": "text",
          "position": {
            "x": 120.95,
            "y": 75.47
          },
          "width": 81.5,
          "height": 25.86,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "pagina_uno": {
          "type": "text",
          "position": {
            "x": 9.79,
            "y": 268.82
          },
          "width": 195.28,
          "height": 6.56,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#424242",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        }
      },
      {
        "pagina_dos": {
          "type": "text",
          "position": {
            "x": 9.79,
            "y": 268.82
          },
          "width": 195.28,
          "height": 6.56,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#424242",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "total_uno": {
          "type": "text",
          "position": {
            "x": 83.45,
            "y": 226.51
          },
          "width": 28.32,
          "height": 8.17,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "total_dos": {
          "type": "text",
          "position": {
            "x": 83.45,
            "y": 236.77
          },
          "width": 28.32,
          "height": 8.17,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "total_tres": {
          "type": "text",
          "position": {
            "x": 83.45,
            "y": 246.71
          },
          "width": 28.32,
          "height": 8.17,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "subtotal": {
          "type": "text",
          "position": {
            "x": 164.09,
            "y": 226.19
          },
          "width": 40.22,
          "height": 8.17,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "impuestos": {
          "type": "text",
          "position": {
            "x": 164.09,
            "y": 236.19
          },
          "width": 40.22,
          "height": 8.17,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "grand_total": {
          "type": "text",
          "position": {
            "x": 164.09,
            "y": 246.19
          },
          "width": 40.22,
          "height": 8.17,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        }
      },
      {
        "pagina_tres": {
          "type": "text",
          "position": {
            "x": 9.79,
            "y": 268.82
          },
          "width": 195.28,
          "height": 6.56,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#424242",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "firma_cliente": {
          "type": "image",
          "position": {
            "x": 12.7,
            "y": 75.4
          },
          "width": 56.14,
          "height": 15.13,
          "rotate": 0,
          "opacity": 1
        },
        "firma_colaborador": {
          "type": "text",
          "position": {
            "x": 159.76,
            "y": 84.13
          },
          "width": 45,
          "height": 6.56,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 13,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#000000",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        }
      }
    ]

    let columns : Array<any> =  [
      "cliente",
      "email",
      "telefono",
      "venta",
      "fecha",
      "text_es",
      "region",
      "place",
      "place_name_es",
      "banco_uno",
      "banco_dos",
      "pagina_uno",
      "pagina_dos",
      "total_uno",
      "total_dos",
      "total_tres",
      "subtotal",
      "impuestos",
      "grand_total",
      "pagina_tres"
    ]

    let count = 0;
    
    var y1_axis_uno = 121;
    var y1_axis_dos = 12.22;
    for(var item of this.resumen_ventas){
      count++;

      if(count <= 14){
        inputs[0]["producto"+count] = item.producto.substr(0,15)+" - "+item.variacion_name +'\n'+item.tipo_detalle + " " + item.disponibilidad;
        inputs[0]["cantidad"+count] = parseFloat(item.total_cantidades).toString() +'\n'+item.unidad;
        inputs[0]["precio"+count] = this.convertCurrency(item.precio) + '\nMXN';
        inputs[0]["total"+count] = this.convertCurrency(item.total_monto)+ '\nMXN';
        
        schemas[0]["producto"+count] = {
          "type": "text",
          "position": {
            "x": 12.65,
            "y": y1_axis_uno
          },
          "width": 96.59,
          "height": 9.23,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[0]["cantidad"+count] = {
          "type": "text",
          "position": {
            "x": 113.93,
            "y": y1_axis_uno
          },
          "width": 22.77,
          "height": 9.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[0]["precio"+count] = {
          "type": "text",
          "position": {
            "x": 140.72,
            "y": y1_axis_uno
          },
          "width": 20.91,
          "height": 9.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[0]["total"+count] = {
          "type": "text",
          "position": {
            "x": 165.68,
            "y": y1_axis_uno
          },
          "width": 36.79,
          "height": 9.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },

        columns.push("producto"+count);
        columns.push("cantidad"+count);
        columns.push("precio"+count);
        columns.push("total"+count);
        y1_axis_uno = y1_axis_uno + 14;

      }else{
        inputs[0]["producto"+count] = item.producto.substr(0,15)+" - "+item.variacion_name +'\n'+item.tipo_detalle + " " + item.disponibilidad;
        inputs[0]["cantidad"+count] = parseFloat(item.total_cantidades).toString() +'\n'+item.unidad;
        inputs[0]["precio"+count] = this.convertCurrency(item.precio) + '\nMXN';
        inputs[0]["total"+count] = this.convertCurrency(item.total_monto)+ '\nMXN';

        schemas[1]["producto"+count] = {
          "type": "text",
          "position": {
            "x": 12.65,
            "y": y1_axis_dos
          },
          "width": 96.59,
          "height": 9.23,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[1]["cantidad"+count] = {
          "type": "text",
          "position": {
            "x": 113.93,
            "y": y1_axis_dos
          },
          "width": 22.77,
          "height": 9.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[1]["precio"+count] = {
          "type": "text",
          "position": {
            "x": 140.72,
            "y": y1_axis_dos
          },
          "width": 20.91,
          "height": 9.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[1]["total"+count] = {
          "type": "text",
          "position": {
            "x": 165.68,
            "y": y1_axis_dos
          },
          "width": 36.79,
          "height": 9.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },

        columns.push("producto"+count);
        columns.push("cantidad"+count);
        columns.push("precio"+count);
        columns.push("total"+count);
        y1_axis_dos = y1_axis_dos + 14;
      }
    }


    var template: Template= {
      "schemas": schemas,
      "basePdf": invoice_ts.base_uno,
      "columns": columns
    };
    generate({ template, inputs }).then((pdf) => {
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      let str_1,str_2,str_3;
      str_2 = "serie-"+this.venta.serie;
      str_3 = moment(this.venta.createdAt).format('YYYY-MM-DD');
      if(this.venta.tipo_usuario == 'Empresa'){
        str_1 = this.venta.empresa.razon_social;
      }else if(this.venta.tipo_usuario == 'Cliente natural'){
        str_1 = this.venta.cliente.nombres;
      }

      let name_file = this.createSlug(str_1+"-"+str_2+"-"+str_3)
      console.log(name_file);
      
      var file = new File([blob], name_file+".pdf", {type: 'application/pdf'});
      console.log(file);
      
      this._ventaService.update_file_venta(this.venta._id,{file:file},this.token).subscribe(
        response=>{
          this.load_pdf = false;
          toastr.success("Venta actualizada correctamente.");
          $('#generarPDF').modal('hide');
        }
      );
    });

  }

  openModalFirma(item:any){
    console.log(item);
    
    this.envioOpen = item;
    setTimeout(() => {
      $(document).ready(() => {
        const canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
        this.context = canvas.getContext('2d');
        this.adjustCanvasSize();

        if (this.context) {
          this.context.lineWidth = 2; // Grosor del trazo
          this.context.strokeStyle = 'black'; // Color del trazo

        } else {
          console.error('No se pudo obtener el contexto del canvas.');
        }
      });
    }, 1000);
  }

  saveFirma(){
    let data : any = {};
    if (this.context) {
      const canvas = this.canvasRef.nativeElement;
      const imageDataUrl = canvas.toDataURL('image/png'); 
      data.firma = imageDataUrl;
      this.load_firma_envio = true;
      this._ventaService.update_firma_envio(this.envioOpen._id,data,this.token).subscribe(
        response=>{
          console.log(response);
          this.load_firma_envio = false;
          this.init_envios();
          $('#firmaEnvio').modal('hide');
        }
      );
    }
  }

  /*FIRMA---------------------*/

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.adjustCanvasSize();
  }

  adjustCanvasSize() {
    if (this.context) {
      const canvas = this.canvasRef.nativeElement;
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * pixelRatio;
      canvas.height = canvas.clientHeight * pixelRatio;
      this.context.scale(pixelRatio, pixelRatio);
    }
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    event.preventDefault()
    if (this.context) {
      this.drawing = true;
      this.isCanvasEmpty = false;
      const x = this.getX(event);
      const y = this.getY(event);
      this.context.beginPath();
      this.context.moveTo(x, y);
    }
  }

  draw(event: MouseEvent | TouchEvent) {
    if (this.drawing && this.context) {
      event.preventDefault()
      const x = this.getX(event);
      const y = this.getY(event);
      this.context.lineTo(x, y);
      this.context.stroke();
    }
  }
  stopDrawing() {
    this.drawing = false;
  }

  private getX(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.offsetX;
    } else if (event instanceof TouchEvent && event.touches.length > 0) {
      return event.touches[0].clientX - this.canvasRef.nativeElement.getBoundingClientRect().left;
    }
    return 0;
  }

  private getY(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.offsetY;
    } else if (event instanceof TouchEvent && event.touches.length > 0) {
      return event.touches[0].clientY - this.canvasRef.nativeElement.getBoundingClientRect().top;
    }
    return 0;
  }

  clearCanvas() {
    if (this.context) {
      const canvas = this.canvasRef.nativeElement;
      this.context.clearRect(0, 0, canvas.width, canvas.height);
      this.isCanvasEmpty = true;
    }
  }
}

