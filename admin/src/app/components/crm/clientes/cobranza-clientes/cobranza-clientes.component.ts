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
  selector: 'app-cobranza-clientes',
  templateUrl: './cobranza-clientes.component.html',
  styleUrls: ['./cobranza-clientes.component.css']
})
export class CobranzaClientesComponent implements OnInit {

  public token = localStorage.getItem('token');
  public cliente: any = {
  }
  public id = '';
  public load_data = true;
  public data = false;
  public arr_data : Array<any> = [];
  public arr_general : Array<any> = [];
  public load_btn = false;

  public inicio = '';
  public hasta = '';
  public str_meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

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
        this.init_datos();
      }
    );
  }

  init_datos(){
    this.load_data = true;
    this._clienteService.get_cliente_admin(this.id,this.token).subscribe(
      response=>{
        if(response.data == undefined){
          this.data = false;
        }else{
          this.cliente = response.data;
          this.data = true;
          this.init_data();
        }
        this.load_data = false;
        
      }
    );
  }

  init_data(){
    this.load_btn = true;
    this._kpiService.get_cobranza_cliente(this.inicio,this.hasta,this.id,this.token).subscribe(
        response=>{
            console.log(response);
          if(response.data != undefined){
            this.arr_data = response.data;
            let idx = 0;
            for(var item of this.arr_data){
                if(item.mes <= 9) item.mes = "0"+item.mes

                item.mes_str = this.str_meses[item.mes-1];
                item.mes_srt_short = this.str_meses[item.mes-1].substring(0,3);
                item.subtotal = item.sem_uno + item.sem_dos + item.sem_tres + item.sem_cuatro;
                item.dias_mes = moment(item.year+"-"+item.mes, "YYYY-MM").daysInMonth();
                item.op_divi = (100000/item.subtotal).toFixed(2);
                item.op_mult = (item.op_divi*item.dias_mes).toFixed(2);
                idx++;

                if(item.op_mult == 'Infinity') item.op_mult = 0;

                this.init_chart_uno(item.sem_uno,item.sem_dos,item.sem_tres,item.sem_cuatro,idx);

                this.arr_general.push({
                    mes_srt_short: item.mes_srt_short,
                    op_mult: item.op_mult,
                });
                
            }

            this.init_chart_general();

            this.load_btn = false;
          }else{
            toastr.error(response.message);
            this.load_btn = false;
          }
        }
    );
  }

  init_chart_uno(sem1:any,sem2:any,sem3:any,sem4:any,idx:any){
    setTimeout(() => {
        $('#kt_apexcharts_'+idx).remove();
        $('#content_apexcharts_'+idx).html('<div id="kt_apexcharts_'+idx+'" style="height: 350px;"></div>');

        var element = document.getElementById('kt_apexcharts_'+idx);

        var labelColor = KTUtil.getCssVariableValue('--kt-gray-500');
        var borderColor = KTUtil.getCssVariableValue('--kt-gray-200');
        var baseColor = KTUtil.getCssVariableValue('--kt-info');
        var lightColor = KTUtil.getCssVariableValue('--kt-info-light');
    
        var options = {
            series: [{
                name: 'Semana',
                data: [sem1, sem2, sem3, sem4]
            }],
            chart: {
                fontFamily: 'inherit',
                type: 'area',
                height: 280,
                toolbar: {
                    show: true,
                    offsetX: 0,
                    offsetY: 0,
                    tools: {
                      download: true,
                      selection: false,
                      zoom: false,
                      zoomin: false,
                      zoomout: false,
                      pan: false,
                      reset: true,
                      customIcons: []
                    },
                    export: {
                      csv: {
                        filename: undefined,
                        columnDelimiter: ',',
                        headerCategory: 'category',
                        headerValue: 'value',
                        dateFormatter(timestamp:any) {
                          return new Date(timestamp).toDateString()
                        }
                      },
                      svg: {
                        filename: undefined,
                      },
                      png: {
                        filename: undefined,
                      }
                    },
                    autoSelected: 'zoom' 
                },
            },
            plotOptions: {
        
            },
            legend: {
                show: false
            },
            dataLabels: {
                enabled: false
            },
            fill: {
                type: 'solid',
                opacity: 1
            },
            stroke: {
                curve: 'smooth',
                show: true,
                width: 3,
                colors: ['#ffc700']
            },
            xaxis: {
                categories: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false
                },
                labels: {
                    style: {
                        colors: labelColor,
                        fontSize: '12px'
                    }
                },
                crosshairs: {
                    position: 'front',
                    stroke: {
                        color: baseColor,
                        width: 1,
                        dashArray: 3
                    }
                },
                tooltip: {
                    enabled: true,
                    formatter: undefined,
                    offsetY: 0,
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: labelColor,
                        fontSize: '12px'
                    }
                }
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
                        return val + ' dias'
                    }
                }
            },
            colors: ['#fff8dd'],
            grid: {
                borderColor: '#ebecf3',
                strokeDashArray: 4,
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            markers: {
                strokeColor: '#ffc700',
                strokeWidth: 3
            }
        };
        
        var chart = new ApexCharts(element, options);
        chart.render();
    }, 50);
  }

  init_chart_general(){
    setTimeout(() => {
        $('#kt_apexcharts_general').remove();
        $('#content_apexcharts_general').html('<div id="kt_apexcharts_general'+'" style="height: 300px;"></div>');

        let arr_meses = [];
        let arr_montos = [];

        for(var item of this.arr_general){
            arr_meses.push(item.mes_srt_short);
            arr_montos.push(item.op_mult);
        }

        var element = document.getElementById('kt_apexcharts_general');

        var labelColor = KTUtil.getCssVariableValue('--kt-gray-500');
    
        var options = {
            series: [{
                name: 'Mes',
                data: arr_montos
            }],
            chart: {
                fontFamily: 'inherit',
                type: 'area',
                height: 300,
                toolbar: {
                    show: true,
                    offsetX: 0,
                    offsetY: 0,
                    tools: {
                      download: true,
                      selection: false,
                      zoom: false,
                      zoomin: false,
                      zoomout: false,
                      pan: false,
                      reset: true,
                      customIcons: []
                    },
                    export: {
                      csv: {
                        filename: undefined,
                        columnDelimiter: ',',
                        headerCategory: 'category',
                        headerValue: 'value',
                        dateFormatter(timestamp:any) {
                          return new Date(timestamp).toDateString()
                        }
                      },
                      svg: {
                        filename: undefined,
                      },
                      png: {
                        filename: undefined,
                      }
                    },
                    autoSelected: 'zoom' 
                },
            },
            plotOptions: {
        
            },
            legend: {
                show: false
            },
            dataLabels: {
                enabled: false
            },
            fill: {
                type: 'solid',
                opacity: 1
            },
            stroke: {
                curve: 'smooth',
                show: true,
                width: 3,
                colors: ['#009ef7']
            },
            xaxis: {
                categories: arr_meses,
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false
                },
                labels: {
                    style: {
                        colors: labelColor,
                        fontSize: '12px'
                    }
                },
                crosshairs: {
                    position: 'front',
                    stroke: {
                        color: '#009ef7',
                        width: 1,
                        dashArray: 3
                    }
                },
                tooltip: {
                    enabled: true,
                    formatter: undefined,
                    offsetY: 0,
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: labelColor,
                        fontSize: '12px'
                    }
                }
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
                        return val + ' dias'
                    }
                }
            },
            colors: ['#f1faff'],
            grid: {
                borderColor: '#f1faff',
                strokeDashArray: 4,
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            markers: {
                strokeColor: '#009ef7',
                strokeWidth: 3
            }
        };
        
        var chart = new ApexCharts(element, options);
        chart.render();
    }, 50);
  }

}
