import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductoService } from 'src/app/services/producto.service';
import { SettinsService } from 'src/app/services/settins.service';
import { TelaService } from 'src/app/services/tela.service';
declare var KTImageInput:any;
declare var $:any;
declare var toastr:any;
declare var spectrum:any;
import { io } from "socket.io-client";
import { GENERAL } from 'src/app/services/GENERAL';
import { GLOBAL } from 'src/app/services/GLOBAL';
import imageCompression from 'browser-image-compression';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-create-producto',
  templateUrl: './create-producto.component.html',
  styleUrls: ['./create-producto.component.css']
})
export class CreateProductoComponent implements OnInit {

  public socket = io("http://localhost:4201",{transports: ['websocket']});
  public banner : File|any = undefined;
  public token = localStorage.getItem('token');
  public str_portada :any = 'assets/images/blank-image.svg';
  public producto : any = {
    tipo: 'Tela',
    estado: 'Publicado',
    genero: '',
    color_base: '',
    categoria: '',
    subcategoria: ''
  };

  public composicion: any = {};
  public composiciones :Array<any> = [];

  public titulo = '';
  public titulos :Array<any> = [];

  public color: any = {
    base: ''
  };
  public coloresbase :Array<any> = [];
  public coloresbase_const :Array<any> = [];

  public galeria :Array<any> = [];
  public _galeria :Array<any> = [];
  public imagen_str : any = undefined;
  public imagen_file : any = undefined;
  public imagen_titulo = '';

  public load_btn = false;

  public _composiciones :Array<any> = [];
  public categorias : Array<any> = [];
  public _colores :Array<any> = [];

  public subcategorias_active : Array<any> = [];
  public tipo_variante = 1; //1Existente 2Nuevo

  public filtro_color = '';
  public load_add_color = false;
  public load_add_color_primario = false;
  public option = 1;
  public porcent_total = 0;
  
  public load_add_primario = false;
  public msm_error_crear_color = '';
  public btn_add_color = false;
  public new_color: any = {};
  public load_precio_global = false;
  public precio_global : any = '';
  public variacion:any = {
    color: '',
    talla: ''
  };
  public variaciones : Array<any> = [];
  public tallas : Array<any> = GENERAL.tallas;
  public today_now : any= new Date();
  public min_new_tag = GLOBAL.min_new_tag;

  public preview: SafeUrl = '';
  public webWorkerProgress: string = '';
  public load_portada = false;
  public permisos : Array<any> = [];

  constructor(
    private _productoService:ProductoService,
    private _settingsService:SettinsService,
    private _router:Router,
    private _telaService:TelaService,
    private sanitizer: DomSanitizer
  ) { 
  }

