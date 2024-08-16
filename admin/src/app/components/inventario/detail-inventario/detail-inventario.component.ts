import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { inventario_ts } from 'src/app/templates_pdf/inventario/inventario_';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
declare var $:any;
declare var toastr:any;
declare var KTApp:any;
import domtoimage from 'dom-to-image';
import { SettinsService } from 'src/app/services/settins.service';
import * as moment from 'moment';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { Template, generate } from '@pdfme/generator';
import { GENERAL } from 'src/app/services/GENERAL';
declare var JsBarcode:any;
declare var jsPDF:any;



@Component({
  selector: 'app-detail-inventario',
  templateUrl: './detail-inventario.component.html',
  styleUrls: ['./detail-inventario.component.css']
})
export class DetailInventarioComponent implements OnInit {

  public token = localStorage.getItem('token');
  public id = '';
  public load_data = true;
  public data = false;
  public detalles :Array<any> = [];
  public arr_xls_telas :Array<any> = [];
  public arr_xls_ropas :Array<any> = [];
  public total_cantidad = 0;
  public almacenes :Array<any> = [];
  public variacion: any = {};
  public metro_to_yrd = 1.09361;
  public almacen_active = '';
  public data_almacen_active : any= {};
  public load_delete = false;

  public parameters = JSON.parse(localStorage.getItem('parameters')!);

  public permisos = {
    inventario_dos : false,
    inventario_cinco: false,
    inventario_seis: false,
    inventario_siete: false,
  }
  public current_route = '';
  public url = GLOBAL.url;

