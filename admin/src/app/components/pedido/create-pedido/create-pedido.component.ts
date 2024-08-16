import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { SettinsService } from 'src/app/services/settins.service';
import { VentaService } from 'src/app/services/venta.service';
declare var Inputmask:any;
declare var toastr:any;
declare var $:any;
declare var moment:any;
import { io } from "socket.io-client";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-create-pedido',
  templateUrl: './create-pedido.component.html',
  styleUrls: ['./create-pedido.component.css']
})
export class CreatePedidoComponent implements OnInit {

  public today_now : any= new Date();
  public socket = io("http://localhost:4201",{transports: ['websocket']});
  public token = localStorage.getItem('token');
  public user = JSON.parse(localStorage.getItem('user_data')!);
  public load_btn = false;
  public load_proveedores = false;
  public load_productos = false;
  public proveedores :Array<any> = [];
  public variaciones :Array<any> = [];
  public filtro_proveedor = '';
  public filtro_producto = '';
  public today = moment(new Date).format('YYYY-MM-DD');

  public page = 100;

  public pedido : any = {
    moneda: 'USD',
    tipo_pago: 'Contado',
    tipo_transporte: '',
    tipo: 'Tela'
  };
  public detalle : any = {};
  public detalles :Array<any> = [];
  public detalles_ :Array<any> = [];
  public arr_detalles :Array<any> = [];

  public tracking_number = '';

  public productos :Array<any> = [];
  public producto_selected : any = {};
  public url = GLOBAL.url;

  public transportes :Array<any> = [];
  public option_menu = 1;
  public proveedor_selected :any= {};
  public tipo_detalle = 'Productos';

  public programaciones :Array<any> = [];
  public const_programaciones :Array<any> = [];
  public variacion_selected : any = undefined;
  public load_programaciones = false;

  public cupon_selected = '';
  public min_new_tag = GLOBAL.min_new_tag;
  public contenedores :  Array<any> = [];

  public load_cantidades_contenedor = false;
  public update_cantidades_contenedor = '';
  public programacion_selected : any = undefined;
  public detalle_selected = false;

  public last_page = 0;
  public load = 0;
  public page_status = true;
  public todos = 0;
  public inpSearch = false;
  public permisos : Array<any> = [];

