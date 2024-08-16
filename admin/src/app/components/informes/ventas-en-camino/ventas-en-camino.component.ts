import { Component, OnInit } from '@angular/core';
import { VentaService } from 'src/app/services/venta.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
declare var toastr:any;
declare var $:any;

@Component({
  selector: 'app-ventas-en-camino',
  templateUrl: './ventas-en-camino.component.html',
  styleUrls: ['./ventas-en-camino.component.css']
})
export class VentasEnCaminoComponent implements OnInit {

  public load_data = false;
  public token = localStorage.getItem('token');
  public ventas : Array<any> = [];
  public isDragging = false;
  public draggingIndex: number | null = null;
  public btn_load = false;
  public load_delete = false;

  constructor(
    private _ventaService:VentaService
  ) { }

  ngOnInit(): void {
    this.init_ventas();
  }
  
  init_ventas(){
    this.load_data = true;
    this._ventaService.obtener_ventas_en_camino(this.token).subscribe(
      response=>{
        console.log(response);
        this.ventas = response.data;
        this.load_data = false;
      }
    );
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.ventas, event.previousIndex, event.currentIndex);
  }

  onDragStarted() {
    this.isDragging = true;
  }

  onDragEnded() {
    this.isDragging = false;
    this.draggingIndex = null;
  }

  save(){
    console.log(this.ventas);
    this.ventas.forEach((element,index) => {
        element.priority = index+1;
    });
    console.log(this.ventas);
    this.btn_load = true;
    this._ventaService.actualizar_prioridades_ventas({ventas:this.ventas},this.token).subscribe(
      response=>{
        console.log(response);
        if(response.data != undefined){
          this.init_ventas();
          toastr.success("Se actualizo las prioridades.");
        }else{
          toastr.error("No se puedo reordenar las ventas.");
        }
        this.btn_load = false;
      }
    );
  }


  removeDetalle(id:any,venta:any){
    this.load_delete = true;
    this._ventaService.remove_detalle_venta(id,venta,this.token).subscribe(
      response=>{
        this.init_ventas();

        $('#deleteDVenta-'+id).modal('hide');
        toastr.success("Eliminación completada.");
        this.load_delete = false;
      },
      error=>{
        console.log(error);
        
      }
    );
  }
}
