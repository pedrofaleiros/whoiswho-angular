import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AppBarComponent } from "../../components/app-bar/app-bar.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, AppBarComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  loginForm!: FormGroup
  service = inject(AuthService)
  router = inject(Router)
  toast = inject(ToastrService)

  showPassword = false

  setShowPassword() {
    this.showPassword = !this.showPassword;
  }

  constructor() {
    let token = localStorage.getItem('auth-token')
    if (token) {
      this.router.navigate(["home"])
      return
    }

    this.loginForm = new FormGroup({
      username: new FormControl(""),
      password: new FormControl(""),
    })

  }

  submit() {
    let username = this.loginForm.value.username
    let password = this.loginForm.value.password

    if (username === "" || password === "") {
      this.toast.warning("Preencha todos os campos")
      return
    }

    this.service.login(username, password).subscribe({
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

  loginGuest() {
    this.router.navigate(['guest'])
  }

  navigate() {
    this.router.navigate(['signup'])
  }

}
