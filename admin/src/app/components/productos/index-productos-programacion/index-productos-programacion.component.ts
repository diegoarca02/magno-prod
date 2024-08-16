import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
import { VentaService } from 'src/app/services/venta.service';
declare var $:any;
declare var moment:any;
declare var toastr:any;
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

@Component({
  selector: 'app-index-productos-programacion',
  templateUrl: './index-productos-programacion.component.html',
  styleUrls: ['./index-productos-programacion.component.css']
})
export class IndexProductosProgramacionComponent implements OnInit {

  public token = localStorage.getItem('token');
  public page = 1;
  public pageSize = 24;
  public load_data = true;

  public filtro_productos = '';
  public productos :Array<any> = [];
  public productos_const :Array<any> = [];
  public programaciones :Array<any> = [];
  public data_xls : Array<any> = [];
  public color_selected : any = {};
  public load_productos = false;
  public option = 1;

  public parameters = JSON.parse(localStorage.getItem('parameters')!);
  public url = GLOBAL.url;
  public permisos = {
    programacion_uno : false,
    programacion_dos : false,
    programacion_tres : false,
    programacion_cuatro : false,
    programacion_cinco : false,
  }
  public tipo_option = 'Telas';
  public load_ropas = false;

  public load_programaciones = false;

   constructor(
    private _ventaService:VentaService,
    private _productoService:ProductoService,
    private _router:Router,
    private _route:ActivatedRoute
  ) { 

    for(var item of this.parameters){
      if(item.permiso == 'programacion_uno'){
        this.permisos.programacion_uno = true;
      }else if(item.permiso == 'programacion_dos'){
        this.permisos.programacion_dos = true;
      }else if(item.permiso == 'programacion_tres'){
        this.permisos.programacion_tres = true;
      }else if(item.permiso == 'programacion_cuatro'){
        this.permisos.programacion_cuatro = true;
      }else if(item.permiso == 'programacion_cinco'){
        this.permisos.programacion_cinco = true;
      }
    }
  }


  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        console.log(params);
        
