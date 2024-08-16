import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-verification-cliente',
  templateUrl: './verification-cliente.component.html',
  styleUrls: ['./verification-cliente.component.css']
})
export class VerificationClienteComponent implements OnInit {

  public load = true;
  public msm = '';
  public email = '';
  public token = '';
  public tipo = '';

  constructor(
    private _route:ActivatedRoute,
    private _clienteService:ClienteService
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        this.tipo = params['tipo'];
        this.token = params['token'];


        if(this.token){
          
            this._clienteService.verification_email_cliente(this.tipo,this.token).subscribe(
              response=>{
                console.log(response);
                this.msm = 'La cuenta '+ response.data.email+' fué verificada correctamente';
                this.email =  response.data.email;
                this.load = false;
              },
              error=>{
                console.log(error);
                this.msm = error.error.message;
                this.load = false;
              }
            );
        }
      }
    );
  }

}
