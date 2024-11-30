import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { AppBarComponent } from "../../components/app-bar/app-bar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, AppBarComponent, CommonModule],
  templateUrl: './signup.component.html'
})
export class SignupComponent {

  signupForm!: FormGroup
  service = inject(AuthService)
  router = inject(Router)
  toast = inject(ToastrService)

  showPassword = false

  isLoading = false;

  setShowPassword() {
    this.showPassword = !this.showPassword;
  }

  constructor() {
    this.signupForm = new FormGroup({
      username: new FormControl(""),
      password: new FormControl(""),
      passwordConfirm: new FormControl(""),
    })
  }

  submit() {
    if (this.isLoading) return;

    let username = this.signupForm.value.username
    let password = this.signupForm.value.password
    let passwordConfirm = this.signupForm.value.passwordConfirm

    if (username === "" || password === "" || passwordConfirm === "") {
      this.toast.warning("Preencha todos os campos")
      return
    }

    if (password !== passwordConfirm) {
      this.toast.warning("Verifique a senha")
      return
    }

    this.isLoading = true;
    this.service.signup(username, password).subscribe({
      next: (value) => {
        this.isLoading = false;
        this.toast.success("Cadastrado com sucesso")
        this.router.navigate(["home"])
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.toast.clear()
        if (err.error.message) {
          this.toast.error(err.error.message)
        } else {
          this.toast.error("Erro inesperado")
        }
      }
    })
  }

  navigate() {
    if (this.isLoading) return;
    this.router.navigate(['login'])
  }
}
