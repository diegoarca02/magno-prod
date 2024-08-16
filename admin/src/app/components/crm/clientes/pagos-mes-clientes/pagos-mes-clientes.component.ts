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
  selector: 'app-pagos-mes-clientes',
  templateUrl: './pagos-mes-clientes.component.html',
  styleUrls: ['./pagos-mes-clientes.component.css']
})
export class PagosMesClientesComponent implements OnInit {

  public token = localStorage.getItem('token');
  public cliente: any = {
  }
  public id = '';
  public filter = '';
  public load_data = true;
  public data = false;
  public arr_data : Array<any> = [];
  public load_btn = false;
  public total = 0;
  public dias_mes = 0;

  constructor(
    private _clienteService:ClienteService,
    private _router:Router,
    private _route:ActivatedRoute,
    private _adminService:AdministradorService,
    private _kpiService:KpiService
  ) { 
    let today = new Date();
    let month :any = today.getMonth()+1;
    if(month<=9) month = '0'+month;
    this.filter = today.getFullYear() +'-'+month;
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
          this.init_data();
          this.data = true;
        }
        this.load_data = false;
        
      }
    );
  }

  init_data(){
    if(!this.filter){
      toastr.error("El periodo es requerido.");
    }else{
      this.load_btn = true;
      let year = parseInt(this.filter.split('-')[0]);
      let month = parseInt(this.filter.split('-')[1]);
      this._kpiService.get_pagos_mensuales_cliente(year,month,this.id,this.token).subscribe(
          response=>{
            this.dias_mes = moment(year+"-"+month, "YYYY-MM").daysInMonth();
            this.arr_data = response.data;
            for(var item of this.arr_data ){
              this.total = this.total + item.monto;
            }
            setTimeout(() => {
              this.init_chart_general();
            }, 50);
            this.load_btn = false;
          }
      );
    }
  }

  init_chart_general(){
    setTimeout(() => {
        $('#kt_apexcharts_general').remove();
        $('#content_apexcharts_general').html('<div id="kt_apexcharts_general'+'" style="height: 300px;"></div>');

        let arr_pagos = [];
        let arr_dias = [];

        for(var item of this.arr_data){
          arr_pagos.push('Pago'+ (parseInt(item.index)+1));
          arr_dias.push(item.dias);
        }

        var element = document.getElementById('kt_apexcharts_general');

        var labelColor = KTUtil.getCssVariableValue('--kt-gray-500');
        var borderColor = KTUtil.getCssVariableValue('--kt-gray-200');
        var baseColor = KTUtil.getCssVariableValue('--kt-info');
        var lightColor = KTUtil.getCssVariableValue('--kt-info-light');
    
        var options = {
            series: [{
                name: 'Mes',
                data: arr_dias
            }],
            chart: {
                fontFamily: 'inherit',
                type: 'area',
                height: 300,
                toolbar: {
                    show: false
                }
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
                colors: [baseColor]
            },
            xaxis: {
                categories: arr_pagos,
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
                        return val + ' días'
                    }
                }
            },
            colors: [lightColor],
            grid: {
                borderColor: borderColor,
                strokeDashArray: 4,
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            markers: {
                strokeColor: baseColor,
                strokeWidth: 3
            }
        };
        
        var chart = new ApexCharts(element, options);
        chart.render();
    }, 50);
  }
}
