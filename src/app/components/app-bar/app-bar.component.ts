import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-row justify-between items-end pt-4 px-4">
      <div (click)="navigateHome()" class="flex flex-row items-center cursor-pointer">
        <img 
          src="/assets/whoiswho-logo.svg" 
          alt="WhoIsWho Logo"
          class="size-8"
        >
        <span class="text-red-600 font-mono text-3xl font-bold ml-2">WhoIsWho</span>
      </div>

      <span *ngIf="showUsername" (click)="navigateProfile()"
       class="font-mono text-blue-600 active:text-blue-400 font-semibold text-lg cursor-pointer"> {{username}} </span>
    </div>
  `,
})
export class AppBarComponent {

  @Input() showUsername = true

  router = inject(Router)
  username = localStorage.getItem('auth-username')

  navigateProfile() {
    this.router.navigate(['profile'])
  }

  navigateHome() {
    this.router.navigate(['home'])
  }
}
