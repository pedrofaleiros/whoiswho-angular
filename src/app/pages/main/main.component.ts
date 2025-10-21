import { Component } from '@angular/core';
import { AppModule } from '../../app.module';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [AppModule],
  template: `
    <router-outlet />
  `,
})
export class MainComponent {

}
