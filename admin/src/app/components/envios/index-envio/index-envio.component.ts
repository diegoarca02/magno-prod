import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { VentaService } from 'src/app/services/venta.service';
declare var toastr:any;
declare var $:any;
import { Template, BLANK_PDF, generate } from '@pdfme/generator';
import { invoice_ts } from 'src/app/templates_pdf/invoice/invoice_';
import { envio_ts } from 'src/app/templates_pdf/envio/envio_';
import { Router } from '@angular/router';
declare var moment:any;

@Component({
  selector: 'app-index-envio',
  templateUrl: './index-envio.component.html',
  styleUrls: ['./index-envio.component.css']
})
export class IndexEnvioComponent implements OnInit {
  
  public token = localStorage.getItem('token');
  public user = JSON.parse(localStorage.getItem('user_data')!);
  public ventas : Array<any> = [];
  public venta_selected : any = {};
  public detalles : Array<any> = [];
  public ventas_envio : Array<any> = [];
  public step = 1;
  public load_detalles = false;
  public load_data = false;
  public const_ventas : Array<any> = [];
  public tipo_option = 'Todos';
  public estados : any = {};
  public todos = 0;
  public sort = 'Defecto';
  public page = 10;
  public load = 0;
  public load_envios = false;
  public envios: Array<any> = [];
  public detalles_almacen :Array<any> = [];
  public load_foto_envio = false;
  public file_envio : File|any = undefined;

  public envioOpen :any = {};
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private context: CanvasRenderingContext2D | null = null;
  private drawing = false;
  public isCanvasEmpty : boolean = true;
  public load_firma_envio = false;
  public permisos : Array<any> = [];

  constructor(
    private ventaService:VentaService,
    private _router:Router
  ) { }

  handlePermisos(event:any){
    this.permisos = event;
    
    if(this.permisos.includes('9000')){
      this.init_todos();
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    
  }

  init_envios(){
    this.load_envios = true;
    this.ventaService.get_envios_procesados(this.token).subscribe(
      response=>{
        this.envios = response.data;
        this.load_envios = false;
      }
    );
  }

  init_todos(){
    this.load++;
    if(this.load==0) this.load_data = true;
    
    this.ventaService.get_ventas_envios(this.tipo_option,this.page,this.token).subscribe(
      response=>{
        console.log(response);
        this.ventas = response.data;
        for(var item of this.ventas){
          if(item.detalles >= 1){
            item.porcent = parseFloat(((100*item.enviados)/item.detalles).toFixed(2));
          }else{
            item.porcent = 0;
          }
        }
        this.const_ventas = this.ventas;
        this.estados.parciales = this.const_ventas.filter(item=> item.porcent < 100).length;
        this.estados.completados = this.const_ventas.filter(item=> item.porcent == 100).length;
        this.estados.entregados = this.const_ventas.filter(item=> item.venta.estado == 'Entregado').length;
        this.todos = response.todos;
    
        this.load_data = false;
      }
    );
  }

  set_tipo(tipo:any){
    this.tipo_option = tipo;
    if(this.tipo_option == 'Parciales'){
      this.ventas = this.const_ventas.filter(item=> item.porcent < 100);
    }else if(this.tipo_option == 'Completados'){
      this.ventas = this.const_ventas.filter(item=> item.porcent == 100);
    }else if(this.tipo_option == 'Entregados'){
      this.ventas = this.const_ventas.filter(item=> item.venta.estado == 'Entregado');
    }else if(this.tipo_option == 'Realizados'){
      this.init_envios();
    }else{
      this.ventas = this.const_ventas;
    }
  }

  sort_matriculas(){
    if(this.sort == 'Menor precio'){
      this.ventas = this.ventas.sort((a, b) => a.venta.total - b.venta.total);
    }else if(this.sort == 'Mayor precio'){
      this.ventas = this.ventas.sort((a, b) => b.venta.total - a.venta.total);
    }else if(this.sort == 'Defecto'){
      this.ventas = this.const_ventas;
    }
  }
  
  click_matriculas(){
    this.page = this.page + 10;
    this.init_todos();
  }

  

  set_envio(){
    this.step = 3;
  }

  set_option(value:any){
    this.step = value;
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


  upload_envio(id:any){
    if(this.file_envio != undefined){
      this.load_foto_envio = true;
      this.ventaService.update_file_envio_venta(id,{file:this.file_envio},this.token).subscribe(
        response=>{
          this.load_foto_envio = false;
          toastr.success("Se subió la foto.");
          $('#envioModal-'+id).modal('hide');
          this.init_envios();
        }
      );
    }else{
      toastr.error("Debes subir una foto.");
    }
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
      this.ventaService.update_firma_envio(this.envioOpen._id,data,this.token).subscribe(
        response=>{
          console.log(response);
          this.load_firma_envio = false;
          this.init_envios();
          $('#firmaEnvio').modal('hide');
        }
      );
    }
  }
}
