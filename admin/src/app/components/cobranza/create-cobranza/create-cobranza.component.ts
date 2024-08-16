import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GENERAL } from 'src/app/services/GENERAL';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ClienteService } from 'src/app/services/cliente.service';
import { SettinsService } from 'src/app/services/settins.service';
import { VentaService } from 'src/app/services/venta.service';
declare var toastr:any;
declare var $:any;
declare var moment:any;
declare var Cleave:any;
import { io } from "socket.io-client";

@Component({
  selector: 'app-create-cobranza',
  templateUrl: './create-cobranza.component.html',
  styleUrls: ['./create-cobranza.component.css']
})
export class CreateCobranzaComponent implements OnInit {

  public token = localStorage.getItem('token');
  public option_menu = 1;
  public pago : any = {
    metodo: 'Efectivo',
    entidad: '',
    tipo_usuario: ''
  };
  public load_btn = false;
  public venta_selected : any = undefined;
  public clientes : Array<any> = [];
  public clientes_const : Array<any> = [];
  public pagos_venta : Array<any> = [];
  public pagos : Array<any> = [];
  public ventas : Array<any> = [];
  public filtro_cliente = '';
  public load_clientes = false;

  public load_entidades = false;
  public entidades : Array<any> = GENERAL.bancos;

  public empresa_selected : any = undefined;
  public cliente_selected : any = undefined;
  public load_cliente_selected = false;
  public credito : any = {};

  public file : any = undefined;
  public file_formato : any = '';
  public file_name : any = '';

  public total_pagado = 0;
  public total_deuda = 0;

  public option_resumen = 'Ventas';
  public hours_despues = 0;
  public descuento_activo = 0;
  public total_descuento_activo : any= 0;
  public view_all_clients = false;
  public data_facturacion : any = {
    receptor: ''
  };
  public cuentas : Array<any> = [];
  public cliente: any = {};
  public contado: any = {};
  public cleave : any = {};
  public socket = io(GLOBAL.socket,{transports: ['websocket']});
  public permisos : Array<any> = [];

