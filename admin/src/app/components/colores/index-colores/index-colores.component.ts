import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { TelaService } from 'src/app/services/tela.service';
declare var $:any;
declare var toastr:any;

@Component({
  selector: 'app-index-colores',
  templateUrl: './index-colores.component.html',
  styleUrls: ['./index-colores.component.css']
})
export class IndexColoresComponent implements OnInit {

  public token = localStorage.getItem('token');
  public load_data = false;
  public colores :Array<any> = [];
  public page = 1;
  public pageSize = 15;
  public color : any = {
    hxd: 'white',
    primario: false
  };
  public msm_error_crear = '';
  public btn_add_color = false;
  public url = GLOBAL.url;
  public permisos : Array<any> = [];

  constructor(
    private _telaService:TelaService,
    private _router:Router
  ) { }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('3000')){
      $('#color-picker').spectrum({
        color: '#FFFFFF'
      });
      this.init_colores();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    
  }

  init_colores(){
    this.load_data = true;
    this._telaService.get_colores(this.token).subscribe(
      response=>{
        this.colores = response.data;
        console.log(response.data);
        this.load_data = false;
      }
    );
  }

  crear_color(){
    this.color.hxd = $('#color-picker').spectrum('get').toHexString();
    this.color.color = this.color.color.trim();
    if(!this.color.color){
      this.msm_error_crear = 'El color es requerido';
    }else if(!this.color.hxd){
      this.msm_error_crear = 'El color HXD es requerido';
    }else if(!this.color.password){
      this.msm_error_crear = 'La clave es requerida';
    }else{
      this.msm_error_crear = '';
      this.btn_add_color = true;
      this._telaService.create_color(this.color,this.token).subscribe(
        response=>{
          console.log(response);
          
          if(response.data != undefined){
            this.color = {
              hxd: 'white',
              primario: false
            };
            setTimeout(() => {
              $("#color-picker").spectrum("set", '#fff');
            }, 50);
            $('#newColor').modal('hide');
            toastr.success("Color creado correctamente.");
            this.init_colores();
          }else{
            toastr.error(response.message);
          }
          this.btn_add_color = false;
        }
      );
    }
  }

  toUpperCase(){
    this.color.color = this.color.color.toUpperCase();
  }
}
