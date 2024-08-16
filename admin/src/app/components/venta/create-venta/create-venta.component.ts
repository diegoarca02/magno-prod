
import { Component, ElementRef, HostListener, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Template, BLANK_PDF, generate } from '@pdfme/generator';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
import { SettinsService } from 'src/app/services/settins.service';
import { VentaService } from 'src/app/services/venta.service';
import { invoice_ts } from 'src/app/templates_pdf/invoice/invoice_';

declare var toastr:any;
declare var moment:any;
declare var $:any;

import { GENERAL } from 'src/app/services/GENERAL';
import * as mapboxgl from "mapbox-gl";
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { HttpClient } from '@angular/common/http';
var inputs : any = [];
var schemas : any = [];
var columns : any = [];
import { DOCUMENT } from '@angular/common';
import { io } from "socket.io-client";
import { PagoService } from 'src/app/services/pago.service';

@Component({
  selector: 'app-create-venta',
  templateUrl: './create-venta.component.html',
  styleUrls: ['./create-venta.component.css']
})
export class CreateVentaComponent implements OnInit {
  @ViewChild('contColoresVentas') contColoresVentas!: ElementRef;
  @ViewChild('contColoresProgra') contColoresProgra!: ElementRef;
  @ViewChild('contentSettingsVentas') contentSettingsVentas!: ElementRef;
  
  public socket = io("http://localhost:4201",{transports: ['websocket']});
  public mapbox = (mapboxgl as typeof mapboxgl);
  public today_now : any= new Date();
  public token = localStorage.getItem('token');
  public user = JSON.parse(localStorage.getItem('user_data')!);
  public venta : any = {
    tipo_usuario: '',
    tipo_pago: '',
    cliente_ubicacion: '',
    limit_days: '',
    metodo_envio: '',
    tipo: 'Tela',
    monto_total: 0,
    total_venta: 0,
    total_programacion: 0,
    total_camino: 0,
    entidad: '',
    metodo: ''
  };
  public usuario_selected : any = {};
  public filtro_cliente = '';
  public option_menu = 2;
  public configuracion : any = {
    cantidad: 0,
    unidad: 'Mtr',
  }
  public cuentas :Array<any> = [];

  public ubicaciones :Array<any> = [];
  public ubicacion_selected  : any = {};
  public load_cliente_selected = false;
  public empresa_selected : any = undefined;
  public cliente_selected : any = undefined;
  public credito : any = {};
  
  public load_clientes = false;
  public clientes :Array<any> = [];
  public clientes_const :Array<any> = [];
  public clientes_modal :Array<any> = [];
  public load_clientes_modal = true;
  public filtro_cliente_modal = 'Todos';
  public view_all_clients = false;

  public load_productos = true;
  public productos :Array<any> = [];
  public filtro_producto = '';
  public min_new_tag = GLOBAL.min_new_tag;
  public detalle : any = {
    unidad: '',
    tipo_detalle: 'En almacen',
  };
  public detalles :Array<any> = [];
  public det_ventas :Array<any> = [];
  public resumen_ventas :Array<any> = [];
  public resumen_ventas_detalles :Array<any> = [];
  public det_futurestock :Array<any> = [];
  public det_programacion :Array<any> = [];
  public producto_selected : any = {};
  public variaciones :Array<any> = [];
  public variacion_selected : any = undefined;
  public load_unidades = false;
  public total_unidades = 0;

  public future_stock = 0;
  public total_dispoble = 0;
  public total_reservado = 0;
  public unidades:Array<any> = [];
  public almacenes:Array<any> = [];
  public almacen_active = '';
  public count = 0;
  public detalle_producto = {
    count: 0,
    total: 0
  }
  public msm_error_unidades = '';
  public envios :Array<any> = GENERAL.transportes;
  public bancos :Array<any> = GENERAL.bancos;
  public load_venta = false;
  public isCanvasEmpty : boolean = true;

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private context: CanvasRenderingContext2D | null = null;
  private drawing = false;
  public venta_response : any = {};
  public programacion_response : any = {};
  public almacen_selected : any = '';

  public data_facturacion : any = {
    tipo_de_comprobante: 'NO-BOLETA',
    porcentaje: '',
    receptor: ''
  };

  public option_porcents :Array<any> = [
    {
      porcentaje: 20,
      monto: 0    
    },
    {
      porcentaje: 30,
      monto: 0    
    },
    {
      porcentaje: 40,
      monto: 0    
    },
    {
      porcentaje: 60,
      monto: 0    
    },
    {
      porcentaje: 80,
      monto: 0    
    }
  ]
  public cuentas_bancarias : Array<any> = [];
  public cliente_status = false;
  public permisos : Array<any> = [];

  sections: { [key: string]: ElementRef } = {};
  @ViewChild('section1') set content1(content: ElementRef) { this.sections['section1'] = content; }
  @ViewChild('section2') set content2(content: ElementRef) { this.sections['section2'] = content; }

