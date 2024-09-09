import { Component, inject } from '@angular/core';
import { GameEnvListComponent } from "../../components/game-env-list/game-env-list.component";
import { AppBarComponent } from "../../components/app-bar/app-bar.component";
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { NavGameEnvButtonComponent } from "../../components/nav-game-env-button/nav-game-env-button.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [GameEnvListComponent, AppBarComponent, MatIconModule, FormsModule, CommonModule, BackButtonComponent, NavGameEnvButtonComponent],
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
