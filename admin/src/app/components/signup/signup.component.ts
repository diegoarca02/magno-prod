import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ColaboradorService } from 'src/app/services/colaborador.service';
declare var passwordStrengthMeter:any;
declare var $:any;
declare var toastr:any;
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { GoogleService } from 'src/app/services/google.service';
import { CredentialResponse } from 'google-one-tap';
import { Router } from '@angular/router';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public user : any = {};
  public google : any = {};
  public load_btn = false;
  public lvl_password = 0;
  public auth2: any;
  @ViewChild('loginRef', {static: true }) loginElement!: ElementRef;


  constructor(
    private _colaboradorService:ColaboradorService,
    private oauthService:OAuthService,
    private _googleService:GoogleService,
    private _router:Router,
    private _ngZone: NgZone,
  ) { 
  }

  ngOnInit(): void {
    this.initGoogle();
    setTimeout(() => {
      const myPassMeter = passwordStrengthMeter({
				containerElement: '#pswmeter',
				passwordInput: '#psw-input',
				showMessage: true,
				messageContainer: '#pswmeter-message',
				messagesList: [
					'Escribe tu contraseña...',
					'Es muy facil',
					'Puedes mejorar la dificultad',
					'Es una buena contraseña',
					'Tu contraseña es genial!'
				],
				height: 8,
				borderRadius: 4,
				pswMinLength: 8,
				colorScore1: '#dc3545',
				colorScore2: '#f7c32e',
				colorScore3: '#4f9ef8',
				colorScore4: '#0cbc87'
			});

      myPassMeter.containerElement.addEventListener('onScore0', () => {
        console.log(1);
        this.updatePasswordBars(0);
      });
      
      myPassMeter.containerElement.addEventListener('onScore1', () => {
        console.log(2);
        this.updatePasswordBars(1);
      });
      
      myPassMeter.containerElement.addEventListener('onScore2', () => {
        console.log(3);
        this.updatePasswordBars(2);
      });
      
      myPassMeter.containerElement.addEventListener('onScore3', () => {
        console.log(4);
        this.updatePasswordBars(3);
      });
      
      myPassMeter.containerElement.addEventListener('onScore4', () => {
        this.updatePasswordBars(4);
      });

    }, 50);
  }

  initGoogle(){
    (<any>window).onGoogleLibraryLoad = () => {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: '353650599721-rju4glm78cmq94dcad6d3am4vcoi797i.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
  
      // @ts-ignore
      google.accounts.id.renderButton(
        // @ts-ignore
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large", width: 450 } 
      );
  
      // @ts-ignore
      google.accounts.id.prompt((notification: PromptMomentNotification) => {});
    };

    // Load the Google SDK script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
 
  async handleCredentialResponse(response: CredentialResponse) {
    await this.verifyGoogleToken(response.credential);
  }

  async verifyGoogleToken(idToken: string) {
    const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`);
    const userInfo = await googleResponse.json();
    console.log(userInfo);
    this.google.nombres = userInfo.given_name;
    this.google.apellidos = userInfo.family_name;
    this.google.email = userInfo.email;
    this.google.password = userInfo.sub;
    this.google.avatar = userInfo.picture;
    this.google.origen = 'Google';
    this.google.rol = 'En espera';
    this.google.estado = false;
    this._colaboradorService.create_colaborador_google(this.google).subscribe(
      response=>{
        console.log(response);
        if(response.data != undefined){
          if(response.tipo == 'register'){
            toastr.success("Cuenta creada correctamente.");
          }else{
            localStorage.setItem('token',response.token);
            localStorage.setItem('user_data',JSON.stringify(response.data));
            localStorage.setItem('_id',response.data._id);
            localStorage.setItem('parameters',JSON.stringify(response.permisos));
             // @ts-ignore
            this._ngZone.run(() => {
              this._router.navigate(['/dashboard']);
            })
          }
        }else{
          toastr.error(response.message);
        }
      }
    );
  }


  updatePasswordBars(level: number) {
    this.lvl_password = level;

    // Define los colores para cada nivel
    const levelColors = ['#f1416c', '#f1bc00', '#ffa500', '#50cd89'];

    // Elimina todas las clases de nivel
    document.querySelectorAll('.password-bar').forEach(bar => {
        bar.removeAttribute('style');
        bar.classList.remove('level-1', 'level-2', 'level-3', 'level-4');
    });

    // Agrega la clase del nivel actual a cada barra y asigna el color correspondiente
    for (let i = 1; i <= level; i++) {
        const barElement = document.getElementById(`bar${i}`);
        if (barElement !== null) {
            barElement.classList.add(`level-${i}`);
            barElement.style.backgroundColor = levelColors[i - 1];
        }
    }
  }

  signup(){
    this.user.pais = 'Mexico';
    this.user.prefijo = '+52';
    this.user.password = this.user.password.trim();
    this.user.direccion = '';
    this.user.rol = 'En espera';
    this.user.estado = false;
    this.user.origen = 'Publico';

    if(!this.user.nombres){
      toastr.error("Ingrese los nombres por favor.");
    }else if(!this.user.apellidos){
      toastr.error("Ingrese los apellidos por favor.");
    }else if(!this.user.email){
      toastr.error("Ingrese el email por favor.");
    }else if(!this.user.telefono){
      toastr.error("Ingrese el telefono por favor.");
    }else if(!this.user.password){
      toastr.error("Ingrese la contraseña por favor.");
    }else if(this.lvl_password != 4){
      toastr.error("Verifique la contraseña.");
    }else{
      console.log(this.user);
      this.load_btn = true;
      this._colaboradorService.create_colaborador_public(this.user).subscribe(
        response=>{
          console.log(response);
          
          if(response.data != undefined){
            toastr.success("Cuenta creada correctamente.");
          }else{
            toastr.error(response.message);
          }
          this.load_btn = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          this.load_btn = false;
        }
      );
    }
  }

 
}
