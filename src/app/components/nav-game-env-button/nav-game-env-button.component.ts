import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-game-env-button',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <button
      (click)="navigateGameEnvs()"
      class="w-full bg-gray-900 rounded-lg p-3 flex flex-row justify-between text-white active:bg-gray-800 cursor-pointer"
    >
      <p class="w-full text-left">Ambientes</p>
      <mat-icon class="text-gray-400">chevron_right</mat-icon>
    </button>
  `,
})
export class NavGameEnvButtonComponent {

  router = inject(Router)

  navigateGameEnvs() {
    this.router.navigate(['gameEnvs'])
  }
}
