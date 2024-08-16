import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
import { SettinsService } from 'src/app/services/settins.service';
declare var toastr:any;
declare var $:any;
declare var KTApp:any;
declare var Tagify:any;
import * as XLSX from 'xlsx';
declare var KTMenu:any;
declare var KTUtil:any;

@Component({
  selector: 'app-index-producto',
  templateUrl: './index-producto.component.html',
  styleUrls: ['./index-producto.component.css']
})
export class IndexProductoComponent implements OnInit {

  public token = localStorage.getItem('token');
  public filtro :any = '';
  public filtro_ropas  :any = '';
  public load_ropas = false;
  public load_estado = false;
  public load_data = true;
  public productos : Array<any> = [];
  public productos_const : Array<any> = [];
  public productos_papelera : Array<any> = [];
  public productos_papelera_const : Array<any> = [];
  public load_papelera = true;
  public categorias: Array<any> = [];
  public url = GLOBAL.url;

 
  public filter_tipo = 'Todos';
  public filter_categoria = 'Todos';
  public filter_estado = 'Todos';

  public page = 10;
  public load = 0;
  
  public str_labels = '';
  public input1 : any;
  public load_btn_duplicar = false;

  public load_del = false;

  public data_xls :Array<any> = [];
  public error_xls = '';
  public load_importar = false;
  public today_now : any= new Date();
  public min_new_tag = GLOBAL.min_new_tag;
  public tab_active = 'Productos';

  public tipo_option = 'Todos';
  public last_page = 0;
  public page_status = true;
  public todos = 0;
  public permisos : Array<any> = [];

  constructor(
    private _router:Router,
    private _route:ActivatedRoute,
    private _productoService:ProductoService,
    private _settingsService:SettinsService
  ) { 
    
  }


  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('3000')){
      setTimeout(() => {
        KTApp.init();
        KTUtil.init();
      }, 50);
      this.init_todos();
      this.init_papelera();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    
  }

  set_tipo(){
    this.init_categorias();
  }
  
  init_categorias(){
    this._productoService.get_Categorias().subscribe(
      response=>{
        if(this.filter_tipo == 'Tela'){
          this.categorias = response.tela.categorias;
        }else if(this.filter_tipo == 'Ropa'){
          this.categorias = response.ropa.categorias;
        }else if(this.filter_tipo == 'Acero'){
          this.categorias = response.acero.categorias;
        }
      }
    );
  }

  
  init_todos(){
    this.load++;
    if(this.load==0) this.load_data = true;
    this._productoService.get_productos('Todos',this.page,this.token).subscribe(
      response=>{
        for(var item of response.data){
          let create :any = new Date(item.producto.createdAt);
          item.producto.minutos_pasados = (this.today_now - create)/60000;
        }
        this.productos = response.data;
        this.productos_const = this.productos;
        this.last_page = this.productos.length;
        this.todos = response.todos;
        console.log(response.data.length + ' - '+this.last_page);
        console.log(this.productos);
        
        this.load_data = false;
      }
    );
  }

  click_matriculas(){
    this.page = this.page + 10;
    this.init_todos();
    if(this.productos.length == this.last_page){
      this.page_status = false;
    }
  }


  init_papelera(){
    this.load_papelera = true;
    this._productoService.get_productos_papelera('Todos',this.token).subscribe(
      response=>{
        console.log(response);
        
        for(var item of response.data){
          let create :any = new Date(item.producto.createdAt);
          item.producto.minutos_pasados = (this.today_now - create)/60000;
        }
        this.productos_papelera = response.data;
        this.productos_papelera_const = this.productos_papelera;
        this.load_papelera = false;
      }
    );
  }

  filtro_avanzado(){
    let arr_uno;
    if(this.filter_tipo == 'Todos'){
      arr_uno = this.productos_const;
    }else{
      arr_uno = this.productos_const.filter(item=>item.producto.tipo == this.filter_tipo);
    }

    let arr_dos;
    if(this.filter_categoria == 'Todos'){
      arr_dos = arr_uno;
    }else{
      arr_dos = arr_uno.filter(item=>item.producto.categoria == this.filter_categoria);
    }

    let arr_tres;
    if(this.filter_estado == 'Todos'){
      arr_tres = arr_dos;
    }else{
      arr_tres = arr_dos.filter(item=>item.producto.estado == this.filter_estado);
    }


    this.productos = arr_tres;
  }

  init_productos(){
    if(this.filtro){
      this.load_data = true;
      this._productoService.get_productos(this.filtro,this.page,this.token).subscribe(
        response=>{
          this.productos = response.data;
          this.load_data = false;
        }
      );
    }else{
      this.init_todos();
    }
  }


  redirect_detail(id:any){
    this._router.navigate(['/inventario/detail',id]);
  }

  duplicar(id:any){
    this.load_btn_duplicar = true;
    this._productoService.duplicar_producto(id,this.token).subscribe(
      response=>{
        console.log(response);
        
        this.init_todos();
        $('#duplicar-'+id).modal('hide');
        toastr.success("Producto duplicado.");
        this.load_btn_duplicar = false;
      },
      error=>{
        console.log(error);
      }
    );
  }

  delete_producto(id:any){
    this.load_del = true;
    this._productoService.delete_producto(id,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          this.init_todos();
          this.init_papelera();
          $('#delete-'+id).modal('hide');
          toastr.success("Producto eliminado.");
          this.load_del = false;
        }else{
          toastr.error(response.message);
          this.load_del = false;
          $('#delete-'+id).modal('hide');
        }
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

  remove_xls(){
    $('#input_xls').val('');
    this.error_xls = '';
    this.data_xls = [];
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

  importar(){
    let data : any = {};
    data.productos = JSON.stringify(this.data_xls);
    this.load_importar = true;
    this._productoService.importar_productos(data,this.token).subscribe(
      response=>{
        console.log(response);
        this.init_todos();
        $('#importModal').modal('hide');
        toastr.success("Productos importados.");
        this.load_importar = false;
      }
    );
  }

  redirect(url:any){
    $('#nuevoProducto').modal('hide');
    this._router.navigate([url]);
  }

  restablecer(){
    this.filter_tipo = 'Todos';
    this.filter_categoria = 'Todos';
    this.filter_estado = 'Todos';
    this.productos = this.productos_const;
  }

}