  constructor(
    private _clienteService:ClienteService,
    private _productoService:ProductoService,
    private _settingsService:SettinsService,
    private _pedidoService:PedidoService,
    private _ventaService:VentaService,
    private _router:Router,
    private _route:ActivatedRoute,
    private renderer: Renderer2, 
    private el: ElementRef,
    private httpClient: HttpClient,
    private _pagoService:PagoService,
    @Inject(DOCUMENT) private document: Document
  ) {
    
    this.venta.fe_inicio_future_stock = moment().add(1, 'months').format('YYYY-MM-DD');
    this.venta.fe_fin_future_stock= moment().add(2, 'months').format('YYYY-MM-DD');

    this.venta.fe_inicio_programacion = moment().add(3, 'months').format('YYYY-MM-DD');
    this.venta.fe_fin_programacion = moment().add(4, 'months').format('YYYY-MM-DD');

    this.venta.fe_inicio = moment().format('YYYY-MM-DD');
    this.venta.fe_fin= moment().add(4, 'days').format('YYYY-MM-DD');

    this.mapbox.accessToken = 'pk.eyJ1IjoiZGllZ29hcmNhMDIiLCJhIjoiY2w3d2NiejZ2MGdqMzN3b2F3Mmg3Nmt5eCJ9.FM837DnzwN2MQMVzrtnEow';

   }


  ngOnInit(): void {
    
  }

  handlePermisos(event:any){
    this.permisos = event; 
    if(this.permisos.includes('10000')){
      this._route.queryParams.subscribe(
        params=>{
          let tipo;
          this.init_productos('Todos');
          if(params['tipo'] != undefined){
            tipo = params['tipo'];
            if(tipo == 'producto'){
              this.init_producto_id(params['payload']);
            }else if(tipo == 'color'){
              this.init_producto_color_id(params['producto'],params['payload']);
            }
          }
          this.validate_cliente_top();
          this.init_clientes_nuevos();
          this.init_cuentas_bancarias();
         
          if(localStorage.getItem('_MEVL')){
            this.venta.metodo_envio = localStorage.getItem('_MEVL');
          }
        }
      );
     
      
      let cliente_atendido = JSON.parse(localStorage.getItem('cliente_atendido')!);
      console.log(cliente_atendido);
      
      if(cliente_atendido == null){
        setTimeout(() => {
          $('#addClienteAtencion').modal('show');
        }, 50);
      }
    }else{
      this._router.navigate(['/dashboard']);
    }
  }



