import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
declare var $:any;
declare var toastr:any;
declare var moment:any;
import domtoimage from 'dom-to-image';
import { SettinsService } from 'src/app/services/settins.service';

@Component({
  selector: 'app-historial-inventario',
  templateUrl: './historial-inventario.component.html',
  styleUrls: ['./historial-inventario.component.css']
})
export class HistorialInventarioComponent implements OnInit {

  public token = localStorage.getItem('token');
  public id = '';
  public periodo = '';
  public load_data = true;
  public data = true;
  public rollos :Array<any> = [];
  public rollos_const:Array<any> = [];
  public variaciones :Array<any> = [];
  public variaciones_const:Array<any> = [];
  public almacenes :Array<any> = [];
  public color: any = {};
  public total_yardas = 0;
  public metro_to_yrd = 1.09361;
  public load_rollos = false;
  public load_variaciones = false;
  public load_delete = false;
  public page = 1;
  public pageSize = 24;

  public str_codigo = '';
  public str_almacen = 'Todos';
  public str_estado = 'Todos';

  public parameters = JSON.parse(localStorage.getItem('parameters')!);

  public permisos = {
    inventario_tres : false,
  }
  public tipo_option = '';

  constructor(
    private _pedidoService:PedidoService,
    private _settingsService:SettinsService,
    private _route:ActivatedRoute,
    private _router:Router
  ) {
    for(var item of this.parameters){
      if(item.permiso == 'inventario_tres'){
        this.permisos.inventario_tres = true;
      }
    }
  }

  ngOnInit(): void {
    if(this.permisos.inventario_tres){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.periodo = params['periodo'];
          if(params['tipo']){
            if(params['tipo'] == 'telas'){
              this.tipo_option = 'Telas';
            }else if(params['tipo'] == 'ropas'){
              this.tipo_option = 'Ropas';
            }
            this.init_almacenes();
          }else{
            this._router.navigate(['/inventario/historial/telas/'+this.id+'/'+this.periodo]);
          }
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
    
  }

  init_almacenes(){
    this._settingsService.get_almacenes(this.token).subscribe(
      response=>{
        this.almacenes = response.data;
        if(this.tipo_option == 'Telas'){
          this.validar_color();
        }else if(this.tipo_option == 'Ropas'){
          this.validar_variacion();
        }
        
      }
    );
  }

  validar_color(){
    this.load_data = true;
    this._pedidoService.validar_color(this.id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          this.data = true;
          this.load_data = false;
          this.historial_telas();
        }else{
          this.data = false;
           this.load_data = false;
        }
       
      }
    );
  }

  validar_variacion(){
    this.load_data = true;
    this._pedidoService.validar_variacion(this.id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          this.data = true;
          this.load_data = false;
          this.historial_ropas();
        }else{
          this.data = false;
           this.load_data = false;
        }
       
      }
    );
  }

  historial_telas(){
    if(!this.periodo){
      toastr.error("Periodo requerido.");
    }else{
      this.load_rollos = true;
      this._pedidoService.rollos_historico(this.id,this.periodo,this.token).subscribe(
        response=>{
          this.rollos = [];
          console.log(response.data);
          
          for(var item of response.data){
            let inicio_ingreso = moment(item.ingreso.createdAt);
            let fin_ingreso = moment(new Date());

            if(!item.eliminacion || !item.estado){
              if(item.venta_detalle){
                let fecha_venta = moment(new Date(item.venta_detalle.venta.createdAt));
                item.dias_dsd_venta = fecha_venta.diff(inicio_ingreso,'days');

                if(!item.venta_detalle.venta.fecha_pago){
                  item.dias_dsd_pago = 'Deuda activa';
                }else{
                  let fecha_pago = moment(new Date(item.venta_detalle.venta.fecha_pago));
                  item.dias_dsd_pago = fecha_pago.diff(fecha_venta,'days');
                }
              }else{
                item.dias_dsd_venta = 'Eliminación';
              }
            }else{
              item.dias_dsd_venta = 'Eliminación';
            }

            item.dias_dsd_ingreso = fin_ingreso.diff(inicio_ingreso,'days'); 
            
            this.rollos.push(item)
          }
          console.log(this.rollos);
          
          this.rollos_const = this.rollos;
          this.load_rollos = false;
  
        }
      );
    }
  }

  historial_ropas(){
    if(!this.periodo){
      toastr.error("Periodo requerido.");
    }else{
      this.load_variaciones = true;
      this._pedidoService.variaciones_historico(this.id,this.periodo,this.token).subscribe(
        response=>{
          this.variaciones = [];
          console.log(response.data);
          
          for(var item of response.data){
            let inicio_ingreso = moment(item.ingreso.createdAt);
            let fin_ingreso = moment(new Date());

            if(!item.eliminacion || !item.estado){
              if(item.venta_detalle){
                let fecha_venta = moment(new Date(item.venta_detalle.venta.createdAt));
                item.dias_dsd_venta = fecha_venta.diff(inicio_ingreso,'days');

                if(!item.venta_detalle.venta.fecha_pago){
                  item.dias_dsd_pago = 'Deuda activa';
                }else{
                  let fecha_pago = moment(new Date(item.venta_detalle.venta.fecha_pago));
                  item.dias_dsd_pago = fecha_pago.diff(fecha_venta,'days');
                }
              }else{
                item.dias_dsd_venta = 'Eliminación';
              }
            }else{
              item.dias_dsd_venta = 'Eliminación';
            }

            item.dias_dsd_ingreso = fin_ingreso.diff(inicio_ingreso,'days'); 
            
            this.variaciones.push(item)
          }
          console.log(this.variaciones);
          
          this.variaciones_const = this.variaciones;
          this.load_variaciones = false;
  
        }
      );
    }
  }

  search(){
    let arr_uno = [];
    let test_codigo =  new RegExp(this.str_codigo,'i');
    arr_uno = this.rollos_const.filter(item=>test_codigo.test(item.codigo));

    let arr_dos = [];
    if(this.str_almacen != 'Todos'){
      arr_dos = arr_uno.filter(item=>item.ingreso.almacen == this.str_almacen);
    }else{
      arr_dos = arr_uno;
    }

    console.log(this.str_estado);

    let arr_tres = [];
    if(this.str_estado != 'Todos'){
      let estado_bool = (this.str_estado === 'true');
      arr_tres = arr_dos.filter(item=>item.estado == estado_bool);
    }else{
      arr_tres = arr_dos;
    }

    this.rollos = arr_tres;
  }

}
