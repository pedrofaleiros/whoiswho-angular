import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './app-bar.component.html'
})
export class AppBarComponent {

  @Input() showTrailing = true

  router = inject(Router)
  username = localStorage.getItem('auth-username')

  navigateProfile() {
    this.router.navigate(['profile'])
  }

  navigateHome() {
    this.router.navigate(['home'])
  }
}