  init_almacenes(){
    this.almacenes = [];
    for(var item of GENERAL.almacenes){
      this.almacenes.push({
        almacen: item.name,
        lng: item.lng,
        lat: item.lat,
        unidades: [],
        unidades_activos : 0,
        distancia: 0
      });
    }
    this.almacen_active = this.almacenes[0].almacen;
    console.log(this.ubicacion_selected);
    console.log(this.almacenes);
    
    
    // Define una función que maneje la solicitud para un ítem específico.
    const obtenerDistanciaParaItem = (sitem:any) => {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${sitem.lng},${sitem.lat};${this.ubicacion_selected.lng},${this.ubicacion_selected.lat}?steps=true&geometries=geojson&access_token=${this.mapbox.accessToken}`;

      return this.httpClient.get(url).toPromise()
        .then((response: any) => {
          sitem.distancia = response.routes[0].distance / 1000;
          return Promise.resolve();  // Resuelve la promesa para continuar con el siguiente ítem.
        })
        .catch(error => {
          console.error("Error al obtener la distancia:", error);
          return Promise.resolve();  // Resuelve la promesa para continuar con el siguiente ítem.
        });
    }

    // Función recursiva para procesar cada ítem uno tras otro.
    const procesarSiguienteItem = (index:any) => {
      if (index >= this.almacenes.length) {
        console.log("Todas las distancias han sido obtenidas y procesadas.");
        return;
      }

      obtenerDistanciaParaItem(this.almacenes[index])
        .then(() => {
          procesarSiguienteItem(index + 1);  // Procesa el siguiente ítem.
        });
    }

// Comienza el procesamiento desde el primer ítem.
  procesarSiguienteItem(0);
    console.log(this.almacenes);
  }

  init_cuentas_bancarias(){
    this._pagoService.get_cuentas_destacadas(this.token).subscribe(
      response=>{
        console.log(response);
        this.cuentas_bancarias = response.data;
      }
    );
  }

  validate_cliente_top(){
    let cliente_atendido = JSON.parse(localStorage.getItem('cliente_atendido')!);
    console.log(cliente_atendido);
    
    if(cliente_atendido != null){
      this.select_cliente(cliente_atendido);
      this.filtro_cliente = cliente_atendido.nombres + ' ' + cliente_atendido.apellidos;
      this.init_clientes();
    }
  }

  next_step(op:any){
    if(op == 1){
      this.option_menu = 1;
    }else if(op == 2){
      if(!this.venta.tipo_usuario){
        toastr.error("El comprador es requerido.");
      }else if(!this.venta.cliente_ubicacion){
        toastr.error("La dirección es requerida.");
      }else{
        this.init_productos('Todos');
        this.option_menu = 2;
       
      }
    }else if(op == 3){
      if(this.detalles.length == 0){
        toastr.error("La venta no puede estar vacía.");
      }else{

        this.det_ventas = this.detalles.filter(item=>item.tipo_detalle == 'En almacen');
        this.det_programacion = this.detalles.filter(item=>item.tipo_detalle == 'Programación');
        this.det_futurestock = this.detalles.filter(item=>item.tipo_detalle == 'En camino');
        this.option_menu = 3;
       
      }
    }else if(op == 4){
      this.option_menu = 4;

      if(this.data_facturacion.tipo_de_comprobante != 'NO-BOLETA'){ 
        this.data_facturacion.metodo == 'Efectivo';
        this.data_facturacion.FormaPago = '01'
        this.data_facturacion.sat_cliente_facturacion = this.cuentas.filter(item=> item.cliente_facturacion.uid == this.data_facturacion.receptor)[0].cliente_facturacion._id;
      }
      
      setTimeout(() => {
        $("#kt_daterangepicker_2").daterangepicker({
          opens: 'center',
          drops: 'up',
          locale: {
            format: 'DD/MM/YYYY' // Establece el formato de fecha deseado
          },
        }, (start:any, end:any, label:any)=>{
          this.venta.fe_inicio_future_stock = start.format('YYYY-MM-DD');
          this.venta.fe_fin_future_stock = end.format('YYYY-MM-DD');
        });

        $("#kt_daterangepicker_2").data('daterangepicker').setStartDate(new Date(this.venta.fe_inicio_future_stock));
        $("#kt_daterangepicker_2").data('daterangepicker').setEndDate(new Date(this.venta.fe_fin_future_stock));
      }, 50);

      setTimeout(() => {
        $("#kt_daterangepicker_1").daterangepicker({
          opens: 'center',
          drops: 'up',
          locale: {
            format: 'DD/MM/YYYY' // Establece el formato de fecha deseado
          },
        }, (start:any, end:any, label:any)=>{
          this.venta.fe_inicio = start.format('YYYY-MM-DD');
          this.venta.fe_fin= end.format('YYYY-MM-DD');
        });

        $("#kt_daterangepicker_1").data('daterangepicker').setStartDate(new Date(this.venta.fe_inicio));
        $("#kt_daterangepicker_1").data('daterangepicker').setEndDate(new Date(this.venta.fe_fin));
      }, 50);

      setTimeout(() => {
        $("#kt_daterangepicker_3").daterangepicker({
          opens: 'center',
          drops: 'up',
          locale: {
            format: 'DD/MM/YYYY' // Establece el formato de fecha deseado
          },
        }, (start:any, end:any, label:any)=>{
          this.venta.fe_inicio = start.format('YYYY-MM-DD');
          this.venta.fe_fin= end.format('YYYY-MM-DD');
        });

        $("#kt_daterangepicker_3").data('daterangepicker').setStartDate(new Date(this.venta.fe_inicio_programacion));
        $("#kt_daterangepicker_3").data('daterangepicker').setEndDate(new Date(this.venta.fe_fin_programacion));
      }, 50);
    
      let total = this.venta.total_venta + this.venta.total_programacion;
      console.log(total);
      for(var item of this.option_porcents){
        item.monto = (item.porcentaje/100)*total;
      }
      
    }else if(op == 5){
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
      
      if(!this.venta.tipo_pago){
        toastr.error("El tipo de pago es requerido.");
      }else{
        if(this.venta.tipo_pago == 'Contado'){
          if(!this.venta.metodo_envio){
            toastr.error("El método de envío requerido.");
          }else if(!this.venta.fe_inicio || !this.venta.fe_fin){
            toastr.error("Las fechas son requeridas.");
          }else if(!this.venta.metodo){
            toastr.error("El método de pago requerido.");
          }if(!this.data_facturacion.tipo_de_comprobante){
            toastr.error("Seleccione el tipo de comprobante.");
          }else{
            if((this.venta.total_venta+this.venta.total_programacion) >= 1){
              if(this.data_facturacion.tipo_de_comprobante == 'Factura'){
                if(this.venta.metodo == 'Efectivo') this.data_facturacion.FormaPago = '01';
                else if(this.venta.metodo == 'Cheque nominativo') this.data_facturacion.FormaPago = '02';
                else if(this.venta.metodo == 'Transferencia electrónica de fondos') this.data_facturacion.FormaPago = '03';
                else if(this.venta.metodo == 'Tarjeta de crédito') this.data_facturacion.FormaPago = '04';
                else if(this.venta.metodo == 'Monedero electrónico') this.data_facturacion.FormaPago = '05';
                this.data_facturacion.sat_cliente_facturacion = this.cuentas.filter(item=> item.cliente_facturacion.uid == this.data_facturacion.receptor)[0].cliente_facturacion._id;

                if(!this.data_facturacion.porcentaje){
                  toastr.error("Seleccione el monto abonado.");
                }else if(!this.data_facturacion.receptor){
                  toastr.error("Seleccione la cuenta de facturación.");
                }else{
                  console.log(1);
                  
                  this.option_menu = 5 ;
                }
              }else{
                console.log(2);
                if(!this.data_facturacion.porcentaje){
                  toastr.error("Seleccione el monto abonado.");
                }else{
                  this.option_menu = 5 ;
                }
                
              }
            }else{
              toastr.error("El monto no puede ser 0.");
            }
          }
        }else if(this.venta.tipo_pago == 'Credito'){
          if(!this.venta.metodo_envio){
            toastr.error("El método de envío requerido.");
          }else if(!this.venta.fe_inicio || !this.venta.fe_fin){
            toastr.error("Las fechas son requeridas.");
          }else{
            this.option_menu = 5 ;
          }
        }
      }

      
    }
  }

  setTipo(){
    if(this.venta.tipo == 'Tela') this.configuracion.unidad = 'Mtr';
    else if(this.venta.tipo == 'Ropa') this.configuracion.unidad = 'Unid';
    else if(this.venta.tipo == 'Acero') this.configuracion.unidad = 'Kg'; 
  }

  select_cliente(item:any){
    this.venta.cliente = item._id;
    this.data_facturacion.cliente = item._id;
    this.usuario_selected = item;
    this.venta.tipo_usuario = 'Cliente natural';
    $('#str_comprador').val(item.nombres);

    //reset empresa
    delete this.venta.empresa_rs;
    delete this.venta.empresa;

    delete this.data_facturacion.empresa_rs;
    delete this.data_facturacion.empresa;

    this.init_ubicaciones('Cliente');
    

    //credito
    this.load_cliente_selected = true;
    this._clienteService.get_credito_cliente(item._id,'Cliente',this.token).subscribe(
      response=>{
        this.cliente_selected = response.cliente;
        this.cuentas = response.cuentas;
        console.log(response);
        this.credito = {
          deuda: response.deuda,
          solicitudes: response.solicitudes,
        }

        if(this.cliente_selected.credito_total==0){
          this.venta.tipo_pago = 'Contado'
        }else if(this.cliente_selected.credito_total>=1){
          this.venta.tipo_pago = 'Credito'
        }


        //CLIENTE ATENDIDO
        this.socket.emit('send-cliente-atendido',true);
        localStorage.setItem('cliente_atendido',JSON.stringify(this.usuario_selected));
        this.load_cliente_selected = false;
      }
    );
  }

  init_ubicaciones(tipo:any){
    if(tipo == 'Cliente'){
      this._clienteService.get_ubicaciones_clientes(this.venta.cliente,tipo,this.token).subscribe(
        response=>{
          this.ubicaciones = response.data;
          if(this.ubicaciones.length >= 1){
            this.venta.cliente_ubicacion = this.ubicaciones[0]._id;
            this.ubicacion_selected = this.ubicaciones.filter(item=>item._id.toString() == this.venta.cliente_ubicacion.toString())[0];
            this.init_almacenes();
          }
        }
      );
    }else if(tipo == 'Empresa'){
      this._clienteService.get_ubicaciones_clientes(this.venta.empresa,tipo,this.token).subscribe(
        response=>{
          this.ubicaciones = response.data;
          if(this.ubicaciones.length >= 1){
            this.venta.cliente_ubicacion = this.ubicaciones[0]._id;
            this.ubicacion_selected = this.ubicaciones.filter(item=>item._id.toString() == this.venta.cliente_ubicacion.toString())[0];
            this.init_almacenes();
          }
        }
      );
    }

  
  }
 
  init_clientes(){
    this.filtro_cliente = this.filtro_cliente.trim();
    if(this.filtro_cliente){
      
      this.load_clientes = true;
      this.clientes = [];
      this.clientes_const = [];
      this._clienteService.get_empresa_clientes(this.filtro_cliente,this.token).subscribe(
        response=>{
          console.log(response);
          
          this.clientes_const = response.data;
          if(response.data.length > 9){
            this.view_all_clients = true;
            response.data.forEach((element:any,index:any) => {
              if(index <= 9)  this.clientes.push(element);    
            });
          }else{
            this.view_all_clients = false;
            this.clientes = response.data;
          }
          this.clientes_const = response.data;
          
          this.load_clientes = false;
        }
      );
    }else{
      this.clientes_const = [];
      this.clientes = [];
    }
  }

  ver_todos_clientes(){
    this.view_all_clients = false;
    this.clientes = this.clientes_const;
  }

  select_empresa(item:any){
  
    this.venta.empresa_rs = item._id;
    this.venta.empresa = item.empresa._id;

    this.data_facturacion.empresa_rs = item._id;
    this.data_facturacion.empresa = item.empresa._id;

    this.empresa_selected = item;
    this.usuario_selected = item;
    this.venta.tipo_usuario = 'Empresa';

    $('#str_comprador').val(item.razon_social);
    $('#addCliente').modal('hide');

    this.init_ubicaciones('Empresa');
    this.set_ubicacion();
    //reset cliente
    delete this.venta.cliente;
    delete this.data_facturacion.cliente;

     //credito
     this.load_cliente_selected = true;
     this._clienteService.get_credito_cliente(item._id,'Empresa',this.token).subscribe(
      response=>{
        this.credito = {
          total: response.total,
          deuda: response.deuda,
        }
        this.load_cliente_selected = false;
      }
    );
  }

  set_ubicacion(){
    this.ubicacion_selected = this.ubicaciones.filter(item=>item._id.toString() == this.venta.cliente_ubicacion)[0];
  }

  init_productos(filtro:any){
    this.load_productos = true;
    this._productoService.get_productos_ventas_con_precios(this.venta.tipo,filtro,this.token).subscribe(
      response=>{
       console.log(response);
       
        for(var item of response.data){
          let create :any = new Date(item.producto.createdAt);
          item.producto.minutos_pasados = (this.today_now - create)/60000;
        }
        this.productos = response.data;
        this.productos.sort((a, b) => b.total_unidades - a.total_unidades);
        this.load_productos = false;
      }
    );
  }

  init_producto_id(id:any){
    this._productoService.get_producto_ventas_con_precios(id,this.token).subscribe(
      response=>{
        this.detalle.producto = response.data.producto._id;
        this.detalle.producto_title = response.data.producto.titulo;
        this.producto_selected = response.data.producto;
        this.variaciones = response.data.variaciones;
        for(var item of this.variaciones){
          item.selected = false;
        }
        console.log(this.variaciones);
      }
    );
  }

  init_producto_color_id(producto:any,color:any){
    this._productoService.get_producto_ventas_con_precios(producto,this.token).subscribe(
      response=>{
        this.detalle.producto = response.data.producto._id;
        this.detalle.producto_title = response.data.producto.titulo;
        this.producto_selected = response.data.producto;
        this.variaciones = response.data.variaciones;
        for(var item of this.variaciones){
          item.selected = false;
        }
        let variacion = this.variaciones.filter(item=> item._id == color)[0];
        let variacion_idx = this.variaciones.indexOf(variacion);
        this.variaciones.sort((a, b) => parseInt(b.unidades_activos) - parseInt(a.unidades_activos));
        this.selected_variacion(variacion,variacion_idx);
        setTimeout(() => {
          $('#radio-color-'+color).attr('checked', true);
        }, 50);
      }
    );
  }

  selected_producto(item:any){
    this.detalle.producto = item.producto._id;
    this.detalle.producto_title = item.producto.titulo;
    this.producto_selected = item.producto;
    this.variaciones = item.variaciones;
    for(var item of this.variaciones){
      item.selected = false;
    }
    setTimeout(() => {
      this.scrollToSection('section1');
    }, 500);
    console.log(this.variaciones);
    this.variaciones.sort((a, b) => parseInt(b.unidades_activos) - parseInt(a.unidades_activos));
  }

  search_productos(){
    if(this.filtro_producto){
      this.init_productos(this.filtro_producto);
    }else{
      this.init_productos('Todos');
    }
  }

  selected_variacion(item:any,idx:any){
    console.log(item);
    
    this.variacion_selected = item;
    this.variacion_selected.index = idx;
    this.detalle.sku = item.sku;
    this.detalle.variante = item.variante;
    this.detalle.hxd = item.hxd;
    this.detalle.producto_variacion = item._id;

    //CARGAR ROLLOS
    this.load_unidades = true;
    this.total_unidades = 0;

    this._ventaService.get_detalle_ingreso_by_color_venta(item._id,this.token).subscribe(
      response=>{
        console.log(response);
        
        this.future_stock = response.future_stock;
        this.total_dispoble = response.total_dispoble;
        this.total_reservado = response.total_reservado;
        this.unidades = response.detalles;
        for(var almacen_item of this.almacenes){
          almacen_item.unidades = this.unidades.filter(itm=>itm.ingreso.almacen == almacen_item.almacen);
          almacen_item.unidades_activos = almacen_item.unidades.length;

          if(almacen_item.unidades.length >= 1){
            this.almacen_active = almacen_item.almacen;
          }
        }

        //////////////////
        //ACTUALIZAR DESCUENTO A ROLLOS
        for(var almacen_item of this.almacenes){
          for(var item_unidad of almacen_item.unidades){
    
            if(this.variacion_selected.descuento){
              item_unidad.descuento = true;
              item_unidad.precio_ahora = this.variacion_selected.precio_ahora
            }
          }
        }
        
        for(var item of this.detalles){
          this.total_unidades = this.total_unidades + item.cantidad;
        }
        
         setTimeout(() => {
          $("#radio-color-"+this.detalle.producto_variacion).prop("checked", true);
         }, 50);
         
        console.log(this.almacenes);
        setTimeout(() => {
          this.scrollToSection('section2');
        }, 500);

        this.almacen_selected = this.almacenes[0].almacen;

        this.load_unidades = false;
      }
    );
  }

  

  count_almacenes(){
    for(var alm of this.almacenes){
      alm.unidades_activos = 0;
    }

    for(var alm of this.almacenes){
      for(var unidad of alm.unidades){
        if(unidad.estado){
           alm.unidades_activos = alm.unidades_activos + 1;
        }
      }
    }
  }

  add_detalle_camino(){
    console.log(this.variacion_selected);
    let variacion = this.variaciones.filter(item=> item._id == this.variacion_selected._id)[0];
    
    if(this.configuracion.cantidad <= variacion.future_stock){
      this.msm_error_unidades = '';
      let precio = this.variacion_selected.precio_venta;

      this.detalles.unshift({
        producto_title: this.variacion_selected.producto.titulo,
        hxd: this.variacion_selected.hxd,
        sku: this.variacion_selected.sku,
        color: this.variacion_selected.color,
        variacion_name: this.variacion_selected.variacion_name,
        talla: this.variacion_selected.talla,
        tipo: this.variacion_selected.tipo,
        color_name: this.variacion_selected.color_name,
        descuento: 0,
        producto: this.variacion_selected.producto._id,
        producto_variacion: this.variacion_selected._id,
        unidad: this.configuracion.unidad,
        precio: precio,
        cantidad: this.configuracion.cantidad,
        subtotal: 0,
        tipo_detalle: 'En camino',
        fe_inicio: this.venta.fe_inicio_future_stock,
        fe_fin: this.venta.fe_fin_future_stock
      });



      this.calcular_montos();
      this.init_resumen_detalles();
      setTimeout(() => {
        this.scrollToSection('section3');
      }, 500);
      this.init_paint_variaciones();
    }else{
      toastr.error("¡No hay stock disponible para lo solicitado!.");
    }
  }

  add_detalle_programacion(){
    if(!this.configuracion.cantidad){
      toastr.error("Ingrese la cantidad.");
    }else{
      let precio = this.variacion_selected.precio_venta;

      let data : any= {
        producto: this.producto_selected._id,
        producto_variacion: this.detalle.producto_variacion,
        variacion_name: this.variacion_selected.variacion_name,
        color: this.variacion_selected.color,
        color_name: this.variacion_selected.color_name,
        talla: this.variacion_selected.talla,
        tipo: this.variacion_selected.tipo,
        precio: precio,
        hxd: this.variacion_selected.hxd,
        sku: this.variacion_selected.sku,
        producto_title: this.producto_selected.titulo,
        tipo_usuario: this.venta.tipo_usuario,
        cantidad: this.configuracion.cantidad,
        unidad: this.configuracion.unidad,
        precio_unidad: precio,
        descuento: 0,
        tipo_detalle: 'Programación',
        fe_inicio: this.venta.fe_inicio_programacion,
        fe_fin: this.venta.fe_fin_programacion
      }

      if(this.venta.tipo_usuario == 'Empresa'){
        data.empresa_rs = this.venta.empresa_rs;
        data.empresa = this.venta.empresa;
      }else if(this.venta.tipo_usuario == 'Cliente natural'){
        data.cliente = this.venta.cliente;
      }

     /*  for(var item of this.variaciones){
        if(item._id == this.variacion_selected._id){
          item.selected = true;
        }
      } */
      this.detalles.unshift(data);
      this.calcular_montos();
      this.init_resumen_detalles();
      this.init_paint_variaciones();
      setTimeout(() => {
        this.scrollToSection('section3');
      }, 500);
    }
  }

  add_detalle_almacen(){
    console.log(this.detalle);
    if(!this.configuracion.cantidad){
      toastr.error("Ingrese la cantidad.");
    }else{
      //OBTENER TODOS LOS ROLLOS DE LOS ALMACENES
      console.log(this.detalles);
      console.log(this.almacenes);

      let arr_unidades = [];
      this.count = 0;

      for(var item of this.almacenes){
        for(var subitem of item.unidades){
          let unidades_detalles = this.detalles.filter(det => det.codigo == subitem.codigo)
          if(unidades_detalles.length == 0){;
            arr_unidades.push(subitem);
          }
        }
      }

      //SELECCION
      if(arr_unidades.length >= 1){
        for(var item of arr_unidades){
          console.log(this.count+'-'+this.configuracion.cantidad);
          if(item.ingreso.almacen == this.almacen_selected){
            if(this.count < this.configuracion.cantidad){
              let precio = item.producto_variacion.precio_venta;
              this.detalles.unshift({
                producto_title: item.producto.titulo,
                hxd: item.producto_variacion.hxd,
                sku: item.producto_variacion.sku,
                color_name: item.producto_variacion.color_name,
                variacion_name: item.producto_variacion.variacion_name,
                talla: item.producto_variacion.talla,
                tipo: item.producto_variacion.tipo,
                color: item.producto_variacion.color,
              
                descuento: 0,
                producto: item.producto._id,
                producto_variacion: item.producto_variacion._id,
                ingreso_detalle: item._id,
                unidad: item.unidad,
                precio: precio,
                cantidad: item.cantidad,
                subtotal: 0,
                almacen: item.ingreso.almacen,
                codigo: item.codigo,
                tipo_detalle: 'En almacen',
                fe_inicio: this.venta.fe_inicio,
                fe_fin: this.venta.fe_fin
              });
    
              this.detalle_producto.total = this.detalle_producto.total + (item.cantidad*precio);
              for(var alm of this.almacenes){
                for(var ro of alm.unidades){
                  if(ro.codigo == item.codigo){
                    ro.estado = false;
                  }
                }
              }
              this.count = this.count + parseFloat(item.cantidad);
              this.detalle_producto.count = this.detalle_producto.count + item.cantidad;
  
             
            }
          }
        }
      }else{
        toastr.error("¡No hay stock disponible para lo solicitado!.");
      }

  

      this.count_almacenes();
      this.calcular_montos();
      this.init_resumen_detalles();
      this.init_paint_variaciones();
      console.log(this.detalles);
    }
  }

  init_paint_variaciones(){
    for(var item of this.variaciones){
      item.selected = false;
    }

    for(let det of this.detalles){
      for(var item of this.variaciones){
        console.log(det.producto_variacion + ' - '+item._id);
        
        if(det.producto_variacion == item._id){
          item.selected = true;
        }
      }
    }

    console.log(this.detalles);
    
  }

  revert_rollo(color:any,idx:any,item:any){
    this.detalles.splice(idx,1);
    if(item.tipo_detalle == 'En almacen'){
      let almacen = this.almacenes.filter(subitem=>subitem.almacen == item.almacen)[0];

      for(var subitem of almacen.unidades){
        if(subitem.codigo == item.codigo){
          subitem.estado = true;
        }
      }
    }
    this.init_resumen_detalles();
    setTimeout(() => {
      $('#panelsStayOpen-'+color).addClass('show');
    }, 50);
    this.count_almacenes();
    this.calcular_montos();
    this.init_paint_variaciones();
  }

  revert_color(color:any){
    console.log(this.resumen_ventas_detalles[color].detalles);
    
    for (var i = this.resumen_ventas_detalles[color].detalles.length - 1; i >= 0; i--) {
        var item = this.resumen_ventas_detalles[color].detalles[i];
        console.log(item.idx);
    
        if (item.tipo_detalle == 'En almacen') {
            let almacen = this.almacenes.find(subitem => subitem.almacen == item.almacen);
    
            if (almacen) {
                for (var subitem of almacen.unidades) {
                    if (subitem.codigo == item.codigo) {
                        subitem.estado = true;
                    }
                }
            }
        }
        this.detalles.splice(item.idx, 1);
    }
    this.resumen_ventas_detalles.splice(color,1);
    this.count_almacenes();
    this.calcular_montos();
    this.init_paint_variaciones();
  }

  calcular_montos(){
    var ventas_almacen = this.detalles.filter(item=>item.tipo_detalle == 'En almacen');
    const total_almacen = ventas_almacen.reduce((count, item) => count + (parseFloat(item.cantidad)*parseFloat(item.precio)), 0);
    this.venta.total_venta = total_almacen;

    var ventas_camino = this.detalles.filter(item=>item.tipo_detalle == 'En camino');
    const total_camino = ventas_camino.reduce((count, item) => count + (parseFloat(item.cantidad)*parseFloat(item.precio)), 0);
    this.venta.total_camino = total_camino;

    var programaciones = this.detalles.filter(item=>item.tipo_detalle == 'Programación');
    const total_programaciones = programaciones.reduce((count, item) => count + (parseFloat(item.cantidad)*parseFloat(item.precio)), 0);
    this.venta.total_programacion = total_programaciones;

    this.venta.monto_total = this.venta.total_venta + this.venta.total_programacion + this.venta.total_camino;

    console.log(this.detalles);
    
  }

  setTipoPago(value:any){
    this.venta.tipo_pago = value;
  }

  set_metodo(){
    this.venta.entidad = '';
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

  init_resumen_response(arr:any){
    let variaciones = [];
    this.resumen_ventas = [];

    for(var item of arr){
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


    for(var item of arr){
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
    this.init_invoice_dos();
  }

  init_resumen_detalles(){
    let variaciones : any= [];
    this.resumen_ventas_detalles = [];
    console.log(this.detalles);
    

    this.detalles.forEach((item,idx) => {
      item.idx = idx;
      if(variaciones.length == 0){
        variaciones.push({
          _id: item.producto_variacion,
          producto: item.producto_title,
          variacion_name: item.variacion_name,
          color_name: item.color_name,
          talla: item.talla,
          tipo: item.tipo,
          unidad: item.unidad,
          hxd: item.hxd,
          precio:item.precio_venta,
          detalles: [item]
        });
      }else{
        var variaciones_arr = variaciones.filter((subitem:any)=> subitem._id == item.producto_variacion);
        if(variaciones_arr.length >= 1){
          variaciones_arr[0].detalles.push(item);
        }else{
          variaciones.push({
            _id: item.producto_variacion,
            producto: item.producto_title,
            variacion_name: item.variacion_name,
            color_name: item.color_name,
            talla: item.talla,
            tipo: item.tipo,
            unidad: item.unidad,
            hxd: item.hxd,
            precio:item.precio_venta,
            detalles: [item]
          });
        }
      }
    });
    for(var sitem of variaciones){
      var total_cantidades = 0;

      for(var det of sitem.detalles){
        total_cantidades = total_cantidades + parseFloat(det.cantidad);
      }

      this.resumen_ventas_detalles.push({
        _id: sitem._id,
        producto: sitem.producto,
        variacion_name: sitem.variacion_name,
        unidad: sitem.unidad,
        tipo: sitem.tipo,
        talla: sitem.talla,
        color_name: sitem.color_name,
        hxd: sitem.hxd,
        total_cantidades: total_cantidades.toFixed(2),
        unidades: sitem.detalles.length,
        detalles: sitem.detalles
      })
    }
  }

  create(){
    let cantidad_venta = 0;
    for(var item of this.detalles){
      cantidad_venta = cantidad_venta + item.cantidad;
    }
    if(this.venta.tipo_pago == 'Contado'){
      this.venta.estado = 'Procesado';
    }else{
      if((this.cliente_selected.credito_disponible-this.venta.monto_total)>=1){
        this.venta.estado = 'Procesado';
      }else{
        this.venta.estado = 'Pendiente';
      }
    }
    this.venta.cantidad_total = cantidad_venta;
    this.venta.unidad = this.configuracion.unidad;
    this.venta.credito_solicitado = this.venta.monto_total - this.cliente_selected.credito_disponible;
    this.venta.detalles = this.detalles;
    this.venta.data_facturacion = this.data_facturacion;
    this.venta.data_facturacion.tipo_usuario = this.venta.tipo_usuario;
    if (this.context) {
      const canvas = this.canvasRef.nativeElement;
      const imageDataUrl = canvas.toDataURL('image/png'); 
      this.venta.firma = imageDataUrl;
    }
    this.load_venta = true;
    console.log(this.venta);
    
    this._ventaService.create_venta(this.venta,this.token).subscribe(
      response=>{
        console.log(response);
        localStorage.setItem('_MEVL',this.venta.metodo_envio);
        this.venta_response = response.venta;
        this.programacion_response = response.programacion;
        this.init_resumen_response(response.detalles);
       
      }
    );
  }


  init_invoice_dos(){
    let client_name = '';
    let client_str = '';
    let client_email = '';
    let client_telefono = '';
    let subtotal_seis,subtotal_cinco,subtotal_cero;
    let iva = this.venta.monto_total-this.venta.monto_total/1.16;
    let subtotal = (this.venta.monto_total/1.16);
    let idventa = "#VEN"+new Date().getFullYear()+this.venta_response.serie.toString().padStart(6,'000000');

    if(this.venta.tipo_usuario == 'Empresa'){
      client_name = this.usuario_selected.empresa.razon_social;
      client_str = 'Empresa';
      client_email = this.usuario_selected.empresa.email;
      client_telefono = 'Sin telefono';
    }
    if(this.venta.tipo_usuario == 'Cliente natural'){
      client_name = this.usuario_selected.nombres.split(' ')[0] + ' ' + this.usuario_selected.apellidos.split(' ')[0];
      client_str = 'Cliente natural';
      if(this.usuario_selected.email){
        client_email = this.usuario_selected.email
      }else{
        client_email = 'Correo no registrado'
      }

      client_telefono = this.usuario_selected.telefono;
    }

   
    subtotal_seis = this.venta.monto_total - ((this.venta.monto_total*6)/100);
    subtotal_cinco = this.venta.monto_total - ((this.venta.monto_total*5)/100);
    subtotal_cero = this.venta.monto_total+0;

    inputs = [
      {
        "cliente": client_name,
        "email": client_email,
        "telefono": client_telefono,
        "venta": idventa,
        "fecha": moment(new Date()).format('YYYY-MM-DD'),
        "text_es":  this.venta_response.cliente_ubicacion.text_es,
        "region": this.venta_response.cliente_ubicacion.region,
        "place": this.venta_response.cliente_ubicacion.place,
        "place_name_es": this.venta_response.cliente_ubicacion.place_name_es,
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
        "firma_cliente": this.venta_response.firma,
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


    schemas = [
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
    ],

    columns =  [
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

      if(count <= 10){
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
      str_2 = "serie-"+this.venta_response.serie;
      str_3 = moment(this.venta_response.createdAt).format('YYYY-MM-DD');
      if(this.venta.tipo_usuario == 'Empresa'){
        str_1 = this.empresa_selected.razon_social;
      }else if(this.venta.tipo_usuario == 'Cliente natural'){
        str_1 = this.usuario_selected.nombres;
      }

      let name_file = this.createSlug(str_1+"-"+str_2+"-"+str_3)
      console.log(name_file);
      
      var file = new File([blob], name_file+".pdf", {type: 'application/pdf'});
      console.log(file);
      
      this._ventaService.update_file_venta(this.venta_response._id,{file:file},this.token).subscribe(
        response=>{
          this.load_venta = false;
          toastr.success("Venta creada correctamente.");
          this._router.navigate(['/ventas/detail/'+response.data._id]);
        }
      );
    });

  }

  createSlug(str:any) {
    let slug = str.toLowerCase().replace(/\s+/g, '-');
    slug = slug.replace(/[^\w\-]+/g, '');
    const maxLength = 50;
    slug = slug.substring(0, maxLength).replace(/-$/, '');
    return slug;
  }
  
  scrollToSection(sectionId: string): void {
    const targetSection = this.sections[sectionId];

    if (targetSection) {
      this.document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  convertCurrency(value: any): string {
    const opcionesDeFormato = {
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

  redirect_url(value:any){
    this._router.navigate([value]).then(()=>{
      $('#addClienteAtencion').modal('hide');
    });
  }

  init_clientes_nuevos(){
    this.load_clientes_modal = true;
    if(this.filtro_cliente_modal){
      this._clienteService.get_clientes_admin(this.filtro_cliente_modal,this.token).subscribe(
        response=>{
          this.clientes_modal = response.data;
          this.load_clientes_modal = false;
        }
      );
    }
  }


}
