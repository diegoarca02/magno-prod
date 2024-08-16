import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettinsService } from 'src/app/services/settins.service';
declare var toastr:any;
declare var $:any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  public token = localStorage.getItem('token');
  public load_almacenes = true;
  public load_btn_almacen = false;
  public almacen : any = {};
  public almacenes : Array<any> = [];

  public load_categorias = true;
  public load_btn_categoria = false;
  public categoria : any = {};
  public categorias : Array<any> = [];

  public load_composiciones = true;
  public load_btn_composicion = false;
  public composicion : any = {};
  public composiciones : Array<any> = [];

  public load_transportes = true;
  public load_btn_transporte = false;
  public transporte : any = {};
  public transportes : Array<any> = [];

  public load_entidades = true;
  public load_btn_entidad = false;
  public entidad : any = {};
  public entidades : Array<any> = [];


  public load_longitudes = true;
  public load_btn_longitud = false;
  public longitud : any = {};
  public longitudes : Array<any> = [];

  public load_pagos = true;
  public load_btn_pago = false;
  public pago : any = {};
  public pagos : Array<any> = [];

  public load_envios = true;
  public load_btn_envio = false;
  public envio : any = {};
  public envios : Array<any> = [];

  public load_tallas = true;
  public load_btn_talla = false;
  public talla : any = {};
  public tallas : Array<any> = [];

  public parameters = JSON.parse(localStorage.getItem('parameters')!);

  public permisos = {
    configuracion_uno : false,
    configuracion_dos : false,
    configuracion_tres : false,
    configuracion_cuatro : false,
    configuracion_cinco : false,
    configuracion_seis : false,
    configuracion_siete : false,
    configuracion_ocho : false,
  }

  public active = 'Almacenes';
  
  

  constructor(
    private _settingsService:SettinsService,
    private _router:Router
  ) { 
    for(var item of this.parameters){
      if(item.permiso == 'configuracion_uno'){
        this.permisos.configuracion_uno = true;
      }else if(item.permiso == 'configuracion_dos'){
        this.permisos.configuracion_dos = true;
      }else if(item.permiso == 'configuracion_tres'){
        this.permisos.configuracion_tres = true;
      }if(item.permiso == 'configuracion_cuatro'){
        this.permisos.configuracion_cuatro = true;
      }else if(item.permiso == 'configuracion_cinco'){
        this.permisos.configuracion_cinco = true;
      }else if(item.permiso == 'configuracion_seis'){
        this.permisos.configuracion_seis = true;
      }else if(item.permiso == 'configuracion_siete'){
        this.permisos.configuracion_siete = true;
      }else if(item.permiso == 'configuracion_ocho'){
        this.permisos.configuracion_ocho = true;
      }
    }
  }

  set_active(item:any){
    this.active = item;
  }

  ngOnInit(): void {
    this.init_almacenes();
    this.init_composiciones();
    this.init_transportes();
    this.init_entidades();
    this.init_longitudes();
    this.init_pagos();
    this.init_envios();
    this.init_tallas();
  }

  init_almacenes(){
    if(this.permisos.configuracion_uno){
      this.load_almacenes = true;
      this._settingsService.get_almacenes(this.token).subscribe(
        response=>{
          this.almacenes = response.data;
          this.load_almacenes = false;
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
    
  }

  crear_almacen(){
    if(!this.almacen.almacen){
      toastr.error("Ingrese el nuevo almacén.");
    }else{
      this.almacen.almacen = this.almacen.almacen.trim();
      this._settingsService.create_almacen(this.almacen,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.almacen = {};
            toastr.success("Registro completado.");
            this.init_almacenes();
          }else{
            toastr.error(response.message);
          }
        }
      );
    }
  }

  remove_almacen(id:any){
    this.load_btn_almacen = true;
    this._settingsService.delete_almacen(id,this.token).subscribe(
      response=>{
        this.init_almacenes();
        $('#delete-'+id).modal('hide');
        toastr.success("Eliminación completada.");
        this.load_btn_almacen = false;
      }
    );
  }

  ///////////////////////////////////////////////////////////////

  
  /* init_categorias(){
    this.load_categorias = true;
    this._settingsService.get_categorias(this.token).subscribe(
      response=>{
        this.categorias = response.data;
        this.load_categorias = false;
      }
    );
  }

  crear_categoria(){
    if(!this.categoria.categoria){
      toastr.error("Ingrese la nueva categoría.");
    }else{
      this.categoria.categoria = this.categoria.categoria.trim();
      this._settingsService.create_categoria(this.categoria,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.categoria = {};
            toastr.success("Registro completado.");
            this.init_categorias();
          }else{
            toastr.error(response.message);
          }
         
        }
      );
    }
  }

  remove_categoria(id:any){
    this.load_btn_categoria = true;
    this._settingsService.delete_categoria(id,this.token).subscribe(
      response=>{
        this.init_categorias();
        $('#delete-'+id).modal('hide');
        toastr.success("Eliminación completada.");
        this.load_btn_categoria = false;
      }
    );
  } */

  
  ///////////////////////////////////////////////////////////////
  
  init_composiciones(){
    this.load_composiciones = true;
    this._settingsService.get_composiciones(this.token).subscribe(
      response=>{
        this.composiciones = response.data;
        this.load_composiciones = false;
      }
    );
  }
  
  crear_composicion(){
    if(!this.composicion.composicion){
      toastr.error("Ingrese la nueva composicion.");
    }else{
      this.composicion.composicion = this.composicion.composicion.trim();
      this._settingsService.create_composicion(this.composicion,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.composicion = {};
            toastr.success("Registro completado.");
            this.init_composiciones();
          }else{
            toastr.error(response.message);
          }
          
        }
      );
    }
  }

  remove_composicion(id:any){
    console.log(id);
    
    this.load_btn_composicion = true;
    this._settingsService.delete_composicion_sett(id,this.token).subscribe(
      response=>{
        this.init_composiciones();
        $('#delete3-'+id).modal('hide');
        toastr.success("Eliminación completada.");
        this.load_btn_composicion = false;
      },
      error=>{
        console.log(error);
        
      }
    );
  }

  ///////////////////////////////////////////////////////////////


  
 ///////////////////////////////////////////////////////////////

  crear_tallas(){
    if(!this.talla.talla){
      toastr.error("Ingrese el nuevo talla.");
    }else{
      this.talla.talla = this.talla.talla.trim();
      console.log(this.talla);
      
      this._settingsService.create_talla(this.talla,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.talla = {};
            toastr.success("Registro completado.");
            this.init_tallas();
          }else{
            toastr.error(response.message);
          }
          
        }
      );
    }
  }

  init_tallas(){
    this.load_tallas = true;
    this._settingsService.get_tallas(this.token).subscribe(
      response=>{
        this.tallas = response.data;
        this.load_tallas = false;
      }
    );
  }

  remove_talla(id:any){
  
    this.load_btn_talla = true;
    this._settingsService.delete_talla_sett(id,this.token).subscribe(
      response=>{
        this.init_tallas();
        $('#deleteTalla-'+id).modal('hide');
        toastr.success("Eliminación completada.");
        this.load_btn_talla = false;
      },
      error=>{
        console.log(error);
        
      }
    );
  }
  
   ///////////////////////////////////////////////////////////////

  
   init_transportes(){
    this.load_transportes = true;
    this._settingsService.get_transportes(this.token).subscribe(
      response=>{
        this.transportes = response.data;
        this.load_transportes = false;
      }
    );
  }

  crear_transporte(){
    if(!this.transporte.transporte){
      toastr.error("Ingrese el nuevo transporte.");
    }else{
      this.transporte.transporte = this.transporte.transporte.trim();
      this._settingsService.create_transporte(this.transporte,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.transporte = {};
            toastr.success("Registro completado.");
            this.init_transportes();
          }else{
            toastr.error(response.message);
          }
          
        }
      );
    }
  }

  remove_transporte(id:any){
  
    this.load_btn_transporte = true;
    this._settingsService.delete_transporte(id,this.token).subscribe(
      response=>{
        this.init_transportes();
        $('#delete5-'+id).modal('hide');
        toastr.success("Eliminación completada.");
        this.load_btn_transporte = false;
      },
      error=>{
        console.log(error);
        
      }
    );
  }

  ///////////////////////////////////////////////////////////////

  
  init_entidades(){
    this.load_entidades = true;
    this._settingsService.get_entidades(this.token).subscribe(
      response=>{
        this.entidades = response.data;
        this.load_entidades = false;
      }
    );
  }

  crear_peso(){
    if(!this.entidad.entidad){
      toastr.error("Ingrese la nueva unidad de medida.");
    }else{
      this.entidad.entidad = this.entidad.entidad.trim();
      this._settingsService.create_entidad(this.entidad,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.entidad = {};
            toastr.success("Registro completado.");
            this.init_entidades();
          }else{
            toastr.error(response.message);
          }
          
        }
      );
    }
  }

  remove_entidad(id:any){
  
    this.load_btn_entidad = true;
    this._settingsService.delete_entidad(id,this.token).subscribe(
      response=>{
        this.init_entidades();
        $('#delete6-'+id).modal('hide');
        toastr.success("Eliminación completada.");
        this.load_btn_entidad = false;
      },
      error=>{
        console.log(error);
        
      }
    );
  }

  ///////////////////////////////////////////////////////////////

  
  init_longitudes(){
    this.load_longitudes = true;
    this._settingsService.get_longitudes(this.token).subscribe(
      response=>{
        this.longitudes = response.data;
        this.load_longitudes = false;
      }
    );
  }

  crear_longitud(){
    if(!this.longitud.longitud){
      toastr.error("Ingrese la nueva unidad de medida.");
    }else{
      this.longitud.longitud = this.longitud.longitud.trim();
      this._settingsService.create_longitud(this.longitud,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.longitud = {};
            toastr.success("Registro completado.");
            this.init_longitudes();
          }else{
            toastr.error(response.message);
          }
         
        }
      );
    }
  }

  remove_longitud(id:any){
  
    this.load_btn_longitud = true;
    this._settingsService.delete_longitud(id,this.token).subscribe(
      response=>{
        this.init_longitudes();
        $('#delete7-'+id).modal('hide');
        toastr.success("Eliminación completada.");
        this.load_btn_longitud = false;
      },
      error=>{
        console.log(error);
        
      }
    );
  }

   ///////////////////////////////////////////////////////////////

  
   init_pagos(){
    this.load_pagos = true;
    this._settingsService.get_pagos(this.token).subscribe(
      response=>{
        this.pagos = response.data;
        this.load_pagos = false;
      }
    );
  }

  crear_pago(){
    if(!this.pago.metodo){
      toastr.error("Ingrese el nuevo método.");
    }else{
      this.pago.metodo = this.pago.metodo.trim();
      this._settingsService.create_pago(this.pago,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.pago = {};
            toastr.success("Registro completado.");
            this.init_pagos();
          }else{
            toastr.error(response.message);
          }
          
        }
      );
    }
  }

  remove_pago(id:any){
  
    this.load_btn_pago = true;
    this._settingsService.delete_pago(id,this.token).subscribe(
      response=>{
        this.init_pagos();
        $('#delete8-'+id).modal('hide');
        toastr.success("Eliminación completada.");
        this.load_btn_pago = false;
      },
      error=>{
        console.log(error);
        
      }
    );
  }

   ///////////////////////////////////////////////////////////////

  
   init_envios(){
    this.load_envios = true;
    this._settingsService.get_envios(this.token).subscribe(
      response=>{
        this.envios = response.data;
        this.load_envios = false;
      }
    );
  }

  crear_envio(){
    if(!this.envio.envio){
      toastr.error("Ingrese el nuevo método.");
    }else{
      this.envio.envio = this.envio.envio.trim();
      this._settingsService.create_envio(this.envio,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.envio = {};
          toastr.success("Registro completado.");
          this.init_envios();
          }else{
            toastr.error(response.message);
          }
          
        }
      );
    }
  }

  remove_envio(id:any){
  
    this.load_btn_envio = true;
    this._settingsService.delete_envio(id,this.token).subscribe(
      response=>{
        this.init_envios();
        $('#delete9-'+id).modal('hide');
        toastr.success("Eliminación completada.");
        this.load_btn_envio = false;
      },
      error=>{
        console.log(error);
        
      }
    );
  }
}