  constructor(
    private _proveedorService:ProveedorService,
    private _productoService:ProductoService,
    private _pedidoService:PedidoService,
    private _router:Router,
    private _settingsService:SettinsService,
    private _ventaService:VentaService,
  ) { 
    this.pedido.fecha_pedido = moment().format('YYYY-MM-DD');
   
  }


  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('4001')){
      this.socket.on('emit-create-producto',(data:any)=>{
        console.log(data);
        this.socket_productos_todos();
        toastr.success('Nuevo producto ingresado.');     
      });
  
      this.init_proveedores('Todos');
      this.init_productos('Todos');
      this.setTipo();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {

    
    
   
  }


  init_proveedores(filtro:any){
    this.load_proveedores = true;
    this._proveedorService.get_proveedores(filtro,this.token).subscribe(
      response=>{
        this.proveedores = response.data;
        this.load_proveedores = false;
      }
    );
  }

  init_programaciones(filtro:any,tipo:any){
    this.load_programaciones = true;
    this._ventaService.get_productos_programaciones_pedido(filtro,tipo,this.token).subscribe(
      response=>{
        this.programaciones = response.data;
        this.const_programaciones = this.programaciones;
        this.load_programaciones = false;
        this.paintPorgramaciones();
      }
    );
  }

  search_proveedor(){
    if(this.filtro_proveedor){
      this.init_proveedores(this.filtro_proveedor);
    }else{
      this.init_proveedores('Todos');
    }
  }

  init_productos(filtro:any){
    this.load++;
    if(this.load==0) this.load_productos = true;
    this._productoService.get_productos(filtro,this.page,this.token).subscribe(
      response=>{
        for(var item of response.data){
          let create :any = new Date(item.producto.createdAt);
          item.producto.minutos_pasados = (this.today_now - create)/60000;
          item.producto.pattern = this.getRandomNumber(1,5);
        }
        
        this.productos = response.data.filter((item:any)=>item.producto.tipo == this.pedido.tipo);
        this.productos.sort((a, b) => b.programaciones - a.programaciones);
        this.last_page = this.productos.length;
        this.todos = response.todos;
        this.load_productos = false;
      }
    );
  }

  click_productos(){
    this.page = this.page + 10;
    this.init_productos('Todos');
    if(this.productos.length == this.last_page){
      this.page_status = false;
    }
  }

  socket_productos_todos(){
    this._productoService.get_productos('Todos',this.page,this.token).subscribe(
      response=>{
        for(var item of response.data){
          let create :any = new Date(item.producto.createdAt);
          item.producto.minutos_pasados = (this.today_now - create)/60000;
        }
        this.productos = response.data;
      }
    );
  }

  search_productos(){
    if(this.filtro_producto){
      this.init_productos(this.filtro_producto);
    }else{
      this.init_productos('Todos');
    }
  }

  selected_proveedor(item:any){
    this.pedido.proveedor = item._id;
    this.proveedor_selected = item;
    setTimeout(() => {
      $('#str_proveedor').val(this.proveedor_selected.razon_social);
    }, 50);
    $('#addproveedor').modal('hide');
  }
 

  selected_producto(item:any){
    $('#str_producto').val(item.producto.titulo);
    this.producto_selected = item.producto;
    this.variaciones = item.variaciones;
    this.init_programaciones(item.producto._id,this.pedido.tipo);

    $('#addproducto').modal('hide');
  }
  
  validate(){

    if(!this.pedido.monto_envio){
      this.pedido.monto_envio = 0;
    }

    this.pedido.detalles = this.detalles;
    this.pedido.contenedores = [];
    for(var item of this.contenedores){
      item.porcentaje = item.totalPorcentaje;
      this.pedido.contenedores.push(item);
    }

    if(!this.pedido.moneda){
      toastr.error("Seleccione el tipo de moneda.");
    }else if(!this.pedido.moneda){
      toastr.error("Seleccione el tipo de moneda.");
    }else if(!this.pedido.tipo_pago){
      toastr.error("Seleccione el tipo de pago.");
    }else if(!this.pedido.fecha_pedido){
      toastr.error("Seleccione la fecha de pedido.");
    }else if(!this.pedido.condicion_pago){
      toastr.error("Defina la condición del pago.");
    }else if(this.pedido.detalles.length <= 0){
      toastr.error("Ingrese productos en el detalle.");
    }else{
    
      console.log(this.pedido);
      this._pedidoService.create_pedido(this.pedido,this.token).subscribe(
        response=>{
          console.log(response);
          this._router.navigate(['/pedidos/detail/'+response.data._id]);
          this.load_btn = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          this.load_btn = false;
        }
      );
    }
  }

  setTipo(){
    this.init_productos('Todos');
    if(this.pedido.tipo == 'Tela'){
      this.pedido.unidad = 'Mtr';
    }else if(this.pedido.tipo == 'Ropa'){
      this.pedido.unidad = 'Unid';
    }else if(this.pedido.tipo == 'Acero'){
      this.pedido.unidad = 'Kg';
    }
    this.detalles = [];
  }

  next_step(op:any){
    if(op == 1){
      this.option_menu = 1;
    }else if(op == 2){
      if(!this.pedido.tipo_pago){
        toastr.error("Seleccione el tipo de pago.");
      }else if(!this.pedido.moneda){
        toastr.error("Seleccione el tipo de moneda.");
      }else{
        this.option_menu = 2;
       
      }
    }else if(op == 3){
      if(this.detalle.cantidad){
        toastr.error("Hay un detalle pendiente.");
      }else if(this.detalle.precio){
        toastr.error("Hay un detalle pendiente.");
      }else if(this.detalles.length == 0){
        toastr.error("Debes subir al menos un producto.");
      }else{
        this.option_menu = 3;
      }
    }else if(op == 4){
      if(!this.pedido.condicion_pago){
        toastr.error("Defina la condición del pago.");
      }else{
        this.option_menu = 4;
      }
    }
   
  }

  getRandomNumber(min:any, max:any) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getColorText(color:any) {
    // Convierte el color hexadecimal a RGB
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
  
    // Calcula la luminosidad según la fórmula de la W3C
    let luminosidad = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
    // Decide si usar texto negro o blanco según la luminosidad
    return luminosidad > 0.5 ? '#000000' : '#FFFFFF';
  }

  selected_programacion(item:any,idx:any){
    this.programacion_selected = item;
    this.detalle_selected = true;
    this.detalle = {
      _id : item._id,
      sku : item.producto_variacion.sku,
      variacion_name : item.producto_variacion.variacion_name,
      color : item.producto_variacion.color,
      talla : item.producto_variacion.talla,
      hxd : item.producto_variacion.hxd,
      producto : item.producto._id,
      producto_title : item.producto.titulo,
      producto_variacion : item.producto_variacion._id,
      cantidad_contenedor : item.producto.cantidad_contenedor,
      portada : item.producto.portada,
      tipo_pedido : 'Programación',
      tipo : item.producto_variacion.tipo,
      unidad : item.unidad,
      pattern : this.producto_selected.pattern,
      colorText : this.getColorText(item.producto_variacion.hxd),
      programacion_detalle:  item._id,
      programacion: item.programacion._id,

      cantidad_detalle: item.cantidad,
      precio : item.precio_unidad,
      op_cantidad: false,
      idx_programacion : idx
    }
  }

  selected_variacion(item:any){
    this.variacion_selected = item;
    this.detalle_selected = true;
    this.detalle = {
      _id : item._id,
      sku : item.sku,
      variacion_name : item.variacion_name,
      color : item.color,
      hxd : item.hxd,
      producto : item.producto._id,
      producto_title : item.producto.titulo,
      producto_variacion : item._id,
      cantidad_contenedor : item.producto.cantidad_contenedor,
      portada : item.producto.portada,
      tipo_pedido : 'Pedido',
      tipo : item.tipo,
      unidad : this.pedido.unidad,
      pattern : this.producto_selected.pattern,
      colorText : this.getColorText(item.hxd),
      op_cantidad: false
    }
    setTimeout(() => {
      $("#radio-color-"+this.detalle.producto_variacion).prop("checked", true);
     }, 50);
  }

  get_next_contenedor(){
    let idx_disponible = this.contenedores.findIndex(item=>item.porcentaje_disponible >= 0);
    let contenedor_disponible = this.contenedores[idx_disponible];
    return contenedor_disponible;
  }

  update_cantidad_contenedor(){
    if(!this.update_cantidades_contenedor){
      toastr.error("Ingrese la cantidad.");
    }else{
      this.load_cantidades_contenedor = true;
      this._productoService.update_cantidad_contenedor(this.producto_selected._id,{
        cantidad_contenedor: this.update_cantidades_contenedor
      },this.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Actualización completada.");
            this.init_productos('Todos');
            this.detalle = {};
            this.detalles_ = [];
            this.detalle_selected = false;
            this.variaciones = [];
            this.producto_selected = {};
          }else{
            toastr.error(response.message);
          }
          this.load_cantidades_contenedor = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          this.load_cantidades_contenedor = false;
        }
      );
    }
  }

  removeDetalle(idx:any){
    this.detalles.splice(idx,1);
    this.detalles_ = [];
    let grupos : any= this.agruparPorcentajeMaximo(this.detalles);
    
    for(var element of grupos){
      for(var el of element.elementos){
        this.detalles_.push(el);
      }
    }
    this.detalles = this.detalles_;
    this.contenedores = grupos; 
    this.paintPorgramaciones();
  }

  paintPorgramaciones(){
    for(let item of this.programaciones){
      item.selected = false;
    }
    for(let item of this.programaciones){
      for(let subitem of this.detalles){
        if(item._id.toString() == subitem.programacion_detalle.toString()){
          item.selected = true;
        }
      }
    }
  }


  drop(event: CdkDragDrop<any[]>,idx:any) {
    const detalleMovido = event.item.data;
    const contenedor = this.contenedores[idx];
    let prev = event.previousContainer.data[0]; 

    console.log(event.item.data.contenedor);
    console.log(contenedor.contenedor);
    
    let disponible = 100 - contenedor.totalPorcentaje;
    if(event.item.data.contenedor == contenedor.contenedor){
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        console.log(this.contenedores);
        this.update_contenedor();
      } else {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
        );
        console.log(this.contenedores);
        this.update_contenedor();
      }
    }else{
      if(prev.porcent <= disponible){
        if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
          console.log(this.contenedores);
          this.update_contenedor();
        } else {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex,
          );
          console.log(this.contenedores);
          this.update_contenedor();
        }
      }
    }
    
  }

  remove_Container(idx:any){
    var elementos = this.contenedores[idx].elementos;

    if(elementos.length >= 1){
      elementos.forEach((item:any,index:any) => {
        let detalle_idx = this.detalles.findIndex(i=>i._id == item._id && i.cantidad == item.cantidad);
        this.detalles.splice(detalle_idx,1);
      });
  
      this.detalles_ = [];
      let grupos : any= this.agruparPorcentajeMaximo(this.detalles);
      
      for(var element of grupos){
        for(var el of element.elementos){
          this.detalles_.push(el);
        }
      }
      this.detalles = this.detalles_;
      this.contenedores = grupos;
    }else{
      this.contenedores.splice(idx,1);
    }

    this.paintPorgramaciones();
  }

  add_detalle(){

    let pgr_exist;
    
    if(this.detalle.tipo_pedido == 'Programación'){
      pgr_exist = this.detalles.find(item => item.programacion_detalle == this.detalle.programacion_detalle)
      console.log(pgr_exist);
    }    

    if(!this.detalle.cantidad_detalle){
      toastr.error("Ingrese la cantidad.");
    }else if(!this.detalle.precio){
      toastr.error("Ingrese el precio.");
    }else if(!this.detalle.cantidad_contenedor){
      toastr.error("El producto no tiene cantidad por contenedor.");
    }else if(pgr_exist){
      toastr.error("La programación ya existe.");
    }else{
      let cont_disponible = this.get_next_contenedor();

      if(this.detalle.tipo_pedido == 'Programación'){
        this.programaciones[this.detalle.idx_programacion].selected = true;
      }
      this.addDetToContenedor();
      this.detalles_ = [];
      this.detalle_selected = false; 
      this.detalle.cantidad_detalle = '';
      this.detalle.precio = '';
      this.detalle._id = '';
    }
  }

  addDetToContenedor() {
    this.arr_detalles = [];
    this.detalles_ = [];
    let porcent_detalle = (this.detalle.cantidad_detalle/this.detalle.cantidad_contenedor)*100; //75
    console.log(porcent_detalle);
    
    while (porcent_detalle > 0) {
      const porcentajeDetalle = Math.min(100, porcent_detalle);
          
      let new_detalle = { ...this.detalle };
      new_detalle.porcent = (porcentajeDetalle);
      new_detalle.cantidad = ((new_detalle.porcent/100)*new_detalle.cantidad_contenedor).toFixed(2);
      console.log(new_detalle.cantidad);
      
      this.arr_detalles.push(new_detalle);
      porcent_detalle -= porcentajeDetalle;
    }
    this.arr_detalles.forEach(element => {
        this.detalles.push(element);
    });

    let grupos : any= this.agruparPorcentajeMaximo(this.detalles);
    
    for(var element of grupos){
      for(var el of element.elementos){
        this.detalles_.push(el);
      }
    }
    this.detalles = this.detalles_;
    this.contenedores = grupos;
  }

  agruparPorcentajeMaximo(arr:any) {
    const arregloOriginal = [...arr];
    arregloOriginal.sort((a, b) => b.porcent - a.porcent);

    const grupos :any = [];
    let totalPorcentaje = 0;
    let contenedor = 1;

    function crearNuevoGrupo() {
      return { contenedor: contenedor++, elementos: [], totalPorcentaje: 0 };
    }

    let grupoActual : any= crearNuevoGrupo();
    grupos.push(grupoActual);

    arregloOriginal.forEach((elemento) => {
      if (grupoActual.totalPorcentaje + elemento.porcent <= 100) {
        grupoActual.elementos.push({ ...elemento, contenedor: grupoActual.contenedor });
        grupoActual.totalPorcentaje += elemento.porcent;
      } else {
        grupoActual = crearNuevoGrupo();
        grupoActual.elementos.push({ ...elemento, contenedor: grupoActual.contenedor });
        grupoActual.totalPorcentaje += elemento.porcent;
        grupos.push(grupoActual);
      }
    });

    return grupos;
  }

  update_contenedor(){
    this.detalles = [];
    for(var item of this.contenedores){
      item.totalPorcentaje = 0;
    }
    this.contenedores.forEach((item,index) => {
      for(var subitem of item.elementos){
        subitem.contenedor = item.contenedor;
        item.totalPorcentaje = item.totalPorcentaje + subitem.porcent;
        this.detalles.push(subitem);
      }
    });

  }

  add_contenedor(){
    if(this.contenedores.length <= 19){
      this.contenedores.push({
        contenedor: this.contenedores.length +1,
        elementos: [],
        totalPorcentaje: 0
      });
    }else{
      toastr.error("Se superó el maximo de contenedores.");

    }
  }
  
  open_EditCantidad(idx:any){
    for(var item of this.detalles){
      item.op_cantidad = false;
    }
    this.detalles[idx].op_cantidad = true;
    this.inpSearch = !this.inpSearch;
  }

  open_EditPrecio(idx:any){
    for(var item of this.detalles){
      item.op_precio = false;
    }
    this.detalles[idx].op_precio = true;
    this.inpSearch = !this.inpSearch;
  }

  closeInputs(){
    for(var item of this.detalles){
      item.op_precio = false;
      item.op_cantidad = false;
    }
  }
  
  toggleSearch(): void {
    this.inpSearch = !this.inpSearch;
    for(var item of this.detalles){
      item.op_precio = false;
    }
    for(var item of this.detalles){
      item.op_cantidad = false;
    }
  }

  getFormattedNumber(idx:any): string {
    const formatter = new Intl.NumberFormat('en-US');
    return formatter.format(this.detalles[idx].cantidad);
  }

  enterSetValues(idx:any){
    let detalle = this.detalles[idx];
    this.arr_detalles = [];
    this.detalles_ = [];
    let porcent_detalle = (detalle.cantidad/detalle.cantidad_contenedor)*100; //75
    console.log(porcent_detalle);
    
    while (porcent_detalle > 0) {
      const porcentajeDetalle = Math.min(100, porcent_detalle);
          
      let new_detalle = { ...detalle };
      new_detalle.porcent = (porcentajeDetalle);
      new_detalle.cantidad = ((new_detalle.porcent/100)*new_detalle.cantidad_contenedor).toFixed(2);
      this.arr_detalles.push(new_detalle);
      porcent_detalle -= porcentajeDetalle;
    }
    this.arr_detalles.forEach(element => {
        this.detalles.push(element);
    });
    this.detalles.splice(idx,1)

    let grupos : any= this.agruparPorcentajeMaximo(this.detalles);
    
    for(var element of grupos){
      for(var el of element.elementos){
        this.detalles_.push(el);
      }
    }
    this.detalles = this.detalles_;
    this.contenedores = grupos;
    
    for(var item of this.detalles){
      item.op_cantidad = false;
      item.op_precio = false;
    }
  }




}
