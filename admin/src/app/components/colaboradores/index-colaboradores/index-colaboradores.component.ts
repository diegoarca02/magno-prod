import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ColaboradorService } from 'src/app/services/colaborador.service';
declare var $:any;
declare var toastr:any;

@Component({
  selector: 'app-index-colaboradores',
  templateUrl: './index-colaboradores.component.html',
  styleUrls: ['./index-colaboradores.component.css']
})
export class IndexColaboradoresComponent implements OnInit {

  public token = localStorage.getItem('token');
  public filtro = '';
  public colaboradores :Array<any> = [];
  public load_estado = false;
  public load_data = true;
  public page = 1;
  public pageSize = 15;
  public permisos:Array<any> = [];
  public user : any = JSON.parse(localStorage.getItem('user_data')!);

  constructor(
    private _colaboradorService:ColaboradorService,
    private _router:Router,
    private _route:ActivatedRoute
  ) { 
    
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('1000') || this.user.email == 'diegoarca02@gmail.com'){
      this._route.queryParams.subscribe(
        (params: any)=>{
          this.filtro = params.filter;
          if(this.filtro){
            this.init_colaboradores();
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

  init_todos(){
    this.load_data = true;
    this._colaboradorService.get_colaboradores_admin('Todos',this.token).subscribe(
      response=>{
        this.colaboradores = response.data;
        console.log(this.colaboradores);
        this.load_data = false;
      }
    );
  }

  filtro_func():any{
    if(this.filtro){
      this._router.navigate(['/seguridad/colaboradores'], { queryParams: { filter: this.filtro } });
    }else{
      this._router.navigate(['/seguridad/colaboradores']);
    }
  }

  init_colaboradores(){
    if(this.filtro){
      this.load_data = true;
      this._colaboradorService.get_colaboradores_admin(this.filtro,this.token).subscribe(
        response=>{
          this.colaboradores = response.data;
          console.log(this.colaboradores);
          this.load_data = false;
        }
      );
    }else{
      this.load_data = true;
      this._colaboradorService.get_colaboradores_admin('Todos',this.token).subscribe(
        response=>{
          this.colaboradores = response.data;
          console.log(this.colaboradores);
          this.load_data = false;
        }
      );
    }
  }

  set_status(item:any){
    this.load_estado = true;
    if(!item.estado){
      if(!item.rol){
        toastr.error("Asigne un rol al colaborador.");
        this.load_estado = false;
      }else{
        this.update_status(item);
      }
    }else{
      this.update_status(item);
    }
  }

  update_status(item:any){
    this._colaboradorService.set_status_colaborador({estado:item.estado},item._id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          toastr.success("Cambio de estado finalizado.");
          this.init_colaboradores();
        }else{
          toastr.error(response.message);
        }
        $('#delete-'+item._id).modal('hide');
        this.load_estado = false;
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_estado = false;
      }
    );
  }

}
