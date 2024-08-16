import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
declare var $:any;

declare var toastr:any;

@Component({
  selector: 'app-rs-empresas',
  templateUrl: './rs-empresas.component.html',
  styleUrls: ['./rs-empresas.component.css']
})
export class RsEmpresasComponent implements OnInit {

  public token = localStorage.getItem('token');
  public id = '';
  public rs :Array<any> = [];
  public clientes :Array<any> = [];
  public filtro_cliente = '';
  public clientes_nuevos :Array<any> = [];
  public load_data = false;
  public data = false;

  public load_add_rs = false;
  public new_rs:any = {
    tipo_empresa: ''
  };
  public ubicacion : any = {
    pais: 'Mexico'
  };
  public ubicacion_edit : any = {
    pais: ''
  };
  public codes : Array<any> = [];
  public estados : Array<any> = [];
  public load_save = false;
  public load_update = false;
  public ubicaciones :Array<any> = [];
  public load_ubicaciones = false;
  public load_clientes = false;
  public msm_error_ubicacion = '';
  public clientes_facturacion :Array<any> = [];
  public load_facturacion = false;
  public load_delete = false;
  
  public cuentas : Array<any> = [];
  public load_cuentas = false;

  public cuenta : any = {};
  public msm_error_cuenta = '';
  public btn_facturacion = false;

