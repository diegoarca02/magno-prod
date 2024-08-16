import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { VentaService } from 'src/app/services/venta.service';
declare var toastr:any;
declare var $:any;

@Component({
  selector: 'app-detalle-pago',
  templateUrl: './detalle-pago.component.html',
  styleUrls: ['./detalle-pago.component.css']
})
export class DetallePagoComponent implements OnInit {

  public token = localStorage.getItem('token');
  public id = '';
  public load_btn = false;
  public load_data = true;
  public data = false;

  public pago_completo: any = {};
  public pagos: Array<any> = [];
  public total_abonado = 0;
  public total_deuda = 0;
  public url = GLOBAL.url;
  public load_pago = false;
  public today_tt = Date.parse(new Date().toString())/1000;
  public option = 1;

  constructor(
    private _route:ActivatedRoute,
    private _ventaService:VentaService
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
        this.init_data();
      }
    );

    
  }

  init_data(){
    this.load_data = true;
    this._ventaService.get_venta_cobranza(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        if(response.data != undefined){
          this.data = true;
          this.pago_completo = response.pago_completo;
          this.pagos = response.pagos;
        }else{
          this.data = false;
        }
        
        this.load_data = false;
      }
    );
  }

  aprobar_pago(id:any){
    this.load_pago = true;
    this._ventaService.aprobar_pago(id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          $('#aprobar-'+id).modal('hide');
          toastr.success("Pago aprobado.");
          this.init_data();
          this.load_pago = false;
        }else{
          $('#aprobar-'+id).modal('hide');
          toastr.error(response.message);
          this.load_pago = false;
        }
      }
    );
  }

  show_detalles(idx:any){
    if(!this.pagos[idx].visible){
      this.pagos[idx].visible = true;
    }else{
      this.pagos[idx].visible = false;
    } 
  }
}
