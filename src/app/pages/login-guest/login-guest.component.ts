import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-guest',
  standalone: true,
  imports: [ReactiveFormsModule, BackButtonComponent, CommonModule],
  templateUrl: './login-guest.component.html',
})
export class LoginGuestComponent {

  guestForm!: FormGroup
  service = inject(AuthService)
  router = inject(Router)
  toast = inject(ToastrService)

  isLoading = false;

  constructor() {
    let token = localStorage.getItem('auth-token')
    if (token) {
      this.router.navigate(["home"])
      return
    }

    this.guestForm = new FormGroup({
      username: new FormControl(""),
    })

  }

  submit() {
    if(this.isLoading) return;
    
    let username = this.guestForm.value.username
    if (username === "") {
      return
    }

    this.isLoading = true;
    this.service.loginGuest(username).subscribe({
      next: (value) => {
        this.isLoading = false;
        this.router.navigate(["home"])
      },
      error: (err: HttpErrorResponse) => {
        this.toast.clear()
        this.isLoading = false;
        if (err.error.message) {
          this.toast.error(err.error.message)
        } else {
          this.toast.error("Erro inesperado")
        }
      }
    })
  }
}
