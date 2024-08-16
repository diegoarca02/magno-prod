import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ColaboradorService } from 'src/app/services/colaborador.service';
declare var toastr:any;
import * as CryptoJS from 'crypto-js';  
import { CredentialResponse } from 'google-one-tap';
import { AdministradorService } from 'src/app/services/administrador.service';
declare var $:any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public user:any = {};
  public user_google :any = JSON.parse(localStorage.getItem('googleToken')!);
  public token = localStorage.getItem('token');
  public googleToken = '';
  public returnUrl : any= '';
  public load_btn = false;
  public response_tipo = '';
  public response_id = '';
  public codigo = '';
  public load_reenviar = false;
  public google : any = {};
  public codes : Array<any> = [];
  public show_password = false;
  public complete_form = false;
  public load_form = false;
  public data_form : any = {
    prefijo: '+51'
  };
  public data_response : any = {};

  constructor(
    private _router:Router,
    private _route:ActivatedRoute,
    private _colaboradorService:ColaboradorService,
    private _adminService:AdministradorService,
    private _ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { 
    console.log(this.user_google);
    
  }

  ngOnInit(): void {
    if(this.token){
      this._router.navigate(['/dashboard']);
    }
    this._route.queryParams.subscribe(
      (params: any)=>{
        console.log(params.returnUrl);
        
        if(params.returnUrl){
          this.returnUrl = params.returnUrl;
        }else{
          this.returnUrl = undefined;
        }
        
        this.initGoogle();
        this.init_codes();
      }
    )
  }

  init_codes(){
    this._adminService.get_Codes().subscribe(
      response=>{
        this.codes = response.countries;
        console.log(this.codes);
        
      }
    );
  }

  
  initializeGoogleSignIn() {
    if (!(<any>window).google || !(<any>window).google.accounts || !(<any>window).google.accounts.id) {
      console.error('Google Sign-In library not available');
      return;
    }

    // Rest of your initialization code
    (<any>window).onGoogleLibraryLoad = () => {
      // @ts-ignore
      //353650599721-rju4glm78cmq94dcad6d3am4vcoi797i.apps.googleusercontent.com
      //23374169871-gh5u4cahassu9ehqq2b122assee3o2lt.apps.googleusercontent.com
      google.accounts.id.initialize({
        client_id: '23374169871-gh5u4cahassu9ehqq2b122assee3o2lt.apps.googleusercontent.com',
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
  }
  
  initGoogle() {
    // Load the Google SDK script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.initializeGoogleSignIn();
    };

    script.onerror = (error) => {
      console.error('Error loading Google SDK:', error);
    };

    document.head.appendChild(script);
  }
 
  logoutGoogle(){
    localStorage.removeItem('googleToken');
    this.user_google = null;
  }

  async handleCredentialResponse(response: CredentialResponse) {
    await this.verifyGoogleToken(response.credential);
  }

  async verifyGoogleToken(idToken: string) {
    const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`);
    const userInfo = await googleResponse.json();
    this.googleToken = JSON.stringify(userInfo);
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

            this.data_response = {
              token: response.token,
              data: response.data,
              permisos: response.permisos,
              googleToken: this.googleToken
            }

            if(!response.data.prefijo||!response.data.telefono||!response.data.pais||!response.data.direccion||!response.data.nacimiento){
              this.complete_form = true;
              this.data_form = response.data;
              this.init_codes();
              this.cdr.detectChanges();
             
              console.log(this.complete_form);
              console.log(1);
              
            }else{
              this.redirect();
              console.log(2);

            }

   
          }
        }else{
          toastr.error(response.message);
        }
      }
    );
  }



  login(){
    const value = parseFloat(this.user.username);

    if (!isNaN(value)) {
        this.user.tipo = 'Telefono';
    } else {
        this.user.tipo = 'Email';
    }

    if(!this.user.username){
      toastr.error("Ingresa tu correo por favor.");
    }else if(!this.user.password){
      toastr.error("Ingresa tu contraseña por favor.");
    }else{
      this.init_login(this.user);
    }
  }

  init_login(user:any){
    this.load_btn = true;
    this._colaboradorService.signin_colaborador(user).subscribe(
      response=>{
        console.log(response);
        if(response.data != undefined){
          this.response_tipo = response.response_tipo;
          this.response_id = response.data._id;
          console.log(this.response_id);

          this.data_response = {
            token: response.token,
            data: response.data,
            permisos: response.permisos,
          }
          
          if(this.response_tipo == 'Email'){
            if(!response.data.prefijo||!response.data.telefono||!response.data.direccion||!response.data.nacimiento){
              this.complete_form = true;
              this.data_form = response.data;
              this.init_codes();
              this.cdr.detectChanges();
            }else{
              this.redirect();
            }
          }
        
        }else{
          toastr.error(response.message);
        }

        this.load_btn = false;
      },
      error=>{
        toastr.error('Hubo un problema en el servidor.');
      }
    );
  }

  redirect(){
    localStorage.setItem('token',this.data_response.token);
    localStorage.setItem('user_data',JSON.stringify(this.data_response.data));
    localStorage.setItem('_id',this.data_response.data._id);
    localStorage.setItem('parameters',JSON.stringify(this.data_response.permisos));

    if(this.returnUrl == undefined){
      this._ngZone.run(() => {
        this._router.navigate(['/dashboard']);
      });
    }else{
      window.location.href = this.returnUrl;
    }
  }

  validate(){
    this.load_btn = true;
    this._colaboradorService.validar_codigo_colaborador({
      _id: this.response_id,
      codigo: this.codigo
    }).subscribe(
      response=>{
        console.log(response);
        if(response.data != undefined){
          localStorage.setItem('token',response.token);
          localStorage.setItem('user_data',JSON.stringify(response.data));
          localStorage.setItem('_id',response.data._id);
          localStorage.setItem('parameters',JSON.stringify(response.permisos));
          this._router.navigate(['/dashboard']);
        }else{
          toastr.error(response.message);
        }

        this.load_btn = false;
      },
      error=>{
        toastr.error('Hubo un problema en el servidor.');
        this.load_btn = false;
      }
    );
  }

  reenviar_codigo(){
    this.load_reenviar = true;
    this._colaboradorService.reenviar_codigo_login(this.response_id).subscribe(
      response=>{
        if(response.data){
          toastr.success('Se envió el nuevo código.');
        }else{
          toastr.error('Hubo un problema en el servidor.');
        }
        this.load_reenviar = false;
      }
    );
  }

  actualizar(){
 
    if(!this.data_form.prefijo){
      toastr.error("Seleccione el prefijo por favor.");
    }else if(!this.data_form.telefono){
      toastr.error("Ingrese el telefono por favor.");
    }else if(!this.data_form.nacimiento){
      toastr.error("Seleccione el nacimiento por favor.");
    }else if(!this.data_form.direccion){
      toastr.error("Ingrese la dirección por favor.");
    }else{
      this.load_form = true;
      this._colaboradorService.update_colaborador(this.data_form,this.data_form._id,this.data_response.token).subscribe(
        response=>{
          if(response.data != undefined){
            toastr.success("Actualización completada.");
            this.redirect();
          }else{
            toastr.error(response.message);
          }
          this.load_form = false;
        },
        error=>{
          toastr.error("Ocurrió un error.");
          this.load_form = false;
        }
      );
      
    }
  }
}
