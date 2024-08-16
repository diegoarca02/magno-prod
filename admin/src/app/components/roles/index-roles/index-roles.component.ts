import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
declare var toastr:any;
declare var $:any;

@Component({
  selector: 'app-index-roles',
  templateUrl: './index-roles.component.html',
  styleUrls: ['./index-roles.component.css']
})
export class IndexRolesComponent implements OnInit {

  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public token = localStorage.getItem('token');
  public filtro = '';
  public roles :Array<any> = [];
  public load_data = true;
  public load_btn_delete = false;

  constructor(
    private _adminService:AdministradorService,
    private _router:Router
  ) { }

  ngOnInit(): void {
    if(this.user.rol == 'Administrador'){
      this.init_roles();
    }else{
      this._router.navigate(['/dashboard']);
    }
    
  }

  init_roles(){
    this.load_data = true;
    this._adminService.get_roles(this.token).subscribe(
      response=>{
        console.log(response);
        this.roles = response.data;
        this.load_data = false;
      }
    );
  }

  eliminar(id:any){
    this.load_btn_delete = true;
    this._adminService.delete_rol(id,this.token).subscribe(
      response=>{
        
        
        if(response.data != undefined){
          this.init_roles();
          $('#delete-'+id).modal('hide');
          toastr.success("Eliminación completada.");
        } else{
          toastr.error("No se puedo eliminar.");
        }
        this.load_btn_delete = false;
      },
      error=>{
        console.log(error);
        
      }
    );
  }

}