  constructor(
    private _ventaService:VentaService,
    private _router:Router,
    private _clienteService:ClienteService,
    private _settingsService:SettinsService
  ) { }

  
  handlePermisos(event:any){
    this.permisos = event;
    
    if(this.permisos.includes('14001')){
      let cliente_atendido = JSON.parse(localStorage.getItem('cliente_atendido')!);
    
      if(cliente_atendido != null){
        this.select_cliente(cliente_atendido);
        this.filtro_cliente = cliente_atendido.nombres + ' ' + cliente_atendido.apellidos;
        this.init_clientes();
      }

      setTimeout(() => {
        this.cleave = new Cleave('#inpMonto', {
            numeral: true,
            numeralThousandsGroupStyle: 'thousand',
            prefix: 'MX$',
            numeralDecimalMark: '.',
            delimiter: ',',
        });
      }, 50);
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    let cliente_atendido = JSON.parse(localStorage.getItem('cliente_atendido')!);
    
    if(cliente_atendido != null){
      this.select_cliente(cliente_atendido);
      this.filtro_cliente = cliente_atendido.nombres + ' ' + cliente_atendido.apellidos;
      this.init_clientes();
    }

    this.socket.on('emit-update-pago',(data:any)=>{
      console.log('evento recibido');
      
      if(cliente_atendido != null){
        this.select_cliente(cliente_atendido);
      }
    });

    setTimeout(() => {
      this.cleave = new Cleave('#inpMonto', {
          numeral: true,
          numeralThousandsGroupStyle: 'thousand',
          prefix: 'MX$',
          numeralDecimalMark: '.',
          delimiter: ',',
      });
    }, 50);

    
  }

  init_clientes(){
    this.filtro_cliente = this.filtro_cliente.trim();
    if(this.filtro_cliente){

      this.load_clientes = true;
      this.clientes = [];
      this.clientes_const = [];
      this._clienteService.get_empresa_clientes(this.filtro_cliente,this.token).subscribe(
        response=>{
          this.clientes_const = response.data;
          if(response.data.length > 9){
            this.view_all_clients = true;
            response.data.forEach((element:any,index:any) => {
              if(index <= 9)  this.clientes.push(element);    
            });
          }else{
            this.view_all_clients = false;
            this.clientes = response.data;
          }
          this.clientes_const = response.data;
          
          this.load_clientes = false;
        }
      );
    }else{
      this.clientes_const = [];
      this.clientes = [];
    }
  }

  set_comprobante(item:any){
    this.data_facturacion.tipo_de_comprobante = item;
    console.log(this.data_facturacion);
    
  }

  ver_todos_clientes(){
    this.view_all_clients = false;
    this.clientes = this.clientes_const;
  }

  select_cliente(item:any){
    this.pago.cliente = item._id;
    this.cliente_selected = item;
    this.pago.tipo_usuario = 'Cliente natural';

    $('#str_comprador').val(item.nombres);
    //reset empresa
    delete this.pago.empresa_rs;
    delete this.pago.empresa;

    this.init_ventas(this.pago.tipo_usuario);

    //credito
    this.load_cliente_selected = true;
    this._clienteService.get_cliente_admin(item._id,this.token).subscribe(
      response=>{
        console.log(response);
        this.contado.deuda = response.deuda;
        this.cliente = response.data;
        this.cuentas = response.cuentas;
        if(this.cuentas.length >= 1){
          this.data_facturacion.receptor = this.cuentas[0].cliente_facturacion.uid;
        }
        
        this.load_cliente_selected = false;
        
      }
    );
  }    

  init_ventas(tipo:any){

  }

  next_step(op:any){
    if(op == 1){
      this.option_menu = 1;
    }else if(op == 2){
      this.option_menu = 2;
      
    }
    else if(op == 3){
      if(!this.pago.tipo_usuario){
        toastr.error("El comprador es requerido.");
      }else if(!this.pago.monto){
        toastr.error("Ingrese el monto a pagar.");
      }else{
        this.option_menu = 3;
      }
    }
  }

  upload_file(event:any):void{
    var file : any;
    
    
    if(event.target.files && event.target.files[0]){
      file = <File>event.target.files[0];
      console.log(file);
    }else{
      toastr.error("La imagen no puede ser subida.");
      this.file = undefined;
      this.file_formato = '';
      $('#file_input').val('');
    }

    try {
      if(file.size <= 10000000){
        if(file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg'){
          this.file_formato = 'Imagen';
          this.file_name = file.name;
          this.file = file;
        }else if(file.type == 'application/pdf'){
          this.file_formato = 'PDF';
          this.file_name = file.name;
          this.file = file;
        }else if(file.type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
          this.file_formato = 'Documento Word';
          this.file_name = file.name;
          this.file = file;
        }else if(file.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
          this.file_formato = 'Documento Excel';
          this.file_name = file.name;
          this.file = file;
        }else{
          toastr.error("Solo se aceptan imagenes.");
          this.file = undefined;
          this.file_formato = '';
          $('#file_input').val('');
        }
      }else{
        toastr.error("La imagen no debe pesar menos de 2Mbs.");
        this.file = undefined;
        this.file_formato = '';
        $('#file_input').val('');
      }
    } catch (error) {
      this.file = undefined;
      this.file_formato = '';
      $('#file_input').val('');
    }
  }

  set_metodo(){
    this.pago.entidad = '';
  }

  clearMonto(){
    delete this.pago.last_pago;
    delete this.pago.descuento;
    this.pago.monto='';
  }

  crear(){
    if(!this.pago.metodo){
      toastr.error("El metodo es requerido.");
    }else if(!this.pago.monto){
      toastr.error("El monto es requerido.");
    }else if(this.pago.metodo != 'Efectivo' && !this.pago.entidad){
      toastr.error("La entidad es requerida.");
    }else{
      this.crear_s();
    }
  }

  

  crear_s(){
    this.pago.comprobante = this.file;
    console.log(this.pago.monto);
    this.pago.monto = parseFloat(this.pago.monto.replace('MX$', '').replace(/[^0-9.]/g, ''))
    this.load_btn = true;

    if(this.cliente.credito_total >= 1){
      this.pago.tipo = 'Credito';
      console.log('Credito');
    }else{
      this.pago.tipo = 'Contado';
      console.log('Contado');
    }
    this._ventaService.crear_pago(this.pago,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data != undefined){
          toastr.success("Pago registrado");
          this._router.navigate(['/cobranzas']);
          
        }else{
          toastr.error(response.message);
        }
        this.load_btn = false;
      }
    );
  }

}
