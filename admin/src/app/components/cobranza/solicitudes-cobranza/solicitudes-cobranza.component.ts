import { Component, OnInit } from '@angular/core';
import { VentaService } from 'src/app/services/venta.service';

@Component({
  selector: 'app-solicitudes-cobranza',
  templateUrl: './solicitudes-cobranza.component.html',
  styleUrls: ['./solicitudes-cobranza.component.css']
})
export class SolicitudesCobranzaComponent implements OnInit {

  public page = 1;
  public pageSize = 24;
  public load_data = true;

  public firstDay : any = '';
  public lastDay : any = '';

  public token = localStorage.getItem('token');
  
  public solicitudes : Array<any> = [];
  public const_solicitudes : Array<any> = [];


  constructor(
    private _ventaService:VentaService
  ) { }

  ngOnInit(): void {
    this.init_data();
  }

  init_data(){
    this.load_data = true;
    this._ventaService.obtener_solicitudes_abiertas(this.token).subscribe(
      response=>{
        console.log(response);
        this.solicitudes = response.data;
        for(var item of this.solicitudes){
          if(item.tipo == "Cliente") item.str_tipo = 'cliente';
          else  if(item.tipo == "Empresa") item.str_tipo = 'empresa';
        }
        this.load_data = false;
      }
    );
  }

  reset_filtros(){}

}
