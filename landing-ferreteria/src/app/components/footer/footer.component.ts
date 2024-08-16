import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  public email = '';

  constructor(
    private _router:Router
  ){

  }

  sendEmail(){
    if(this.email){
      this._router.navigate(['/contacto'],{queryParams:{email:this.email}}).then(() => {
        window.scrollTo(0, 0); // Esto desplazará la página hacia arriba
      });;
    }
  }
}
