import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
declare var $:any;

declare var toastr:any;

@Component({
  selector: 'app-create-colaboradores',
  templateUrl: './create-colaboradores.component.html',
  styleUrls: ['./create-colaboradores.component.css']
})
export class CreateColaboradoresComponent implements OnInit {

  public token = localStorage.getItem('token');
  public colaborador: any = {
    rol: '',
    prefijo: ''
  }
  public codes : Array<any> = [];
  public roles : Array<any> = [];
  public load_btn = false;
  public permisos:Array<any> = [];


  constructor(
    private _colaboradorService:ColaboradorService,
    private _adminService:AdministradorService,
    private _router:Router,
    private _route:ActivatedRoute
  ) {
   
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('1001')){
      this.init_roles();
    
  
      this.init_codes();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
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
          templateResult: optionFormat
      });
    }, 50);
  }

  init_roles(){
    this._adminService.get_only_roles(this.token).subscribe(
      response=>{
        this.roles = response.data;
      }
    );
  }

  
  init_codes(){
    this._adminService.get_Codes().subscribe(
      response=>{
        this.codes = response.countries;
      }
    );
  }

  registrar(){
    this.colaborador.pais = $("#kt_docs_select2_country").val();
    this.colaborador.password = this.colaborador.password.trim();
    this.colaborador.password_confirm = this.colaborador.password_confirm.trim();
    this.colaborador.estado = true;

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
    }else if(!this.colaborador.password){
      toastr.error("Ingrese la contraseña por favor.");
    }else if(this.colaborador.password != this.colaborador.password_confirm){
      toastr.error("Las contraseñas no coinciden.");
    }else{
      this.load_btn = true;
      this._colaboradorService.create_colaborador(this.colaborador,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Creación completada.");
            this._router.navigate(['/seguridad/colaboradores']);
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
 

}
