import { Component, OnInit } from '@angular/core';
import { KpiService } from 'src/app/services/kpi.service';
declare var ApexCharts:any;
declare var KTUtil:any;
declare var toastr:any;
declare var $:any;

@Component({
  selector: 'app-cobranza-kpi',
  templateUrl: './cobranza-kpi.component.html',
  styleUrls: ['./cobranza-kpi.component.css']
})
export class CobranzaKpiComponent implements OnInit {

    public token = localStorage.getItem('token');
    public filter : any = '';

    constructor(
        private _kpiService:KpiService
    ) { 
        let today = new Date();
        let month :any = today.getMonth()+1;
        if(month<=9) month = '0'+month;
        this.filter = today.getFullYear() +'-'+month;
    }

    ngOnInit(): void {
        this.init_charts();
    }

    init_charts(){
        if(!this.filter){
            toastr.error("El periodo es requerido.");
        }else{
            let year = parseInt(this.filter.split('-')[0]);
            let month = parseInt(this.filter.split('-')[1]);

            this._kpiService.get_cobranza_semanal(month,year,this.token).subscribe(
                response=>{
                    console.log(response);
                    this.init_chart_uno(response.sem_uno,response.sem_dos,response.sem_tres,response.sem_cuatro);
                }
            );
        }
        
    }

    init_chart_uno(sem1:any,sem2:any,sem3:any,sem4:any){
        setTimeout(() => {
            $('#kt_apexcharts_1').remove();
            $('#content_apexcharts_1').html('<div id="kt_apexcharts_1" style="height: 350px;"></div>');
            var element = document.getElementById('kt_apexcharts_1');

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
                    height: 350,
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
                            return '$' + val + ' MXN'
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
