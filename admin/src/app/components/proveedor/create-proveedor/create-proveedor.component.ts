import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
declare var $:any;
declare var toastr:any;
import { ProveedorService } from 'src/app/services/proveedor.service';

@Component({
  selector: 'app-create-proveedor',
  templateUrl: './create-proveedor.component.html',
  styleUrls: ['./create-proveedor.component.css']
})
export class CreateProveedorComponent implements OnInit {


  public token = localStorage.getItem('token');
  public cuenta : any = {};
  public proveedor : any = {};
  public codes : Array<any> = [];
  public cuentas : Array<any> = [];

  public parameters = JSON.parse(localStorage.getItem('parameters')!);
  public permisos : Array<any> = [];

  constructor(
    private _proveedorService:ProveedorService,
    private _adminService:AdministradorService,
    private _router:Router
  ) { 
    
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('5001')){
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
      this.init_codes();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
  }

  init_codes(){
    this._adminService.get_Codes().subscribe(
      response=>{
        this.codes = response.countries;
        console.log(response);
        setTimeout(() => {
          $('#select-phone').select2();
        }, 50);
      }
    );
  }

  registrar(){
    this.proveedor.prefijo = $("#select-phone").val();
    this.proveedor.pais = $("#kt_docs_select2_country").val();
    this.proveedor.cuentas = this.cuentas;
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

      this._proveedorService.create_proveedor(this.proveedor,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Creación completada.");
            this._router.navigate(['/proveedor']);
          }else{
            toastr.error(response.message);
          }
          
        }
      );
    }
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
      this.cuentas.push(this.cuenta);
      this.cuenta = {};
      $('#modalCuenta').modal('hide');
    }
  }

  remove(idx:any){
    this.cuentas.splice(idx,1)
  }
}
