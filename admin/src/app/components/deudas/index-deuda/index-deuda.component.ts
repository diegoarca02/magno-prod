import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
declare var moment:any;

@Component({
  selector: 'app-index-deuda',
  templateUrl: './index-deuda.component.html',
  styleUrls: ['./index-deuda.component.css']
})
export class IndexDeudaComponent implements OnInit {

  public page = 100;
  public load_data = false;
  public load_deuda = false;
  public token = localStorage.getItem('token');
  public clientes : Array<any> = [];
  public envios : Array<any> = [];
  public pagos : Array<any> = [];
  public cliente : any = {};
  public load = 0;
  public todos = 0;
  public option = 1;
  public total = 0;
  public pagado = 0;
  public load_cliente = false;
  public permisos : Array<any> = [];

  constructor(
    private _clienteService:ClienteService,
    private _router:Router
  ) { 
   
  }

  ngOnInit(): void {
    this.init_clientes();
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('12000')){
      this.init_clientes();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  init_clientes(){
    this.load_data = true;
    this._clienteService.obtener_clientes_notas(this.token).subscribe(
      response=>{
        console.log(response);
        this.load_data = false;
        this.cliente = response.data;
      }
    );
  }

  /* click_matriculas(){
    this.page = this.page + 10;
    this.init_data();
  }
   */

  init_data(id:any){
    this.load_cliente = true;
    this._clienteService.obtener_envios_notas(id,this.token).subscribe(
      response=>{
        console.log(response);
        this.envios = response.data;
        this.pagos = response.pagos;
        this.total = response.total;
        this.pagado = response.pagado;
        for(var item of this.envios){
          if(item.envio.fecha_entrega){
            let fechaMoment = moment(item.envio.fecha_entrega);
            let fechaActual = moment();
            item.dias_transcurridos = fechaActual.diff(fechaMoment, 'days');
          }else{
            item.dias_transcurridos = '---';
          }
        }
        this.load_cliente = false;
        this.option = 2;
      }
    );
  }


}
