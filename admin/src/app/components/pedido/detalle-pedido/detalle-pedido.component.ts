import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
declare var $:any;
declare var toastr:any;
declare var KTApp:any;
import domtoimage from 'dom-to-image';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { GENERAL } from 'src/app/services/GENERAL';
declare var jsPDF:any;
declare var moment:any;
declare var QRCode:any;

@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.component.html',
  styleUrls: ['./detalle-pedido.component.css']
})
export class DetallePedidoComponent implements OnInit {

  public token = localStorage.getItem('token');
  public id = '';
  public load_btn = false;
  public load_btn_email = false;
  public load_data = true;
  public data = false;

  public pedido: any = {};
  public detalles :Array<any> = [];
  public contenedores :Array<any> = [];
  public programaciones :Array<any> = [];
  public load_confirmacion = false;

  public nuevo_estado = '';
  public count_envio = 0;
  public programacion_option = 1;

  public det_pedidos :Array<any> = [];
  public det_programaciones :Array<any> = [];
  public proveedores :Array<any> = [];
  public load_proveedores = false;

  public pedido_confirmacion : any = {};
  public load_pedido_confirmacion = false;

  public load_cancelar_confirmacion = false;
  public load_proveedor_confirmacion = false;

  public ventas_pedido = 0;
  public option_aprobar_interno = false;
  public option_aprobar_programaciones = false;
  public pedidos_aprobacion :Array<any> = [];
  public pedidos_envio :Array<any> = [];

  public option_envios_interno = false;
  public option_envios_programaciones = false;
  public envio : any = {
    tipo_transporte: ''
  };

  public load_envio_confirmacion = false;
  public load_pedido_confirmaciones = false;
  public load_cancelar_confirmaciones = false;
  public transportes :Array<any> = GENERAL.transportes;
  public ventas_aprobadas = 0;
  
  public option = 1;
  public detalles_ : Array<any> = [];
  public load_del_detalle = false;
  public permisos : Array<any> = [];

  constructor(
    private _pedidoService:PedidoService,
    private _route:ActivatedRoute,
    private _router:Router,
    private _proveedorService:ProveedorService
  ) { 
   
  }