  ngOnInit(): void {
    
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('3001')){
      this.init_colores('Todos');
      this.set_tipo();
      setTimeout(() => {
        $('#select2').select2();
        $('#select2Variante').select2();
        $('#color-picker').spectrum({
          color: '#FFFFFF'
        });

        $('#color-picker-modal').spectrum({
          color: '#FFFFFF'
        });
      }, 50);
    }else{
      this._router.navigate(['/dashboard']);
    }
  }


  setTipoVariante(value:any){
    if(value == 2){
      setTimeout(() => {
        $('#select2Variante').select2();
      }, 50);
    }
    this.tipo_variante = value;
  }


  fileChangeEvent(event:any):void{
    console.log(event);
    var file : any;
    if(event.target.files && event.target.files[0]){
      file = <File>event.target.files[0];
    }else{
      toastr.error("La imagen no puede ser subida.");
    }


    try {
      if(file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg'){
        this.compress(file);
      }else{
        toastr.error("Solo se aceptan imagenes.");
        this.banner = undefined;
        this.str_portada = 'assets/images/blank-image.svg';
        $('#input-create-portada').val('');
      }
    } catch (error) {
      toastr.error("Error al cargar el archivo.");
      this.banner = undefined;
      this.str_portada = 'assets/images/blank-image.svg';
      $('#input-create-portada').val('');
    }
  }

  async compress(file:any){
    this.load_portada = true;
    this.preview = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file))
    var options = {
      maxSizeMB: 20,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      onProgress: (p:any) => {
        this.webWorkerProgress = '(' + p + '%' + ')'
      }
    }
    const output = await imageCompression(file, options);
    console.log(output);

    const miFile = new File([output], 'nombre_del_archivo.png', { type: output.type });
    this.banner = miFile;
    const reader = new FileReader();
    reader.onload = e => this.str_portada = reader.result;
    reader.readAsDataURL(this.banner);
    console.log(this.banner);
    this.load_portada = false;
  }



  cancelPortada(){
    this.str_portada = 'assets/images/blank-image.svg';
    this.banner = undefined;
    $('#input-create-portada').val('');
  }

  add_composicion(){
    this.composicion.composicion = $("#select2").val();
    
    if(!this.composicion.composicion){
      toastr.error("Ingrese la composición.");
    }else if(!this.composicion.porcentaje){
      toastr.error("Ingrese el porcentaje.");
    }else if(this.composicion.porcentaje > 100){
      toastr.error("El porcentaje debe ser menor a 100.");
    }else{
      let porcent_total = 0;
      for(var item of this.composiciones){
        porcent_total = porcent_total + item.porcentaje;
      }
      let total = this.composicion.porcentaje + porcent_total;

      if(total<= 100){
        this.composiciones.push({
          composicion: this.composicion.composicion,
          porcentaje: this.composicion.porcentaje,
        });
        this.composicion = {};
        $("#select2").val('');

        this.calcular_composiciones();

      }else{
        toastr.error("El total no debe superar el 100%.");
      }

      
    } 
  }

  calcular_composiciones(){
    this.porcent_total = 0;
    for(var item of this.composiciones){
      this.porcent_total = this.porcent_total + item.porcentaje;
    }
  }

  remove_composicion(idx:any){
    this.composiciones.splice(idx,1);
    this.calcular_composiciones();
  }

  add_titulo(){
    if(!this.titulo){
      toastr.error("Ingreses un titulo a agregar.");
    }else{
      this.titulos.push({
        titulo: this.titulo,
      });
      this.titulo = '';
    } 
  }

  remove_color(idx:any,item:any){
    this.variaciones.splice(idx,1);
    this.coloresbase[item.idx].selected = false;
  }

  remove_titulo(idx:any){
    this.titulos.splice(idx,1)
  }

  upload_imagen(event:any):void{
    var file : any;
    if(event.target.files && event.target.files[0]){
      file = <File>event.target.files[0];
    }else{
      toastr.error("La imagen no puede ser subida.");
    }

    try {
      if(file.size <= 2000000){
        if(file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg'){
        
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function () {
            $('#img_str').val(reader.result);
          };
          this.imagen_file = file;

        }else{
          toastr.error("Solo se aceptan imagenes.");
          this.imagen_file = undefined;
          
        }
      }else{
        toastr.error("La imagen no debe pesar menos de 2Mbs.");
        $('.image-input-placeholder').attr('style','background-image: url("assets/images/blank-image.svg") !important');
        this.imagen_file = undefined;
      }
    } catch (error) {
    }
  }

  add_imagen(){
    if(this.imagen_file == undefined || !this.imagen_file){
      toastr.error("Cargue una imagen para subirla.");
    }else if(!this.imagen_titulo){
      toastr.error("Ingrese el titulo de la imagen.");
    }else{
      setTimeout(() => {
        
      }, 50);

      this.imagen_file.str = $('#img_str').val();
      this.imagen_file.titulo = this.imagen_titulo
      this.galeria.push({
        file: this.imagen_file,
        str: $('#img_str').val(),
        titulo: this.imagen_titulo
      });
      $('#file-upload-img').val('');

      this.imagen_titulo = '';
  
    }
  }

  remove_imagen(idx:any){
    this.galeria.splice(idx,1)
  }

  upperCaseInput(e:any) {
      this.color.variante = this.color.variante.toUpperCase();
  }

  validate_producto(){
    this.producto.portada = this.banner;
    this.producto.composiciones = this.composiciones;
    this.producto.titulos = this.titulos;
    if(this.producto.tipo == 'Tela') this.producto.variaciones = this.variaciones;
    else if(this.producto.tipo == 'Ropa' || this.producto.tipo == 'Acero') this.producto.variaciones = this.variaciones;
    this.producto.galeria = this.galeria;
    
    this.calcular_composiciones();

    if(!this.producto.titulo){
      toastr.error("Ingrese el titulo del producto.");
    }else if(!this.producto.tipo){
      toastr.error("Seleccione el tipo del producto.");
    }else if(!this.producto.categoria){
      toastr.error("Seleccione la categoria del producto.");
    }else if(!this.producto.subcategoria){
      toastr.error("Seleccione la subcategoria del producto.");
    }else if(!this.producto.cantidad_contenedor){
      toastr.error("Ingrese la cantidad por contenedor.");
    }else if(this.producto.portada == undefined || !this.producto.portada){
      toastr.error("Suba una imagen de portada.");
    }else if(!this.producto.estado){
      toastr.error("Seleccione el estado del producto.");
    }else if(this.porcent_total!= 100){
      toastr.error("Complete la composicion por favor.");
    }else if(this.producto.variaciones.length == 0){
      toastr.error("Ingrese al menos un color.");
    }else{
      this.create_producto();
    }
    
  }


  create_producto(){
    this.load_btn = true;
    this._productoService.create_producto(this.producto,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          this.socket.emit('send-create-producto',true);
          toastr.success("Producto registrado.");
          this._router.navigate(['/productos']);
        }else{
          toastr.error(response.message);
        }
        this.load_btn = false;
      },
      error=>{
        console.log(error);
        
        toastr.error("Ocurrió un error.");
        this.load_btn = false;
      }
    );
  }

  set_categoria(){
    this.producto.subcategoria = '';
    this.subcategorias_active = this.categorias.filter(item => item.titulo == this.producto.categoria)[0].subcategorias;
  }

  init_composiciones(){
    this._productoService.get_Composiciones().subscribe(
      response=>{
        if(this.producto.tipo == 'Tela'){
          this._composiciones = response.tela;
        }else if(this.producto.tipo == 'Ropa'){
          this._composiciones = response.tela;
        }else if(this.producto.tipo == 'Acero'){
          this._composiciones = response.acero;
        }
      }
    );
  }

  init_categorias(){
    this._productoService.get_Categorias().subscribe(
      response=>{
        if(this.producto.tipo == 'Tela'){
          this.categorias = response.tela.categorias;
        }else if(this.producto.tipo == 'Ropa'){
          this.categorias = response.ropa.categorias;
        }else if(this.producto.tipo == 'Acero'){
          this.categorias = response.acero.categorias;
        }
      }
    );
  }

  set_tipo(){
    this.init_composiciones();
    this.init_categorias();
    this.init_colores('Todos');
  }
  
  init_colores(value:any){
    this._telaService.get_colores_filter(value,this.token).subscribe(
      response=>{
        for(var item of response.data){
          let create :any = new Date(item.createdAt);
          item.minutos_pasados = (this.today_now - create)/60000;
        }
        this.coloresbase = response.data;
        setTimeout(() => {
          $("#select-color-variacion").select2();
        }, 50);
       
        for(var item of this.coloresbase){
          for(var subitem of this.variaciones){
            if(item._id == subitem.color){
              item.selected = true;
            }
          }
        }
        
      }
    );
  }

  filtro_colores(){
    if(this.filtro_color){
      this.init_colores(this.filtro_color);
    }else{
     this.init_colores('Todos'); 
    }
  }

  select_colorbase(item:any,idx:any){
    if(this.variaciones.length == 0){
      this.variaciones.push({
        variacion_name: item.color,
        color_name: item.color,
        hxd: item.hxd,
        precio_venta: 0,
        color: item._id,
        idx: idx
      });
    }else{
      var color_exist = this.variaciones.find(subitem=>subitem.variacion_name == item.color);
      console.log(color_exist);
      
      if(color_exist == undefined || !color_exist){
        this.variaciones.push({
          variacion_name: item.color,
          color_name: item.color,
          hxd: item.hxd,
          precio_venta: 0,
          color: item._id,
          idx: idx
        });
      }
    }
    this.coloresbase[idx].selected = true;
    
  }

  add_colores_primarios(){
    this.load_add_color_primario = true;
    this._telaService.get_colores(this.token).subscribe(
      response=>{
        let colores_primarios = response.data.filter((item:any)=>item.color.primario);
        for(var item of colores_primarios){
          var regs = this.variaciones.filter(subitem=>subitem.variacion_name == item.color.color);
          if(regs.length == 0){
            this.variaciones.push({
              variacion_name: item.color.color,
              color_name: item.color.color,
              hxd: item.color.hxd,
              precio_venta: 0,
              color: item.color._id
            });
          }
        }
        $('#addColoresPrimarios').modal('hide');
        this.load_add_color_primario = false;
      }
    );
  }

  setMenu(value:any){
    if(value == 1){
    }
    else if(value == 3){
      setTimeout(() => {
        $('#select2').select2();
        
      }, 50);
    }
    this.option = value;
  }

  crear_color(){
    this.new_color.hxd = $('#color-picker-modal').spectrum('get').toHexString();
    this.new_color.primario = false;
    if(!this.new_color.color){
      this.msm_error_crear_color = 'El color es requerido';
    }else if(!this.new_color.hxd){
      this.msm_error_crear_color = 'El color HXD es requerido';
    }else{
      this.msm_error_crear_color = '';
      this.btn_add_color = true;

      this._telaService.create_color(this.new_color,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.new_color = {
              hxd: 'white'
            };
            setTimeout(() => {
              $("#color-picker-modal").spectrum("set", '#fff');
            }, 50);
            $('#newColor').modal('hide');
            this.init_colores('Todos');
            toastr.success("Color creado correctamente.");
          }else{
            toastr.error(response.message);
          }
          this.btn_add_color = false;
        },
        error=>{
          this.btn_add_color = false;
        }
      );
    }
  }

  set_precio_global(){
    if(!this.precio_global){
      toastr.error("El precio global es requerido.");
    }if(this.precio_global <= 0){
      toastr.error("El precio no es válido.");
    }else{
      for(var item of this.variaciones){
        item.precio_venta = this.precio_global;
      }
      toastr.success("Precios actualizados.");
      $('#modalPrecioGlobal').modal('hide');
    }
  }

  validate_variacion(){
    let id_color = $('#select-color-variacion').val();
    let color = this.coloresbase.filter(item=>item._id == id_color)[0];
    if(this.producto.tipo == 'Ropa'){
      this.variacion.variacion_name = color.color;
    }

    this.variacion.color_name = color.color;
    this.variacion.hxd = color.hxd;
    this.variacion.color = color._id;
    this.variacion.precio_venta = 0;
    
    if(this.producto.tipo == 'Ropa'){
      if(! this.variacion.color_name){
        toastr.error("El color es requerido.");
      }else if(!this.variacion.hxd){
        toastr.error("El tono es requerido.");
      }else if(!this.variacion.talla){
        toastr.error("La talla es requerida.");
      }else{
        this.add_variacion();
      }
    }else if(this.producto.tipo == 'Acero'){
      if(! this.variacion.color_name){
        toastr.error("El color es requerido.");
      }else if(!this.variacion.hxd){
        toastr.error("El tono es requerido.");
      }else{
        this.add_variacion();
      }
    }
  }

  add_variacion(){
    this.variaciones.push(this.variacion);
    this.variacion = {
      color: '',
      talla: ''
    };
  }

  remove_variacion(idx:any){
    this.variaciones.splice(idx,1);
  }

  prev_step(){
    if(this.option > 1){
      this.option = this.option -1;
    }
  }
  
  next_step(){
    this.option = this.option +1;
  }

  toUpperCase(){
    this.new_color.color = this.new_color.color.toUpperCase();
  }
}
