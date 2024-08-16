import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var KTUtil:any;
declare var ApexCharts:any;
import { ProductoService } from 'src/app/services/producto.service';
import { VentaService } from 'src/app/services/venta.service';
declare var $:any;
declare var toastr:any;

@Component({
  selector: 'app-color-programacion',
  templateUrl: './color-programacion.component.html',
  styleUrls: ['./color-programacion.component.css']
})
export class ColorProgramacionComponent implements OnInit {

  public data : any = false;
  public load_data = false;
   public token = localStorage.getItem('token');
  public page = 1;
  public pageSize = 24;
  public id = '';
  public producto : any = {};
  public color : any = {};
  public str_portada = '';
  public url = GLOBAL.url;
  public colores : Array<any> = [];
  public colores_arr : Array<any> = [];
  public programaciones : Array<any> = [];
  public option : any = 1;
  public color_id_selected = '';

  constructor(
    private _route:ActivatedRoute,
    private _productoService:ProductoService,
    private _ventaService:VentaService
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
        this.init_color();
        
      }
    );
  }

  downloadExcel(){}

  init_color(){
    this.load_data = true;
    this._ventaService.get_programaciones_color(this.id,this.token).subscribe(
      response=>{
        console.log(response);
        
        if(response.data != undefined){
          this.programaciones = response.data;
          this.str_portada = this.url+'resources/products/'+response.color.producto.portada;
          this.producto = response.color.producto;
          this.color = response.color;
          this.data = true;
        }else{
          this.data = false;
        }
        this.load_data = false;
        
      }
    );
  }

  set_option(value:any){
    if(value == 2){
      this.init_chart();
    }
    this.option = value;
  }

  init_chart(){

    let n_pendiente = 0;
    let n_realizado = 0;
    let n_finalizado = 0;

    for(var item of this.programaciones){
      if(item.estado == 'Pendiente') n_pendiente++;
      else if(item.estado == 'Realizado') n_realizado++;
      else if(item.estado == 'Finalizado') n_finalizado++;
    }

    setTimeout(() => {
      var chart :any= {
          self: null,
          rendered: false
      };
      var element = document.getElementById("kt_charts_widget_1"); 

      if (!element) {
          return;
      }
      
      var labelColor = KTUtil.getCssVariableValue('--bs-gray-800');    
      var borderColor = KTUtil.getCssVariableValue('--bs-border-dashed-color');
      var maxValue :any = 18;
      
      var options = {
          series: [{
              name: 'Sales',
              data: [n_pendiente, n_realizado, n_finalizado]                                                                                                             
          }],           
          chart: {
              fontFamily: 'inherit',
              type: 'bar',
              height: 350,
              toolbar: {
                  show: false
              }                             
          },                    
          plotOptions: {
              bar: {
                  borderRadius: 8,
                  horizontal: true,
                  distributed: true,
                  barHeight: 50,
                  dataLabels: {
              position: 'bottom' // use 'bottom' for left and 'top' for right align(textAnchor)
            }                                                       
              }
          },
          dataLabels: { 
              enabled: true,              
              textAnchor: 'start',  
              offsetX: 0,   
              style: {
                  fontSize: '14px',
                  fontWeight: '600',
                  align: 'left',                                                            
              }                                       
          },             
          legend: {
              show: false
          },                               
          colors: ['#FFC700', '#3E97FF', '#3E97FF', '#FFC700', '#7239EA'],                                                                      
          xaxis: {
              categories: ["Pendiente", "Realizado", 'Finalizado'],
                  labels: {
                      formatter: function (val:any) {
                        return val.toFixed(1) + ' p.'
                      },
                      style: {
                          colors: [labelColor],
                          fontSize: '14px',
                          fontWeight: '600',
                          align: 'left'                                              
                      }                  
                  },
                  axisBorder: {
            show: false
          }                         
          },
          yaxis: {
              labels: {           
                  style: {
                      colors: labelColor,
                      fontSize: '14px',
                      fontWeight: '600'                                                                 
                  },
                  offsetY: 2,
                  align: 'left' 
              }           
          },
          grid: {                
              borderColor: borderColor,                
              xaxis: {
                  lines: {
                      show: true
                  }
              },   
              yaxis: {
                  lines: {
                      show: false  
                  }
              },
              strokeDashArray: 4              
          },
          tooltip: {
              style: {
                  fontSize: '12px'
              },
              y: {
                  formatter: function (val:any) {
                      return val + ' programaciones';
                  }
              }
          }                                 
      };  
        
      chart.self = new ApexCharts(element, options);
      chart.self.render();
      chart.rendered = true;
    }, 50);
  }
 

}
