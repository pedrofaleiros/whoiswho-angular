import { Component } from '@angular/core';

@Component({
  selector: 'app-app-bar',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-row justify-between p-4 items-center">
      <div class="flex flex-row items-center">
        <img 
          src="/assets/whoiswho-logo.svg" 
          alt="WhoIsWho Logo"
          class="size-8"
        >
        <span class="text-red-600 font-mono text-2xl font-bold ml-2">WhoIsWho</span>
      </div>
      <span class="font-mono text-blue-500 font-semibold text-xl"> {{username}} </span>
    </div>
  `,
})
export class AppBarComponent {

  username = localStorage.getItem('auth-username')
}
