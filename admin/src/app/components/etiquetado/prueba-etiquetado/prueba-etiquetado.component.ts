import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
declare var $:any;
declare var jsPDF:any;
declare var toastr:any;
declare var QRCode:any;
import { io } from "socket.io-client";

@Component({
  selector: 'app-prueba-etiquetado',
  templateUrl: './prueba-etiquetado.component.html',
  styleUrls: ['./prueba-etiquetado.component.css']
})
export class PruebaEtiquetadoComponent implements OnInit {

  public socket = io("http://localhost:4201",{transports: ['websocket']});
  public url = GLOBAL.url;
  public load_productos = false;
  public filtro_producto = '';
  public producto : any = {};
  public variaciones : Array<any> = [];
  public variaciones_selected : Array<any> = [];
  public token = localStorage.getItem('token');

  public data : any = {};
  public producto_id = '';
  public producto_titulo = '';
  public composiciones_str = '';
  public composiciones : Array<any>= [];
  public url_venta = '';

  public parameters = JSON.parse(localStorage.getItem('parameters')!);
  public today_now : any= new Date();
  public permisos : Array<any>= [];
  public id = '';
  public min_new_tag = GLOBAL.min_new_tag;
  public load_data = false;
  public load_variaciones = false;

  constructor(
    private _productoService:ProductoService,
    private _route:ActivatedRoute,
    private _router:Router
  ) { 
    
  }

