import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
    let router = inject(Router)

    let token = localStorage.getItem('auth-token')
    if (token && !router.url.includes("/auth")) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        })
    }

    return next(req).pipe(
        // catchError((err: any) => {
        //     if (err instanceof HttpErrorResponse) {
        //         if (err.status === 401) {
        //             alert('401 - tratar aqui');
        //             router.navigate(['/login']);
        //         } else if (err.status === 403) {
        //             alert('403 - tratar aqui');
        //             router.navigate(['/login']);
        //         } else {
        //             console.error('HTTP error:', err);
        //         }
        //     } else {
        //         console.error('An error occurred:', err);
        //     }
        //     return throwError(() => err);
        // })
    );
}