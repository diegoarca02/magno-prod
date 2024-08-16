import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
import { SettinsService } from 'src/app/services/settins.service';
declare var $:any;
declare var toastr:any;
import * as XLSX from 'xlsx';
import { io } from "socket.io-client";
import { GENERAL } from 'src/app/services/GENERAL';

@Component({
  selector: 'app-manual-ingreso',
  templateUrl: './manual-ingreso.component.html',
  styleUrls: ['./manual-ingreso.component.css']
})
export class ManualIngresoComponent implements OnInit {

  public token = localStorage.getItem('token');
  public load_btn = false;
  public detalles : Array<any> = [];
  public detalles_ingreso : Array<any> = [];
  public load_detalles = false;
  public page = 10;
  public ingreso : any = {
    tipo: 'Tela',
    unidad: 'Mtr',
    almacen: '',
    tipo_registro: ''
  };

  public detalle : any = {
    cantidad: '',
    codigo: ''
  }
  public producto: any = {};
  public producto_variacion: any = {};

  public peso = 0;
  public todos = 0;
  public cantidad = 0;
  public almacenes : Array<any> = [];

  public load_productos = false;
  public productos :Array<any> = [];
  public filtro_producto = '';
  public url = GLOBAL.url;

  public producto_selected : any = {};
  public color_selected : any = {};
  public variaciones :Array<any> = [];

  public producto_variacion_id = '';

  public data_xls :Array<any> = [];
  public error_xls = '';
  public load_importar = false;

  public variacion_active = '';
  public arr_variaciones : Array<any> = [];
  public min_new_tag = GLOBAL.min_new_tag;
  public today_now : any= new Date();
  public socket = io("http://localhost:4201",{transports: ['websocket']});
  public permisos : Array<any> = [];