  ngOnInit(): void {
    
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('3011')){
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.init_producto();
  
        }
      );
    }else{
      this._router.navigate(['/dashboard']);
    }
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
          
          setTimeout(() => {
            new QRCode("qrventa",{
                text: window.location.origin+"/ventas/create/?payload="+this.id+'&tipo=producto',
                width: 120,
                height: 120,
            });
          }, 50);

          this.init_composiciones();
          this.init_productos_variaciones();
          this.data = true;
        }
        this.load_data = false;
      }
    );
  }

  init_composiciones(){
    this._productoService.get_producto_composiciones(this.id,this.token).subscribe(
      response=>{
        for(var item of response.data){
            this.composiciones.push(item.composicion + ' ' +item.porcentaje+'%');
        }
        this.composiciones_str = this.composiciones.join(', ');
      }
    )
  }

  init_productos_variaciones(){
    this.load_variaciones = true;
    this._productoService.get_producto_variaciones(this.id,this.token).subscribe(
      response=>{
        console.log(response.data);
        this.variaciones = response.data;
        this.variaciones.forEach(async(item) => {
          item.selected = true;
          this.selected_variacion(item);
        });
        this.load_variaciones = false;
      }
    );
  }

  selected_variacion(item:any){


    if(this.variaciones_selected.length == 0){
      this.variaciones_selected.push(item);
      setTimeout(() => {
        new QRCode("qrcode-"+item._id ,{
            text: window.location.origin+"/inventario/detail/"+item._id,
            width: 128,
            height: 128,
        });
        new QRCode("qrcolor-"+item._id ,{
            text: window.location.origin+"/ventas/create/?payload="+item._id+'&tipo=color&producto='+this.id,
            width: 128,
            height: 128,
        });
      }, 50);
    }else{
      
        let variaciones_ext = this.variaciones_selected.find((sitem)=> sitem._id == item._id);
        
        if(variaciones_ext == undefined){
          this.variaciones_selected.push(item);
          setTimeout(() => {
            new QRCode("qrcode-"+item._id ,{
                text: window.location.origin+"/inventario/detail/"+item._id,
                width: 128,
                height: 128,
            });
            new QRCode("qrcolor-"+item._id ,{
                text: window.location.origin+"/ventas/create/?payload="+item._id+'&tipo=color&producto='+this.id,
                width: 128,
                height: 128,
            });
          }, 50);
        }else{
          toastr.error("El producto ya fue seleccionado");
        }
    }

    for(var subitem of this.variaciones){
      if(subitem._id == item._id){
        subitem.selected = true;
      }
    }

    console.log(this.variaciones_selected);
    
  }

  remove_variacion(idx:any,item:any){
    this.variaciones_selected.splice(idx,1);
    for(var subitem of this.variaciones){
      if(subitem._id == item._id){
        subitem.selected = false;
      }
    }
  }
  /*  */

  download_plantilla(){
    if(this.variaciones.length >= 1){
      var doc = new jsPDF();

      doc.setFontSize(18)
      doc.setFont(undefined, 'bold')
      doc.text(15.61, 20.69, this.producto.titulo);

      doc.setFontSize(14)
      doc.setFont(undefined, 'normal')
      doc.text(15.61, 30.69, this.composiciones_str);

      doc.addImage($('#qrventa img').attr('src'), 'JPEG', 163.85, 8.99, 29, 27)

      let count_x = 0;
      let count_page = 0;
      let x = 15.61;
      let y = 62.89;

      for(var item of this.variaciones_selected){
       
        
        count_x++;
        count_page++;

        doc.rect(x,y,49.28,45.85);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold')
        doc.text(x,y+53.23,item.variacion_name,{align: 'center'});

  
        doc.addImage($('#qrcolor-'+item._id+' img').attr('src'), 'JPEG', x+5, y+16, 18, 18)
        doc.addImage($('#qrcode-'+item._id+' img').attr('src'), 'JPEG', x+25, y+16, 18, 18)
    
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text(x+9, y+39, 'Venta');

        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text(x+26, y+39, 'Inventario');
        

        if(count_x<= 3){
          x = x + 64.24; //sumar 64.24
  
          if(count_x == 3){ //si es 3 resetear contador y x
            x = 15.61;
            count_x = 0;
            y = y + 72.71;
          }; 
        }

        if(count_page == 9){
          count_page = 0;
          x = 15.61;
          y = 62.89;

          doc.addPage();
          

          doc.setFontSize(18)
          doc.setFont(undefined, 'bold')
          doc.text(15.61, 20.69, this.producto.titulo);
      
          doc.setFontSize(14)
          doc.setFont(undefined, 'normal')
          doc.text(15.61, 30.69, this.composiciones_str);

          doc.addImage($('#qrventa img').attr('src'), 'JPEG', 163.85, 8.99, 29, 27)
          
        }
      }
      doc.save("PL-"+this.producto.titulo.trim().replace(/\s/g, ""));
    }else{
      toastr.error("No hay variaciones seleccionados.");
    }


    /* var out = doc.output();
    var url = 'data:application/pdf;base64,' + btoa(out); 
    window.open(url, '_blank'); */ 
  }

  

  download_etiqueta(){
    var doc = new jsPDF('l', 'mm', [52, 74]);

    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text(5.06, 7.89, 'Producto: ');

    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(25.56, 7.89, this.producto.titulo);

  

    let count_x = 0;
    let count_x_reset = 0;
    let count_x_qr = 0;
    let y_axis = 15;
    for(var item of this.variaciones_selected){
      count_x++;
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.text(5.06, y_axis, count_x+' '+item.variacion_name);
      y_axis = y_axis + 5.5;
      count_x_reset++;

      if(count_x_reset == 7){
        y_axis = 15;
        count_x_reset = 0;
        
        doc.addPage();

        doc.setFontSize(11)
        doc.setFont(undefined, 'bold')
        doc.text(5.06, 7.89, 'Estilo: ');

        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text(19.56, 7.89, this.producto.titulo);
      }
    }

    if(count_x >= this.variaciones_selected.length){
      for(var item of this.variaciones_selected){
        doc.addPage();

        doc.setFontSize(11)
        doc.setFont(undefined, 'bold')
        doc.text(5.06, 7.89, 'Variación: ');

        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text(25.56, 7.89, item.variacion_name);

        doc.addImage($('#qrventa img').attr('src'), 'JPEG', 6.76, 14.82, 27, 27)
        doc.addImage($('#qrcode-'+item._id+' img').attr('src'), 'JPEG', 39.1, 14.82, 27, 27)

        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text(13.49, 47.73, 'Venta');

        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text(45.49, 47.73, 'Inventario');
      }
    }
    

    doc.save("ET-"+this.producto.titulo.trim().replace(/\s/g, ""));
  }

  reset_variaciones(){
    this.variaciones_selected = [];
    for(var item of this.variaciones){
      if(this.variaciones_selected.length == 0){
        this.variaciones_selected.push(item);
        setTimeout(() => {
          new QRCode("qrcode-"+item._id ,{
              text: window.location.origin+"/inventario/detail/"+item._id,
              width: 128,
              height: 128,
          });
        }, 50);
      }else{
        
          let variaciones_ext = this.variaciones_selected.find((sitem)=> sitem._id == item._id);
          
          if(variaciones_ext == undefined){
            this.variaciones_selected.push(item);
            setTimeout(() => {
              new QRCode("qrcode-"+item._id ,{
                  text: window.location.origin+"/inventario/detail/"+item._id,
                  width: 128,
                  height: 128,
              });
            }, 50);
          }else{
            toastr.error("El producto ya fue seleccionado");
          }
      }
    }
  }
}

