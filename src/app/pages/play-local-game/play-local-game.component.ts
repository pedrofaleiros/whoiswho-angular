import { Component, inject, OnInit } from '@angular/core';
import { LocalGameService } from '../../services/local-game.service';
import { LocalGame } from '../../models/local-game';
import { CommonModule, Location } from '@angular/common';
import { BackButtonComponent } from "../../components/back-button/back-button.component";

@Component({
  selector: 'app-play-local-game',
  standalone: true,
  imports: [CommonModule, BackButtonComponent],
  templateUrl: './play-local-game.component.html',
})
export class PlayLocalGameComponent implements OnInit {

  location = inject(Location)
  service = inject(LocalGameService)

  game = new LocalGame("", [])
  loading = true;

  ngOnInit() {
    this.game = this.service.game

    if (this.game.gameEnv === '') {
      this.location.back()
    }
  }
}
