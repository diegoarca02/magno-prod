import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { VentaService } from 'src/app/services/venta.service';
declare var toastr:any;
declare var $:any; 
declare var moment:any;
import { Template, BLANK_PDF, generate } from '@pdfme/generator';
import { invoice_ts } from 'src/app/templates_pdf/invoice/invoice_';
import { envio_ts } from 'src/app/templates_pdf/envio/envio_';
import { PagoService } from 'src/app/services/pago.service';

@Component({
  selector: 'app-envio-venta-guest',
  templateUrl: './envio-venta-guest.component.html',
  styleUrls: ['./envio-venta-guest.component.css']
})
export class EnvioVentaGuestComponent {

  public codigo = '';
  public data = false;
  public error = '';
  public token = localStorage.getItem('token');
  public user = JSON.parse(localStorage.getItem('user_data')!);

  public venta : any = {};
  public envios : Array<any> = [];
  public load_data = false;
  public deuda = 0;

  public file_envio : File|any = undefined;
  public load_foto_envio = false;

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private context: CanvasRenderingContext2D | null = null;
  private drawing = false;
  public isCanvasEmpty : boolean = true;
  public load_firma_envio = false;
  public envioOpen :any = {};

  public load_entrega_envio = false;
  public detalles_almacen :Array<any> = [];
  public cuentas_bancarias : Array<any> = [];

  constructor(
    private _ventaService:VentaService,
    private _pagoService:PagoService
  ){}

  ngOnInit(){
    this.init_cuentas_bancarias();
  }

  init_data(){
    this.load_data = true;
    this._ventaService.get_venta_guest(this.codigo,this.token).subscribe(
      response=>{

        if(response.data != undefined){
          this.data = true;
          this.venta = response.data.venta;
          this.envios = response.data.envios;
          this.deuda = response.data.deuda;
          this.detalles_almacen = response.data.detalles_almacen;
        }else{
          this.data = false;
          this.venta = {};
          this.envios = [];
        }
        console.log(this.envios);
        this.load_data = false;
      }
    );
  }

  init_cuentas_bancarias(){
    this._pagoService.get_cuentas_destacadas(this.token).subscribe(
      response=>{
        console.log(response);
        this.cuentas_bancarias = response.data;
      }
    );
  }

  fileChangeEventEnvio(event:any):void{
    var file : any;
    if(event.target.files && event.target.files[0]){
      file = <File>event.target.files[0];
    }else{
      toastr.error("La imagen no puede ser subida.");
    }

    try {
      if(file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg'){
        this.file_envio = file;
        console.log(this.file_envio);
      }else{
        toastr.error("Solo se aceptan imagenes.");
        this.file_envio = undefined;
      }
    } catch (error) {
    }
  }

  upload_envio(id:any,rs:any){
    if(this.file_envio != undefined){
      this.load_foto_envio = true;
      this._ventaService.update_file_envio_venta(id,{file:this.file_envio},this.token).subscribe(
        response=>{
          this.load_foto_envio = false;
          toastr.success("Se subió la foto.");
          if(!rs) $('#envioModal-'+id).modal('hide');
          else if(rs) $('#envioModalRS-'+id).modal('hide');
          this.init_data();
        }
      );
    }else{
      toastr.error("Debes subir una foto.");
    }
  }

  openModalFirma(item:any){
    console.log(item);
    
    this.envioOpen = item;
    setTimeout(() => {
      $(document).ready(() => {
        const canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
        this.context = canvas.getContext('2d');
        this.adjustCanvasSize();

        if (this.context) {
          this.context.lineWidth = 2; // Grosor del trazo
          this.context.strokeStyle = 'black'; // Color del trazo

        } else {
          console.error('No se pudo obtener el contexto del canvas.');
        }
      });
    }, 1000);
  }

  openFocus(){

  }

