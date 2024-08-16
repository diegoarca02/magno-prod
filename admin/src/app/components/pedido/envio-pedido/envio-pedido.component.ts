import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
declare var $:any;
declare var toastr:any;
import domtoimage from 'dom-to-image';
import { SettinsService } from 'src/app/services/settins.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { GENERAL } from 'src/app/services/GENERAL';
declare var moment:any;

@Component({
  selector: 'app-envio-pedido',
  templateUrl: './envio-pedido.component.html',
  styleUrls: ['./envio-pedido.component.css']
})
export class EnvioPedidoComponent implements OnInit {

  public token = localStorage.getItem('token');
  public id = '';
  public load_btn = false;
  public load_data = true;
  public data = false;
  public transportes :Array<any> = GENERAL.transportes;
  public detalles : Array<any> = [];
  public option_envios_interno = false;
  public pedidos_envio : Array<any> = [];
  public pedidos_envio_const : Array<any> = [];
  public detalles_envio : Array<any> = [];
  public option = 1;

  public arr_detalles : Array<any> = [];
  public detalles_ : Array<any> = [];
  public contenedores : Array<any> = [];
  public envio : any = {
    tipo_transporte: ''
  };
  public load_del_detalle = false;
  public permisos : Array<any> = [];

  constructor(
    private _pedidoService:PedidoService,
    private _route:ActivatedRoute,
    private _router:Router,
    private _settingsService:SettinsService
  ) { }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('4002')){
      this.envio.programacion_transporte = moment().add(30, 'days').format('YYYY-MM-DD');
      this.init_data();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
 
  }

  init_data(){
    this.load_data = true;
    this._pedidoService.obtener_pedidos_detalles_aprobados(this.token).subscribe(
      response=>{
 
        this.detalles = response.data;
        console.log(this.detalles);
        this.load_data = false;
      }
    );
  }

  
  setOpEnvio(value:any){
    if(this.option_envios_interno) this.option_envios_interno = false;
    else if(!this.option_envios_interno) this.option_envios_interno = true;
  }

  setCHK_envios(event:any){
    var checkbox = event.target;
    var valor = checkbox.value; // Puedes usar algún identificador único del elemento

    if (checkbox.checked) {
        // Si el checkbox está marcado, agregarlo al arreglo si no está presente
        if (this.pedidos_envio.indexOf(valor) === -1) {
            this.pedidos_envio.push(valor);
        }
    } else {
        // Si el checkbox no está marcado, quitarlo del arreglo si está presente
        var index = this.pedidos_envio.indexOf(valor);
        if (index !== -1) {
            this.pedidos_envio.splice(index, 1);
        }
    }
  }

  setOption(value:any){
    if(value==1){
      this.option = 1;
      this.pedidos_envio.forEach((element) => {
        setTimeout(() => {
          $("#chk-"+element).prop("checked", true);
        }, 50);
      });
    }else if(value==2){
      this.detalles_envio = [];
      for(var item of this.pedidos_envio){
        let _item = this.detalles.find(det=>det._id == item);
        this.detalles_envio.push(_item);
      }
      this.addDetToContenedor();
      this.option = 2;
    }else if(value==3){
      this.option = 3;
    }
  }

  addDetToContenedor() {
    console.log(this.detalles_envio);
    let arr_detalles_partidos :any= [];
    this.arr_detalles = [];
    this.detalles_ = [];
    this.detalles_envio.forEach(item => {
      let porcent_detalle = (item.cantidad/item.producto.cantidad_contenedor)*100; //75
      console.log(porcent_detalle);
      
      while (porcent_detalle > 0) {
        const porcentajeDetalle = Math.min(100, porcent_detalle);
            
        let new_detalle = { ...item };
        new_detalle.porcent = (porcentajeDetalle);
        new_detalle.cantidad = ((new_detalle.porcent/100)*new_detalle.producto.cantidad_contenedor).toFixed(2);
        console.log(new_detalle.cantidad);
        
        this.arr_detalles.push(new_detalle);
        porcent_detalle -= porcentajeDetalle;
      }
    });

    
    let grupos : any= this.agruparPorcentajeMaximo(this.arr_detalles);
    this.contenedores = grupos;
    console.log(this.contenedores);
    
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

  crear(){
    console.log(this.detalles_envio);
    console.log(this.envio);
    console.log(this.contenedores);
    let arr_contenedores = [];

    for(var item of this.contenedores){
      let arr_detalles = [];
      for(let subitem of item.elementos){
        arr_detalles.push({
          pedido_detalle: subitem._id,
          colorText: subitem.colorText,
          variacion_name: subitem.producto_variacion.variacion_name,
          hxd: subitem.color.hxd,
          producto: subitem.producto.titulo,
          porcent: subitem.porcent,
          cantidad: subitem.cantidad
        });
      }
      arr_contenedores.push({
        contenedor: item.contenedor,
        porcentaje: item.totalPorcentaje,
        detalles: arr_detalles
      });
    }


    if(!this.envio.tipo_transporte){
      toastr.error("Seleccione el tipo de transporte.");
    }else if(!this.envio.empresa_transporte){
      toastr.error("Ingrese la empresa de transporte.");
    }else if(!this.envio.aduanero_transporte){
      toastr.error("Ingrese el aduanero.");
    }else if(!this.envio.programacion_transporte){
      toastr.error("Ingrese la fecha programada.");
    }else{
      this.envio.pedido = this.id;
      this.envio.pedidos_envio = this.pedidos_envio;
      this.envio.arr_contenedores = arr_contenedores;
     /*  this.load_envio_confirmacion = true; */
  
      console.log(this.envio);
      this._pedidoService.create_envio_pedido(this.envio,this.token).subscribe(
        response=>{
          console.log(response);
          this._router.navigate(['/pedidos']);
          toastr.success("Se actualizó el pedido.");
         
        },
        error=>{
          console.log(error);
          
          toastr.error("Ocurrió un error.");
        }
      );
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

  }

  removeDetalle(contenedor:any,detalle:any, iddetalle:any){
    this.contenedores[contenedor].elementos.splice(detalle,1);
    this.pedidos_envio = this.pedidos_envio.filter(item => item !== iddetalle);
    setTimeout(() => {
      $("#chk-"+iddetalle).prop("checked", false);
    }, 50);
    setTimeout(() => {
      $("#deleteModal-"+detalle).modal("hide");
    }, 50);

    this.detalles_envio = [];
    for(var item of this.pedidos_envio){
      let _item = this.detalles.find(det=>det._id == item);
      this.detalles_envio.push(_item);
    }
    this.addDetToContenedor();
  }
}
