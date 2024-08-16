import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { LOGO } from 'src/app/templates_pdf/logo';
declare var KTUtil:any;
declare var ApexCharts:any;
import { ProductoService } from 'src/app/services/producto.service';
declare var $:any;
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { Template, BLANK_PDF, generate } from '@pdfme/generator';
import { invoice_ts } from 'src/app/templates_pdf/invoice/invoice_';
import { VentaService } from 'src/app/services/venta.service';
declare var moment:any;
var inputs_uno : any = [];
var schemas_uno : any = [];
var columns_uno : any = [];
declare var toastr:any;

@Component({
  selector: 'app-detalle-programacion',
  templateUrl: './detalle-programacion.component.html',
  styleUrls: ['./detalle-programacion.component.css']
})
export class DetalleProgramacionComponent implements OnInit {

  public data : any = false;
  public load_data = true;
  public token = localStorage.getItem('token');
  public id = '';
  public programacion : any = {};
  public detalles : Array<any> = [];
  public url = GLOBAL.url;
  public logo_str = LOGO.str;
  public cancelado = false;
  public load_cancelar = false;
  public load_cancelar_detalle = false;
  public load_confirmacion = false;
  public pagos_pendientes = 0;
  public permisos:Array<any> = [];

  constructor(
    private _route:ActivatedRoute,
    private _productoService:ProductoService,
    private _ventaService:VentaService,
    private _router:Router
  ) { 
    
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('11003')){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          console.log(this.id);
          
          this.init_programacion();
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {

  }

  init_programacion(){
    this.load_data = true;

    
    this._ventaService.get_programacion(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        if(response.data != undefined){
          this.pagos_pendientes = response.pagos_pendientes;
          this.programacion = response.programacion;
          this.detalles = response.programacion_detalle;
          for(var item of this.detalles){
            if(item.estado != 'Procesado') this.cancelado = true;
          }
          this.data = true;
        }else{
          this.data = false;
        }
        this.load_data = false;
      }
    );
  }


  cancelar(){
    this.load_cancelar = true;
    this._ventaService.cancelar_programacion(this.id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          toastr.success("Se canceló la programación.");
          $('#cancelarModal').modal('hide')
          this.init_programacion();
        }else{
          toastr.error("No se pudo cancelar la programación.");
        }


        this.load_cancelar = false;
      }
    );
  }

  confirmar(){
    this.load_confirmacion = true;
    this._ventaService.confirmar_programacion(this.id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          toastr.success("Se confirmó la programación.");
          $('#confirmacion').modal('hide')
          this.init_programacion();
        }else{
          toastr.error("No se pudo confirmar la programación.");
        }

        this.load_confirmacion = false;
      }
    );
  }

  cancelar_detalle(id:any){
    this.load_cancelar_detalle = true;
    this._ventaService.cancelar_detalle_programacion(id,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data != undefined){
          toastr.success("Se canceló la programación.");
          $('#detCancelar-'+id).modal('hide')
          this.init_programacion();
        }else{
          toastr.error("No se pudo cancelar la programación.");
        }


        this.load_cancelar_detalle = false;
      }
    );
  }

}