  /*FIRMA---------------------*/

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.adjustCanvasSize();
  }

  adjustCanvasSize() {
    if (this.context) {
      const canvas = this.canvasRef.nativeElement;
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * pixelRatio;
      canvas.height = canvas.clientHeight * pixelRatio;
      this.context.scale(pixelRatio, pixelRatio);
    }
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    event.preventDefault()
    if (this.context) {
      this.drawing = true;
      this.isCanvasEmpty = false;
      const x = this.getX(event);
      const y = this.getY(event);
      this.context.beginPath();
      this.context.moveTo(x, y);
    }
  }

  draw(event: MouseEvent | TouchEvent) {
    if (this.drawing && this.context) {
      event.preventDefault()
      const x = this.getX(event);
      const y = this.getY(event);
      this.context.lineTo(x, y);
      this.context.stroke();
    }
  }
  stopDrawing() {
    this.drawing = false;
  }

  private getX(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.offsetX;
    } else if (event instanceof TouchEvent && event.touches.length > 0) {
      return event.touches[0].clientX - this.canvasRef.nativeElement.getBoundingClientRect().left;
    }
    return 0;
  }

  private getY(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.offsetY;
    } else if (event instanceof TouchEvent && event.touches.length > 0) {
      return event.touches[0].clientY - this.canvasRef.nativeElement.getBoundingClientRect().top;
    }
    return 0;
  }

  clearCanvas() {
    if (this.context) {
      const canvas = this.canvasRef.nativeElement;
      this.context.clearRect(0, 0, canvas.width, canvas.height);
      this.isCanvasEmpty = true;
    }
  }

  saveFirma(){
    let data : any = {};
    if (this.context) {
      const canvas = this.canvasRef.nativeElement;
      const imageDataUrl = canvas.toDataURL('image/png'); 
      data.firma = imageDataUrl;
      this.load_firma_envio = true;
      this._ventaService.update_firma_envio(this.envioOpen._id,data,this.token).subscribe(
        response=>{
          console.log(response);
          this.load_firma_envio = false;
          this.init_data();
          $('#firmaEnvio').modal('hide');
        }
      );
    }
  }

  download_envio(item:any){
    console.log(item);
    
    let inputs :Array<any> = [
      {
        "encargado": item.destinatario,
        "direccion": item.cliente_ubicacion.place_name_es,
        "expedicion": item.lugar_expedicion,
        "estado": item.cliente_ubicacion.region,
        "ciudad": item.cliente_ubicacion.place,
        "transportista": item.paqueteria,
        "rollos": item.unidades.toString(),
        "precio_rollo": "--",
        "total_rollos": "--",
        "admin": this.user.nombres.split(' ')[0]+' '+this.user.apellidos.split(' ')[0],
        "fecha": moment(item.createdAt).format('YYYY-MM-DD'),
        "encargado_dos": item.destinatario,
        "expedicion_dos": item.lugar_expedicion,
        "estado_dos": item.cliente_ubicacion.region,
        "direccion_dos": item.cliente_ubicacion.place_name_es
      }
    ]

    var template : Template= {
      "schemas":   [
        {
          "encargado": {
            "type": "text",
            "position": {
              "x": 51.86,
              "y": 33.01
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "direccion": {
            "type": "text",
            "position": {
              "x": 51.6,
              "y": 40.89
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "expedicion": {
            "type": "text",
            "position": {
              "x": 51.6,
              "y": 48.3
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "estado": {
            "type": "text",
            "position": {
              "x": 51.6,
              "y": 55.3
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "ciudad": {
            "type": "text",
            "position": {
              "x": 51.6,
              "y": 62.3
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "transportista": {
            "type": "text",
            "position": {
              "x": 51.6,
              "y": 69.3
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "rollos": {
            "type": "text",
            "position": {
              "x": 51.6,
              "y": 75.6
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "precio_rollo": {
            "type": "text",
            "position": {
              "x": 81.23,
              "y": 98
            },
            "width": 35,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "total_rollos": {
            "type": "text",
            "position": {
              "x": 81.23,
              "y": 106.52
            },
            "width": 35,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "admin": {
            "type": "text",
            "position": {
              "x": 58.74,
              "y": 125.62
            },
            "width": 78.92,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "fecha": {
            "type": "text",
            "position": {
              "x": 156.63,
              "y": 125.35
            },
            "width": 47.7,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "encargado_dos": {
            "type": "text",
            "position": {
              "x": 38.58,
              "y": 190.85
            },
            "width": 152.47,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "expedicion_dos": {
            "type": "text",
            "position": {
              "x": 38.85,
              "y": 197.68
            },
            "width": 51.13,
            "height": 7,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "estado_dos": {
            "type": "text",
            "position": {
              "x": 126.59,
              "y": 197.97
            },
            "width": 75.47,
            "height": 6.99,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          },
          "direccion_dos": {
            "type": "text",
            "position": {
              "x": 38.58,
              "y": 204.88
            },
            "width": 163.58,
            "height": 12.03,
            "alignment": "left",
            "fontSize": 13,
            "characterSpacing": 0,
            "lineHeight": 1
          }
        }
      ],
      "basePdf": envio_ts.base
    };
    generate({ template, inputs }).then((pdf) => {
      console.log(pdf);
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      window.open(URL.createObjectURL(blob));
    }).catch((error)=>{
      console.log(error);
      
    });
  }

  convertCurrency(value: any): string {
    const opcionesDeFormato :any = {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
  
    const numeroFormateado = value !== 0
      ? new Intl.NumberFormat('es-MX', opcionesDeFormato).format(value)
      : '0';
  
    return numeroFormateado;
  }

  createSlug(str:any) {
    let slug = str.toLowerCase().replace(/\s+/g, '-');
    slug = slug.replace(/[^\w\-]+/g, '');
    const maxLength = 50;
    slug = slug.substring(0, maxLength).replace(/-$/, '');
    return slug;
  }

  download_entrega(item:any){
    let venta_envio = item;
    console.log(this.detalles_almacen);
    let arr_detalles = this.detalles_almacen.filter(subitem=> subitem.venta_envio?._id == item._id);
   
    
    let client_name = '';
    let client_str = '';
    let client_email = '';
    let client_telefono = '';
    let subtotal_seis,subtotal_cinco,subtotal_cero;
    let iva = this.venta.monto_total-this.venta.monto_total/1.16;
    let subtotal = (this.venta.monto_total/1.16);
    let idventa = "#VEN"+new Date().getFullYear()+this.venta.serie.toString().padStart(6,'000000');

    if(this.venta.tipo_usuario == 'Empresa'){
      client_name = this.venta.empresa.razon_social;
      client_str = 'Empresa';
      client_email = this.venta.empresa.email;
      client_telefono = 'Sin telefono';
    }
    if(this.venta.tipo_usuario == 'Cliente natural'){
      client_name = this.venta.cliente.nombres.split(' ')[0] + ' ' + this.venta.cliente.apellidos.split(' ')[0];
      client_str = 'Cliente natural';
      if(this.venta.cliente.email){
        client_email = this.venta.cliente.email
      }else{
        client_email = 'Correo no registrado'
      }

      client_telefono = this.venta.cliente.telefono;
    }

    let inputs :Array<any> = [
      {
        "cliente": client_name,
        "email": client_email,
        "telefono": client_telefono,
        "venta": idventa,
        "fecha": moment(new Date()).format('YYYY-MM-DD'),
        "text_es":  this.venta.cliente_ubicacion.text_es,
        "region": this.venta.cliente_ubicacion.region,
        "place": this.venta.cliente_ubicacion.place,
        "place_name_es": this.venta.cliente_ubicacion.place_name_es,
        "pagina_uno": idventa+" - Pagina 1/3 en el documento.",
        "pagina_dos": idventa+" - Pagina 2/3 en el documento.",
        "pagina_tres": idventa+" - Pagina 3/3 en el documento.",
        "firma_colaborador": this.user.nombres+' '+this.user.apellidos,
        "firma_cliente": item.firma,
        "banco_uno": "No especificado",
        "banco_dos": "No especificado",
      }
    ]

    if(this.cuentas_bancarias[0]){
      const cuenta = this.cuentas_bancarias[0];
      inputs[0].banco_uno = `BANCO: ${cuenta.banco}\nNOMBRES: ${cuenta.titular}\nSWIFT: ${cuenta.swift}\nN° CUENTA: ${cuenta.ncuenta}\nC. INTERBANCARIA: ${cuenta.cinter}`;
    }

    if(this.cuentas_bancarias[1]){
      const cuenta = this.cuentas_bancarias[1];
      inputs[0].banco_dos = `BANCO: ${cuenta.banco}\nNOMBRES: ${cuenta.titular}\nSWIFT: ${cuenta.swift}\nN° CUENTA: ${cuenta.ncuenta}\nC. INTERBANCARIA: ${cuenta.cinter}`;
    }


    let schemas : Array<any> = [
      {
        "cliente": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 35.61
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "email": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 41.17
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "telefono": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 46.79
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "venta": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 54.67
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "fecha": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 59.7
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "text_es": {
          "type": "text",
          "position": {
            "x": 127.95,
            "y": 35.61
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "region": {
          "type": "text",
          "position": {
            "x": 127.95,
            "y": 41.17
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "place": {
          "type": "text",
          "position": {
            "x": 127.95,
            "y": 46.73
          },
          "width": 74.1,
          "height": 5,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "place_name_es": {
          "type": "text",
          "position": {
            "x": 127.95,
            "y": 54.67
          },
          "width": 74.1,
          "height": 11.08,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "banco_uno": {
          "type": "text",
          "position": {
            "x": 11.91,
            "y": 76.32
          },
          "width": 81.5,
          "height": 25.86,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "banco_dos": {
          "type": "text",
          "position": {
            "x": 120.95,
            "y": 75.47
          },
          "width": 81.5,
          "height": 25.86,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "pagina_uno": {
          "type": "text",
          "position": {
            "x": 9.79,
            "y": 268.82
          },
          "width": 195.28,
          "height": 6.56,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#424242",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        }
      },
      {
        "pagina_dos": {
          "type": "text",
          "position": {
            "x": 9.79,
            "y": 268.82
          },
          "width": 195.28,
          "height": 6.56,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#424242",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        "firma_cliente": {
          "type": "image",
          "position": {
            "x": 12.7,
            "y": 220.55
          },
          "width": 56.14,
          "height": 15.13,
          "rotate": 0,
          "opacity": 1
        },
        "firma_colaborador": {
          "type": "text",
          "position": {
            "x": 159.76,
            "y": 230.55
          },
          "width": 45,
          "height": 6.56,
          "rotate": 0,
          "alignment": "right",
          "verticalAlignment": "top",
          "fontSize": 13,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#000000",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        }
      },
      
    ]

    let columns : Array<any> =  [
      "cliente",
      "email",
      "telefono",
      "venta",
      "fecha",
      "text_es",
      "region",
      "place",
      "place_name_es",
      "banco_uno",
      "banco_dos",
      "pagina_uno",
      "pagina_dos",
      "grand_total",
    ]

    let count = 0;
    var y1_axis_uno = 118.74;
    var y1_axis_dos = 11.21;
    for(var item of arr_detalles){
      console.log(item);
      
      count++;
      if(count <= 19){
        inputs[0]["producto"+count] = item.producto.titulo.substr(0,15)+" - "+item.producto_variacion.variacion_name + " | " +item.ingreso_detalle.codigo;
        inputs[0]["cantidad"+count] = parseFloat(item.cantidad).toString() +' '+item.unidad;
        inputs[0]["precio"+count] = this.convertCurrency(item.precio) + ' MXN';
        inputs[0]["total"+count] = this.convertCurrency(parseFloat(item.cantidad)* item.precio)+ ' MXN';
        
        schemas[0]["producto"+count] = {
          "type": "text",
          "position": {
            "x": 10.58,
            "y": y1_axis_uno
          },
          "width": 100.03,
          "height": 5.23,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 10,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#000000",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[0]["cantidad"+count] = {
          "type": "text",
          "position": {
            "x": 113.93,
            "y": y1_axis_uno
          },
          "width": 22.77,
          "height": 5.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 10,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[0]["precio"+count] = {
          "type": "text",
          "position": {
            "x": 140.72,
            "y": y1_axis_uno
          },
          "width": 20.91,
          "height": 5.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 10,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[0]["total"+count] = {
          "type": "text",
          "position": {
            "x": 165.68,
            "y": y1_axis_uno
          },
          "width": 36.79,
          "height": 5.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 10,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },

        columns.push("producto"+count);
        columns.push("cantidad"+count);
        columns.push("precio"+count);
        columns.push("total"+count);
        y1_axis_uno = y1_axis_uno + 8.15;

      }else{
        inputs[0]["producto"+count] = item.producto.substr(0,15)+" - "+item.variacion_name + " | " +item.ingreso_detalle.codigo;
        inputs[0]["cantidad"+count] = parseFloat(item.cantidad).toString() +'\n'+item.unidad;
        inputs[0]["precio"+count] = this.convertCurrency(item.precio) + '\nMXN';
        inputs[0]["total"+count] = this.convertCurrency(parseFloat(item.cantidad)* item.precio)+ '\nMXN';
        
        schemas[1]["producto"+count] = {
          "type": "text",
          "position": {
            "x": 10.58,
            "y": y1_axis_dos
          },
          "width": 100.03,
          "height": 5.23,
          "rotate": 0,
          "alignment": "left",
          "verticalAlignment": "top",
          "fontSize": 10,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#000000",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[1]["cantidad"+count] = {
          "type": "text",
          "position": {
            "x": 113.93,
            "y": y1_axis_dos
          },
          "width": 22.77,
          "height": 5.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[1]["precio"+count] = {
          "type": "text",
          "position": {
            "x": 140.72,
            "y": y1_axis_dos
          },
          "width": 20.91,
          "height": 5.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },
        schemas[1]["total"+count] = {
          "type": "text",
          "position": {
            "x": 165.68,
            "y": y1_axis_dos
          },
          "width": 36.79,
          "height": 5.23,
          "rotate": 0,
          "alignment": "center",
          "verticalAlignment": "top",
          "fontSize": 11,
          "lineHeight": 1,
          "characterSpacing": 0,
          "fontColor": "#3a3a3a",
          "backgroundColor": "",
          "opacity": 1,
          "fontName": "Roboto"
        },


        columns.push("producto"+count);
        columns.push("cantidad"+count);
        columns.push("precio"+count);
        columns.push("total"+count);
        y1_axis_dos = y1_axis_dos + 8.15;
      }
    }

    console.log(inputs);
    console.log(schemas);
    console.log(columns);

    var template: Template= {
      "schemas": schemas,
      "basePdf": invoice_ts.base_entrega,
      "columns": columns
    };

    generate({ template, inputs }).then((pdf) => {
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      let str_1,str_2,str_3;
      str_2 = "serie-"+this.venta.serie;
      str_3 = moment(this.venta.createdAt).format('YYYY-MM-DD');

      if(this.venta.tipo_usuario == 'Empresa'){
        str_1 = this.venta.empresa.razon_social;
      }else if(this.venta.tipo_usuario == 'Cliente natural'){
        str_1 = this.venta.cliente.nombres;
      }

      let name_file = this.createSlug(str_1+"-"+str_2+"-"+str_3)
      console.log(name_file);
      
      var file = new File([blob], name_file+".pdf", {type: 'application/pdf'});
      
      this.load_entrega_envio = true;
      this._ventaService.update_file_entrega_envio(venta_envio._id,{file_entrega:file},this.token).subscribe(
        response=>{
          if(response.data != undefined){
            window.open(response.data.file_entrega, "_blank");
          }
          this.load_entrega_envio = false;
        }
      );
    }).catch(error=>{
      console.log(error);
      
    });
  }

}
