import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
declare var toastr:any;
declare var $:any;
declare var Cleave:any;

@Component({
  selector: 'app-sidebar-clientes',
  templateUrl: './sidebar-clientes.component.html',
  styleUrls: ['./sidebar-clientes.component.css']
})
export class SidebarClientesComponent implements OnInit {

  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public token = localStorage.getItem('token');
  public cliente: any = {
    umedida_cantidad: ''
  }
  public id = '';
  public load_data = true;
  public data = false;
  public tipo = 'perfil';
  public deuda = 0;

  public amplitud : any = {};
  public btn_amplitud = false;
  @Output() eventClienteSelected = new EventEmitter<void>();
  public permisos : Array<any> = [];

  constructor(
    private _route:ActivatedRoute,
    private _clienteService:ClienteService,
    private _router:Router
  ) { }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('2003')){
      this._clienteService.eventClientCredito.subscribe(
        response=>{
          this.init_datos();
        }
      );
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.init_datos();
        }
      );
      this._route.queryParams.subscribe(
        (querys:any)=>{
            if(querys['tipo']){
              this.tipo = querys['tipo'];
            }else{
              this.tipo = 'perfil';
            }
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    
  }

  openModalCredito(){
    setTimeout(() => {
      new Cleave('#inpAmplitud', {
          numeral: true,
          numeralThousandsGroupStyle: 'thousand',
          prefix: 'MX$',
          numeralDecimalMark: '.',
          delimiter: ','
      });

      new Cleave('#inpReduccion', {
          numeral: true,
          numeralThousandsGroupStyle: 'thousand',
          prefix: 'MX$',
          numeralDecimalMark: '.',
          delimiter: ','
      });
    }, 50);
  }

  init_datos(){
    this.load_data = true;
    this._clienteService.get_cliente_admin(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data == undefined){
          this.data = false;
        }else{
          this.cliente = response.data;
          this.deuda = response.deuda;
          if(!this.cliente.umedida_cantidad){
            this.cliente.umedida_cantidad = '';
          }
          this.data = true;
        }
        this.load_data = false;
        
      }
    );
  }

  setNav(value:any){
    this.tipo = value;
    this._router.navigate(['/clientes',this.id],{queryParams:{tipo:this.tipo}})
  }

  update_credito(tipo:any){
    this.amplitud.monto = parseFloat(this.amplitud.monto.replace('MX$', '').replace(/[^0-9.]/g, ''))
    console.log(this.amplitud.monto);
    
    if(!this.amplitud.monto){
      toastr.error("El monto del crédito es requerido.");
    }else if(this.amplitud.monto <= 0){
      toastr.error("El monto no puede ser negativo.");
    }else{
      this.btn_amplitud = true;
      this.amplitud.cliente = this.id;
      this.amplitud.tipo_usuario = 'Cliente natural';
      this.amplitud.tipo = tipo;
      this._clienteService.update_cliente_credito(this.amplitud,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Actualización completada.");
            $('#creditoAmpliacionModal').modal('hide');
            $('#creditoReduccionModal').modal('hide');
            this.amplitud = {}
            this.init_datos();
          }else{
            toastr.error(response.message);
          }
          this.btn_amplitud = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          this.btn_amplitud = false;
        }
      );
    }
  }

  select_cliente(){
    localStorage.setItem('cliente_atendido',JSON.stringify(this.cliente));
    this.eventClienteSelected.emit();
  }
}
