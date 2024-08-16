import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
declare var $:any;
declare var toastr:any;

@Component({
  selector: 'app-detail-roles',
  templateUrl: './detail-roles.component.html',
  styleUrls: ['./detail-roles.component.css']
})
export class DetailRolesComponent implements OnInit {

  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public token = localStorage.getItem('token');
  public id = '';
  public colaboradores :Array<any> = [];
  public permisos_selected :Array<any> = [];
  public rol : any = {};
  public load_btn = false;
  public data = false;
  public load_data = true;

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
          this.colaboradores = response.colaboradores;
          this.data = true;
        }
        this.load_data = false;
        console.log( this.data );
      }
    );
  }

}
