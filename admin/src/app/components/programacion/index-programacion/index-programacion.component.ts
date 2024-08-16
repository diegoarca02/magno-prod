import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
import { VentaService } from 'src/app/services/venta.service';
declare var $:any;
declare var moment:any;
declare var toastr:any;
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

@Component({
  selector: 'app-index-programacion',
  templateUrl: './index-programacion.component.html',
  styleUrls: ['./index-programacion.component.css']
})
export class IndexProgramacionComponent implements OnInit {

  public token = localStorage.getItem('token');
  public page = 10;
  public load_data = true;
  public programaciones : Array<any> = []; 
  public const_programaciones : Array<any> = []; 

  public parameters = JSON.parse(localStorage.getItem('parameters')!);
  public url = GLOBAL.url;

  public tipo_option = 'Todos';
  public load_programaciones = false;
  public estados : any = {};
  public load_confirmacion = false;
  public load = 0;
  public last_page = 0;
  public page_status = true;
  public todos = 0;
  public permisos : Array<any> = [];

   constructor(
    private _ventaService:VentaService,
    private _productoService:ProductoService,
    private _router:Router,
    private _route:ActivatedRoute
  ) { 

  }


  ngOnInit(): void {
    
  }

  handlePermisos(event:any){
    this.permisos = event;

    if(this.permisos.includes('11000')){
      this.init_todos();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

 
  set_tipo(tipo:any){
    this.tipo_option = tipo;

    if(this.tipo_option != 'Todos'){
      this.programaciones = this.const_programaciones.filter(item=> item.programacion.estado == this.tipo_option);
    }else{
      this.programaciones = this.const_programaciones;
    }
  }

  click_matriculas(){
    this.page = this.page + 10;
    this.init_todos();
  }
  
  init_todos(){
    this.load++;
    if(this.load==0) this.load_data = true;
    this._ventaService.get_programaciones_range(this.tipo_option,this.page,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data.length == this.last_page){
          this.page_status = false;
        }
        this.programaciones = response.data;
        this.const_programaciones = this.programaciones;
        this.estados = response.estados;
        this.todos = response.todos;
        console.log(response);
        
        this.load_data = false;
      }
    );
  }

  confirmar(idx:any){
    this.load_confirmacion = true;
    this._ventaService.confirmar_programacion(idx,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          toastr.success("Se confirmó la programación.");
          $('#confirmacion-'+idx).modal('hide')
          this.init_todos();
        }else{
          toastr.error("No se pudo confirmar la programación.");
        }

        this.load_confirmacion = false;
      }
    );
  }

}
