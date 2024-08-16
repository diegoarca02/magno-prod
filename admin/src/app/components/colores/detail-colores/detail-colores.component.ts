import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
import { TelaService } from 'src/app/services/tela.service';
declare var $:any;
declare var toastr:any;

@Component({
  selector: 'app-detail-colores',
  templateUrl: './detail-colores.component.html',
  styleUrls: ['./detail-colores.component.css']
})
export class DetailColoresComponent implements OnInit {

  public user = JSON.parse(localStorage.getItem('user_data')!);
  public data = false;
  public load_data = true;
  public color : any = {};
  public productos : Array<any> = [];
  public etiquetas : Array<any> = [];
  public new_password = '';
  public id = '';
  public token = localStorage.getItem('token');
  public load_btn = false;
  public url = GLOBAL.url;
  public show_password = false;
  public etiqueta : any = {
    prioridad: '',
    etiqueta: ''
  };
  public load_btn_etiqueta = false;
  public load_etiquetas = false;
  public permisos : Array<any> = [];
  
  constructor(
    private _telaService:TelaService,
    private _route:ActivatedRoute,
    private _productoService:ProductoService,
    private _router:Router
  ) { }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('3010')){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.init_color();
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    
  }


  init_color(){
    this._telaService.get_color(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        if(response.data != undefined){
          this.color = response.data;
          this.data = true;
          this.productos = response.productos;
          this.init_etiquetas();
        }else{
          this.data = false;
        }
        this.load_data = false;
       
      }
    );
    ;
  }

  init_etiquetas(){
    this.load_etiquetas = true;
    this._telaService.get_etiquetas_color(this.id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          this.etiquetas = response.data;
        }
        this.load_etiquetas = false;
      }
    );
  }

  actualizar_color(){
    if(!this.color.color){
      toastr.error('El color es requerido');
    }else if(!this.color.hxd){
      toastr.error('El color HXD es requerido');
    }else{
      this.load_btn = true;
      this._telaService.update_color(this.id,this.color,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Color actualizado correctamente.");
            this._router.navigate(['/productos/colores']);
          }else{
            toastr.error(response.message);
          }
          this.load_btn = false;
        }
      );
    }
  }

  actualizar_color_password(){
    if(!this.new_password){
      toastr.error('La clave es requerida');
    }else{
      this.load_btn = true;
      this._telaService.update_password_color(this.id,{password:this.new_password},this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Contraseña actualizada.");
            this._router.navigate(['/productos/colores']);
            this.init_color();
          }else{
            toastr.error(response.message);
          }
          this.load_btn = false;
        }
      );
    }
  }

  create_etiqueta(){
    if(this.etiqueta.etiqueta == 'Básico')this.etiqueta.hxd = '#000';
    if(this.etiqueta.etiqueta == 'Favorito')this.etiqueta.hxd = '#2E86C1';
    if(this.etiqueta.etiqueta == 'Nuevo')this.etiqueta.hxd = '#bf6c08';

    if(!this.etiqueta.etiqueta){
      toastr.error("Ingrese el nombre de la etiqueta.");
    }else if(!this.etiqueta.prioridad){
      toastr.error("Seleccione la prioridad de la etiqueta.");
    }else if(!this.etiqueta.hxd){
      toastr.error("Seleccione el color de la etiqueta.");
    }else{
      this.etiqueta.color = this.id;
      this._productoService.add_etiqueta_color(this.etiqueta,this.token).subscribe(
        response=>{
          console.log(response);
          if(response.data != undefined){
            this.etiqueta = {
              prioridad: '',
              etiqueta: ''
            }
            $('#modalEtiquetaCreate').modal('hide');
            toastr.success("Registro completado.");
            this.init_etiquetas();

          }else{
            toastr.error(response.message);
          }
        }
      );
    } 
  }

  
  remove_etiqueta(id:any){
    console.log(id);
    
    this._productoService.delete_etiqueta_color(id,this.token).subscribe(
      response=>{
        this.init_etiquetas();
        toastr.success("Eliminación completada.");
      }
    );
  }
}
