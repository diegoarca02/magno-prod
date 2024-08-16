import { Component } from '@angular/core';
declare var Swiper:any;
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {
  ngOnInit(){
    setTimeout(() => {
      new Swiper('#swiper1',{
        "slidesPerView": 1,
        "pagination": {
          "el": ".swiper-pagination",
          "clickable": true
        },
        "breakpoints": {
          "500": {
            "slidesPerView": 2
          },
          "991": {
            "slidesPerView": 3
          }
        }
      });
      new Swiper('#swiper',{
        effect: "fade",
        speed: 500,
        autoplay: {
          delay: 5500,
          disableOnInteraction: false
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true
        },
        navigation: {
          prevEl: "#hero-prev",
          nextEl: "#hero-next"
        }
      });

      new Swiper('#swiper2',{
        "slidesPerView": 2,
        "spaceBetween": 24,
        "pagination": {
          "el": ".swiper-pagination",
          "clickable": true
        },
        "breakpoints": {
          "500": {
            "slidesPerView": 3
          },
          "650": {
            "slidesPerView": 4
          },
          "900": {
            "slidesPerView": 5
          },
          "1100": {
            "slidesPerView": 6
          }
        }
      });
      
    }, 50);
  }
}
