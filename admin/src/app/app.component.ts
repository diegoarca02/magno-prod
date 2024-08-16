import { Component } from '@angular/core';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { ColaboradorService } from './services/colaborador.service';
declare var KTLayoutAside:any;
declare var KMenu:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


  constructor(
    private router: Router,
    ) {
  }



  
}
