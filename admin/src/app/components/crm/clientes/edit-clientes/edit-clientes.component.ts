import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { SettinsService } from 'src/app/services/settins.service';
declare var $:any;
declare var Cleave:any;
declare var toastr:any;

@Component({
  selector: 'app-edit-clientes',
  templateUrl: './edit-clientes.component.html',
  styleUrls: ['./edit-clientes.component.css']
})
export class EditClientesComponent implements OnInit {

  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public token = localStorage.getItem('token');
  public cliente: any = {
    umedida_cantidad: ''
  }
  public id = '';
  public load_data = true;
  public data = false;
  public codes : Array<any> = [];
  public arr_colaboradores : Array<any> = [];
  public colaboradores : Array<any> = [];
  public load_btn = false;

  public load_colaboradores = false;

  public filtro_colaborador = '';

  public longitudes : Array<any> = [];
  public inpDisabled = true;
  public load_delete = false;
  

  constructor(
    private _clienteService:ClienteService,
    private _router:Router,
    private _route:ActivatedRoute,
    private _adminService:AdministradorService,
    private _colaboradorService:ColaboradorService,
    private _settingsService:SettinsService
  ) { 
    
  }

  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
        this.init_datos();
        setTimeout(() => {
          new Cleave('#inpTelefono', {
              numericOnly: true,
              blocks: [2, 4, 4],
              delimiter: ' ',
              delimiterLazyShow: true
          });
        }, 50);
      }
    );
    
  }

  init_datos(){
    this.load_data = true;
    this._clienteService.get_cliente_admin(this.id,this.token).subscribe(
      response=>{
        if(response.data == undefined){
          this.data = false;
        }else{
          this.cliente = response.data;
          this.colaboradores = response.colaboradores;
          
          if(!this.cliente.umedida_cantidad){
            this.cliente.umedida_cantidad = '';
          }
          this.init_codes();
          this.init_colaboradores_todos();
          this.data = true;
        }
        this.load_data = false;
        
      }
    );
  }

  init_codes(){
    this._adminService.get_Codes().subscribe(
      response=>{
        this.codes = response.countries;
        console.log(response);
        setTimeout(() => {
          $("#select-phone").select2().val(this.cliente.prefijo).trigger("change");
        }, 50);
        
      }
    );
  }

  actualizar(){
    this.cliente.prefijo = $("#select-phone").val();
    if(!this.cliente.nombres){
      toastr.error("Ingrese los nombres por favor.");
    }else if(!this.cliente.apellidos){
      toastr.error("Ingrese los apellidos por favor.");
    }else if(!this.cliente.email){
      toastr.error("Ingrese el correo por favor.");
    }else if(!this.cliente.prefijo){
      toastr.error("Seleccione el prefijo por favor.");
    }else if(!this.cliente.telefono){
      toastr.error("Ingrese el telefono por favor.");
    }else{
      this.load_btn = true;
      this._clienteService.update_cliente(this.cliente,this.id,this.token).subscribe(
        response=>{
          console.log(response);
          if(response.data != undefined){
            this.inpDisabled = true;
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

  actualizar_umedida(){
    this._clienteService.update_cliente_umedida({umedida_cantidad:this.cliente.umedida_cantidad},this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
      }
    );
  }


  add_colaborador(item:any){
    this._clienteService.agregar_cliente_agente({
      colaborador: item._id,
      tipo: 'Cliente',
      cliente: this.id
    },this.token).subscribe(
      response=>{
        console.log(response);
        $('#addColaborador').modal('hide');
        toastr.success("Colaborador agregado.");
        this.init_datos();
      }
    );
  }

  init_colaboradores_todos(){
    this.load_colaboradores = true;
    this.filtro_colaborador = '';
    this._colaboradorService.get_colaboradores_cliente_admin('Todos',this.id,this.token).subscribe(
      response=>{
        this.arr_colaboradores = response.data;
        this.load_colaboradores = false;
      }
    );
  }



 

  init_colaboradores(){
    if(this.filtro_colaborador){
      this.load_colaboradores = true;
      this._colaboradorService.get_colaboradores_cliente_admin(this.filtro_colaborador,this.id,this.token).subscribe(
        response=>{
          this.arr_colaboradores = response.data;
          this.load_colaboradores = false;
        }
      );
    }else{
      this.init_colaboradores_todos();
    }
  }

 
  remove_colaborador(id:any){
    this.load_delete = true;
    this._clienteService.remove_cliente_agente(id,this.token).subscribe(
      response=>{
        $('#delete-'+id).modal('hide');
        this.init_colaboradores();
        this.load_delete = false;
        toastr.success("Colaborador eliminado.");
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_delete = false;
      }
    );
  }

}
