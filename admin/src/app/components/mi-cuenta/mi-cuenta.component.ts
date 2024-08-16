import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var $:any;

declare var toastr:any;

@Component({
  selector: 'app-mi-cuenta',
  templateUrl: './mi-cuenta.component.html',
  styleUrls: ['./mi-cuenta.component.css']
})
export class MiCuentaComponent implements OnInit {

  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public token = localStorage.getItem('token');
  public id = '';
  public colaborador: any = {
    rol: ''
  }
  public load_password = false;
  public load_data = false;
  public data = false;
  public codes : Array<any> = [];
  public roles : Array<any> = [];
  public load_btn = false;
  public load_remuneracion = false;

  public new_password = '';
  public banner : File|any = undefined;
  public str_portada :any = 'assets/images/blank2.svg';
  public str_static_portada : any = 'assets/images/blank2.svg';
  public url = GLOBAL.url;

  constructor(
    private _colaboradorService:ColaboradorService,
    private _router:Router,
    private _adminService:AdministradorService,
    private _route:ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.init_roles();
    setTimeout(() => {
      var optionFormat = function(item:any) {
          if ( !item.id ) {
              return item.text;
          }
          var span = document.createElement('span');
          var imgUrl = item.element.getAttribute('data-kt-select2-country');
          var template = '';
      
          template += '<img src="' + imgUrl + '" class="rounded-circle h-20px me-2" alt="image"/>';
          template += item.text;
          span.innerHTML = template;
          return $(span);
      }
      $('#kt_docs_select2_country').select2({
          templateSelection: optionFormat,
          templateResult: optionFormat,
          disabled: true
      });

    }, 50);

    this.id = this.user._id;
    this.init_datos();
    
  }

  init_codes(){
    this._adminService.get_Codes().subscribe(
      response=>{
        this.codes = response.countries;
        console.log(response);
        setTimeout(() => {
          $('#select-phone').select2().val(this.colaborador.prefijo).trigger("change");;
        }, 50);
      }
    );
  }

  init_roles(){
    this._adminService.get_only_roles(this.token).subscribe(
      response=>{
        this.roles = response.data;
        console.log(this.roles);
        
      }
    );
  }

  init_datos(){
    this.load_data = true;
    this._colaboradorService.get_colaborador_admin(this.id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          this.colaborador =response.data;
          console.log(this.colaborador);
          
          if(this.colaborador.avatar){
            this.str_portada = this.colaborador.avatar;
            this.str_static_portada = this.str_portada;
          }else{
            this.str_portada = 'assets/images/blank2.svg';
            this.str_static_portada = this.str_portada;
          }
          setTimeout(() => {
      
              var optionFormat = function(item:any) {
                if ( !item.id ) {
                    return item.text;
                }
            
                var span = document.createElement('span');
                var imgUrl = item.element.getAttribute('data-kt-select2-country');
                var template = '';
            
                template += '<img src="' + imgUrl + '" class="rounded-circle h-20px me-2" alt="image"/>';
                template += item.text;
            
                span.innerHTML = template;
            
                return $(span);
            }
            $("#kt_docs_select2_country").select2({
              templateSelection: optionFormat,
              templateResult: optionFormat
            }).val(this.colaborador.pais).trigger("change");
            /* $("#kt_docs_select2_country").select2("val", this.colaborador.pais); */
            this.init_codes();
          }, 50);
          this.data = true;
        }else{
          this.data = false;
        }

        this.load_data = false;
      }
    );
  }

  actualizar(){
    this.colaborador.pais = $("#kt_docs_select2_country").val();
    this.colaborador.prefijo = $("#select-phone").val();
    if(!this.colaborador.nombres){
      toastr.error("Ingrese los nombres por favor.");
    }else if(!this.colaborador.apellidos){
      toastr.error("Ingrese los apellidos por favor.");
    }else if(!this.colaborador.email){
      toastr.error("Ingrese el email por favor.");
    }else if(!this.colaborador.prefijo){
      toastr.error("Seleccione el prefijo por favor.");
    }else if(!this.colaborador.telefono){
      toastr.error("Ingrese el telefono por favor.");
    }else if(!this.colaborador.nacimiento){
      toastr.error("Seleccione el nacimiento por favor.");
    }else if(!this.colaborador.pais){
      toastr.error("Seleccione el pais por favor.");
    }else if(!this.colaborador.direccion){
      toastr.error("Ingrese la dirección por favor.");
    }else if(!this.colaborador.rol){
      toastr.error("Seleccione el rol por favor.");
    }else{
      this.load_btn = true;
      this._colaboradorService.update_colaborador(this.colaborador,this.id,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Actualización completada.");
          }else{
            toastr.error(response.message);
          }
          this.load_btn = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          this.load_btn = false;
        }
      );
      
    }
  }

  updatePassword(){
    if(!this.new_password){
      toastr.error("Ingresa tu nueva contraseña.");
    }else if(this.new_password.toString().length < 6){
      toastr.error("La contraseña debe tener menos de 6 digitos.");
    }else{
      this.load_password = true;
      this._colaboradorService.update_password(localStorage.getItem('_id'),{password:this.new_password},this.token).subscribe(
        response=>{
          this.logout();
          this.load_password = false;
        }
      );
    }
  }

  
  logout(){
    localStorage.removeItem('parameters');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');
    localStorage.removeItem('_id');
    window.location.reload();
  }

  fileChangeEvent(event:any):void{
    var file : any;
    if(event.target.files && event.target.files[0]){
      file = <File>event.target.files[0];
    }else{
      toastr.error("La imagen no puede ser subida.");
    }

    try {
      if(file.size <= 2000000){
        if(file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg'){
          this.banner = file;
          this.uploadImage();

        }else{
          toastr.error("Solo se aceptan imagenes.");
          this.banner = undefined;
          this.str_portada = 'assets/images/blank2.svg';
        }
      }else{
        toastr.error("La imagen no debe pesar menos de 2Mbs.");
        this.banner = undefined;
        this.str_portada = 'assets/images/blank2.svg';
      }
      console.log(this.banner);
      
    } catch (error) {
      toastr.error("Error al cargar el archivo.");
      this.banner = undefined;
      this.str_portada = 'assets/images/blank2.svg';
    }
  }

  cancelPortada(){
    this.str_portada = 'assets/images/blank2.svg';
    this.banner = undefined;
  }

  
  uploadImage(){
    this._colaboradorService.actualizar_avatar_colaborador({
      avatar: this.banner
    },this.token).subscribe(
      response=>{
        if(response.data != undefined){
          this.user.avatar = response.data;
          localStorage.setItem('user_data',JSON.stringify(this.user));
          localStorage.removeItem('parameters');
          localStorage.removeItem('user_data');
          localStorage.removeItem('token');
          localStorage.removeItem('_id');
        }else{
          toastr.error(response.message);
        }
      }
    );
  }

}