  constructor(
    private _clienteService:ClienteService,
    private _router:Router,
    private _route:ActivatedRoute,
    private _adminService:AdministradorService
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
        this.init_datos();
        this.init_ubicaciones();
        this.init_codes();
        this.init_clientes_lastest();
        this.init_facturacion();
        this.init_facturacion_cliente();
      }
    );
  }

  init_clientes(){
    this.load_clientes = true;
    if(this.filtro_cliente){
      this._clienteService.get_clientes_admin(this.filtro_cliente,this.token).subscribe(
        response=>{
          this.clientes_nuevos = response.data;
          this.load_clientes = false;
        }
      );
    }else{
      this.clientes_nuevos = [];
      this.load_clientes = false;
    }
  }

  init_clientes_lastest(){
    this.load_clientes = true;
    this._clienteService.get_clientes_latest(this.token).subscribe(
      response=>{
        this.clientes_nuevos = response.data;
        this.load_clientes = false;
      }
    );
    
  }

  init_codes(){
    this._adminService.get_Codes().subscribe(
      response=>{
        this.codes = response.countries;
        console.log(response);
        setTimeout(() => {
          $('#select-phone-create').select2({
            dropdownParent: $("#newUbicacion")
          });
         
        }, 50);
      }
    );
  }

  init_facturacion_cliente(){
    this.load_facturacion = true;
    this._clienteService.get_clientes_facturacion_empresa(this.id,this.token).subscribe(
      response=>{
        this.clientes_facturacion = response.data;
        this.load_facturacion = false;
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


  init_datos(){
    this.load_data = true;
    this._clienteService.get_data_empresa(this.id,this.token).subscribe(
      response=>{
        if(response.data =! undefined){
          this.rs = response.rs;
          this.clientes = response.clientes;
          this.data = true;
        }else{
          this.data = false;
        }

        this.load_data = false;
      }
    );
  }

  add_cliente(id:any){
    let data = {
      cliente: id,
      empresa: this.id
    }
    this._clienteService.add_cliente_empresa_rs(data,this.token).subscribe(
      response=>{
        console.log(response);
        if(response.data != undefined){
          
          this.init_datos();
          toastr.success("Colaborador agregado.");
        }else{
          toastr.error(response.message);
        }
      }
    );
  }


  add_rs(){
    this.new_rs.empresa = this.id;
    this._clienteService.add_empresa_rs(this.new_rs,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          this.new_rs = {
            tipo_empresa: ''
          };
          $('#addRS').modal('hide');
          this.init_datos();
          toastr.success("Razón social agregada.");
        }else{
          toastr.error(response.message);
        }
      }
    );
  }

  create_ubicacion(){
    this.ubicacion.prefijo = $("#select-phone-create").val();

    if(!this.ubicacion.pais){
      toastr.error("Seleccione el país por favor.");
    }else if(!this.ubicacion.zip){
      toastr.error("Ingrese el código postal por favor.");
    }else if(!this.ubicacion.estado){
      toastr.error("Ingrese el estado por favor.");
    }else if(!this.ubicacion.ciudad){
      toastr.error("Ingrese la ciudad por favor.");
    }else if(!this.ubicacion.direccion){
      toastr.error("Ingrese la direccion por favor.");
    }else if(!this.ubicacion.prefijo){
      toastr.error("Seleccione el prefijo por favor.");
    }else if(!this.ubicacion.telefono){
      toastr.error("Ingrese el telefono por favor.");
    }else{
        this.ubicacion.empresa = this.id;
        this.load_save = true;
        this._clienteService.create_ubicacion_empresa(this.ubicacion,this.token).subscribe(
          response=>{
            $('#newUbicacion').modal('hide');
            this.ubicacion = {
              pais: ''
            };
            setTimeout(() => {
              $('#select-phone-create').select2({
                dropdownParent: $("#newUbicacion")
              }).val("").trigger("change")
            }, 50);
            toastr.success("Ubicación creada.");
            this.init_ubicaciones();
            this.load_save = false;
          },
          error=>{
            toastr.error("Ocurrió un error.");
            this.load_save = false;
          }
        );
    }
  }

  init_ubicaciones(){
    this.load_ubicaciones = true;
    this._clienteService.get_ubicaciones_empresa(this.id,this.token).subscribe(
      response=>{
        this.ubicaciones = response.data;
        this.load_ubicaciones = false;
      }
    );
  }

  
  get_ubicacion(id:any){
    this._clienteService.get_ubicacion_cliente(id,this.token).subscribe(
      response=>{
        this.ubicacion_edit = response.data;
        setTimeout(() => {
          $('#select-phone-edit-'+id).select2({
            dropdownParent: $("#editUbicacion-"+id)
          }).val(this.ubicacion_edit.prefijo).trigger("change");;
        }, 50);
      }
    );
  }

  update_ubicacion(id:any){
    this.ubicacion_edit.prefijo = $("#select-phone-edit-"+id).val();

    if(!this.ubicacion_edit.pais){
      this.msm_error_ubicacion = "Seleccione el país por favor.";
    }else if(!this.ubicacion_edit.estado){
      this.msm_error_ubicacion = "Ingrese el estado por favor.";
    }else if(!this.ubicacion_edit.ciudad){
      this.msm_error_ubicacion = "Ingrese la ciudad por favor.";
    }else if(!this.ubicacion_edit.direccion){
      this.msm_error_ubicacion = "Ingrese la direccion por favor.";
    }else if(!this.ubicacion_edit.prefijo){
      this.msm_error_ubicacion = "Seleccione el prefijo por favor.";
    }else if(!this.ubicacion_edit.telefono){
      this.msm_error_ubicacion = "Ingrese el telefono por favor.";
    }else{
        this.load_update = true;
        this._clienteService.update_ubicacion_cliente(id,this.ubicacion_edit,this.token).subscribe(
          response=>{
            $('#editUbicacion-'+id).modal('hide');
            this.ubicacion_edit = {
              pais: ''
            };
            setTimeout(() => {
              $('#select-phone-edit').select2({
                dropdownParent: $("#newUbicacion")
              }).val("").trigger("change")
            }, 50);
            toastr.success("Ubicación actualizada.");
            this.init_ubicaciones();
            this.load_update = false;
          }
        );
    }
  }
  
  add_cuenta(id:any){
    let exist = this.clientes_facturacion.filter(item=>item.cliente_facturacion._id == id);
    if(exist.length == 0){
      this._clienteService.add_cliente_facturacion({
        empresa: this.id,
        cliente_facturacion: id,
        tipo_usuario : 'Empresa'
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
      this.cuenta.empresa = this.id;
      this.cuenta.tipo_usuario = 'Empresa';
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


  remove_cuenta(id:any){

  }
}