  constructor(
    private _pedidoService:PedidoService,
    private _settingsService:SettinsService,
    private _router:Router,
    private _productoService:ProductoService
  ) { 
    for(var item of GENERAL.almacenes){
      this.almacenes.push(item.name);
    }
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('7001')){
      this.init_productos('Todos');
    }else{
      this._router.navigate(['/dashboard']);
    }
  }
  
  ngOnInit(): void {
    
    
  }

  click_matriculas(){
    this.page = this.page + 10;
    this.search_productos();
  }

  search_productos(){
    if(this.filtro_producto){
      this.init_productos(this.filtro_producto);
    }else{
      this.init_productos('Todos');
    }
  }

  //PRODUCTOS
  init_productos(filtro:any){
    this.load_productos = true;
    this._productoService.get_productos(filtro,this.page,this.token).subscribe(
      response=>{
        for(var item of response.data){
          let create :any = new Date(item.producto.createdAt);
          item.producto.minutos_pasados = (this.today_now - create)/60000;
        }
        this.todos = response.todos;
        this.productos = response.data.filter((item:any)=>item.producto.tipo == this.ingreso.tipo);
        this.load_productos = false;
      }
    );
  }

  confirmar_cambio(){
    this.cantidad = 0;
    this.peso = 0;
    this.detalles_ingreso = [];
    $('#modalCambio').modal('hide');
  }

  selected_variacion(item:any){
    console.log(item);
    
    this.producto = item.producto;
    this.producto_variacion = item;
    this.producto_variacion_id = item._id;
    setTimeout(() => {
      $("#radio-color-"+this.producto_variacion_id).prop("checked", true);
    }, 50);
  }

  


  agregar_detalle(){
    if(!this.producto._id){
      toastr.error("Seleccione el producto.");
    }else if(!this.producto_variacion._id){
      toastr.error("Seleccione la variación.");
    }else if(!this.detalle.cantidad){
      toastr.error("La cantidad es requerida.");
    }else if(this.detalle.cantidad <= 0){
      toastr.error("La cantidad no puede ser negativa.");
    }else{
      
      let str_almacen = this.ingreso.almacen.replace(/ /g, "").substr(0,3);
      let str_producto = this.producto.titulo.trim().substr(0,3);
      let str_variacion_name = this.producto_variacion.variacion_name.trim().substr(0,3);
      let str_cantidad = parseInt(this.detalle.cantidad);
      let str_index = this.detalles_ingreso.length+1;

      this.cantidad = this.cantidad + parseFloat(this.detalle.cantidad);

      //
      this.detalle.producto = this.producto._id;
      this.detalle.producto_variacion = this.producto_variacion._id;
      this.detalle.color = this.producto_variacion.color;
      this.detalle.producto_titulo = this.producto.titulo;
      this.detalle.variacion_name = this.producto_variacion.variacion_name;
      this.detalle.hxd = this.producto_variacion.hxd;

      let arr_unidades = [];

      if(this.ingreso.tipo == 'Ropa'){
        for(var i = 0; i< str_cantidad;i++){
          let det = {
            cantidad: 1,
            codigo:  str_almacen+''+str_producto+''+str_variacion_name+''+str_cantidad+''+str_index +'-'+ this.getRandomArbitrary(10000,99999),
            color: this.detalle.color,
            hxd: this.detalle.hxd,
            producto: this.detalle.producto,
            producto_titulo: this.detalle.producto_titulo,
            producto_variacion: this.detalle.producto_variacion,
            variacion_name: this.detalle.variacion_name,
          }
          
          arr_unidades.push(det);
        }
      }else{
        
        this.detalle.codigo = str_almacen+''+str_producto+''+str_variacion_name+''+str_cantidad+''+str_index +'-'+ this.getRandomArbitrary(10000,99999);
        arr_unidades.push(this.detalle);

      }

      if(this.arr_variaciones.length == 0){
        
        this.arr_variaciones.unshift({
          producto: this.detalle.producto_titulo,
          producto_variacion: this.detalle.producto_variacion,
          variacion_name: this.producto_variacion.variacion_name,
          hxd: this.producto_variacion.hxd,
          color_name: this.producto_variacion.color_name,
          talla: this.producto_variacion.talla,
          tipo: this.producto_variacion.tipo,
          unidades: arr_unidades.reverse(), 
          cantidad: this.detalle.cantidad
        });
      }else{
        var variacion_exist = this.arr_variaciones.filter(item=> item.producto_variacion == this.detalle.producto_variacion);
        if(variacion_exist.length == 0){
          this.arr_variaciones.unshift({
            producto: this.detalle.producto_titulo,
            producto_variacion: this.detalle.producto_variacion,
            variacion_name: this.producto_variacion.variacion_name,
            hxd: this.producto_variacion.hxd,
            color_name: this.producto_variacion.color_name,
            talla: this.producto_variacion.talla,
            tipo: this.producto_variacion.tipo,
            unidades: arr_unidades.reverse(), 
            cantidad: this.detalle.cantidad
          });
        }else{
          for(var item of this.arr_variaciones){
            if(item.producto_variacion == this.detalle.producto_variacion){
              item.cantidad = item.cantidad + this.detalle.cantidad;
              item.unidades = item.unidades.concat(arr_unidades).reverse();
            }
          }
        }
      }

      this.variacion_active = this.detalle.producto_variacion;
      console.log(this.arr_variaciones);

      this.detalle = {
        cantidad: '',
        codigo: ''
      }

    }
  }

  getRandomArbitrary(min:any, max:any) {
    return Math.round(Math.random() * (max - min) + min);
  }

  validate(){
    //PREPARAR DETALLES
    this.detalles_ingreso = [];
    for(var item of this.arr_variaciones){
      for(var subitem of item.unidades){
        subitem.unidad = this.ingreso.unidad;
        subitem.tipo = this.ingreso.tipo;
        this.detalles_ingreso.push(subitem);
      }
    }
    console.log(this.ingreso);
    
    let ingreso :any = {
      almacen: this.ingreso.almacen,
      unidades: this.detalles_ingreso.length,
      cantidad: this.cantidad,
      unidad: this.ingreso.unidad,
      tipo: this.ingreso.tipo,
      detalles: this.detalles_ingreso
    }

    if(!this.ingreso.almacen){
      toastr.error("El almacén es requerido.");
    }else if(ingreso.detalles.length == 0){
      toastr.error("El conteo de productos está vacio.");
    }else{
      this.load_btn = true;
      console.log(ingreso);
      
      this._pedidoService.create_ingreso(ingreso,this.token).subscribe(
        response=>{
          console.log(response);
          toastr.success("Ingreso creado.");
          this._router.navigate(['/ingresos/detail',response.data._id]);
          $('#confirmarModal').modal('hide');
          this.load_btn = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          $('#confirmarModal').modal('hide');
          this.load_btn = false;
        }
      );
    }
  }

  remove_detalle(idx1:any,idx2:any,cantidad:any){
    this.cantidad = 0;
    this.arr_variaciones[idx1].unidades.splice(idx2,1);

    for(let item of this.arr_variaciones){
      let cantidad = 0;
      for(let subitem of item.unidades){
        cantidad = cantidad + subitem.cantidad;
        this.cantidad =  this.cantidad + subitem.cantidad;
      }
      item.cantidad = cantidad;
    }

  }

  selected_producto(item:any){
    $('#str_producto').val(item.producto.titulo);
    this.producto_variacion = {};
    this.producto = item.producto;
    this.variaciones = item.variaciones;
    console.log(this.variaciones);
    
  }

  import_rollos(){
    if(!this.producto._id){
      toastr.error("Seleccione el producto.");
    }else if(!this.producto_variacion._id){
      toastr.error("Seleccione el color del producto.");
    }else if(!this.ingreso.umedida_cantidad){
      toastr.error("La unidad de medida para cantidad es requerida.");
    }else if(!this.ingreso.almacen){
      toastr.error("El almacén es requerido.");
    }else{
      $('#importModal').modal('show');
    }
  }

  remove_xls(){
    $('#input_xls').val('');
    this.error_xls = '';
    this.data_xls = [];
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

  validateXLS(){
    console.log(this.data_xls);
    let rollos = [];
    for(var item of this.data_xls){
      if(item.rollos != undefined){
        rollos.push(item);
      }
    }
    this.data_xls = rollos;
    console.log(rollos);
    
    
    var validate = true;
    if(this.data_xls.length >= 1){
      this.data_xls.forEach((element:any,idx:any) => {
          if(!element.rollos){
            this.error_xls = 'El rollo está vacío, fila: '+(idx+1);
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
    for(var item of this.data_xls){
      console.log(item.rollos);
      let str_almacen = this.ingreso.almacen.replace(/ /g, "").substr(0,3);
      let str_producto = this.producto.titulo.trim().substr(0,3);
      let str_color = this.producto_variacion.variante.trim().substr(0,3);
      let str_cantidad = parseInt(item.rollos);
      let str_index = this.detalles_ingreso.length+1;


      if(!this.detalle.peso)this.detalle.peso = 0;
      
      this.peso = this.peso + parseFloat(this.detalle.peso);
      this.cantidad = this.cantidad + parseFloat(item.rollos);

      this.detalles_ingreso.unshift({
        cantidad: item.rollos,
        codigo:  str_almacen+''+str_producto+''+str_color+''+str_cantidad+''+str_index +''+ this.getRandomArbitrary(100,999),
        peso: this.detalle.peso,
        producto: this.producto._id,
        producto_variacion: this.producto_variacion._id
      });

      $('#importModal').modal('hide');
    }
  }

  setTipo(){
    this.cantidad = 0;
    this.variaciones = [];
    this.variacion_active = '';
    this.producto_variacion = {};
    this.arr_variaciones = [];
    this.detalles = [];
    this.init_productos('Todos');
    if(this.ingreso.tipo == 'Tela'){
      this.ingreso.unidad = 'Mtr';
    }else if(this.ingreso.tipo == 'Ropa'){
      this.ingreso.unidad = 'Unid';
    }else if(this.ingreso.tipo == 'Acero'){
      this.ingreso.unidad = 'Kg';
    }
    
  }
}
