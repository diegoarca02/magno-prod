import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
import { SettinsService } from 'src/app/services/settins.service';
import { TelaService } from 'src/app/services/tela.service';
declare var toastr:any;
declare var $:any;
declare var KTApp:any;
declare var Tagify:any;
import * as XLSX from 'xlsx';
declare var KTMenu:any;
declare var KTUtil:any;
@Component({
  selector: 'app-importar-colores',
  templateUrl: './importar-colores.component.html',
  styleUrls: ['./importar-colores.component.css']
})
export class ImportarColoresComponent implements OnInit {

  public token = localStorage.getItem('token');
  public error_xls = '';
  public validate_data = false;
  public data_xls : Array<any> = [];
  public categorias : Array<any> = [];
  public productos : Array<any> = [];

  public load_importar = false;
  public colores :Array<any> = [];
  public url = GLOBAL.url;

  constructor(
    private _productoService:ProductoService,
    private _settingsService:SettinsService,
    private _router:Router,
    private _telaService:TelaService
  ) { }

  ngOnInit(): void {
    this.init_todos();
  }


  init_todos(){
    this._productoService.get_productos('Todos',1,this.token).subscribe(
      response=>{
        this.productos = response.data;
        setTimeout(() => {
          // Format options
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

          // Init Select2 --- more info: https://select2.org/
          $('#kt_docs_select2_users').select2({
            templateSelection: optionFormat,
            templateResult: optionFormat
          });
          
        }, 150);
      }
    );
  }

  remove_xls(){
    $('#input_xls').val('');
    this.error_xls = '';
    this.data_xls = [];
  }


  validateXLS(): void {
    var validate = true;
    if(this.data_xls.length >= 1){
      this.data_xls.forEach((element:any,idx:any) => {
        if(!element.color){
          this.error_xls = 'El color es requerido, fila: '+(idx+1);
          this.validate_data = false;
        }else if(!element.hxd){
          this.error_xls = 'El color hxd es requerido, fila: '+(idx+1);
          this.validate_data = false;
        }else if(!element.precio.toString()){
          this.error_xls = 'El precio es requerido, fila: '+(idx+1);
          this.validate_data = false;
        }else{
          validate = true;
          this.error_xls = '';
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
    console.log(this.data_xls);
    
    if($("#kt_docs_select2_users").val()){
      if(this.data_xls.length >= 1){
        this.data_xls.forEach((element:any,idx:any) => {
          if(!element.color){
            this.error_xls = 'El color es requerido, fila: '+(idx+1);
            this.validate_data = false;
          }else if(!element.hxd){
            this.error_xls = 'El color hxd es requerido, fila: '+(idx+1);
            this.validate_data = false;
          }else if(!element.precio.toString()){
            this.error_xls = 'El precio es requerido, fila: '+(idx+1);
            this.validate_data = false;
          }else{
            this.validate_data = true;
            this.error_xls = '';
          }
        });
      }else{
        this.error_xls = 'No se encontro datos en el documento';
        this.validate_data = false;
      }
    }else{
      this.error_xls = 'No se seleccionó el producto';
      this.validate_data = false;
    }


    if(this.validate_data){
      this.importar();
    }
  }

  importar(){
    let data : any = {};
    data.colores = JSON.stringify(this.data_xls);
    data.producto = $("#kt_docs_select2_users").val();
    console.log(data);
    
    this.load_importar = true;
    this._productoService.importar_colores(data,this.token).subscribe(
      response=>{
        this._router.navigate(['/manufactura/productos/edit/tela',data.producto]);
        toastr.success("Colores importados.");
        this.load_importar = false;
      }
    );
  }
}
