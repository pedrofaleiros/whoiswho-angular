import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(private router: Router) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const authToken = localStorage.getItem('auth-token')

    if (authToken) {
      return true;
    }

    this.router.navigate(["/login"])
    return false
  }
}

export const AuthGuard: CanActivateFn = (next, state): boolean => {
  return inject(AuthGuardService).canActivate(next, state)
}
