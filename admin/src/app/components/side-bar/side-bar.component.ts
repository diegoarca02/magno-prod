import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
declare var $:any;
declare var KTLayoutAside:any;
declare var KTToggle:any;
declare var KTDrawer:any;
declare var KTUtil:any;
declare var KTScroll:any;
declare var KTScrolltop:any;
declare var KTMenu:any;
declare var KTApp:any;
declare var toastr:any;

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public parameters = JSON.parse(localStorage.getItem('parameters')!);
  public id = localStorage.getItem('_id');
  public token = localStorage.getItem('token');
  public codes : Array<any> = [];
  public load_btn = false;
  public permisos : Array<any> = [];
  @Output() eventPermisos : any= new EventEmitter<void>();

  constructor(
    private _colaboradorService:ColaboradorService,
    private _router:Router,
    private _adminService:AdministradorService
  ) { 
    
  
  }

  ngOnInit(): void {
    setTimeout(() => {
      KTApp.init();
      KTUtil.init();
      KTDrawer.init();
      KTToggle.init();
      KTLayoutAside.init();
      KTDrawer.updateAll();
      KTScroll.init();
      KTScrolltop.init();
      KTMenu.init();
    }, 50);
    this._colaboradorService.verify_token(localStorage.getItem('token')).subscribe(
      response=>{
        for(var item of response.permisos){
          this.permisos.push(item.permiso);
        }
        if(response.data == undefined){
          localStorage.removeItem('parameters');
          localStorage.removeItem('user_data');
          localStorage.removeItem('token');
          localStorage.removeItem('_id');
          this._router.navigate(['/']);
        }
        this.eventPermisos.emit(this.permisos);
      },
      error=>{
        localStorage.removeItem('parameters');
        localStorage.removeItem('user_data');
        localStorage.removeItem('token');
        localStorage.removeItem('_id');
        this._router.navigate(['/']);
      }
    );
    this.init_datos();
    this.init_codes();
    
  }

  openMenu(id:any){
    setTimeout(() => {
      var clase = $('#menu-'+id).attr('class');

      console.log(clase);
      
      if(clase == 'menu-item menu-accordion'){
        $('#menu-'+id).removeAttr('class');
        $('#menu-'+id).attr('class','menu-item menu-accordion hover show');
      }else if(clase == 'menu-item menu-accordion hover show'){
        $('#menu-'+id).removeAttr('class');
        $('#menu-'+id).attr('class','menu-item menu-accordion');
      }
      
    }, 50);
  }

 

  logout(){
    localStorage.removeItem('parameters');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');
    localStorage.removeItem('_id');
    window.location.reload();
  }

  close_menu(){
    setTimeout(() => {
      $('#kt_aside').removeClass('drawer-on');
    }, 50);
  }

  init_codes(){
    this._adminService.get_Codes().subscribe(
      response=>{
        this.codes = response.countries;
        console.log(response);
        setTimeout(() => {
          $('#select-phone').select2().val(this.user.prefijo).trigger("change");
        }, 50);
      }
    );
  }

  init_datos(){
    this._colaboradorService.get_colaborador_admin(this.id,this.token).subscribe(
      response=>{
        this.user = response.data;
        if(!this.user.direccion || !this.user.nacimiento || !this.user.prefijo || !this.user.telefono){
     
          setTimeout(() => {
            $('#modalUser').modal({
              backdrop: 'static',
              keyboard: false
            });
            $('#modalUser').modal('show');
          }, 50)
        }
      }
    );
  }


}
