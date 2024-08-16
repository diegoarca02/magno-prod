import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from 'src/app/services/venta.service';
declare var $:any;
declare var toastr:any;
declare var KTApp:any;
declare var moment:any;
import domtoimage from 'dom-to-image';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { SettinsService } from 'src/app/services/settins.service';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

@Component({
  selector: 'app-detalle-programacion-orden',
  templateUrl: './detalle-programacion-orden.component.html',
  styleUrls: ['./detalle-programacion-orden.component.css']
})
export class DetalleProgramacionOrdenComponent implements OnInit {

  public token = localStorage.getItem('token');
  public id = '';
  public load_btn = false;
  public load_data = true;
  public data = false;
  public venta : any = {};

  public programaciones_xls:Array<any> = [];
  public programaciones :Array<any> = [];

  constructor(
    private _route:ActivatedRoute,
    private _router:Router,
    private _ventaService:VentaService,
    private _productoService:ProductoService,
    private _pedidoService: PedidoService,
    private _settingsService:SettinsService
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
    this._ventaService.get_venta(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data == undefined){
          this.data = false;
        }else{
          this.venta = response.venta;
          this.programaciones_xls = [];
          this.programaciones = response.programaciones;
          for(var item of this.programaciones){
            this.programaciones_xls.push({
              producto: item.producto.titulo,
              color: item.producto_color.variante,
              cantidad: item.cantidad,
              unidad: item.unidad
            });
          }
          this.data = true;
        }
        this.load_data = false;
      }
    );
  }

  downloadExcelProgramacion(){
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Orden");

    worksheet.addRow(undefined);
    for (let x1 of this.programaciones_xls){
      let x2=Object.keys(x1);

      let temp=[]
      for(let y of x2){
        temp.push(x1[y])
      }
      worksheet.addRow(temp)
    }

    //GENERAR EXCEL
    let fname='Programacion #'+this.venta.year+'-'+this.venta.serie.toString().padStart(6,'000000');

    worksheet.columns = [
      { header: 'Producto', key: 'col1', width: 35, style: {border: 'thin'}},
      { header: 'Color', key: 'col1', width: 25, style: {border: 'thin'}},
      { header: 'Cantidad', key: 'col2', width: 25},
      { header: 'Unidad', key: 'col2', width:25},
    ]as any;
    
    //add data and file name and download
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, fname+'.xlsx');
    });
  }

  download(){
    try {
      var elm : any = document.getElementById('toPDF');
      domtoimage.toJpeg(elm, { quality: 0.95 })
      .then(function (dataUrl:any) {
          var link = document.createElement('a');
          link.download = new Date().getTime()+'.jpeg';
          link.href = dataUrl;
          link.click();
      });
    } catch (error) {
      console.log(error);
      
    }
  }
}
