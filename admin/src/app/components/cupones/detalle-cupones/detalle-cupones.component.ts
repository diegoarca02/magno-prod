import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from 'src/app/services/venta.service';
declare var $: any;
declare var toastr:any;

@Component({
  selector: 'app-detalle-cupones',
  templateUrl: './detalle-cupones.component.html',
  styleUrls: ['./detalle-cupones.component.css']
})
export class DetalleCuponesComponent implements OnInit {

  public token = localStorage.getItem('token');
  public codigo = '';
  public cupon : any = {};
  public compradores : Array<any> = [];
  public load_data = true;
  public data = false;
  public load_cancelar = false;
  
  public parameters = JSON.parse(localStorage.getItem('parameters')!);

  public permisos = {
    cupon_tres : false,
    cupon_cuatro : false,
  }

  constructor(
    private _ventaService:VentaService,
    private _route:ActivatedRoute,
    private _router:Router
  ) { 
    for(var item of this.parameters){
      if(item.permiso == 'cupon_tres'){
        this.permisos.cupon_tres = true;
      }else if(item.permiso == 'cupon_cuatro'){
        this.permisos.cupon_cuatro = true;
      }
    }
  }

  ngOnInit(): void {
    if(this.permisos.cupon_tres){
      this._route.params.subscribe(
        params=>{
          this.codigo = params['codigo'];
          this.init_data();
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
    
  }

  init_data(){
    this.load_data = true;
    this._ventaService.get_cupon(this.codigo,this.token).subscribe(
      response=>{
        console.log(response);
        if(response.data != undefined){
          this.cupon = response.data;
          this.compradores = response.compradores;
          this.data = true;
        }else{
          this.data = false;
        }
        this.load_data = false;
      }
    );;
  }

  cancelar_cupon(id:any){
    this.load_cancelar = true;
    this._ventaService.cancelar_comprador_cupon(id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          $('#cancelar-'+id).modal('hide');
          this.init_data();
          toastr.success("Cupón cancelado.");
        }else{
          $('#cancelar-'+id).modal('hide');
          toastr.error(response.message);
        }
        this.load_cancelar = false;
      }
    );
  }

}
