import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, NavigationEnd, Router, RouterStateSnapshot, RoutesRecognized, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ColaboradorService } from '../services/colaborador.service';
import { filter, pairwise } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private _router:Router,
 
    private _colaboradorService:ColaboradorService,
  ){

   
  }

  /* http://localhost:4200/crm/clientes */

  canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot):any{
    let access:any = this._colaboradorService.isAuthenticate();

    if(!access){
      this._router.navigate(['/'], { queryParams: state.url ? { returnUrl: state.url } : {} });
      return false;
    }
    return true;
  }
  
}
