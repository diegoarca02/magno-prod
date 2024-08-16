import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GENERAL } from 'src/app/services/GENERAL';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
import { SettinsService } from 'src/app/services/settins.service';
import { VentaService } from 'src/app/services/venta.service';
declare var toastr:any;
declare var moment:any;
declare var $:any;


@Component({
  selector: 'app-create-programacion',
  templateUrl: './create-programacion.component.html',
  styleUrls: ['./create-programacion.component.css']
})
export class CreateProgramacionComponent implements OnInit {

  public option_menu = 1;
  public token = localStorage.getItem('token');
  public url = GLOBAL.url;
  public load_btn = false;

  public load_clientes = false;
  public load_cliente_selected = false;
  public clientes :Array<any> = [];
  public filtro_cliente = '';
  public clientes_const :Array<any> = [];
  public view_all_clients = false;

  public empresa_selected : any = undefined;
  public cliente_selected : any = undefined;
  public programacion_selected : any = undefined;

  public venta : any = {
    tipo_usuario: '',
    tipo_pago: '',
    cliente_ubicacion: '',
    limit_days: '',
    metodo_envio: ''
  };

  public ubicaciones :Array<any> = [];
  public ubicacion_selected  : any = {};
  public credito : any = {};
  public programaciones :Array<any> = [];
  public before_detalles :Array<any> = [];
  public detalles :Array<any> = [];

  public total : any = 0;
  public total_const = 0;
  public yrds : any = 0;
  public yrds_const = 0;

  public resumen_metraje = 0;
  public envios :Array<any> = GENERAL.envios;
  public pagos :Array<any> = GENERAL.bancos;
  public entidades :Array<any> = [];
  public load_entidades = false;
  public today = moment(new Date()).format();
  public user = JSON.parse(localStorage.getItem('user_data')!);
  public resumen_ventas :Array<any> = [];
  public detalle : any = {
    unidad: '',
  };

  public load_rollos = false;
  public precio_unidad = 0;
  public metro_to_yrd = 1.09361;

  constructor(
    private _clienteService:ClienteService,
    private _productoService:ProductoService,
    private _settingsService:SettinsService,
    private _pedidoService:PedidoService,
    private _ventaService:VentaService,
    private _router:Router
    
  ) { 
  }

  ngOnInit(): void {
    let cliente_atendido = JSON.parse(localStorage.getItem('cliente_atendido')!);

    if(cliente_atendido != null){
      this.select_cliente(cliente_atendido);
      this.filtro_cliente = cliente_atendido.nombres + ' ' + cliente_atendido.apellidos;
      this.init_clientes();
    }

  }

