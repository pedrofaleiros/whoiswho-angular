import { Component, inject } from '@angular/core';
import { AppModule } from '../../app.module';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AppModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {

  router = inject(Router)
  authService = inject(AuthService)
  toast = inject(ToastrService)

  username = localStorage.getItem('auth-username') ?? ""
  usernameInput = ""
  errorMessage: string | null = null

  constructor() {
    this.usernameInput = this.username
  }

  logout() {
    if (confirm("Deseja sair da conta?")) {
      this.authService.logout(this.router)
    }
  }

  save() {
    this.toast.clear()
    if (this.usernameInput === "") return

    if (this.usernameInput === this.username) {
      this.toast.success("Alterado com sucesso.")
      return
    }

    this.authService.update(this.usernameInput).subscribe({
      next: (data) => {
        this.toast.success("Alterado com sucesso.")
        this.username = data.username
        this.usernameInput = this.username
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error.message
      }
    })
  }
}
