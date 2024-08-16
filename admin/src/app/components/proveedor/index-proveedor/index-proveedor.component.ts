import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProveedorService } from 'src/app/services/proveedor.service';
declare var $:any;
declare var toastr:any;

@Component({
  selector: 'app-index-proveedor',
  templateUrl: './index-proveedor.component.html',
  styleUrls: ['./index-proveedor.component.css']
})
export class IndexProveedorComponent implements OnInit {

  public token = localStorage.getItem('token');
  public load_estado = false;
  public proveedores :Array<any> = [];
  public filtro = '';
  public load_data = true;
  public interes :any = {};
  public permisos : Array<any> = [];

  constructor(
    private _proveedorService:ProveedorService,
    private _router:Router,
    private _route:ActivatedRoute
  ) { 
    
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('5000')){
      this._route.queryParams.subscribe(
        (params: any)=>{
          this.filtro = params.filtro;
          if(this.filtro){
            this.init_proveedores();
          }else{
            this.init_todos();
          }
        }
      )
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    
  }

  init_proveedores(){
    if(this.filtro){
      this.load_data = true;
      this._proveedorService.get_proveedores(this.filtro,this.token).subscribe(
        response=>{
          this.proveedores = response.data;
          this.load_data = false;
        }
      );
    }else{
      this.proveedores = [];
      this.load_data = false;
    }
  }

  init_todos(){
    this.load_data = true;
    this._proveedorService.get_proveedores('Todos',this.token).subscribe(
      response=>{
        this.proveedores = response.data;
        this.load_data = false;
      }
    );
  }

  filtro_func():any{
    if(this.filtro){
      this._router.navigate(['/proveedor'], { queryParams: { filtro: this.filtro } });
    }else{
      this._router.navigate(['/proveedor']);
    }
  }

  set_status(id:any,status:any){
    this.load_estado = true;
    this._proveedorService.set_status_proveedor(id,{status:status},this.token).subscribe(
      response=>{
        this.load_estado = false;
        $('#delete-'+id).modal('hide');
        toastr.success("Cambio de estado finalizado.");
        this.init_todos();
        
      }
    );
  }
}