        if(params['tipo']){
          console.log(1);
          if(params['tipo'] == 'telas'){
            this.tipo_option = 'Telas';
            this.init_todos();
          }else if(params['tipo'] == 'ropas'){
            this.tipo_option = 'Ropas';
            this.init_ropas();
          }

        }else{
          console.log(2);
          this._router.navigate(['/programaciones/telas']);
        }
      }
    );
  }

  init_todos(){
    this.load_data = true;
    this._productoService.get_productos_programaciones('Todos',this.token).subscribe(
      response=>{
        console.log(response);
        
        this.productos = response.data;
        this.programaciones = response.programaciones;
        this.productos_const = this.productos;
        for(var item of this.productos){
          item.visible = false;
        }

        for(var item of this.programaciones){
          if(item.producto){
            let cliente;
            if(item.tipo_usuario == 'Cliente natural') cliente = item.cliente.nombres.split(' ')[0] +' '+item.cliente.apellidos.split(' ')[0];
            else if(item.tipo_usuario == 'Empresa') cliente = item.empresa_rs.razon_social;
            this.data_xls.push({
                producto: item.producto.titulo,
                cliente: cliente,
                color: item.producto_color.variante,
                metraje: item.cantidad,
                unidad: item.unidad,
                estado: item.estado,
                precio_unidad: item.precio_unidad,
                subtotal: item.cantidad * item.precio_unidad,
            });
          }
        }

        this.data_xls.sort((a, b) => {
          const nameA = a.estado.toUpperCase(); // ignore upper and lowercase
          const nameB = b.estado.toUpperCase(); // ignore upper and lowercase
          if (nameA > nameB) {
            return -1;
          }
          if (nameA < nameB) {
            return 1;
          }
        
          // names must be equal
          return 0;
        });
        console.log(this.productos);
        
        this.load_data = false;
      }
    );
  }

  init_ropas(){
    this.load_data = true;
    this._productoService.get_productos_programaciones_ropas('Todos',this.token).subscribe(
      response=>{
        console.log(response);
        
        this.productos = response.data;
        this.programaciones = response.programaciones;
        this.productos_const = this.productos;
        for(var item of this.productos){
          item.visible = false;
        }

        for(var item of this.programaciones){
          if(item.producto){
            let cliente;
            if(item.tipo_usuario == 'Cliente natural') cliente = item.cliente.nombres.split(' ')[0] +' '+item.cliente.apellidos.split(' ')[0];
            else if(item.tipo_usuario == 'Empresa') cliente = item.empresa_rs.razon_social;
            this.data_xls.push({
                producto: item.producto.titulo,
                cliente: cliente,
                color: item.ropa_variacion.color,
                talla: item.ropa_variacion.talla,
                cantidad: item.cantidad,
                estado: item.estado,
                precio_unidad: item.precio_unidad,
                subtotal: item.cantidad * item.precio_unidad,
            });
          }
        }

        this.data_xls.sort((a, b) => {
          const nameA = a.estado.toUpperCase(); // ignore upper and lowercase
          const nameB = b.estado.toUpperCase(); // ignore upper and lowercase
          if (nameA > nameB) {
            return -1;
          }
          if (nameA < nameB) {
            return 1;
          }
        
          // names must be equal
          return 0;
        });

        this.load_data = false;
      }
    );
  }

  init_productos(){
    if(this.filtro_productos){
      this.load_data = true;
      this._productoService.get_productos_programaciones(this.filtro_productos,this.token).subscribe(
        response=>{
          this.productos = response.data;
          this.programaciones = response.programaciones;
          for(var item of this.productos){
            item.visible = false;
          }
          this.load_data = false;
        }
      );
    }else{
      this.init_todos();
    }
  }

  show_detalles(idx:any){
    if(!this.productos[idx].visible){
      this.productos[idx].visible = true;
    }else{
      this.productos[idx].visible = false;
    } 
  }

  init_programaciones(item:any){
    this._router.navigate(['/programaciones/color',item._id]);
  }

  back_productos(){
    this.option = 1;
    this.productos = this.productos_const;
    this.filtro_productos = '';
  }

  downloadExcel(){
    if(this.data_xls.length >= 1){
      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet("Orden");

      worksheet.addRow(undefined);
      for (let x1 of this.data_xls){
        let x2=Object.keys(x1);

        let temp=[]
        for(let y of x2){
          temp.push(x1[y])
        }
        worksheet.addRow(temp)
      }

      //GENERAR EXCEL
      let fname= new Date().getTime();

      if(this.tipo_option == 'Telas'){
        worksheet.columns = [
          { header: 'Producto', key: 'col1', width: 35, style: {border: 'thin'}},
          { header: 'Cliente', key: 'col1', width: 35, style: {border: 'thin'}},
          { header: 'Color', key: 'col2', width: 25, style: {border: 'thin'}},
          { header: 'Metraje', key: 'col4', width: 15, style: {border: 'thin'}},
          { header: 'U/M', key: 'col5', width: 10},
          { header: 'Estado', key: 'col3', width:20},
          { header: 'Precio unidad', key: 'col6', width: 25},
          { header: 'Subtotal', key: 'col6', width: 25},
        ]as any;
      }else if(this.tipo_option == 'Ropas'){
        worksheet.columns = [
          { header: 'Producto', key: 'col1', width: 35, style: {border: 'thin'}},
          { header: 'Cliente', key: 'col1', width: 35, style: {border: 'thin'}},
          { header: 'Color', key: 'col2', width: 25, style: {border: 'thin'}},
          { header: 'Talla', key: 'col2', width: 25, style: {border: 'thin'}},
          { header: 'Cantidad', key: 'col4', width: 15, style: {border: 'thin'}},
          { header: 'Estado', key: 'col3', width:20},
          { header: 'Precio unidad', key: 'col6', width: 25},
          { header: 'Subtotal', key: 'col6', width: 25},
        ]as any;
      }
      
      //add data and file name and download
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, fname+'.xlsx');
      });
    }
  }
  

  set_tipo(tipo:any){
    this.tipo_option = tipo;
    if(this.tipo_option == 'Telas'){
      this._router.navigate(['/manufactura/productos/telas/programaciones']);
    }else if(this.tipo_option == 'Ropas'){
      this._router.navigate(['/manufactura/productos/ropas/programaciones']);
    }
  }

}
