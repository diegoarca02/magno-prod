import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from 'src/app/services/pago.service';
declare var $:any;
declare var toastr:any;


@Component({
  selector: 'app-edit-cuenta',
  templateUrl: './edit-cuenta.component.html',
  styleUrls: ['./edit-cuenta.component.css']
})
export class EditCuentaComponent {

  public token = localStorage.getItem('token');
  public cuenta : any = {
    banco: '',
    pais: '',
    moneda: 'MXN'
  };
  public load_btn = false;
  public id = '';
  public permisos : Array<any> = [];

  constructor(
    private _route:ActivatedRoute,
    private _pagoService:PagoService,
    private _router:Router
  ){}

  ngOnInit(){
    
  }

  handlePermisos(event:any){
    this.permisos = event;

    if(this.permisos.includes('13002')){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.init_data();
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  init_data(){
    this._pagoService.get_cuenta(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        this.cuenta = response.data;
        $("#kt_docs_select2_country").select2().val(this.cuenta.pais).trigger("change");
      }
    );
  }

  update(){
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
      this._pagoService.update_cuenta(this.id,this.cuenta,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Cuenta actualizada correctamente.");
          
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
