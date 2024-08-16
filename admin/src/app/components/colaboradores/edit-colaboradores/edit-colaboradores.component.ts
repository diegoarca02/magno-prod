import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GENERAL } from 'src/app/services/GENERAL';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
declare var $:any;
declare var Tagify:any;
declare var toastr:any;
declare var Cleave:any;

@Component({
  selector: 'app-edit-colaboradores',
  templateUrl: './edit-colaboradores.component.html',
  styleUrls: ['./edit-colaboradores.component.css']
})
export class EditColaboradoresComponent implements OnInit {

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
  public load_acceso = false;
  public tagify : any;
  public almacenes : Array<any> = [];
  public permisos:Array<any> = [];


  constructor(
    private _colaboradorService:ColaboradorService,
    private _router:Router,
    private _adminService:AdministradorService,
    private _route:ActivatedRoute
  ) { 
    for(var item of GENERAL.almacenes){
      this.almacenes.push(item.name);
    }
  }

  
  handlePermisos(event:any){
    this.permisos = event;
    console.log(this.permisos);
    
    if(this.permisos.includes('1003')){
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
            templateResult: optionFormat
        });
      
      }, 50);
      this._route.params.subscribe(
        params=>{
            this.id = params['id'];
            this.init_datos();
            
          }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  
  ngOnInit(): void {
  
  }

  init_tagify(){
    setTimeout(() => {
      const input = document.querySelector('#kt_tagify');
      this.tagify = new Tagify(input,{
        whitelist: this.almacenes,
        maxTags: 10,
        dropdown: {
          maxItems: 5,
          classname: 'tagify__inline__suggestions',
          enable: 0,
          closeOnSelect: false
        }
      });
      this.tagify.addTags(this.colaborador.almacenes);
    }, 150);
  }

  init_codes(){
    this._adminService.get_Codes().subscribe(
      response=>{
        this.codes = response.countries;
      }
    );
  }

  init_roles(){
    this._adminService.get_only_roles(this.token).subscribe(
      response=>{
        this.roles = response.data;

      }
    );
  }

  init_datos(){
    this.load_data = true;
    this._colaboradorService.get_colaborador_admin(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data != undefined){
          this.colaborador =response.data;
          if(this.colaborador.rol == 'Almacenista') this.init_tagify();
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

          }, 50);
          this.init_codes();
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
    if(!this.colaborador.nombres){
      toastr.error("Ingrese los nombres por favor.");
    }else if(!this.colaborador.apellidos){
      toastr.error("Ingrese los apellidos por favor.");
    }else if(!this.colaborador.email){
      toastr.error("Ingrese el email por favor.");
    }else if(!this.colaborador.rol){
      toastr.error("Seleccione el rol por favor.");
    }else{
      this.load_btn = true;
      this.colaborador.almacenes = [];
      
      if(this.colaborador.rol == 'Almacenista'){
        for(var item of this.tagify.getTagElms()){
          this.colaborador.almacenes.push(item.__tagifyTagData.value);
        }
        console.log(this.colaborador.almacenes);
      }
      
      this._colaboradorService.update_colaborador(this.colaborador,this.id,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Actualización completada.");
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

  reset_password(){
    this.load_password = true;
      this._colaboradorService.reset_colaborador_password(this.id,this.token).subscribe(
        response=>{
          $('#reset-password').modal('hide');
          toastr.success("Cambio de contraseña finalizado.");
          this.load_password = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          this.load_password = false;
        }
      );
  }

  update_remuneracion(){
    if(!this.colaborador.remuneracion){
      toastr.error("Ingrese el monto de la remuneración.");
    }else{
      this.load_remuneracion = true;
      this._colaboradorService.update_remuneracion_colaborador(this.id,{remuneracion:this.colaborador.remuneracion},this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Actualización completada.");
            this.init_datos();
          }else{
            toastr.error(response.message);
          }
          this.load_remuneracion = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          this.load_remuneracion = false;
        }
      );
      
    }
  }

  validar_hora(tipo:any){
    if(tipo == 'entrada'){
      if(this.colaborador.acceso_entrada <= 0){
        this.colaborador.acceso_entrada = 1;
      }else if(this.colaborador.acceso_entrada > 24){
        this.colaborador.acceso_entrada = 24;
      }
    }

    if(tipo == 'salida'){
      if(this.colaborador.acceso_salida <= 0){
        this.colaborador.acceso_salida = 1;
      }else if(this.colaborador.acceso_salida > 24){
        this.colaborador.acceso_salida = 24;
      }
    }
  }

  update_acceso(){
    if(!this.colaborador.acceso_entrada){
      toastr.error("La hora de entrada es requerida.");
    }else if(!this.colaborador.acceso_salida){
      toastr.error("La hora de salida es requerida.");
    }else if(this.colaborador.acceso_entrada >= this.colaborador.acceso_salida){
      toastr.error("Las horas estan incorrectas.");
    }else{
      this.load_acceso = true;
      this._colaboradorService.update_acceso_colaborador(this.id,{
        acceso_entrada: this.colaborador.acceso_entrada,
        acceso_salida: this.colaborador.acceso_salida
      },this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Actualización completada.");
            this.init_datos();
          }else{
            toastr.error(response.message);
          }
          this.load_acceso = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          this.load_remuneracion = false;
        }
      );
    }
  }
}
