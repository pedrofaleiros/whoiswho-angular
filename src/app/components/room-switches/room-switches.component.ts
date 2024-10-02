import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-room-switches',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-switches.component.html',
})
export class RoomSwitchesComponent {

  @Input() includeDefaultGameEnvs!: boolean;
  @Input() includeUserGameEnvs!: boolean
  @Output() onClickUser = new EventEmitter<void>();
  @Output() onClickDefault = new EventEmitter<void>();

  handleClickDefault() {
    this.onClickDefault.emit()
  }

  handleClickUser() {
    this.onClickUser.emit()
  }
}
