import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { KpiService } from 'src/app/services/kpi.service';
declare var $:any;
declare var toastr:any;
declare var moment:any;
declare var ApexCharts:any;
declare var KTUtil:any;

@Component({
  selector: 'app-productos-ventas-kpi',
  templateUrl: './productos-ventas-kpi.component.html',
  styleUrls: ['./productos-ventas-kpi.component.css']
})
export class ProductosVentasKpiComponent implements OnInit {

  public token = localStorage.getItem('token');
  public cliente: any = {
  }
  public id = '';
  public load_data = true;
  public data = false;
  public arr_data : Array<any> = [];
  public arr_general : Array<any> = [];
  public arr_productos : Array<any> = [];
  public load_btn = false;

  public inicio = '';
  public hasta = '';
  public str_meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  public idx_active = 0;

  constructor(
    private _clienteService:ClienteService,
    private _router:Router,
    private _route:ActivatedRoute,
    private _adminService:AdministradorService,
    private _kpiService:KpiService
  ) { 
    var date = new Date();
    let inicio = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    let hasta = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    this.inicio = moment(inicio).format('YYYY-MM-DD');
    this.hasta = moment(hasta).format('YYYY-MM-DD');
  }

  
  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
        this.init_data();
      }
    );
  }

  init_data(){
    this.load_btn = true;
    this._kpiService.get_ventas_productos(this.inicio,this.hasta,this.token).subscribe(
        response=>{
            console.log(response);
            this.arr_productos = response.general;
            this.init_chart_general();
            if(response.data != undefined){
              for(var item of response.data){
                //SEM1
                for(var sem of item.sem_uno){
                  for(var venta of item.ventas){
                      if(sem._id.toString() == venta.producto._id.toString()){
                          if(venta.day >= 1 && venta.day <= 7){
                              let subtotal = (venta.cantidad * venta.precio).toFixed(2);
                              sem.total = sem.total + parseFloat(subtotal);
                          }
                      }
                  }
                }
                //SEM2
                for(var sem of item.sem_dos){
                  for(var venta of item.ventas){
                      if(sem._id.toString() == venta.producto._id.toString()){
                          if(venta.day >= 8 && venta.day <= 14){
                              let subtotal = (venta.cantidad * venta.precio).toFixed(2);
                              sem.total = sem.total + parseFloat(subtotal);
                          }
                      }
                  }
                }
                //SEM3
                for(var sem of item.sem_tres){
                  for(var venta of item.ventas){
                      if(sem._id.toString() == venta.producto._id.toString()){
                          if(venta.day >= 15 && venta.day <= 21){
                              let subtotal = (venta.cantidad * venta.precio).toFixed(2);
                              sem.total = sem.total + parseFloat(subtotal);
                          }
                      }
                  }
                }
                //SEM4
                for(var sem of item.sem_cuatro){
                  for(var venta of item.ventas){
                      if(sem._id.toString() == venta.producto._id.toString()){
                          if(venta.day >= 22 && venta.day <= 31){
                              let subtotal = (venta.cantidad * venta.precio).toFixed(2);
                              sem.total = sem.total + parseFloat(subtotal);
                          }
                      }
                  }
                }
              }
              
              this.arr_general = response.data;

              for(var item of this.arr_general){

                item.sem_uno_total = 0;
                item.sem_dos_total = 0;
                item.sem_tres_total = 0;
                item.sem_cuatro_total = 0;
                item.total = 0;

                if(item.mes <= 9) item.mes = "0"+item.mes

                item.mes_str = this.str_meses[item.mes-1];
                item.mes_srt_short = this.str_meses[item.mes-1].substring(0,3);

                for(var subitem of item.sem_uno){
                  item.sem_uno_total = item.sem_uno_total + subitem.total;
                }
                for(var subitem of item.sem_dos){
                  item.sem_dos_total = item.sem_dos_total + subitem.total;
                }
                for(var subitem of item.sem_tres){
                  item.sem_tres_total = item.sem_tres_total + subitem.total;
                }
                for(var subitem of item.sem_cuatro){
                  item.sem_cuatro_total = item.sem_cuatro_total + subitem.total;
                }

                item.total = item.sem_uno_total + item.sem_dos_total + item.sem_tres_total + item.sem_cuatro_total;
              }
              console.log(this.arr_general);
              this.init_chart_mensual();
              this.load_btn = false;
            }else{
              toastr.error(response.message);
              this.load_btn = false;
            }
        }
    );
  }

  init_chart_general(){
    setTimeout(() => {
        var chart :any = {
            self: null,
            rendered: false
        };

        $('#kt_apexcharts_general').remove();
        $('#content_apexcharts_general').html('<div id="kt_apexcharts_general'+'" style="height: 300px;"></div>');

        let arr_productos = [];
        let arr_montos = [];

        for(var item of this.arr_productos){
          if(item.total > 0){
            arr_productos.push(item.titulo);
            arr_montos.push(item.total.toFixed(2));
          }
        }

        var element = document.getElementById('kt_apexcharts_general');

        var labelColor = KTUtil.getCssVariableValue('--kt-gray-500');
    
        var options = {
          series: [{
              name: 'Spent time',
              data: arr_montos
          }],
          chart: {
              fontFamily: 'inherit',
              type: 'bar',
              height: 300,
              toolbar: {
                  show: false
              }              
          },
          plotOptions: {
              bar: {
                  horizontal: false,
                  columnWidth: ['28%'],
                  borderRadius: 5,                     
                  dataLabels: {
                      position: "top" // top, center, bottom
                  },
                  startingShape: 'flat'
              },
          },
          legend: {
              show: false
          },
          dataLabels: {
              enabled: true, 
              offsetY: -28,                                             
              style: {
                  fontSize: '13px',
                  colors: [labelColor]
              },
                  formatter: function(val:any) {
                      return val;// + "H";
                  }                           
          },
          stroke: {
              show: true,
              width: 2,
              colors: ['transparent']
          },
          xaxis: {
              categories: arr_productos,
              axisBorder: {
                  show: false,
              },
              axisTicks: {
                  show: false
              },
              labels: {
                  style: {
                      colors: KTUtil.getCssVariableValue('--kt-gray-500'),
                      fontSize: '13px'
                  }                  
              },
              crosshairs: {
                  fill: {         
                      gradient: {         
                          opacityFrom: 0,
                          opacityTo: 0
                      }
                  }
              }
          },
          yaxis: {
              labels: {
                  style: {
                      colors: KTUtil.getCssVariableValue('--kt-gray-500'),
                      fontSize: '13px'
                  },
                  formatter: function(val:any) {
                      return val;
                  } 
              }
          },
          fill: {
              opacity: 1
          },
          states: {
              normal: {
                  filter: {
                      type: 'none',
                      value: 0
                  }
              },
              hover: {
                  filter: {
                      type: 'none',
                      value: 0
                  }
              },
              active: {
                  allowMultipleDataPointsSelection: false,
                  filter: {
                      type: 'none',
                      value: 0
                  }
              }
          },
          tooltip: {
              style: {
                  fontSize: '12px'
              },
              y: {
                  formatter: function (val:any) {
                      return  + val + ' MXN' 
                  }
              } 
          },
          colors: ['#f1416c'],
          grid: {
              borderColor: '#d3d3db',
              strokeDashArray: 4,
              yaxis: {
                  lines: {
                      show: true
                  }
              }
          }
        };
  
        chart.self = new ApexCharts(element, options);
        chart.self.render();
        chart.rendered = true; 
    }, 50);
  }

  init_chart_mensual(){
    setTimeout(() => {
        var chart :any = {
            self: null,
            rendered: false
        };

        $('#kt_apexcharts_mensual').remove();
        $('#content_apexcharts_mensual').html('<div id="kt_apexcharts_mensual'+'" style="height: 300px;"></div>');

        let arr_mes = [];
        let arr_montos = [];

        for(var item of this.arr_general){
          arr_mes.push(item.mes_srt_short);
          arr_montos.push(item.total.toFixed(2));
        }

        var element = document.getElementById('kt_apexcharts_mensual');

        var labelColor = KTUtil.getCssVariableValue('--kt-gray-500');
    
        var options = {
          series: [{
              name: 'Spent time',
              data: arr_montos
          }],
          chart: {
              fontFamily: 'inherit',
              type: 'bar',
              height: 300,
              toolbar: {
                  show: false
              }              
          },
          plotOptions: {
              bar: {
                  horizontal: false,
                  columnWidth: ['28%'],
                  borderRadius: 5,                     
                  dataLabels: {
                      position: "top" // top, center, bottom
                  },
                  startingShape: 'flat'
              },
          },
          legend: {
              show: false
          },
          dataLabels: {
              enabled: true, 
              offsetY: -28,                                             
              style: {
                  fontSize: '13px',
                  colors: [labelColor]
              },
                  formatter: function(val:any) {
                      return val;// + "H";
                  }                           
          },
          stroke: {
              show: true,
              width: 2,
              colors: ['transparent']
          },
          xaxis: {
              categories: arr_mes,
              axisBorder: {
                  show: false,
              },
              axisTicks: {
                  show: false
              },
              labels: {
                  style: {
                      colors: KTUtil.getCssVariableValue('--kt-gray-500'),
                      fontSize: '13px'
                  }                  
              },
              crosshairs: {
                  fill: {         
                      gradient: {         
                          opacityFrom: 0,
                          opacityTo: 0
                      }
                  }
              }
          },
          yaxis: {
              labels: {
                  style: {
                      colors: KTUtil.getCssVariableValue('--kt-gray-500'),
                      fontSize: '13px'
                  },
                  formatter: function(val:any) {
                      return val;
                  } 
              }
          },
          fill: {
              opacity: 1
          },
          states: {
              normal: {
                  filter: {
                      type: 'none',
                      value: 0
                  }
              },
              hover: {
                  filter: {
                      type: 'none',
                      value: 0
                  }
              },
              active: {
                  allowMultipleDataPointsSelection: false,
                  filter: {
                      type: 'none',
                      value: 0
                  }
              }
          },
          tooltip: {
              style: {
                  fontSize: '12px'
              },
              y: {
                  formatter: function (val:any) {
                      return  + val + ' MXN' 
                  }
              } 
          },
          colors: ['#009ef7'],
          grid: {
              borderColor: '#d3d3db',
              strokeDashArray: 4,
              yaxis: {
                  lines: {
                      show: true
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
