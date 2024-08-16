import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettinsService } from 'src/app/services/settins.service';
import { VentaService } from 'src/app/services/venta.service';
declare var $:any;
declare var moment:any;
declare var toastr:any;
declare var printJS:any;
import { PDFDocument, rgb } from 'pdf-lib';
import { HttpResponse } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { GENERAL } from 'src/app/services/GENERAL';

@Component({
  selector: 'app-index-cobranza',
  templateUrl: './index-cobranza.component.html',
  styleUrls: ['./index-cobranza.component.css']
})
export class IndexCobranzaComponent implements OnInit {

  public page = 10;
  public pageSize = 24;
  public load_data = true;
  public cliente_id = '';
  public metodo_id = '';
  public estado_id = '';
  public colaborador_id = '';

  public token = localStorage.getItem('token');
  
  public pagos : Array<any> = [];
  public const_pagos : Array<any> = [];

  public filtro_metodo = 'Todos';
  public filtro_estado = 'Todos';
  public filtro_entidad = 'Todos';

  public load_pago = false;
  public load_timbre = false;
  public load_cancelacion = false;
  public today_tt = Date.parse(new Date().toString())/1000;

  public load_entidades = false;
  public entidades : Array<any> = GENERAL.bancos;

  public estados : any = {};
  public last_page = 0;
  public page_status = true;
  public load = 0;
  public todos = 0;
  public permisos : Array<any> = [];

  constructor(
    private _ventaService:VentaService,
    private _settingsService:SettinsService,
    private _router:Router
  ) {
    var date = new Date();
    
  }

  handlePermisos(event:any){
    this.permisos = event;
    
    if(this.permisos.includes('14000')){
      this.init_todos();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    
    
  }

  click_matriculas(){
    this.page = this.page + 10;
    this.init_todos();
  }


  init_todos(){
    this.load++;
    if(this.load==0) this.load_data = true;
    this._ventaService.get_pagos(this.page,this.token).subscribe(
      response=>{
        console.log(response.data);
        this.pagos = response.data;
        for(var item of this.pagos){
          item.pago.exp_tt = Date.parse(new Date(item.pago.exp).toString())/1000;
        }
        console.log(this.pagos);
        this.const_pagos = this.pagos;
        this.todos = response.todos;
        this.last_page = this.pagos.length;
        this.load_data = false;

        setTimeout(() => {
          $('.table-responsive').on('show.bs.dropdown', function () {
            $('.table-responsive').css( "overflow", "inherit" );
        });
        
        $('.table-responsive').on('hide.bs.dropdown', function () {
              $('.table-responsive').css( "overflow", "auto" );
        })
        }, 50);
      }
    );
  }

  reset(){}

  search(){
    let arr = [];
      if(this.filtro_metodo == 'Todos'){
        arr = this.const_pagos;
      }else{
        arr = this.const_pagos.filter(item=>item.pago.metodo == this.filtro_metodo);
      }

      let arr_two = [];
      if(this.filtro_estado == 'Todos'){
        arr_two = arr;
      }else{
        arr_two = arr.filter(item=>item.pago.estado == this.filtro_estado);
      }

      let arr_three = [];
      if(this.filtro_entidad == 'Todos'){
        arr_three = arr_two;
      }else{
        arr_three = arr_two.filter(item=>item.pago.entidad == this.filtro_entidad);
      }

      this.pagos = arr_three;
  }

  aprobar_pago(id:any){
    this.load_pago = true;
    this._ventaService.aprobar_pago(id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          $('#aprobarPago-'+id).modal('hide');
          toastr.success("Pago aprobado.");
          this.init_todos();
          this.load_pago = false;
        }else{
          $('#aprobarPago-'+id).modal('hide');
          toastr.error(response.message);
          this.load_pago = false;
        }
      }
    );
  }

  cancelar_pago(id:any){
    this.load_cancelacion = true;
    this._ventaService.cancelar_pago(id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          $('#cancelarPago-'+id).modal('hide');
          toastr.success("Pago cancelado.");
          this.init_todos();
          this.load_cancelacion = false;
        }else{
          $('#cancelarPago-'+id).modal('hide');
          toastr.error(response.message);
          this.load_cancelacion = false;
        }
      }
    );
  }
  
  print(id:any){
    printJS({
      printable: 'contdiv-'+id,
      type: 'html'
    })
  }

  reset_filtros(){
    this.filtro_metodo = 'Todos';
    this.filtro_estado = 'Todos';
    this.filtro_entidad = 'Todos';
    this.pagos = this.const_pagos;
  }

  download(id:any){
    this._ventaService.download_cfdi(id).subscribe(
      (response)=>{
        console.log(response);
        
        /* var myBlob = new Blob([response.body], {type: "application/pdf"});
        var url = window.URL.createObjectURL(myBlob);
        var anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = "file.pdf";
        anchor.click();
        window.URL.revokeObjectURL(url); */
      }
    );
  }


 

}
