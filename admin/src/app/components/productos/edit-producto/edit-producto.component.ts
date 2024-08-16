import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GENERAL } from 'src/app/services/GENERAL';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
import { SettinsService } from 'src/app/services/settins.service';
import { TelaService } from 'src/app/services/tela.service';
declare var KTImageInput:any;
declare var $:any;
declare var toastr:any;
declare var lightGallery:any;

@Component({
  selector: 'app-edit-producto',
  templateUrl: './edit-producto.component.html',
  styleUrls: ['./edit-producto.component.css']
})
export class EditProductoComponent implements OnInit {

  public banner : File|any = undefined;
  public token = localStorage.getItem('token');
  public producto : any = {
    tipo: '',
    estado: '',
    genero: '',
    subcategoria: ''
  };

  public composicion: any = {};
  public composiciones :Array<any> = [];

  public titulo = '';
  public titulos :Array<any> = [];

  public color: any = {
    base: ''
  };
  public color_edit: any = {
    base: ''
  };
  public variaciones :Array<any> = [];

  public id = '';
  public load_btn = false;
  public load_data = true;
  public data = false;
  public _composiciones :Array<any> = ['Acrílico','Afelpado','Batista','Bouclé','Cambray de lino','Chalí','Chambre','Cibelina','Cuero','Gamuza','Damasco','Mezclilla','Elastano','Encaje','Espuma','Estopilla','Lana','Bufanda','Gamuza','Jersey','Lana','Malla Doble','Nailon','Napa','Paina','Pana','Peau de soie', 'Percal', 'Pied-de-poule (tela a cuadros)', 'Piel de camello', 'Piel sintética', 'Piqué', 'Plumas', 'Plumetis', 'Plush', 'Poliéster', 'Pongee','Ratina', 'Rayón', 'Cupramonio', 'Viscosa', 'Rayón polinizado', 'Sari', 'Sarga', 'Sarga diagonal', 'Scrim', 'Seda', 'Shantung', 'Shetland', 'Tafetán', 'Tejido de punto', 'Tela calada', 'Tencel', 'Terciopelo', 'Ciselé', 'Terciopelo arrugado', 'Devoré', 'Terciopelo de lana', 'Tul', 'Tweed', 'Donegal', 'Harris', 'Irlandés'];

  public galeria :Array<any> = [];
  public imagen_str : any = undefined;
  public imagen_file : any = undefined;
  public imagen_titulo = '';
  public url = GLOBAL.url;
  public categorias : Array<any> = [];
  public _colores : Array<any> = [];

  public load_precio = false;
  public precio_venta = '';
  public str_portada :any = '';
  public str_static_portada : any = '';
  public load_color_edit = false;
  public load_sku = false;

  public load_titulos = true;
  public load_composiciones = true;
  public load_galeria = true;
  public load_variaciones= true;

  public load_precio_global = false;
  public precio_global : any = '';
  public subcategorias_active : Array<any> = [];
  public coloresbase : Array<any> = [];
  public coloresbase_edit  : Array<any> = [];
  public tipo_variante = 1; //1Existente 2Nuevo

  public filtro_color = '';
  public filtro_color_edit = '';
  public load_add_variacion = false;
  public load_coloresbase_edit = false;

  public msm_error_crear_color = '';
  public btn_add_color = false;
  public new_color: any = {};
  public load_add_primario = false;

  public msm_add_primarios = '';
  public showMsm_add_primarios: boolean = false;
  public option = 1;
  public load_delete = false;
  public tallas : Array<any> = GENERAL.tallas;
  public variacion:any = {
    color: '',
    talla: ''
  };
  public etiqueta : any = {
    prioridad: '',
    etiqueta: ''
  };
  public load_etiquetas = false;
  public etiquetas: Array<any> = [];
  public permisos:Array<any> = [];

  constructor(
    private _productoService:ProductoService,
    private _route:ActivatedRoute,
    private _router:Router,
    private _settingsService:SettinsService,
    private _telaService:TelaService
  ) {
    
   }


   handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('3006')){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.init_producto(); 
          this.init_colores('Todos');
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

   ngOnInit(): void {
    
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
        this.set_categoria();
      }
    );
  }

  init_colores(value:any){
    this._telaService.get_colores_filter(value,this.token).subscribe(
      response=>{
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

  set_tipo(){
    this.init_composiciones();
    this.init_categorias();
    this.init_colores('Todos');
  }

  setTipoVariante(value:any){
    if(value == 2){
      setTimeout(() => {
        $('#select2Variante').select2();
      }, 50);
    }
    this.tipo_variante = value;
  }

  init_producto(){
    this.load_data = true;
    this._productoService.get_producto(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data == undefined){
          this.data = false;
        }else{
          this.producto = response.producto;
          this.set_tipo();
          
          this.str_portada = this.producto.portada;
          this.str_static_portada = this.producto.portada;
          setTimeout(() => {
            $('#select2').select2();
            $('#color-picker').spectrum({
              color: '#FFFFFF'
            });
            $('#color-picker-edit').spectrum({
              color: '#FFFFFF'
            });
            $('#color-picker-modal').spectrum({
              color: '#FFFFFF'
            });
          }, 50);
          this.init_productos_composiciones();
          this.init_productos_titulos();
          this.init_productos_variaciones();
          this.init_productos_imagenes();
          this.init_productos_etiquetas();
          this.galeria = response.images;
          this.data = true;
        }
        this.load_data = false;

       
      }
    );
  }

  fileChangeEvent(event:any):void{
    var file : any;
    if(event.target.files && event.target.files[0]){
      file = <File>event.target.files[0];
    }else{
      toastr.error("La imagen no puede ser subida.");
    }

    try {
      if(file.size <= 2000000){
        if(file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg'){
          this.banner = file;
          const reader = new FileReader();
          reader.onload = e => this.str_portada = reader.result;
          reader.readAsDataURL(this.banner);
        }else{
          toastr.error("Solo se aceptan imagenes.");
          this.str_portada = this.str_static_portada;
          this.banner = undefined;
          
        }
      }else{
        toastr.error("La imagen no debe pesar menos de 2Mbs.");
        this.str_portada = this.str_static_portada;
        this.banner = undefined;
      }
    } catch (error) {
      toastr.error("Solo se aceptan imagenes.");
      this.str_portada = this.str_static_portada;
      this.banner = undefined;
    }
  }

  cancelPortada(){
    this.str_portada = this.str_static_portada;
    this.banner = undefined;
  }

  init_productos_composiciones(){
    this.load_composiciones = true;
    this._productoService.get_producto_composiciones(this.id,this.token).subscribe(
      response=>{
        this.composiciones = response.data;
        this.load_composiciones = false;
      }
    );
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
      let data = {
        composicion: this.composicion.composicion,
        porcentaje: this.composicion.porcentaje,
        producto: this.id,
      };
      this._productoService.add_composicion(data,this.token).subscribe(
        response=>{
     
          if(response.data != undefined){
            this.init_productos_composiciones();
            toastr.success("Registro completada.");
          }else{
            toastr.error(response.message);
          }

          this.composicion = {};
        }
      );
    } 
  }

  remove_composicion(id:any){
    this._productoService.delete_composicion(id,this.token).subscribe(
      response=>{
        this.init_productos_composiciones();
        toastr.success("Eliminación completada.");
      }
    );
  }

  add_titulo(){
    if(!this.titulo){
      toastr.error("Ingreses un titulo a agregar.");
    }else{
      let data = {
        titulo: this.titulo,
        producto: this.id
      }

      this._productoService.add_titulo(data,this.token).subscribe(
        response=>{
     
          if(response.data != undefined){
            this.init_productos_titulos();
            toastr.success("Registro completada.");
          }else{
            toastr.error(response.message);
          }

          this.titulo = '';
        }
      );
      
     
    } 
  }

  init_productos_titulos(){
    this.load_titulos = true;
    this._productoService.get_producto_titulos(this.id,this.token).subscribe(
      response=>{
        this.titulos = response.data;
        this.load_titulos = false;
      }
    );
  }

  remove_titulo(id:any){
    this._productoService.delete_titulo(id,this.token).subscribe(
      response=>{
        this.init_productos_titulos();
        toastr.success("Eliminación completada.");
      }
    );
  }

  add_etiqueta(){
    if(this.etiqueta.etiqueta == 'Básico')this.etiqueta.color = '#000';
    if(this.etiqueta.etiqueta == 'Favorito')this.etiqueta.color = '#2E86C1';

    if(!this.etiqueta.etiqueta){
      toastr.error("Ingrese el nombre de la etiqueta.");
    }else if(!this.etiqueta.prioridad){
      toastr.error("Seleccione la prioridad de la etiqueta.");
    }else if(!this.etiqueta.color){
      toastr.error("Seleccione el color de la etiqueta.");
    }else{
      this.etiqueta.producto = this.id;

      this._productoService.add_etiqueta(this.etiqueta,this.token).subscribe(
        response=>{
          console.log(response);
          
          if(response.data != undefined){
            toastr.success("Registro completada.");
            this.init_productos_etiquetas();
          }else{
            toastr.error(response.message);
          }

          this.etiqueta = {
            prioridad: '',
            etiqueta: ''
          }
        }
      );
      
     
    } 
  }

  init_productos_etiquetas(){
    this.load_etiquetas = true;
    this._productoService.get_producto_etiquetas(this.id,this.token).subscribe(
      response=>{
        this.etiquetas = response.data;
        this.load_etiquetas = false;
      }
    );
  }

  remove_etiqueta(id:any){
    this._productoService.delete_etiqueta(id,this.token).subscribe(
      response=>{
        this.init_productos_etiquetas();
        toastr.success("Eliminación completada.");
      }
    );
  }

  init_productos_variaciones(){
    this.load_variaciones = true;
    this._productoService.get_producto_variaciones(this.id,this.token).subscribe(
      response=>{
        console.log(response.data);
        this.variaciones = response.data;
        for(var item of this.coloresbase){
          item.selected = false;
        }
        for(var item of this.coloresbase){
          for(var subitem of this.variaciones){
            if(item._id == subitem.color){
              item.selected = true;
            }
          }
        }
        this.load_variaciones = false;
      }
    );
  }

  set_estado(id:any,hidden:any){
    this._productoService.set_estado_variacion(id,{hidden: hidden},this.token).subscribe(
      response=>{
        this.init_productos_variaciones();
        toastr.success("Actualización completada.");
      }
    );
  }

  upperCaseInput(e:any) {
      this.color.variante = this.color.variante.toUpperCase();
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

  init_productos_imagenes(){
    this.load_galeria = true;
    this._productoService.get_producto_imagenes(this.id,this.token).subscribe(
      response=>{
        this.galeria = response.data;
        this.load_galeria = false;
      }
    );
  }

  add_imagen(){
    if(this.imagen_file == undefined || !this.imagen_file){
      toastr.error("Cargue una imagen para subirla.");
    }else if(!this.imagen_titulo){
      toastr.error("Ingrese el titulo de la imagen.");
    }else{

      let data = {
        imagen: this.imagen_file,
        titulo: this.imagen_titulo,
        producto : this.id,
      };

      this._productoService.add_imagen(data,this.token).subscribe(
        response=>{
     
          if(response.data != undefined){
            this.init_productos_imagenes();
            toastr.success("Imagen subida correctamente.");
          }else{
            toastr.error(response.message);
          }

          this.imagen_titulo = '';
          this.imagen_file = undefined;
          $('#file-upload-img').val('');
        }
      );

      
  
    }
  }

  remove_imagen(id:any){
    this._productoService.delete_imagen(id,this.token).subscribe(
      response=>{
        this.init_productos_imagenes();
        toastr.success("Eliminación completada.");
      }
    );
  }

  validate_producto(){
    
    this.producto.portada = this.banner;
    console.log(this.producto);
    
    if(!this.producto.titulo){
      toastr.error("Ingrese el titulo del producto.");
    }else if(!this.producto.tipo){
      toastr.error("Seleccione el tipo del producto.");
    }else if(!this.producto.categoria){
      toastr.error("Seleccione la categoria del producto.");
    }else if(!this.producto.subcategoria){
      toastr.error("Seleccione la subcategoria del producto.");
    }else if(!this.producto.estado){
      toastr.error("Seleccione el estado del producto.");
    }else{
      this.update_producto();
      
    }
    
  }

  update_producto(){
    this.load_btn = true;
    this._productoService.update_producto(this.id,this.producto,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          toastr.success("Producto actualizado.");
          this._router.navigate(['/productos']);
        }else{
          toastr.error(response.message);
        }
        this.load_btn = false;
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_btn = false;
      }
    );
  }

  set_precio(item:any){
    if(this.precio_venta){
      this.load_precio = true;
      this._productoService.update_precio_producto_color(item._id,{precio_venta:this.precio_venta},this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.precio_venta = '';
            this.init_productos_variaciones();
            toastr.success("Producto actualizado.");
            $('#precio-'+item._id).modal('hide');
          }else{
            toastr.error(response.message);
          }
          
          this.load_precio = false;
        }
      );
    }else{
      toastr.error('Ingrese el precio del producto.');
    }
  }

  open_color(item:any){
    this.color_edit = item;
  }

  editar_color(item:any){
    let data = {
      variante: item.color,
      hxd: item.hxd,
      color: item._id,
    }
    this.load_color_edit = true;
    this._productoService.edit_color(this.color_edit._id,data,this.token).subscribe(
      response=>{
   
        if(response.data != undefined){
          this.init_productos_variaciones();
          toastr.success("Actualización completada.");
          $('#modalColor').modal('hide');
        }else{
          toastr.error(response.message);
        }

        this.color_edit = {
          base: ''
        };
        this.load_color_edit = false;
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_color_edit = false;
      }
    );
  }

  update_sku(id:any){
    this.load_sku = true;
      this._productoService.update_sku_color(id,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.init_productos_variaciones();
            toastr.success("Color actualizado.");
            $('#modalSKU-'+id).modal('hide');
          }else{
            toastr.error(response.message);
          }
          
          this.load_sku = false;
        }
      );
  }

  set_precio_global(){
    if(!this.precio_global){
      toastr.error("El precio global es requerido.");
    }if(this.precio_global <= 0){
      toastr.error("El precio no es válido.");
    }else{
      this.load_precio_global = true;
      this._productoService.update_precio_global_color(this.id,{precio_venta: this.precio_global},this.token).subscribe(
        response=>{
          console.log(response);
          
          this.precio_global = '';
          this.init_productos_variaciones();
          toastr.success("Precios actualizados.");
          $('#modalPrecioGlobal').modal('hide');
          
          this.load_precio_global = false;
        }
      );
    }
  }

  set_categoria(){
    this.subcategorias_active = this.categorias.filter(item => item.titulo == this.producto.categoria)[0].subcategorias;
  }

  init_colores_base(){
    this._telaService.get_colores_filter('Todos',this.token).subscribe(
      response=>{
        this.coloresbase = response.data;
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
  
  filtro_colores_edit(){
    if(this.filtro_color_edit){
      this.load_coloresbase_edit = true;
      this._telaService.get_colores_filter(this.filtro_color_edit,this.token).subscribe(
        response=>{
          console.log(response);
          this.coloresbase_edit = response.data;
          this.load_coloresbase_edit = false;
        }
      );
    }
  }


  select_colorbase(item:any){

    let color_exist = this.variaciones.filter(variacion=>variacion.color == item._id);

    if(color_exist.length == 0){
      let data = {
        variacion_name: item.color,
        color_name: item.color,
        hxd: item.hxd,
        producto:this.id,
        color:item._id,
        precio_venta: 0
      }
      this.load_add_variacion = true;
      this._productoService.add_variacion(data,this.token).subscribe(
        response=>{
          if(response.data != undefined){
            this.init_productos_variaciones();
            toastr.success("Registro completado.");
          }else{
            toastr.error(response.message);
          }
          this.load_add_variacion = false;
        }
      );
    }
  }

  crear_color(){
    this.new_color.hxd = $('#color-picker-modal').spectrum('get').toHexString();
    if(!this.new_color.color){
      this.msm_error_crear_color = 'El color es requerido';
    }else if(!this.new_color.hxd){
      this.msm_error_crear_color = 'El color HXD es requerido';
    }else{
      this.msm_error_crear_color = '';
      this.btn_add_color = true;
      this.new_color.producto = this.id;
      console.log(this.new_color);
      
      this._productoService.create_color_producto(this.new_color,this.token).subscribe(
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
            this.init_productos_variaciones();
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

  add_colores_primarios(){
    this.load_add_primario = true;
    this._telaService.add_colores_primarios_producto(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data != undefined){
          $('#addColoresPrimarios').modal('hide');
          toastr.success("Registro completado.");
          if(response.count_omitidos >= 1){
            this.showMsm_add_primarios = true;
            this.msm_add_primarios = 'Fueron omitidos '+response.count_omitidos+' colores primarios ya existentes.';
            setTimeout(() => {
              this.showMsm_add_primarios = false;
            }, 6000);
          }
          this.init_productos_variaciones();
        }else{
          toastr.error(response.message);
        }
        this.load_add_primario = false;
      }
    );
  }

  setMenu(value:any){
    if(value == 1){
    }
    else if(value == 3){
      setTimeout(() => {
        $('#select2').select2();
        $('#color-picker').spectrum({
          color: '#FFFFFF'
        });
      }, 50);
    }
    this.option = value;
  }

  delete_variacion(id:any){
    this.load_delete = true;
    this._productoService.delete_variacion(id,this.token).subscribe(
      response=>{
        $('#deleteVariacion-'+id).modal('hide');
        this.init_productos_variaciones();
        this.load_delete = false;
        toastr.success("Color eliminado.");
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_delete = false;
      }
    );
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
    this.variacion.producto = this.id;
    
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
    console.log(this.variacion);
    this.load_add_variacion = true;
    this._productoService.add_variacion(this.variacion,this.token).subscribe(
      response=>{
        if(response.data != undefined){
          this.init_productos_variaciones();
          toastr.success("Registro completado.");
          this.variacion = {
            color: '',
            talla: ''
          };
        }else{
          toastr.error(response.message);
        }
        this.load_add_variacion = false;
      }
    );
   
  }

  
  remove_variacion(idx:any){
    this.variaciones.splice(idx,1)
  }

  toUpperCase(){
    this.new_color.color = this.new_color.color.toUpperCase();
  }
}