  init_clientes(){
    this.filtro_cliente = this.filtro_cliente.trim();
    if(this.filtro_cliente){
      console.log(this.filtro_cliente);
      
      this.load_clientes = true;
      this.clientes = [];
      this.clientes_const = [];
      this._clienteService.get_empresa_clientes(this.filtro_cliente,this.token).subscribe(
        response=>{
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




  select_cliente(item:any){
    this.venta.cliente = item._id;
    this.cliente_selected = item;
    this.venta.tipo_usuario = 'Cliente natural';

    //RESET DETALLES
    this.detalles = [];
    this.before_detalles = [];
    this.total = 0;
    this.yrds = 0;
    this.programacion_selected = undefined;

    $('#str_comprador').val(item.nombres);

    //reset empresa
    delete this.venta.empresa_rs;
    delete this.venta.empresa;

    this.init_ubicaciones('Cliente');
    console.log(this.ubicacion_selected);
    

    //credito
    this.load_cliente_selected = true;
    this._clienteService.get_credito_cliente(item._id,'Cliente',this.token).subscribe(
      response=>{
        this.programaciones = response.programaciones;
        this.credito = {
          total: response.total,
          deuda: response.deuda,
          limit_credito: response.limit_credito,
          limit_days: response.limit_days,
          disponible: response.limit_credito - response.deuda
        }
        console.log(this.programaciones);
        
        this.load_cliente_selected = false;
      }
    );
  }

  select_empresa(item:any){
    this.venta.empresa_rs = item._id;
    this.venta.empresa = item.empresa._id;
    this.empresa_selected = item;
    this.venta.tipo_usuario = 'Empresa';

    //RESET DETALLES
    this.detalles = [];
    this.before_detalles = [];
    this.total = 0;
    this.yrds = 0;
    this.programacion_selected = undefined;

    $('#str_comprador').val(item.razon_social);
    $('#addCliente').modal('hide');

    this.init_ubicaciones('Empresa');
    this.set_ubicacion();
    //reset cliente
    delete this.venta.cliente;

     //credito
     this.load_cliente_selected = true;
     this._clienteService.get_credito_cliente(item._id,'Empresa',this.token).subscribe(
      response=>{
        this.programaciones = response.ingresos;
        this.credito = {
          total: response.total,
          deuda: response.deuda,
          limit_credito: response.limit_credito,
          limit_days: response.limit_days,
          disponible: response.limit_credito - response.deuda
        }
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
            console.log(this.ubicacion_selected);
            
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
          }
        }
      );
    }
  }
  
  set_ubicacion(){
    this.ubicacion_selected = this.ubicaciones.filter(item=>item._id.toString() == this.venta.cliente_ubicacion)[0];
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
        this.option_menu = 2;
       
      }
    }else if(op == 3){
      if(this.detalles.length == 0){
        toastr.error("La venta no puede estar vacía.");
      }else{
        this.venta.metodo = '';
        this.venta.entidad = '';
        this.total_const = this.total; //CERRAR EL TOTAL
        this.yrds_const = this.yrds; //CERRAR EL TOTAL

        this.venta.fe_inicio = moment().format('YYYY-MM-DD');
        this.venta.fe_fin= moment().add(4, 'days').format('YYYY-MM-DD');

        setTimeout(() => {
          $("#kt_daterangepicker_1").daterangepicker({
            opens: 'center',
            drops: 'up'
          }, (start:any, end:any, label:any)=>{
            this.venta.fe_inicio = start.format('YYYY-MM-DD');
            this.venta.fe_fin= end.format('YYYY-MM-DD');
          });
    
          $("#kt_daterangepicker_1").data('daterangepicker').setStartDate(new Date(this.venta.fe_inicio+'T00:00:00'));
          $("#kt_daterangepicker_1").data('daterangepicker').setEndDate(new Date(this.venta.fe_fin+'T00:00:00'));
    
        }, 50);

        for(var item of this.detalles){
          this.resumen_metraje = this.resumen_metraje + item.cantidad;
        }

        this.option_menu = 3;
      }
    }else if(op == 4){
      this.venta.detalles = this.detalles;
      this.venta.total = this.total_const;
      
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
          }else if(this.venta.metodo != 'Efectivo'){
            if(!this.venta.entidad){
              toastr.error("La entidad bancaria requerida.");
            }else{
              this.option_menu = 4;
            }
          }else if(this.venta.metodo == 'Efectivo'){
            this.option_menu = 4;
          }
        }else if(this.venta.tipo_pago == 'Credito'){
          if(!this.venta.metodo_envio){
            toastr.error("El método de envío requerido.");
          }else if(!this.venta.fe_inicio || !this.venta.fe_fin){
            toastr.error("Las fechas son requeridas.");
          }else{
            this.option_menu = 4;
          }
        }
      }
    }
  }

  setTipoPago(){
    if(this.venta.tipo_pago == 'Credito'){
      this.total = this.total_const;
      this.venta.descuento = 0;
      this.total = this.total_const;
    }else if(this.venta.tipo_pago != 'Credito'){
      this.total = this.total_const;
      this.venta.descuento = 0;
      this.total = this.total_const;
    }
  }

  set_metodo(){
    this.venta.entidad = '';
  }

  select_programacion(item:any){
    if(!item.active){
      console.log(item);
      
      this.load_rollos = true;
      this.programacion_selected = item;

      if(item.cupon){
        this.venta.cupon = item.cupon._id;
      }else{
        delete this.venta.cupon;
      }
      
      this.precio_unidad = item.pedido_programacion.precio_unidad;
      this._pedidoService.get_ingreso(item._id,this.token).subscribe(
        response=>{
          if(response.data){
            this.before_detalles = [];
            for(var det of response.detalles){
              let cantidad_yrds,convert;
              if(det.ingreso.umedida_cantidad == 'Mtr'){
                cantidad_yrds = (det.cantidad*this.metro_to_yrd).toFixed(2);
                convert = true;
              }else if(det.ingreso.umedida_cantidad == 'Yrd'){
                cantidad_yrds = det.cantidad;
                convert = false;
              }

              this.before_detalles.push({
                producto_title: det.producto.titulo,
                hxd: det.producto_color.hxd,
                sku: det.producto_color.sku,
                variante: det.producto_color.variante,
          
                producto: det.producto._id,
                producto_color: det.producto_color._id,
                ingreso_detalle: det._id,
                unidad: 'Yrds',
                precio: this.precio_unidad,
                convert: convert,
                cantidad: det.cantidad,
                cantidad_yrds : cantidad_yrds,
                subtotal: 0,
                pedido_programacion : item.pedido_programacion._id,
                ingreso_id : item._id
              });
            }
          }
          this.load_rollos = false;
        }
      );
    }
  }

  confirmar_programacion(){
    for(var item of this.before_detalles){
      item.precio = this.precio_unidad
    }

    for(var item of this.programaciones){
      if(this.programacion_selected._id == item._id){
        item.active = true;
      }
    }
  
    for(var item of this.before_detalles){
      this.detalles.push(item);
    }

    console.log(this.detalles);
    

    this.calcular_total();
    this.programacion_selected = undefined;
  }

  quitar_programacion(id:any){
    for(var item of this.programaciones){
      if(id == item._id){
        item.active = false;
      }
    }

    let arr_detalles : any = [];
    this.detalles.forEach((element,index) => {
        if(element.ingreso_id.toString() != id.toString()){
          arr_detalles.push(element);
        }
    });
    this.detalles = arr_detalles;
    this.calcular_total();
  }

  calcular_total(){
    this.total = 0;
    this.yrds = 0;
    for(var item of this.detalles){
      this.total = this.total + (parseFloat(item.cantidad_yrds)*parseFloat(item.precio));
      this.yrds = this.yrds + parseFloat(item.cantidad_yrds);
    }

    this.total = this.total.toFixed(2);
    this.yrds = this.yrds.toFixed(2);
  }

  create(estado:any){
    this.venta.estado = estado;
    this.venta.credito_solicitado = this.credito.disponible - this.total;
    if(!this.venta.tipo_pago){
      toastr.error("El tipo de pago es requerido.");
    }else if(!this.venta.metodo_envio){
      toastr.error("El método de envío requerido.");
    }else if(!this.venta.fe_inicio || !this.venta.fe_fin){
      toastr.error("Las fechas son requeridas.");
    }else{
      this.create_s();
    }
   
  }

  create_s(){
    if(!this.venta.descuento){
      this.venta.descuento = 0;
    }

    for(var item of this.detalles){
      if(this.venta.tipo_usuario == 'Empresa'){
        item.empresa_rs = this.venta.empresa_rs;
        item.empresa = this.venta.empresa;
      }else if(this.venta.tipo_usuario == 'Cliente natural'){
        item.cliente = this.venta.cliente;
      }
      item.cantidad = item.cantidad_yrds;
    }

    this.venta.tipo_compra = 'Venta';

    this._ventaService.create_venta(this.venta,this.token).subscribe(
      response=>{
        toastr.success("Venta creada correctamente.");
        this._router.navigate(['/ventas/detail/'+response.data._id]);
      }
    );
  }
}
