import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
import { SettinsService } from 'src/app/services/settins.service';
declare var $:any;
declare var toastr:any;
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-importar-rollos',
  templateUrl: './importar-rollos.component.html',
  styleUrls: ['./importar-rollos.component.css']
})
export class ImportarRollosComponent implements OnInit {

  public token = localStorage.getItem('token');
  public error_xls = '';
  public validate_data = false;
  public data : any = [];
  public productos : Array<any> = [];
  public almacenes : Array<any> = [];
  public subcategorias_active : Array<any> = [];
  public load_importar = false;
  public url =GLOBAL.url;

  constructor(
    private _productoService:ProductoService,
    private _settingsService:SettinsService,
    private _router:Router
  ) { }

  ngOnInit(): void {
    this.init_productos();
    this.init_almacenes();
    
  }

  init_almacenes(){
    this._settingsService.get_almacenes(this.token).subscribe(
      response=>{
        this.almacenes = response.data;
      }
    );
  }

  remove_xls(){
    $('#input_xls').val('');
    this.error_xls = '';
    this.data = [];
  }

  init_productos(){
    this._productoService.get_productos('Todos',1,this.token).subscribe(
      response=>{
        this.productos = response.data;
      }
    );
  }

  upload_xls(event:any){
    
    var file : any;
    file = <File>event.target.files[0];
    console.log(file);

    try {
      if(file.size <= 2000000){
        if(file.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
          const reader = new FileReader();
          reader.onload = (e: any) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheetName = workbook.SheetNames[0]; // Nombre de la hoja de trabajo, asumiendo que deseas obtener los datos de la primera hoja
            const worksheet = workbook.Sheets[worksheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Obtener las columnas en formato vertical del archivo de Excel
            const columnsVertical = [];
            if (jsonData.length > 0) {
              const headerRow :any = jsonData[0];
              for (let i = 0; i < headerRow.length; i++) {
                const columnName = headerRow[i];
                const columnData = jsonData.slice(1).map((row:any) => row[i]); // Obtener los datos de la columna en cada fila
                const column = {
                  name: columnName,
                  data: columnData
                };
                columnsVertical.push(column);
              }
            }
            console.log(columnsVertical);
            let arr_data : any= columnsVertical;

            for(var item of arr_data){
              let data = [];
              item.almacen = '';
              item.tipo = 'Tela';
              item.peso = 0;
              item.cantidad = 0;

              for(var subitem of item.data){
                if(subitem != undefined){
                  item.cantidad = item.cantidad + parseFloat(subitem);
                  data.push({
                    cantidad: subitem,
                    peso: 0,
                  });
                }
              }
              item.rollos = data.length;
              item.data = data;
              item.umedida_peso = '';
              item.umedida_cantidad = 'Yrd';
            }

            this.data = arr_data;

            setTimeout(() => {
              // Format options
              // Init Select2 --- more info: https://select2.org/
              this.data.forEach((element:any,index:any) => {
                var optionFormat = function(item:any) {
                  if ( !item.id ) {
                      return item.text;
                  }
      
                  var span = document.createElement('span');
                  var imgUrl = item.element.getAttribute('data-kt-select2-user');
                  var template = '';
      
                  template += '<img src="' + imgUrl + '" class="rounded-circle h-20px w-20px me-2" alt="image"/>';
                  template += item.text;
      
                  span.innerHTML = template;
      
                  return $(span);
                }
                
                $('#kt_select-'+index).select2({
                  templateSelection: optionFormat,
                  templateResult: optionFormat,
                });

                $('#kt_select-'+index).on('change', (event:any) => {
                  const selectedValue = $(event.target).val();
                  element.producto = selectedValue;
                  
                  var colores = this.productos.find(item=>item.producto._id == selectedValue);
                  element.colores = colores.colores;
                });
              });
              
            }, 150);
          };
          reader.readAsArrayBuffer(file);
          
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
    console.log(this.data);
    var validate = true;
    if(this.data.length >= 1){
      this.data.forEach((element:any,idx:any) => {
          if(!element.producto){
            this.error_xls = 'El producto es requerido, color: '+element.name;
            validate = false;
          }else if(!element.producto_color){
            this.error_xls = 'El color es requerido, color: '+element.name;
            validate = false;
          }
      });
    }else{
      this.error_xls = 'No se encontro datos en el documento';
      validate = false;
    }


    if(validate){
      this.error_xls = '';
      this.importar();
    }else{
      $('#input_xls').val('');
    }
  }

  importar(){
   
    let data : any = {};
    data.ingresos = JSON.stringify(this.data);
    console.log(data);
    
    this.load_importar = true;
    this._productoService.importar_rollos(data,this.token).subscribe(
      response=>{
        console.log(response);
        
        this.load_importar = false;
      }
    );
  }

  aplicar_todos(idx:any){
    for(var item of this.data){
      item.almacen = this.data[idx].almacen;
      item.producto_color = this.data[idx].producto_color;
    }
    setTimeout(() => {
      this.data.forEach((element:any,index:any) => {
        var optionFormat = function(item:any) {
          if ( !item.id ) {
              return item.text;
          }

          var span = document.createElement('span');
          var imgUrl = item.element.getAttribute('data-kt-select2-user');
          var template = '';

          template += '<img src="' + imgUrl + '" class="rounded-circle h-20px w-20px me-2" alt="image"/>';
          template += item.text;

          span.innerHTML = template;

          return $(span);
        }

        if(index != idx) $('#kt_select-'+index).select2({
          templateSelection: optionFormat,
          templateResult: optionFormat,
        }).val($("#kt_select-"+idx).val()).trigger("change");
      });
      
    }, 50);
  }

  quitar_rollo(idx_data:any,idx_rollo:any){
    this.data[idx_data].data.splice(idx_rollo,1);
  }

  quitar_color(idx_data:any){
    this.data.splice(idx_data,1);
  }

}
