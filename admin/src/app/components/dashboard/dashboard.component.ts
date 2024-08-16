import { Component, OnInit } from '@angular/core';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { GoogleService } from 'src/app/services/google.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public user : any = JSON.parse(localStorage.getItem('user_data')!);
  public str_portada = '';
  public load_data = true;
  public tareas : Array<any> = [];
  public token = localStorage.getItem('token');
  public currentTime: Date = new Date();

  constructor(
    private _googleService:GoogleService,
    private _colaboradorService:ColaboradorService
  ) { }

  ngOnInit(): void {
    if(this.user.avatar){
      this.str_portada = this.user.avatar;
    }else{
      this.str_portada = 'assets/images/blank2.svg';
    }
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    this.init_tareas();
  }

  init_tareas(){
    this.load_data = true;
    this._colaboradorService.obtener_tareas_pendientes_colaborador(this.token).subscribe(
      response=>{
        console.log(response);
        this.tareas = response.data;
        for(var item of this.tareas){
          item.date_realizar = new Date(item.date_realizar);
        }
        this.tareas.sort((a, b) => a.date_realizar - b.date_realizar);
      }
    );
  }

}
