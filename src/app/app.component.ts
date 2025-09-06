import { Component, Inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  providers: [{ provide: 'API_URL', useValue: environment.API_URL }]
})
export class AppComponent implements OnInit {

  constructor(@Inject('API_URL') public apiUrl: string, private http: HttpClient) { }

  ngOnInit() {
    this.http.get(`${environment.API_URL}/hello`, { responseType: 'text' }).subscribe({
      error: () => { }
    });
    this.http.get(`${environment.SOCKET_URL}/`).subscribe({
      error: () => { }
    });
  }
}
