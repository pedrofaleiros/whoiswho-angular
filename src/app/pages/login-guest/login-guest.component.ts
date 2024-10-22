import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { BackButtonComponent } from "../../components/back-button/back-button.component";

@Component({
  selector: 'app-login-guest',
  standalone: true,
  imports: [ReactiveFormsModule, BackButtonComponent],
  templateUrl: './login-guest.component.html',
})
export class LoginGuestComponent {

  guestForm!: FormGroup
  service = inject(AuthService)
  router = inject(Router)
  toast = inject(ToastrService)

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
    let username = this.guestForm.value.username
    if (username === "") {
      return
    }

    this.service.loginGuest(username).subscribe({
      next: (value) => {
        this.router.navigate(["home"])
      },
      error: (err: HttpErrorResponse) => {
        this.toast.clear()
        if (err.error.message) {
          this.toast.error(err.error.message)
        } else {
          this.toast.error("Erro inesperado")
        }
      }
    })
  }
}
