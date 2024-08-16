import { Component, OnInit } from '@angular/core';
import { PedidoService } from 'src/app/services/pedido.service';
declare var brain:any;

@Component({
  selector: 'app-inf-inventario',
  templateUrl: './inf-inventario.component.html',
  styleUrls: ['./inf-inventario.component.css']
})
export class InfInventarioComponent implements OnInit {

  public load_data = true;
  public token = localStorage.getItem('token');
  public data : Array<any> = [];
  public totales : any = {};

  constructor(
    private _pedidoService:PedidoService
  ) { }

  ngOnInit(): void {
    this.init_data();
  }

  init_data(){
    this.load_data = true;
    this._pedidoService.kpi_inventario(this.token).subscribe(
      response=>{
        console.log(response);
        this.data = response.data;
        this.totales = response.totales;

        for(var item of this.data){
          var aRgbHex = item.hxd.replace('#','').match(/.{1,2}/g);  
          var aRgb = [
              parseInt(aRgbHex[0], 16),
              parseInt(aRgbHex[1], 16),
              parseInt(aRgbHex[2], 16)
          ];
          
          let txt = this.redBrain(aRgb[0]/255,aRgb[1]/255,aRgb[2]/255);
          item.txt = txt;
          console.log(txt);
        }

        this.load_data = false;
      }
    );
  }

  redBrain(r:any,g:any,b:any){
      const net = new brain.NeuralNetwork();
      //0 negro 1 blanco
      net.train([
          { input: { r: 0, g: 0, b: 0}, output: { brain: 1 } },
          { input: { r: 1, g: 1, b: 1}, output: { brain: 0 } },
          { input: { r: 0, g: 0, b: 1}, output: { brain: 1 } },
          { input: { r: 0, g: 1, b: 1}, output: { brain: 0 } },
      ]);
      
      var output = net.run({ r: r, g: g, b: b }); 
      let colortxt;
      if(output.brain > .5) colortxt = 'white';
      else colortxt = 'black';
      return colortxt;
  }

}
