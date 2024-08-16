import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from 'src/app/services/venta.service';
declare var toastr:any;
declare var $:any;
declare var moment:any;
import { io } from "socket.io-client";
import { GLOBAL } from 'src/app/services/GLOBAL';
import { GENERAL } from 'src/app/services/GENERAL';

@Component({
  selector: 'app-create-envio',
  templateUrl: './create-envio.component.html',
  styleUrls: ['./create-envio.component.css']
})
export class CreateEnvioComponent {
  public step = 1;
  public doc_venta : any = {};
  public venta_selected : any = {};
  public ventas_envio : Array<any> = [];
  public load_data = true;
  public detalles : Array<any> = [];
  public token = localStorage.getItem('token');
  public user = JSON.parse(localStorage.getItem('user_data')!);
  public id = '';
  public load_btn_remove = false;
  public unidades : Array<any> = [];
  public productos_venta = new Set();
  public load_rollos = false;
  public socket = io(GLOBAL.socket,{transports: ['websocket']});
  public envios :Array<any> = GENERAL.transportes;
  public permisos : Array<any> = [];
  
  constructor(
    private ventaService:VentaService,
    private _route:ActivatedRoute,
    private _router:Router
  ){
    this.doc_venta.lugar_expedicion = 'Jalisco, México.'
  }
  
  handlePermisos(event:any){
    this.permisos = event;

    if(this.permisos.includes('9001')){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.init_data();
        }
      );
  
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(){
    this.socket.on('emit-update-unidades',(data:any)=>{
      console.log(data);
      this.init_data();
      this.init_rollos();
    });
    
    

  }



  init_data(){
    this.load_data = true;

    this.ventaService.get_detalles_venta(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        this.detalles = response.data;
        this.doc_venta.venta = response.venta._id;
        this.venta_selected = response.venta;
        this.doc_venta.cliente = response.venta.cliente;
        this.doc_venta.cliente_ubicacion = response.venta.cliente_ubicacion._id;
        this.doc_venta.paqueteria= response.venta.metodo_envio;
        this.doc_venta.rollos = this.ventas_envio.length;
        this.doc_venta.lugar_expedicion = 'Zapotlanejo, Jalisco';
        this.doc_venta.destinatario = response.venta.cliente_ubicacion.encargado;
        this.doc_venta.paqueteria = response.venta.metodo_envio;

        $('.form-check-unidad').prop('checked', false);
        //PRODUCTOS
        this.detalles.forEach(item => {
          this.productos_venta.add(item.producto._id);
        });

        setTimeout(() => {
          for(var item of this.ventas_envio){
            $('#unidad-'+item).prop('checked', true);
          }
        }, 50);

        this.init_rollos();

        this.load_data = false;
      }
    );
  }

  init_rollos(){
    let data = Array.from(this.productos_venta);
    this.load_rollos = true;
    this.ventaService.unidades_disponibles_productos({products:data},this.token).subscribe(
      response=>{
        console.log(response);
        this.unidades = response.data;
        this.load_rollos = false;
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

  set_option(value:any){
    this.step = value;
  }

  create(){
    if(!this.doc_venta.destinatario){
      toastr.error("El destinatario es requerido.");
    }else{
      console.log( this.ventas_envio);
      this.doc_venta.subtotal = 0;
      for(var item of this.ventas_envio){
        let detalle = this.detalles.find(subitem => subitem._id == item);
        this.doc_venta.subtotal = this.doc_venta.subtotal + (parseFloat(detalle.cantidad)*detalle.precio);
      }
      
      
      this.doc_venta.detalles = this.ventas_envio;
      this.doc_venta.unidades = this.ventas_envio.length;
      console.log(this.doc_venta);
      this.ventaService.create_doc_envio(this.doc_venta,this.token).subscribe(
        response=>{
          if(response.data != undefined){
              this._router.navigate(['/envios']);
          }else{
              toastr.error("Ocurrio un Error.");
          }
        }
      );
    }
  }

  remove_detalle(id:any){
    this.load_btn_remove = true;
    this.ventaService.remove_detalle_venta(id,this.id,this.token).subscribe(
      response=>{
        this.init_data();
        $('#removeDetalle-'+id).modal('hide');
        toastr.success("Eliminación completada.");
        this.socket.emit('send-update-unidades',true);
        this.load_btn_remove = false;
      },
      error=>{
        console.log(error);
        
      }
    );
  }

  add_detalle(item:any){
    console.log(item);
    
    let data = {
      tipo: item.tipo,
      venta: this.id,
      producto: item.producto._id,
      producto_variacion: item.producto_variacion._id,
      color: item.color,
      ingreso_detalle: item._id,
      descuento: false,
      unidad: item.unidad,
      cantidad: item.cantidad,
      precio: item.producto_variacion.precio_venta,
      tipo_detalle: 'En almacen',
      fe_inicio : moment().format('YYYY-MM-DD'),
      fe_fin: moment().add(4, 'days').format('YYYY-MM-DD'),
      estado: 'Confirmado',
      day: new Date().getDate(),
      month: new Date().getMonth()+1,
      year: new Date().getFullYear()
    }

    this.ventaService.add_detalle_venta(this.id,data,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          this.init_data();
          toastr.success("Unidad agregada.");
          this.socket.emit('send-update-unidades',true);
          this.socket.emit('send-update-pago',true);
          this.init_rollos();
        }else{
          toastr.error(response.message);
        }
      },
      error=>{
        console.log(error);
        
      }
    );
  }

 
}
