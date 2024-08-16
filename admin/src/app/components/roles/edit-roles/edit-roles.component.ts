import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
declare var $:any;
declare var toastr:any;


@Component({
  selector: 'app-edit-roles',
  templateUrl: './edit-roles.component.html',
  styleUrls: ['./edit-roles.component.css']
})
export class EditRolesComponent implements OnInit {

  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public token = localStorage.getItem('token');
  public id = '';
  public permisos :Array<any> = [];
  public permisos_selected :Array<any> = [];
  public rol : any = {};
  public load_btn = false;
  public data = false;
  public load_data = true;
  public filter_modulo = 'Clientes';
  public edit_titulo = false;
  public new_titulo = '';
  public load_update_titulo = false;

  constructor(
    private _adminService:AdministradorService,
    private _router:Router,
    private _route:ActivatedRoute
  ) { }

  ngOnInit(): void {
   
    if(this.user.rol == 'Administrador'){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.init_datos();
          this.init_permisos();
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
    
  }

  init_datos(){
    this.load_data = true;
    this._adminService.get_rol(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        if(response.data == undefined){
          this.data = false;
          
        }else{
          this.rol = response.rol;
          this.permisos_selected = response.permisos;
          
          setTimeout(() => {
            this.permisos_selected.forEach((element:any) => {
              $('#customCheck-'+element.permiso).attr('checked', true);
            });
          }, 50);
          
          this.data = true;
        }
        this.load_data = false;
      }
    );
  }

  init_permisos(){
    this._adminService.get_Permisos().subscribe(
      response=>{
        this.permisos = response;
      }
    );
  }

  changeModulo(){
    setTimeout(() => {
      this.permisos_selected.forEach((element:any) => {
        $('#customCheck-'+element.permiso).attr('checked', true);
      });
    }, 50);
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

  update_titulo(){
    this.load_update_titulo = true;
    this._adminService.edit_titulo_rol(this.id,{rol: this.new_titulo},this.token).subscribe(
      response=>{
        toastr.success("Actualización completada.");
        this.init_datos();
        this.init_permisos();
        this.edit_titulo = false;
        this.load_update_titulo = false;
      }
    );
  }


  actualizar(){
    this.load_btn = true;
    console.log(this.permisos_selected);
    this._adminService.update_permisos_rol(this.id,{permisos:this.permisos_selected},this.token).subscribe(
      response=>{
        console.log(response);
        if(response.data != undefined){
          toastr.success("Actualización completada.");
        }else{
          toastr.error('No se actualizó los permisos');
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
