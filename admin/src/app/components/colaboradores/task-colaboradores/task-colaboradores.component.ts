import { Component } from '@angular/core';
import { ColaboradorService } from 'src/app/services/colaborador.service';
declare var $:any;
declare var toastr:any;

@Component({
  selector: 'app-task-colaboradores',
  templateUrl: './task-colaboradores.component.html',
  styleUrls: ['./task-colaboradores.component.css']
})
export class TaskColaboradoresComponent {
  public load_data = true;
  public str_periodo = '';
  public str_estado = 'Todos';
  public tareas : Array<any> = [];
  public token = localStorage.getItem('token');
  public tarea : any = {};
  public tarea_error = '';
  public load_btn_tarea = false;
  public load_btn_state = false;
  public load_btn_posponer = false;
  public today = new Date().getTime();

  public tarea_pospuesta : any = {};
  public load_btn_cancelar = false;

  constructor(
    private _colaboradorService:ColaboradorService
  ){
    let today = new Date();
    let month :any = today.getMonth()+1;
    if(month<=9) month = '0'+month;
    this.str_periodo = today.getFullYear() +'-'+month;
  }

  ngOnInit(): void {
    this.init_tareas();
  }

  init_tareas(){
    this.load_data = true;
    this._colaboradorService.obtener_tareas_colaborador(this.str_periodo,this.str_estado,this.token).subscribe(
      response=>{
        console.log(response);
        this.tareas = response.data;
        for(let item of this.tareas){
          for(let subitem of item.tareas){
            let tt_realizar = new Date(subitem.date_realizar).getTime();
            if(tt_realizar<this.today){
              subitem.exp = true;
            }
          }
        }
        console.log(this.tareas);
        this.load_data = false;
      }
    );
  }
  
  crear_tarea(){
    if(!this.tarea.date_realizar){
      this.tarea_error = 'La fecha es requerida';
    }else if(!this.tarea.descripcion){
      this.tarea_error = 'La descripcion es requerida';
    }else{
      this.load_btn_tarea = true;
      this._colaboradorService.crear_tarea_colaborador(this.tarea,this.token).subscribe(
        response=>{
          console.log(response);
          this.tarea_error = '';
          toastr.success("Tarea agregada correctamente.");
          $('#nuevaTarea').modal('hide');
          this.init_tareas();
          this.load_btn_tarea = false;
        }
      );
    }
  }

  marcar_tarea(id:any){
    this.load_btn_state = true;
    this._colaboradorService.marcar_tarea_colaborador(id,this.token).subscribe(
      response=>{
        this.init_tareas();
        $('#state-'+id).modal('hide');
        toastr.success('Tarea marcada correctamente.');
        this.load_btn_state = false;
      }
    );
  }

  posponer_tarea(){
    if(!this.tarea_pospuesta.date_realizar){
      this.tarea_error = 'La fecha es requerida';
    }else{
      this.load_btn_posponer = true;
      this._colaboradorService.posponer_tarea_colaborador(this.tarea_pospuesta._id,this.tarea_pospuesta,this.token).subscribe(
        response=>{
          this.init_tareas();
          this.tarea_error = '';
          $('#posponerTarea').modal('hide');
          this.tarea_pospuesta = {};
          toastr.success('Tarea pospuesta correctamente.');
          this.load_btn_posponer = false;
        }
      );
    }
  }

  cancelar_tarea(id:any){
    this.load_btn_cancelar = true;
    this._colaboradorService.cancelar_tarea_colaborador(id,this.token).subscribe(
      response=>{
        console.log(response);
        this.tarea_error = '';
        toastr.success("Tarea cancelada exitosamente.");
        $('#cancelar-'+id).modal('hide');
        this.init_tareas();
        this.load_btn_cancelar = false;
      }
    );
  }
}
