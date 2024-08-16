import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VentaService } from 'src/app/services/venta.service';

@Component({
  selector: 'app-index-cupones',
  templateUrl: './index-cupones.component.html',
  styleUrls: ['./index-cupones.component.css']
})
export class IndexCuponesComponent implements OnInit {

  
  public page = 1;
  public pageSize = 24;
  public load_data = true;
  public token = localStorage.getItem('token');
  public cupones : Array<any> = [];

  public str_codigo = '';
  public str_estado = 'Todos';

  public parameters = JSON.parse(localStorage.getItem('parameters')!);

  public permisos = {
    cupon_uno : false,
    cupon_dos : false,
    cupon_tres : false,
  }
  
  constructor(
    private _ventaService:VentaService,
    private _router:Router
  ) { 
    for(var item of this.parameters){
      if(item.permiso == 'cupon_uno'){
        this.permisos.cupon_uno = true;
      }else if(item.permiso == 'cupon_dos'){
        this.permisos.cupon_dos = true;
      }else if(item.permiso == 'cupon_tres'){
        this.permisos.cupon_tres = true;
      }
    }
  }

  ngOnInit(): void {
    if(this.permisos.cupon_uno){
      this.init_data();
    }else{
      this._router.navigate(['/dashboard']);
    }
    
  }

  init_data(){
    this.load_data = true;
    let str_codigo;
    if(!this.str_codigo) str_codigo = ' ';
    else str_codigo = this.str_codigo;
    this._ventaService.get_cupones(str_codigo,this.str_estado,this.token).subscribe(
      response=>{
        this.cupones = response.data;
        for(var item of this.cupones){
          item.visible = false;
        }
        this.load_data = false;
      }
    );
  }

  
  show_detalles(idx:any){
    if(!this.cupones[idx].visible){
      this.cupones[idx].visible = true;
    }else{
      this.cupones[idx].visible = false;
    } 
  }

  reset(){}
}
