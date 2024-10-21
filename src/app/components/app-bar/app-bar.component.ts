import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex flex-row justify-between items-end pt-4 px-4">
      <div (click)="navigateHome()" class="flex flex-row items-center cursor-pointer">
        <img 
          src="/assets/whoiswho-logo.svg" 
          alt="WhoIsWho Logo"
          class="size-6"
        >
        <span class="text-red-600 font-mono text-xl font-bold ml-2">WhoIsWho</span>
      </div>

      <button *ngIf="showTrailing" (click)="navigateProfile()" class="flex flex-row items-center text-blue-600">
        <mat-icon>settings</mat-icon>
        
        <!-- <span *ngIf="showUsername" (click)="navigateProfile()"
        class="font-mono text-blue-600 active:text-blue-400 font-semibold text-base cursor-pointer"> {{username}} </span>
         -->
      </button>
    </div>
  `,
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
