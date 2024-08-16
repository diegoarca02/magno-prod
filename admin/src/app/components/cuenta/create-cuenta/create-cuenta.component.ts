import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PagoService } from 'src/app/services/pago.service';
declare var $:any;
declare var toastr:any;

@Component({
  selector: 'app-create-cuenta',
  templateUrl: './create-cuenta.component.html',
  styleUrls: ['./create-cuenta.component.css']
})
export class CreateCuentaComponent {

  public token = localStorage.getItem('token');
  public cuenta : any = {
    banco: '',
    pais: '',
    moneda: 'MXN'
  };
  public load_btn = false;
  public permisos : Array<any> = [];

  constructor(
    private _pagoService:PagoService,
    private _router:Router
  ){

  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('13001')){
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
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(){
    
  }

  create(){
    this.cuenta.pais = $("#kt_docs_select2_country").val();
    if(!this.cuenta.titular){
      toastr.error("El titular de la cuenta es requerido.");
    }else if(!this.cuenta.banco){
      toastr.error("El banco es requerido.");
    }else if(!this.cuenta.pais){
      toastr.error("El país es requerido.");
    }else if(!this.cuenta.ncuenta){
      toastr.error("El número de cuenta es requerido.");
    }else if(!this.cuenta.cinter){
      toastr.error("La clave interbancaria es requerida.");
    }else if(!this.cuenta.moneda){
      toastr.error("La moneda es requerida.");
    }else if(!this.cuenta.swift){
      toastr.error("El código swift es requerido.");
    }else{
      console.log(this.cuenta);
      this.load_btn = true;
      this._pagoService.create_cuenta(this.cuenta,this.token).subscribe(
        response=>{
          console.log(response);
          if(response.data != undefined){
            toastr.success("Cuenta creada correctamente.");
            this._router.navigate(['/cuentas']);
          }else{
            toastr.error(response.message);
          }
          this.load_btn = false;
        }
      );
    }
  }
}