  ngOnInit(): void {
    
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('4003')){
      setTimeout(() => {
        KTApp.init();
      }, 50);
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.init_data();
          this.init_proveedores('Todos');
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
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

  setOpEnvio(value:any){
    this.pedidos_aprobacion = [];
    if(value == 1){
      this.option_aprobar_interno = false;
      if(this.option_envios_interno) this.option_envios_interno = false;
      else if(!this.option_envios_interno) this.option_envios_interno = true;
    }else  if(value == 2){
      this.option_aprobar_programaciones = false;
      if(this.option_envios_programaciones){
        this.option_envios_programaciones = false;
        this.pedidos_envio = [];
      }
      else if(!this.option_envios_programaciones) this.option_envios_programaciones = true;
    }
  }

  setOpAprobacion(value:any){
    this.pedidos_envio = [];
    if(value == 1){
      this.option_envios_interno = false;
      if(this.option_aprobar_interno) this.option_aprobar_interno = false;
      else if(!this.option_aprobar_interno) this.option_aprobar_interno = true;
    }else  if(value == 2){
      this.option_envios_programaciones = false;
      if(this.option_aprobar_programaciones){
        this.option_aprobar_programaciones = false;
        this.pedidos_aprobacion = [];
      }
      else if(!this.option_aprobar_programaciones) this.option_aprobar_programaciones = true;
    }
  }

  init_data(){
    this.load_data = true;
    this._pedidoService.get_pedido(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data == undefined){
          this.data = false;
        }else{
          this.pedido = response.pedido;
          this.detalles = response.detalles;

          this.contenedores = response.contenedores;
          this.det_programaciones = [];
          this.det_pedidos = [];
          console.log(this.detalles);
          

          setTimeout(() => {
            new QRCode("qrpedido",{
                text: window.location.origin+"/pedidos/detail/"+this.pedido._id,
                width: 100,
                height: 100,
            });
          }, 50);

          for(var subitem of this.contenedores){
              subitem.detalles = [];
          }
          
          for(var item of this.detalles){

            if(item.estado == 'Aprobado'){
              this.ventas_aprobadas = this.ventas_aprobadas + 1;
            }

            if(item.estado == 'Pedido'){
              this.ventas_pedido = this.ventas_pedido + 1;
            }

            if(item.estado == 'Enviado'){
              this.count_envio = this.count_envio + 1;
            }

            if(item.tipo_pedido == "Programación"){
              this.det_programaciones.push(item);
            }else if(item.tipo_pedido == "Pedido"){
              item.pedido_aprobacion = false;
              this.det_pedidos.push(item);
            }

            for(var subitem of this.contenedores){
              if(item.contenedor == subitem.contenedor){
                subitem.detalles.push(item);
              }
            }
          }
          
          this.det_programaciones.forEach(async (item) => {
            setTimeout(() => {
              new QRCode("qrdet-"+item._id,{
                  text: window.location.origin+"/clientes/"+item.programacion_detalle.programacion.cliente,
                  width: 120,
                  height: 120,
              });
            }, 50);
          });
       

          if(this.pedido.tipo_pedido == 'Programacion'){
            this.init_programaciones();
          }
          this.data = true;
        }
        this.load_data = false;
      }
    );
  }

  init_programaciones(){
    this.programaciones = [];
    for(var item of this.detalles){
      if(this.programaciones.length == 0){
        this.programaciones.push({
          razon_social: item.proveedor.razon_social,
          email: item.proveedor.email,
          _id: item.proveedor._id,
          pedidos: []
        });
      }else{
        let p = this.programaciones.filter(subitem=>subitem._id == item.proveedor._id);
        if(p.length == 0){
          this.programaciones.push({
            razon_social: item.proveedor.razon_social,
            email: item.proveedor.email,
            _id: item.proveedor._id,
            pedidos: []
          });
        }
      }
    }

    for(var item of this.detalles){
      for(var subitem of this.programaciones){
        if(item.proveedor._id.toString() == subitem._id.toString()){
          subitem.pedidos.push(item);
        }
      }
    }

    console.log(this.programaciones);
    
  }

  download(){
    try {
      var elm : any = document.getElementById('toPDF');
      domtoimage.toJpeg(elm, { quality: 0.95 })
      .then(function (dataUrl:any) {
          var link = document.createElement('a');
          link.download = new Date().getTime()+'.jpeg';
          link.href = dataUrl;
          link.click();
      });
    } catch (error) {
      console.log(error);
      
    }
  }

  set_estado(value:any){
    this.load_confirmacion = true;
    this._pedidoService.update_estado_pedido(this.id,{estado:value},this.token).subscribe(
      response=>{
        this.load_confirmacion = false;
        $('#confirmacion').modal('hide');
        toastr.success("Cambio de estado finalizado.");
        this.init_data();
        
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_confirmacion = false;
      }
    );
  }

  send_email(){
    this.load_btn_email = true;
    this._pedidoService.send_email_pedido(this.pedido._id,this.pedido.proveedor.email,this.token).subscribe(
      response=>{
        $('#detalleEmail').modal('hide');
        toastr.success("Se envió el correo.");
        this.load_btn_email = false;
      },
      error=>{
        console.log(error);
        
        toastr.error("Ocurrió un error.");
        this.load_btn_email = false;
      }
    );
    
  }

  send_email_programacion(proveedor:any,email:any){
    this.load_btn_email = true;
    this._pedidoService.send_email_programacion(this.pedido._id,proveedor,email,this.token).subscribe(
      response=>{
        $('#detalleEmail-'+proveedor).modal('hide');
        toastr.success("Se envió el correo.");
        this.load_btn_email = false;
      },
      error=>{
        console.log(error);
        
        toastr.error("Ocurrió un error.");
        this.load_btn_email = false;
      }
    );
  }

  open_modal_confirmacion_detalle(id:any){
    this.pedido_confirmacion = {};
    this.pedido_confirmacion.pedido_detalle = id;
  }

  select_proveedor_detalle(item:any){
    this.pedido_confirmacion.proveedor = item._id;
    console.log(this.pedido_confirmacion);
    
  }

  confirmar_detalle_pedido(){
    this.load_pedido_confirmacion = true;
    this._pedidoService.set_confirmacion_pedido(this.pedido_confirmacion,this.token).subscribe(
      response=>{
        $('#modalConfirmacion').modal('hide');
        toastr.success("Se aprobó el pedido.");
        this.pedido_confirmacion = {};
        this.init_data();
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_pedido_confirmacion = false;
      }
    );
  }

  cancelar_detalle_pedido(){
    this.load_cancelar_confirmacion = true;
    this._pedidoService.set_cancelar_pedido(this.pedido_confirmacion,this.token).subscribe(
      response=>{
        $('#modalConfirmacion').modal('hide');
        toastr.success("Se cancelo el pedido.");
        this.pedido_confirmacion = {};
        this.init_data();
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_cancelar_confirmacion = false;
      }
    );
  }

  proveedor_detalle_pedido(){
    this.load_proveedor_confirmacion = true;
    this._pedidoService.set_proveedor_pedido(this.pedido_confirmacion,this.token).subscribe(
      response=>{
        $('#modalProveedor').modal('hide');
        toastr.success("Se actualizó el pedido.");
        this.pedido_confirmacion = {};
        this.init_data();
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_proveedor_confirmacion = false;
      }
    );
  }

  setCHK(event:any){
    var checkbox = event.target;
    var valor = checkbox.value; // Puedes usar algún identificador único del elemento

    if (checkbox.checked) {
        // Si el checkbox está marcado, agregarlo al arreglo si no está presente
        if (this.pedidos_aprobacion.indexOf(valor) === -1) {
            this.pedidos_aprobacion.push(valor);
        }
    } else {
        // Si el checkbox no está marcado, quitarlo del arreglo si está presente
        var index = this.pedidos_aprobacion.indexOf(valor);
        if (index !== -1) {
            this.pedidos_aprobacion.splice(index, 1);
        }
    }

    console.log(this.pedidos_aprobacion);
    
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

    console.log(this.pedidos_envio);
    
  }

  confirmar_detalle_pedidos(){
    this.load_pedido_confirmaciones = true;
    console.log(this.pedidos_aprobacion);
    let data = {
      pedidos_aprobacion: this.pedidos_aprobacion,
      pedido: this.id
    }
    this._pedidoService.set_confirmacion_pedidos(data,this.token).subscribe(
      response=>{
        $('#modalConfirmaciones').modal('hide');
        toastr.success("Se aprobaron los pedidos.");
        this.pedidos_aprobacion = [];
        this.option_aprobar_interno = false;
        this.option_aprobar_programaciones = false;
        this.load_pedido_confirmaciones = false;
        this.init_data();
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_pedido_confirmaciones = false;
      }
    );
  }

  cancelar_detalle_pedidos(){
    this.load_cancelar_confirmaciones = true;
    this._pedidoService.set_cancelar_pedidos(this.pedidos_aprobacion,this.token).subscribe(
      response=>{
        $('#modalConfirmaciones').modal('hide');
        toastr.success("Se cancelaron los pedidos.");
        this.pedido_confirmacion = [];
        this.init_data();
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_cancelar_confirmaciones = false;
      }
    );
  }

  download_pdf(){
    var doc = new jsPDF();

    
    let contenedor;
    let y_ = 58+8;
    let page = 0;
    let y_square = 62+8;
    let count = 1;
    let y_count = 75+8;
    let y_product = 67+8;
    let y_proveedor = 76+8;
    let y_proveedor_ = 82+8;
    let y_contenedor = 76+8;
    let y_contenedor_ = 82+8;
    let y_cantidad = 76+8;
    let y_cantidad_ = 82+8;
    let y_qr = 60+8;
    let y_tipo = 76+8;
    let y_tipo_ = 82+8;

    for(var item of this.detalles){

      page++;
      let rgbColor = this.hexToRgb(item.color.hxd);

      let proveedor;

      if(item.proveedor) proveedor = item.proveedor.razon_social;
      else proveedor = 'Sin proveedor';

      if(page == 5){
  
        page = 0;
        y_ = 58+8;
        y_square = 62+8;
        y_count = 75+8;
        y_product = 67+8;
        y_proveedor = 76+8;
        y_proveedor_ = 82+8;
        y_contenedor = 76+8;
        y_contenedor_ = 82+8;
        y_cantidad = 76+8;
        y_cantidad_ = 82+8;
        y_qr = 60+8;
        y_tipo = 76+8;
        y_tipo_ = 82+8;

        doc.addPage();
    
        console.log(item.contenedor);
        if(contenedor !=  item.contenedor){
          doc.setFontSize(11)
          doc.setFont(undefined,'bold')
          doc.text(12.69, y_ - 6, item.contenedor.toUpperCase());
          doc.setFont();
         
         
        }
        
        doc.setDrawColor(77,77,77); // Color del borde: negro
        doc.setLineWidth(0.3);
        doc.rect(12.69,y_,183.85,30.5);

        
        doc.setDrawColor(77, 77, 77);
        doc.setLineWidth(0.2); // Ajusta según sea necesario
        doc.setFillColor(rgbColor.r,rgbColor.g,rgbColor.b); // Color de relleno
        doc.rect(18, y_square, 8, 8, 'FD'); // 'F' indica que se debe llenar
        
        doc.setFontSize(13)
        doc.setTextColor(77,77,77);
        doc.setFont(undefined, undefined,1)
        doc.text(5.5, y_count, count.toString());
        doc.setTextColor(0,0,0);

        doc.setFontSize(10)
        doc.setTextColor(25,25,25);
        doc.setFont(undefined, "bold")
        doc.text(28.27, y_product, item.producto.titulo + ' - ' +item.producto_variacion.variacion_name);
        doc.setTextColor(0,0,0);

        doc.setFontSize(10)
        doc.setTextColor(77,77,77);
        doc.setFont(undefined, "bold")
        doc.text(18, y_proveedor, 'Proveedor:');
        doc.setTextColor(0,0,0);

        doc.setFontSize(10)
        doc.setTextColor(25,25,25);
        doc.setFont(undefined, "normal")
        doc.text(18, y_proveedor_, proveedor);
        doc.setTextColor(0,0,0);

        doc.setFontSize(10)
        doc.setTextColor(77,77,77);
        doc.setFont(undefined, "bold")
        doc.text(50, y_contenedor, 'Contenedor');
        doc.setTextColor(0,0,0);

        doc.setFontSize(10)
        doc.setTextColor(25,25,25);
        doc.setFont(undefined, "normal")
        doc.text(50,y_contenedor_, item.contenedor);
        doc.setTextColor(0,0,0);

        doc.setFontSize(10)
        doc.setTextColor(77,77,77);
        doc.setFont(undefined, "bold")
        doc.text(82, y_cantidad, 'Cantidad');
        doc.setTextColor(0,0,0);

        doc.setFontSize(10)
        doc.setTextColor(25,25,25);
        doc.setFont(undefined, "normal")
        doc.text(82,y_cantidad_, item.cantidad.toString());
        doc.setTextColor(0,0,0);

        if(item.tipo_pedido == "Programación"){
          doc.addImage($('#qrdet-'+item._id+' img').attr('src'), 'JPEG', 170, y_qr, 25, 26)
        }

        doc.setFontSize(10)
        doc.setTextColor(77,77,77);
        doc.setFont(undefined, "bold")
        doc.text(114, y_cantidad, 'Tipo');
        doc.setTextColor(0,0,0);
  
        doc.setFontSize(10)
        doc.setTextColor(25,25,25);
        doc.setFont(undefined, "normal")
        doc.text(114,y_cantidad_, item.tipo_pedido);
        doc.setTextColor(0,0,0);
      }

      doc.setFontSize(30)
      doc.setFont(undefined, undefined,1)
      doc.text(12.69, 16.93, 'PEDIDO');
      doc.setFont();

      doc.addImage($('#qrpedido img').attr('src'), 'JPEG', 167, 22, 30, 30)

      doc.setFontSize(13)
      doc.setTextColor(126,130,153);
      doc.setFont(undefined, undefined,1)
      doc.text(56.08, 16.93, "#"+this.pedido.year+"-"+this.pedido.serie.toString().padStart(6,'000000'));
      doc.setTextColor(0,0,0);

      doc.setFontSize(11)
      doc.setFont(undefined,'bold')
      doc.text(12.69, 28.28, "PEDIDO", {align: 'center'});
      doc.setFont();

      doc.setFontSize(10)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, "normal")
      doc.text(12.69, 35.28, "#"+this.pedido.year+"-"+this.pedido.serie.toString().padStart(6,'000000'));
      doc.setTextColor(0,0,0);
      doc.setFont();

      doc.setFontSize(10)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, undefined,1)
      doc.text(12.69, 40.28, this.pedido.tipo_pago);
      doc.setTextColor(0,0,0);

      doc.setFontSize(10)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, undefined,1)
      doc.text(12.69, 45.28, this.pedido.moneda);
      doc.setTextColor(0,0,0);

      doc.setFontSize(10)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, undefined,1)
      doc.text(12.69, 50.28, moment(this.pedido.fecha_pedido).format('YYYY-MM-DD'));
      doc.setTextColor(0,0,0);

      if(contenedor != item.contenedor){
        doc.setFontSize(11)
        doc.setFont(undefined,'bold')
        doc.text(12.69, y_ - 6, "Contenedor " + item.contenedor);
        doc.setFont();
      }

      doc.setDrawColor(77,77,77); // Color del borde: negro
      doc.setLineWidth(0.3);
      doc.rect(12.69,y_,183.85,30.5);

      doc.setDrawColor(77, 77, 77);
      doc.setLineWidth(0.2); // Ajusta según sea necesario
      doc.setFillColor(rgbColor.r,rgbColor.g,rgbColor.b); // Color de relleno
      doc.rect(18, y_square, 8, 8, 'FD'); // 'F' indica que se debe llenar

      doc.setFontSize(13)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, undefined,1)
      doc.text(5.5, y_count, count.toString());
      doc.setTextColor(0,0,0);

      doc.setFontSize(10)
      doc.setTextColor(25,25,25);
      doc.setFont(undefined, "bold")
      doc.text(28.27, y_product, item.producto.titulo + ' - ' +item.producto_variacion.variacion_name);
      doc.setTextColor(0,0,0);

      doc.setFontSize(10)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, "bold")
      doc.text(18, y_proveedor, 'Proveedor');
      doc.setTextColor(0,0,0);
  
      doc.setFontSize(10)
      doc.setTextColor(25,25,25);
      doc.setFont(undefined, "normal")
      doc.text(18, y_proveedor_, proveedor);
      doc.setTextColor(0,0,0);

      doc.setFontSize(10)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, "bold")
      doc.text(50, y_contenedor, 'Contenedor');
      doc.setTextColor(0,0,0);

      doc.setFontSize(10)
      doc.setTextColor(25,25,25);
      doc.setFont(undefined, "normal")
      doc.text(50,y_contenedor_, item.contenedor);
      doc.setTextColor(0,0,0);

      doc.setFontSize(10)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, "bold")
      doc.text(82, y_cantidad, 'Cantidad');
      doc.setTextColor(0,0,0);

      doc.setFontSize(10)
      doc.setTextColor(25,25,25);
      doc.setFont(undefined, "normal")
      doc.text(82,y_cantidad_, item.cantidad.toFixed(2));
      doc.setTextColor(0,0,0);

      if(item.tipo_pedido == "Programación"){
        doc.addImage($('#qrdet-'+item._id+' img').attr('src'), 'JPEG', 170, y_qr, 25, 26)
      }

      doc.setFontSize(10)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, "bold")
      doc.text(114, y_cantidad, 'Tipo');
      doc.setTextColor(0,0,0);

      doc.setFontSize(10)
      doc.setTextColor(25,25,25);
      doc.setFont(undefined, "normal")
      doc.text(114,y_cantidad_, item.tipo_pedido);
      doc.setTextColor(0,0,0);

      y_ = y_ + 45;
      y_square = y_square + 45;
      y_count = y_count + 45;
      y_product = y_product + 45;
      y_proveedor = y_proveedor + 45;
      y_proveedor_ = y_proveedor_ + 45;
      y_contenedor = y_contenedor + 45;
      y_contenedor_ = y_contenedor_ + 45;
      y_cantidad = y_cantidad + 45;
      y_cantidad_ = y_cantidad_ + 45;
      y_qr = y_qr + 45;
      contenedor = item.contenedor;
      count++;
    }
    doc.addPage();

    let y_titulo_contenedor = 69;
    for(var item of this.contenedores){
      

      doc.setFontSize(30)
      doc.setFont(undefined, undefined,1)
      doc.text(12.69, 16.93, 'CONTENEDORES');
      doc.setFont();

      doc.addImage($('#qrpedido img').attr('src'), 'JPEG', 167, 22, 30, 30)

      doc.setFontSize(13)
      doc.setTextColor(126,130,153);
      doc.setFont(undefined, undefined,1)
      doc.text(105, 16.93, "#"+this.pedido.year+"-"+this.pedido.serie.toString().padStart(6,'000000'));
      doc.setTextColor(0,0,0);

      doc.setFontSize(11)
      doc.setFont(undefined,'bold')
      doc.text(12.69, 28.28, "PEDIDO", {align: 'center'});
      doc.setFont();

      doc.setFontSize(10)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, "normal")
      doc.text(12.69, 35.28, "#"+this.pedido.year+"-"+this.pedido.serie.toString().padStart(6,'000000'));
      doc.setTextColor(0,0,0);
      doc.setFont();

      doc.setFontSize(10)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, undefined,1)
      doc.text(12.69, 40.28, this.pedido.tipo_pago);
      doc.setTextColor(0,0,0);

      doc.setFontSize(10)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, undefined,1)
      doc.text(12.69, 45.28, this.pedido.moneda);
      doc.setTextColor(0,0,0);

      doc.setFontSize(10)
      doc.setTextColor(77,77,77);
      doc.setFont(undefined, undefined,1)
      doc.text(12.69, 50.28, moment(this.pedido.fecha_pedido).format('YYYY-MM-DD'));
      doc.setTextColor(0,0,0);

      doc.setFontSize(12)
      doc.setFont(undefined,'bold')
      doc.text(12.69, y_titulo_contenedor, "Contenedor "+item.contenedor);
      doc.setFont();

      let y_hxd = 74.03;
      let y_prdct = 78;

      for(var subitem of item.detalles){
      
        let rgbColor = this.hexToRgb(subitem.color.hxd);
        doc.setDrawColor(77, 77, 77);
        doc.setLineWidth(0.2); // Ajusta según sea necesario
        doc.setFillColor(rgbColor.r,rgbColor.g,rgbColor.b); // Color de relleno
        doc.rect(18, y_hxd, 10, 10, 'FD'); // 'F' indica que se debe llenar

        doc.setFontSize(10)
        doc.setTextColor(25,25,25);
        doc.setFont(undefined, "bold")
        doc.text(33, y_prdct, subitem.producto.titulo + ' - ' +subitem.producto_variacion.variacion_name);
        doc.setTextColor(0,0,0);

        doc.setFontSize(10)
        doc.setTextColor(77,77,77);
        doc.setFont(undefined, "bold")
        doc.setFontStyle('italic')
        doc.text(33, y_prdct+5, subitem.cantidad.toFixed(2) + ' ' +subitem.unidad);
        doc.setTextColor(0,0,0);

        y_hxd = y_hxd + 13;
        y_prdct = y_prdct + 13;
      }

      doc.addPage();

    }

    

    doc.save("ET-"+this.pedido.year+"-"+this.pedido.serie.toString().padStart(6,'000000'));
  }

  hexToRgb(hex:any) {
    // Elimina el posible símbolo de almohadilla (#) al principio del color
    hex = hex.replace(/^#/, '');

    // Convierte pares de caracteres hexadecimales a valores RGB
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return { r: r, g: g, b: b };
  }

  envio_detalle_pedido(){

    if(!this.envio.tipo_transporte){
      toastr.error("Seleccione el tipo de transporte.");
    }else if(!this.envio.empresa_transporte){
      toastr.error("Ingrese la empresa de transporte.");
    }else if(!this.envio.aduanero_transporte){
      toastr.error("Ingrese el aduanero.");
    }else if(!this.envio.costo_envio){
      toastr.error("Ingrese el costo de envío.");
    }else if(!this.envio.programacion_transporte){
      toastr.error("Ingrese la fecha programada.");
    }else{
      this.envio.pedido = this.id;
      this.envio.pedidos_envio = this.pedidos_envio;

      this.load_envio_confirmacion = true;
  
      console.log(this.envio);
      this._pedidoService.create_envio_pedido(this.envio,this.token).subscribe(
        response=>{
          $('#modalEnvio').modal('hide');
          toastr.success("Se actualizó el pedido.");
          this.pedido_confirmacion = {};
          this.option_envios_programaciones = false;
          this.option_envios_interno = false;
          this.pedidos_envio = [];
          this.init_data();
        },
        error=>{
          toastr.error("Ocurrió un error.");
          this.load_proveedor_confirmacion = false;
        }
      );
    }

    
    
  }



}