  constructor(
    private _pedidoService:PedidoService,
    private _settingsService:SettinsService,
    private _route:ActivatedRoute,
    private _router:Router
  ) { 
    for(var item of this.parameters){
      if(item.permiso == 'inventario_dos'){
        this.permisos.inventario_dos = true;
      }else if(item.permiso == 'inventario_cinco'){
        this.permisos.inventario_cinco = true;
      }else if(item.permiso == 'inventario_seis'){
        this.permisos.inventario_seis = true;
      }else if(item.permiso == 'inventario_siete'){
        this.permisos.inventario_siete = true;
      }
    }
    this.current_route = document.URL;
  }

  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
        this.init_almacenes();

      }
    );

  }

  init_almacenes(){
    GENERAL.almacenes.forEach(element => {
        this.almacenes.push({
          almacen: element.name,
          detalles: []
        });
    });
    this.almacen_active = this.almacenes[0].almacen;
    let almacen = this.almacenes.filter(item=>item.almacen == this.almacen_active)[0];
    this.data_almacen_active = almacen.detalles;
   
    this.init_ingresos();
    
  }

  init_ingresos(){
    this.load_data = true;
    this.arr_xls_telas = [];
    this.total_cantidad = 0;
    this._pedidoService.get_detalle_ingreso_by_color(this.id,this.token).subscribe(
      response=>{
      
        console.log(response);
        
        if(response.data == undefined){
          this.data = false;
          this.load_data = false;
        }else{
          this.variacion = response.variacion;
          this.detalles = response.detalles;
          if(this.detalles.length >= 1){
            for(var item of this.almacenes){
              item.detalles = this.detalles.filter(itm=>itm.ingreso.almacen == item.almacen);
            }
          }
          for(var item of this.detalles){
            this.total_cantidad = this.total_cantidad + item.cantidad;
            let str_estado;
            if(!item.apartado){
              if(item.estado) str_estado = 'Disponible'
              else str_estado = 'No disponible'
            }else{
              str_estado = 'Reservado'
            }

            this.arr_xls_telas.push({
              sku: item.producto_variacion.sku,
              producto: item.producto.titulo,
              variacion: item.producto_variacion.variacion_name,
              color: item.producto_variacion.color_name,
              cantidad:  item.cantidad,
              medida: item.ingreso.unidad,
              f_ingreso: moment(item.ingreso.createdAt).format('YYYY-MM-DD'),
              estado: str_estado,
            });
          }

          this.load_data = false;
          this.data = true;

          for(var item of this.almacenes){
            for(var subitem of item.detalles){
              this.doSetTimeout(subitem.codigo,subitem.cantidad);
            }
          }
        }
       
      }
    );

   
  }

  doSetTimeout(val:any,cantidad:any) {
    setTimeout(function() {
      JsBarcode('#barcode-'+val, val);
    }, 100);
  }

  set_almacen_active(){
    let almacen = this.almacenes.filter(item=>item.almacen == this.almacen_active)[0];
    this.data_almacen_active = almacen;
  }


  delete_rollo(id:any){
    this.load_delete = true;
    this._pedidoService.eliminar_rollo_interno(id,this.token).subscribe(
      response=>{
        this.load_delete = false;
        $('#delModal-'+id).modal('hide');
        toastr.success("Rollo eliminado.");
        this.init_almacenes();
      }
    );
  }

  downloadExcel(){
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Orden");

    worksheet.addRow(undefined);
    for (let x1 of this.arr_xls_telas){
      let x2=Object.keys(x1);

      let temp=[]
      for(let y of x2){
        temp.push(x1[y])
      }
      worksheet.addRow(temp)
    }

    //GENERAR EXCEL
    let fname='Inventariado';
    worksheet.columns = [
      { header: 'SKU', key: 'col2', width: 25},
      { header: 'Producto', key: 'col1', width: 35, style: {border: 'thin'}},
      { header: 'Variación', key: 'col1', width: 35, style: {border: 'thin'}},
      { header: 'Color', key: 'col1', width: 25, style: {border: 'thin'}},
      { header: 'Cantidad', key: 'col2', width: 15},
      { header: 'Medida', key: 'col2', width:15},
      { header: 'Ingreso', key: 'col2', width:25},
      { header: 'Estado', key: 'col2', width:25},
    ]as any;
    
    //add data and file name and download
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, fname+'.xlsx');
    });
  }

  downloadEtiqueta(item:any){
    console.log(item);
    
    var schemas : any= [
      {
        "imagen": {
          "type": "image",
          "position": {
            "x": 31.75,
            "y": 61.38
          },
          "width": 91.62,
          "height": 31.29,
          "alignment": "left",
          "fontSize": 13,
          "characterSpacing": 0,
          "lineHeight": 1
        },
        "producto": {
          "type": "text",
          "position": {
            "x": 47.1,
            "y": 25.93
          },
          "width": 98.5,
          "height": 7,
          "alignment": "left",
          "fontSize": 14,
          "characterSpacing": 0,
          "lineHeight": 1,
          "fontColor": "#2e2e2e"
        },
        "color": {
          "type": "text",
          "position": {
            "x": 46.86,
            "y": 33.93
          },
          "width": 98.5,
          "height": 7,
          "alignment": "left",
          "fontSize": 14,
          "characterSpacing": 0,
          "lineHeight": 1
        },
        "cantidad": {
          "type": "text",
          "position": {
            "x": 47.09,
            "y": 42.07
          },
          "width": 98.5,
          "height": 7,
          "alignment": "left",
          "fontSize": 14,
          "characterSpacing": 0,
          "lineHeight": 1
        },
        "peso": {
          "type": "text",
          "position": {
            "x": 46.95,
            "y": 50.22
          },
          "width": 98.5,
          "height": 7,
          "alignment": "left",
          "fontSize": 14,
          "characterSpacing": 0,
          "lineHeight": 1
        }
      }
    ]

    var columns =  [
      "imagen",
      "producto",
      "color",
      "cantidad",
      "peso"
    ]

    let total_cantidad;
    total_cantidad = item.cantidad.toFixed(2)

    var inputs = [
      {
        "producto" : item.producto.titulo,
        "imagen": $('#barcode-'+item.codigo).attr('src'),
        "color": item.producto_variacion.variacion_name,
        "cantidad": total_cantidad + " " + item.ingreso.unidad,
        "peso" : "---"
      }
    ]

    var template : Template = {
      "schemas" : schemas,
      "basePdf" : inventario_ts.etiqueta_base,
      "columns" : columns
    }
    
    generate({template,inputs}).then((pdf)=>{
      console.log(pdf);
      const blob = new Blob([pdf.buffer],{type:'application/pdf'});
      window.open(URL.createObjectURL(blob));
    })
    
  }

  downloadAll(){
    console.log(this.data_almacen_active);
    var doc = new jsPDF('l', 'mm', [105, 148]);
    let count = 0;
    for(var item of this.data_almacen_active.detalles){

      let total_cantidad;
      total_cantidad = item.cantidad.toFixed(2)

      doc.text(10.44, 13.50, 'POO: --').setFont(undefined, 'bold');
      doc.text(60.44, 13.50, 'N°: --').setFont(undefined, 'bold');
      doc.text(100.56, 13.50, 'LOTE: --').setFont(undefined, 'bold');

      doc.text(10.44, 28.87, 'ESTILO: ' +item.producto.titulo).setFont(undefined, 'bold');
      doc.text(10.44, 37.87, 'COLOR: '+item.producto_variacion.variacion_name).setFont(undefined, 'bold');
      doc.text(10.44, 46.87, 'METRAJE: '+total_cantidad + " " + item.ingreso.unidad).setFont(undefined, 'bold');
      doc.text(10.44, 55.87, 'PESO: --- ').setFont(undefined, 'bold');

      doc.addImage($('#barcode-'+item.codigo).attr('src'), 'JPEG',40.75, 65.12, 70.62, 31.29)
      if(count != this.data_almacen_active.detalles.length - 1){
        doc.addPage();
      }
      
      count++;
    }

    doc.save(new Date().getTime());
    
  }
}
