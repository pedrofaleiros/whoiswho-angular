import { Component, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environment/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  providers: [{ provide: 'API_URL', useValue: environment.API_URL }]
})
export class AppComponent {
  
  constructor(@Inject('API_URL') public apiUrl: string) { }
}
