import { Location } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div
      (click)="navigateBack()"
      class="flex flex-row items-center mt-2 text-blue-600 active:text-blue-400"
    >
      <mat-icon class="">chevron_left</mat-icon>
      <button class="text-lg">{{text}} </button>
    </div>
  `,
})
export class BackButtonComponent {

  @Input() text = "Voltar"
  location = inject(Location)
  toast = inject(ToastrService)

  navigateBack() {
    this.toast.clear()
    this.location.back()
  }
}
