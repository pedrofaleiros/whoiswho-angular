import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-impostors-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './impostors-button.component.html',
})
export class ImpostorsButtonComponent {

  @Input() impostors: number = 0;
  @Output() onClick = new EventEmitter<void>();

  handleClick() {
    this.onClick.emit();
  }
}
