import { Component, OnInit } from '@angular/core';
declare var lightGallery:any;

@Component({
  selector: 'app-galeria-producto',
  templateUrl: './galeria-producto.component.html',
  styleUrls: ['./galeria-producto.component.css']
})
export class GaleriaProductoComponent implements OnInit {



  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      var e = document.querySelectorAll('.light-gallery-message');
  
      for (var t = 0; t < e.length; t++) lightGallery(e[t], {
          thumbnail: true,
      
      })
    }, 50);
  }

}
