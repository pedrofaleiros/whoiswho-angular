import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { AuthService } from "./auth.service";

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
    let router = inject(Router)
    let authService = inject(AuthService)

    let token = localStorage.getItem('auth-token')
    if (token && (!router.url.includes("/login") || !router.url.includes("/signup"))) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        })
    }

    return next(req).pipe(
        catchError((err: any) => {
            if (err instanceof HttpErrorResponse) {
                let status = err.status                
                if(status === 0){
                    alert("Erro de CORS")
                } else if (status === 401 || status === 403) {
                    authService.logout(router)
                }
            }
            return throwError(() => err);
        })
    );
}