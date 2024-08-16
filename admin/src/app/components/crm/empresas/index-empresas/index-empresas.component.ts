import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
declare var toastr:any;
declare var $:any;


@Component({
  selector: 'app-index-empresas',
  templateUrl: './index-empresas.component.html',
  styleUrls: ['./index-empresas.component.css']
})
export class IndexEmpresasComponent implements OnInit {

  public token = localStorage.getItem('token');
  public filtro :any = '';
  public load_estado = false;
  public load_data = false;
  public empresas : Array<any> = [];
  public empresas_const : Array<any> = [];
  public page = 1;
  public pageSize = 15;

  public parameters = JSON.parse(localStorage.getItem('parameters')!);
  public permisos = {
    cliente_uno : false,
  }


  constructor(
    private _router:Router,
    private _route:ActivatedRoute,
    private _clienteService:ClienteService
  ) {
    for(var item of this.parameters){
      if(item.permiso == 'cliente_uno'){
        this.permisos.cliente_uno = true;
      }
    }
   }

  ngOnInit(): void {
    if(this.permisos.cliente_uno){
      this._route.queryParams.subscribe(
        (params: any)=>{
          this.filtro = params.filter;
          if(this.filtro){
            this.init_empresas();
          }else{
            this.init_todos();
          }
        }
      )
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  init_empresas(){
    if(this.filtro){
      this.load_data = true;
      this._clienteService.get_empresas_admin(this.filtro,this.token).subscribe(
        response=>{
          this.empresas = response.data;
          this.load_data = false;
        }
      );
    }else{
      this.init_todos();
    }
  }

  init_todos(){
    this.load_data = true;
    this._clienteService.get_empresas_admin('Todos',this.token).subscribe(
      response=>{
        this.empresas = response.data;
        console.log(this.empresas);
        
        this.load_data = false;
      }
    );
  }


  filtro_func():any{
    if(this.filtro){
      this._router.navigate(['/empresas'], { queryParams: { filter: this.filtro } });
    }else{
      this._router.navigate(['/empresas']);
    }
  }

  set_status(id:any,status:any){
    this.load_estado = true;
    this._clienteService.set_status_empresa(id,{estado:status},this.token).subscribe(
      response=>{
        this.load_estado = false;
        $('#delete-'+id).modal('hide');
        toastr.success("Cambio de estado finalizado.");
        this.init_empresas();
        
      }
    );
  }
}
