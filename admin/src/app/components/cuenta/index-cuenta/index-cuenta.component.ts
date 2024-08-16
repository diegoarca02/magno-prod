import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from 'src/app/services/pago.service';

@Component({
  selector: 'app-index-cuenta',
  templateUrl: './index-cuenta.component.html',
  styleUrls: ['./index-cuenta.component.css']
})
export class IndexCuentaComponent {

  public token = localStorage.getItem('token');
  public cuentas : Array<any> = [];
  public load_data = true;
  public permisos : Array<any> = [];

  constructor(
    private _pagoService:PagoService,
    private _route:ActivatedRoute,
    private _router:Router
  ){

  }
  

  handlePermisos(event:any){
    this.permisos = event;
    
    if(this.permisos.includes('13000')){
      this.init_data();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(){
    
  }

  init_data(){
    this.load_data = true;
    this._pagoService.get_cuentas(this.token).subscribe(
      response=>{
        this.cuentas = response.data;
        console.log(this.cuentas);
        
        this.load_data = false;
      }
    );
  }
}
