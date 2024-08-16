import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router} from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
declare var $:any;
declare var toastr:any;

@Component({
  selector: 'app-index-clientes',
  templateUrl: './index-clientes.component.html',
  styleUrls: ['./index-clientes.component.css']
})
export class IndexClientesComponent implements OnInit {

  public token = localStorage.getItem('token');
  public filtro :any = '';
  public load_estado = false;
  public load_data = true;
  public clientes : Array<any> = [];
  public clientes_const : Array<any> = [];
  public page = 1;
  public pageSize = 15;
  public permisos : Array<any> = [];

  constructor(
    private _clienteService:ClienteService,
    private _route:ActivatedRoute,
    private _router:Router
  ) {
    
   }

  handlePermisos(event:any){
    this.permisos = event;
    
    if(this.permisos.includes('2000')){
      this.validate_cliente_top();
      this._route.queryParams.subscribe(
        (params: any)=>{
          this.filtro = params.filtro;
          if(this.filtro){
            this.init_clientes();
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

  validate_cliente_top(){
    let cliente_atendido = JSON.parse(localStorage.getItem('cliente_atendido')!);
    console.log(cliente_atendido);
    
    if(cliente_atendido != null){
      this._router.navigate(['/clientes',cliente_atendido._id],{queryParams: {tipo:'perfil'} })
    }
  }

  init_clientes(){
    if(this.filtro){
      this.load_data = true;
      this._clienteService.get_clientes_admin(this.filtro,this.token).subscribe(
        response=>{
          console.log(this.clientes);
          
          this.clientes = response.data;
          this.load_data = false;
        }
      );
    }else{
      this.clientes = [];
      this.load_data = false;
    }
  }

  init_todos(){
    this.load_data = true;
    this._clienteService.get_clientes_admin('Todos',this.token).subscribe(
      response=>{
       
        this.clientes = response.data;
        console.log(this.clientes);
        this.load_data = false;
        
      }
    );
  }

  

  filtro_func():any{
    if(this.filtro){
      this._router.navigate(['/clientes'], { queryParams: { filtro: this.filtro } });
    }else{
      this._router.navigate(['/clientes']);
    }
  }

  set_status(id:any,estado:any){
    this.load_estado = true;
    this._clienteService.set_status_cliente(id,{estado:estado},this.token).subscribe(
      response=>{
        this.load_estado = false;
        $('#delete-'+id).modal('hide');
        toastr.success("Cambio de estado finalizado.");
        this.init_todos();
        
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_estado = false;
      }
    );
  }

  
}
