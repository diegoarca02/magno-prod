import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
declare var $:any;
declare var toastr:any;
import { ProveedorService } from 'src/app/services/proveedor.service';

@Component({
  selector: 'app-edit-proveedor',
  templateUrl: './edit-proveedor.component.html',
  styleUrls: ['./edit-proveedor.component.css']
})
export class EditProveedorComponent implements OnInit {

  public telefono : any = {};


  public token = localStorage.getItem('token');
  public cuenta : any = {};
  public proveedor : any = {};
  public cuentas : Array<any> = [];
  public id = '';
  public load_data = true;
  public load_cuentas = true;
  public data = false;
  public codes : Array<any> = [];
  public permisos : Array<any> = [];


  constructor(
    private _proveedorService:ProveedorService,
    private _router:Router,
    private _route:ActivatedRoute,
    private _adminService:AdministradorService
  ) { 
    
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('5003')){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.init_datos();
          this.init_codes();
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {

  }

  init_datos(){
    this.load_data = true;
    this._proveedorService.get_proveedor_admin(this.id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          this.init_cuentas();
          this.proveedor =response.data;
          this.telefono.number = this.proveedor.telefono;
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
          }).val(this.proveedor.pais).trigger("change");
          /* $("#kt_docs_select2_country").select2("val", this.colaborador.pais); */

        }, 50);
          this.data = true;
        }else{
          this.data = false;
        }
        this.load_data = false;
      }
    );
  }

  init_codes(){
    this._adminService.get_Codes().subscribe(
      response=>{
        this.codes = response.countries;
        setTimeout(() => {
          $('#select-phone').select2().val(this.proveedor.prefijo).trigger("change");;
        }, 50);
      }
    );
  }


  actualizar(){

    this.proveedor.prefijo = $("#select-phone").val();
    this.proveedor.pais = $("#kt_docs_select2_country").val();
    if(!this.proveedor.razon_social){
      toastr.error("Ingrese la razón social del proveedor.");
    }else if(!this.proveedor.email){
      toastr.error("Ingrese el email del proveedor.");
    }else if(!this.proveedor.pais){
      toastr.error("Seleccione el pais del proveedor.");
    }else if(!this.proveedor.prefijo){
      toastr.error("Seleccione el prefijo por favor.");
    }else if(!this.proveedor.telefono){
      toastr.error("Ingrese el telefono del proveedor.");
    }else if(!this.proveedor.encargado){
      toastr.error("Ingrese el encargado del proveedor.");
    }else{

      this._proveedorService.update_proveedor(this.id,this.proveedor,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Actualización completada.");
            this._router.navigate(['/proveedor']);
          }else{
            toastr.error(response.message);
          }
          
        }
      );
    }
    
  }

  init_cuentas(){
    this.load_cuentas = true;
    this._proveedorService.get_cuentas_proveedor(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        this.cuentas = response.data;
        this.load_cuentas = false;
      }
    );
  }

  agregar_cuenta(){
    if(!this.cuenta.banco){
      toastr.error("Ingrese el banco de la cuenta.");
    }else if(!this.cuenta.swift){
      toastr.error("Ingrese el código swift de la cuenta.");
    }else if(!this.cuenta.titular){
      toastr.error("Ingrese el titular de la cuenta.");
    }else if(!this.cuenta.numero){
      toastr.error("Ingrese el numero de cuenta.");
    }else if(!this.cuenta.direccion){
      toastr.error("Ingrese la dirección de la cuenta.");
    }else{
      this.cuenta.proveedor = this.id;
      this._proveedorService.create_cuenta_proveedor(this.cuenta,this.token).subscribe(
        response=>{
          toastr.success("Creación completada.");
          this.init_cuentas();
          $('#modalCuenta').modal('hide');
          this.cuenta = {};
        }
      );
    }
  }

  remove(id:any){
    this._proveedorService.delete_cuenta_proveedor(id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          toastr.success("Eliminación completada.");
          this.init_cuentas();
        }else{
          toastr.error(response.message);
        }
      }
    );
  }
}
