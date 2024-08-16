import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductoService } from 'src/app/services/producto.service';
import { SettinsService } from 'src/app/services/settins.service';
declare var $:any;
declare var toastr:any;
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-importar-producto',
  templateUrl: './importar-producto.component.html',
  styleUrls: ['./importar-producto.component.css']
})
export class ImportarProductoComponent implements OnInit {

  public token = localStorage.getItem('token');
  public error_xls = '';
  public validate_data = false;
  public data_xls : Array<any> = [];
  public categorias : Array<any> = [];
  public subcategorias_active : Array<any> = [];
  public load_importar = false;

  constructor(
    private _productoService:ProductoService,
    private _settingsService:SettinsService,
    private _router:Router
  ) { }

  ngOnInit(): void {
  }

  remove_xls(){
    $('#input_xls').val('');
    this.error_xls = '';
    this.data_xls = [];
  }

  init_categorias(){
    this._settingsService.get_categorias(this.token).subscribe(
      response=>{
        for(var item of this.data_xls){
          if(item.tipo == 'Tela'){
            this.categorias.push(response.telas);
          }else if(item.tipo == 'Ropa'){
            this.categorias.push(response.ropas);
          }
        }
      }
    );
  }

  set_tipo(value:any,idx:any){
    this._settingsService.get_categorias(this.token).subscribe(
      response=>{
        console.log(response);
        
        this.categorias[idx] = [];
        if(value == 'Tela'){
          this.categorias[idx] = response.telas;
        }else if(value == 'Ropa'){
          this.categorias[idx] = response.ropas;
        }
      }
    );
  }

  set_categoria(value:any,idx:any){
    this.subcategorias_active[idx] = this.categorias[idx].filter((item:any) => item.categoria == value)[0].subcategorias;
  }

  validateXLS(): void {
    console.log(this.data_xls);
    var validate = true;
    if(this.data_xls.length >= 1){
      this.data_xls.forEach((element:any,idx:any) => {
          if(!element.titulo){
            this.error_xls = 'El titulo es requerido, fila: '+(idx+1);
            validate = false;
          }else if(!element.tipo){
            this.error_xls = 'El tipo es requerido, fila: '+(idx+1);
            validate = false;
          }else if(!element.categoria){
            this.error_xls = 'La categoria es requerida, fila: '+(idx+1);
            validate = false;
          }else if(!element.subcategoria){
            this.error_xls = 'La subcategoria es requerida, fila: '+(idx+1);
            validate = false;
          }else if(!element.estado){
            this.error_xls = 'El estado es requerido, fila: '+(idx+1);
            validate = false;
          }else if(!element.descripcion){
            this.error_xls = 'La descripcion es requerida, fila: '+(idx+1);
            validate = false;
          }
      });
    }else{
      this.error_xls = 'No se encontro datos en el documento';
      validate = false;
    }

    if(validate){
      this.error_xls = '';
    }else{
      $('#input_xls').val('');
    }
  }

  upload_xls(event:any){
    
    var file : any;
    file = <File>event.target.files[0];
    console.log(file);

    try {
      if(file.size <= 2000000){
        if(file.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
          const fileReader = new FileReader();
          fileReader.onload = (e: any) => {
            const workbook = XLSX.read(e.target.result, {type: 'binary'});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data :any = XLSX.utils.sheet_to_json(worksheet, {header: 1});

            const result = [];
            const headers :any = data[0];

            for (let i = 1; i < data.length; i++) {
              const obj :any= {};
              for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = data[i][j];
              }
              result.push(obj);
            }
            this.data_xls = result;
            
            this.init_categorias();
            
            this.validateXLS();
          };
          fileReader.readAsArrayBuffer(file);
          
        }else{
          this.error_xls = "El documento debe ser XLS.";
          $('#input_xls').val('');
        }
      }else{
        this.error_xls = "El documento debe pesar menos de 2Mbs.";
        $('#input_xls').val('');
      }
    } catch (error) {
    }
  }

  validate(){
    this.validate_data = true;
    if(this.data_xls.length >= 1){
      this.data_xls.forEach((element:any,idx:any) => {
          if(!element.titulo){
            this.error_xls = 'El titulo es requerido, fila: '+(idx+1);
            this.validate_data = false;
          }else if(!element.tipo){
            this.error_xls = 'El tipo es requerido, fila: '+(idx+1);
            this.validate_data = false;
          }else if(!element.categoria){
            this.error_xls = 'La categoria es requerida, fila: '+(idx+1);
            this.validate_data = false;
          }else if(!element.subcategoria){
            this.error_xls = 'La subcategoria es requerida, fila: '+(idx+1);
            this.validate_data = false;
          }else if(!element.estado){
            this.error_xls = 'El estado es requerido, fila: '+(idx+1);
            this.validate_data = false;
          }else if(!element.descripcion){
            this.error_xls = 'La descripcion es requerida, fila: '+(idx+1);
            this.validate_data = false;
          }
      });
    }else{
      this.error_xls = 'No se encontro datos en el documento';
      this.validate_data = false;
    }

    if(this.validate_data){
      this.importar();
    }
  }

  importar(){
    let data : any = {};
    data.productos = JSON.stringify(this.data_xls);
    console.log(this.data_xls);
    
    this.load_importar = true;
    this._productoService.importar_productos(data,this.token).subscribe(
      response=>{
        this._router.navigate(['/manufactura/productos/ropas']);
        toastr.success("Productos importados.");
        this.load_importar = false;
      }
    );
  }
}
