import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
declare var toastr:any;
declare var $:any;

@Component({
  selector: 'app-facturacion-clientes',
  templateUrl: './facturacion-clientes.component.html',
  styleUrls: ['./facturacion-clientes.component.css']
})
export class FacturacionClientesComponent implements OnInit {

  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public token = localStorage.getItem('token');
  public cuentas : Array<any> = [];
  public load_cuentas = false;
  public load_facturacion = false;
  public clientes_facturacion : Array<any> = [];
  public id = '';
  public cuenta : any = {};
  public msm_error_cuenta = '';
  public btn_facturacion = false;
  public load_delete_cuenta = false;

  constructor(
    private _clienteService:ClienteService,
    private _route:ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
        this.init_facturacion_cliente();
        this.init_facturacion();
      }
    );
  }

  init_facturacion(){
    this.load_cuentas = true;
    this._clienteService.get_clientes_facturacion(this.token).subscribe(
      response=>{
        this.cuentas = response.data;
        this.load_cuentas = false;
      }
    );
  }

  init_facturacion_cliente(){
    this.load_facturacion = true;
    this._clienteService.get_clientes_facturacion_cliente(this.id,this.token).subscribe(
      response=>{
        this.clientes_facturacion = response.data;
        this.load_facturacion = false;
      }
    );
  }

  crear_facturacion(){
    if(!this.cuenta.nombres){
      this.msm_error_cuenta = "Ingrese los nombres por favor.";
    }else if(!this.cuenta.apellidos){
      this.msm_error_cuenta = "Ingrese los apellidos por favor.";
    }else if(!this.cuenta.email){
      this.msm_error_cuenta = "Ingrese el correo por favor.";
    }else if(!this.cuenta.telefono){
      this.msm_error_cuenta = "Ingrese el telefono por favor.";
    }else if(!this.cuenta.zip){
      this.msm_error_cuenta = "Ingrese el ZIP por favor.";
    }else if(!this.cuenta.rfc){
      this.msm_error_cuenta = "Ingrese el RFC por favor.";
    }else{
      this.btn_facturacion = true;
      this.cuenta.cliente = this.id;
      this.cuenta.tipo_usuario = 'Cliente natural';
      this._clienteService.create_cliente_facturacion(this.cuenta,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            $('#newCuenta').modal('hide');
            this.cuenta = {};
            this.init_facturacion_cliente();
            toastr.success("Cuenta creada correctamente.");
          }else{
            this.msm_error_cuenta = response.message;
          }
          this.btn_facturacion = false;
        }
      );
    }
  }

  add_cuenta(id:any){
    let exist = this.clientes_facturacion.filter(item=>item.cliente_facturacion._id == id);
    if(exist.length == 0){
      this._clienteService.add_cliente_facturacion({
        cliente: this.id,
        cliente_facturacion: id,
        tipo_usuario : 'Cliente natural'
      },this.token).subscribe(
        response=>{
          $('#addCuenta').modal('hide');
          this.init_facturacion_cliente();
          toastr.success("Cuenta agregada correctamente.");
        }
      );
    }else{
      toastr.error("La cuenta esta en el cliente.");
    }
    
  }

  

  remove_cuenta(id:any){
    this.load_delete_cuenta = true;
    this._clienteService.delete_cliente_facturacion(id,this.token).subscribe(
      response=>{
        $('#deleteCuenta-'+id).modal('hide');
        this.init_facturacion_cliente();
        this.load_delete_cuenta = false;
        toastr.success("Cuenta eliminada.");
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_delete_cuenta = false;
      }
    );
  }

}
