import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var KTMenu:any;
declare var toastr:any;
declare var $:any;
import { io } from "socket.io-client";

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {
  public socket = io("http://localhost:4201",{transports: ['websocket']});
  public token = localStorage.getItem('token');
  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public str_portada = '';
  public url = GLOBAL.url;
  public clientes :Array<any> = [];
  public filtro_cliente = '';
  public load_clientes = false;
  public clientes_nuevos :Array<any> = [];
  public cliente_atendido : any = undefined;
  public show_nav = false;
  public tareas : Array<any> = [];
  public ntareas = 0;
  @Output() eventClienteSelected = new EventEmitter<void>();
  public load_data = true;

  constructor(
    private _colaboradorService:ColaboradorService,
    private _clienteService:ClienteService,
    private _router:Router
  ) { 
  
  }


  ngOnInit(): void {
   
    this.socket.on('emit-cliente-atendido',(data:any)=>{
      this.init_cliente_atendido();
    });

    this.init_clientes();
    this.init_tareas();
    setTimeout(() => {
      KTMenu.init();
      KTMenu.createInstances();
      KTMenu.initGlobalHandlers();
      KTMenu.updateDropdowns();
      KTMenu.hideDropdowns();
      /* KTMenu.getInstance(); */
    }, 50);
    
    this.init_cliente_atendido();
    
  }

  init_cliente_atendido(){
    let cliente_atendido = JSON.parse(localStorage.getItem('cliente_atendido')!);

    if(cliente_atendido != null){
      console.log(cliente_atendido);
      this._clienteService.get_cliente_admin(cliente_atendido._id,this.token).subscribe(
        response=>{
          console.log(response);
          if(response.data != undefined){
            this.cliente_atendido = cliente_atendido;
          }else{
            localStorage.removeItem('cliente_atendido')
          }
        }
      );
     
    }
  }

  init_user(){
   this.user = JSON.parse(localStorage.getItem('user_data')!);
  }

  logout(){
    localStorage.removeItem('parameters');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');
    localStorage.removeItem('_id');
    window.location.reload();
  }


  open_menu(){
    setTimeout(() => {
      $('#kt_aside').addClass('drawer-on');
    }, 50);
  }

  init_clientes(){
    this.load_clientes = true;
    if(this.filtro_cliente){
      this._clienteService.get_clientes_admin(this.filtro_cliente,this.token).subscribe(
        response=>{
          console.log(response);
          
          this.clientes_nuevos = response.data;
          this.load_clientes = false;
        }
      );
    }else{
      this._clienteService.get_clientes_admin('Todos',this.token).subscribe(
        response=>{
          this.clientes_nuevos = response.data;
          this.load_clientes = false;
        }
      );
    }
  }

  select_cliente(item:any){
    this.cliente_atendido = item;
    localStorage.setItem('cliente_atendido',JSON.stringify(item));
    this.eventClienteSelected.emit();
    $('#addClienteAtencion').modal('hide');
  }

  init_clientes_lastest(){
    this.load_clientes = true;
    this._clienteService.get_clientes_latest(this.token).subscribe(
      response=>{
        this.clientes_nuevos = response.data;
        this.load_clientes = false;
      }
    );
    
  }

  remove_cliente_selected(){
    this.cliente_atendido = undefined;
    localStorage.removeItem('cliente_atendido')
  }

  changeNav(){
    if(this.show_nav) this.show_nav = false;
    else if(!this.show_nav) this.show_nav = true;
  }

  redirect_url(value:any,modal:any){
    this._router.navigate([value]).then(()=>{
      $(modal).modal('hide');
    });
  }
  
  init_tareas(){
    this.load_data = true;
    this._colaboradorService.obtener_tareas_pendientes_colaborador(this.token).subscribe(
      response=>{
        console.log(response);
        this.tareas = response.data;
        for(var item of this.tareas){
          item.date_realizar = new Date(item.date_realizar);
        }
        this.tareas.sort((a, b) => a.date_realizar - b.date_realizar);
        
        this.ntareas = response.total;
      }
    );
  }
}
