import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
declare var toastr:any;

@Component({
  selector: 'app-create-roles',
  templateUrl: './create-roles.component.html',
  styleUrls: ['./create-roles.component.css']
})
export class CreateRolesComponent implements OnInit {

  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public token = localStorage.getItem('token');
  public data : any = {};
  public permisos :Array<any> = [];
  public permisos_selected :Array<any> = [];
  public load_btn = false;
  
  constructor(
    private _adminService:AdministradorService,
  private _router:Router
  ) { }

  ngOnInit(): void {
    if(this.user.rol == 'Administrador'){
      this.init_permisos();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }


  init_permisos(){
    this._adminService.get_Permisos().subscribe(
      response=>{
        console.log(response);
        this.permisos = response;
      }
    );
  }

  selectPermiso(event:any,short:any,modulo:any,descripcion:any){
  
    let tipo_select = event.currentTarget.checked;
    if(tipo_select){
      if(this.permisos_selected.length == 0){
        this.permisos_selected.push({
          permiso: short,
          modulo: modulo,
          descripcion: descripcion,
        });
      }else{
        let exist = false;
        this.permisos_selected.forEach(element => {
            if(element.permiso == short){
              exist = true;
            }
        });
  
        if(!exist){
          this.permisos_selected.push(
            {
              permiso: short,
              modulo: modulo,
              descripcion: descripcion,
            }
          );
        }
      }
    }else{
      let indice:any;
      this.permisos_selected.forEach((element,index) => {
          if(element.permiso == short){
            indice = index;
          }
      });
      this.permisos_selected.splice(indice,1);
    }

    console.log(this.permisos_selected);
    
  }

  create_rol(){
    if(!this.data.rol){
      toastr.error("Ingrese un rol a registrar.");
    }else if(this.permisos_selected.length <= 1){
      toastr.error("Seleccione dos permisos como minimo.");
    }else{
      this.load_btn = true;
      this.data.permisos = this.permisos_selected;
      this._adminService.create_rol(this.data,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Creación completada.");
            this._router.navigate(['/seguridad/roles']);
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
}
