import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ColaboradorService } from 'src/app/services/colaborador.service';
declare var $:any;

@Component({
  selector: 'app-permisos-colaboradores',
  templateUrl: './permisos-colaboradores.component.html',
  styleUrls: ['./permisos-colaboradores.component.css']
})
export class PermisosColaboradoresComponent {
  public token = localStorage.getItem('token');
  public btn_load = false;
  public id = '';
  public load_data = true;
  public data = false;
  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public usuario :any = {
    rol: ''
  };
  public permisos : Array<any> = [];

  constructor(
    private _colaboradorService:ColaboradorService,
    private _route:ActivatedRoute,
    private _router:Router
  ){}
  
  handlePermisos(event:any){
    this.permisos = event;
    console.log(this.permisos);
    
    if(this.permisos.includes('1004')||this.user.email == 'diegoarca02@gmail.com'){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          if(this.id){
            this.init_data();
          
          }else{
            this.data = false;
            this.load_data = false;
          }
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(){
    
  }
  
  init_data(){
    this._colaboradorService.obtener_permisos_colaborador(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data == undefined){
          this.load_data = false;
          this.data = false;
        }else{
          this.load_data = false;
          this.data = true;
          this.usuario = response.data;
          this.permisos = response.permisos;
          
          this.setPermisos();
        }
      }
    );
  }

  setPermisos(){
    setTimeout(() => {
      this.permisos.forEach((element:any) => {
        $('#customCheck-'+element.permiso).attr('checked', true);
      });
    }, 50);
  }


  selectPermiso(event:any,codigo:any){
    this._colaboradorService.update_permiso_colaborador({
      colaborador:this.id,
      permiso: codigo
    },this.token).subscribe(
      response=>{
        console.log(response);
        
      }
    );
  }
}
