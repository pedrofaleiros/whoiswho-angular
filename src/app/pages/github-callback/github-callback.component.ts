import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-github-callback',
  standalone: true,
  template: `
    <div class="w-full flex flex-col items-center p-6 text-white">
      <p class="mt-10">Processando login com GitHub...</p>
    </div>
  `,
})
export class GithubCallbackComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastrService);
  private auth = inject(AuthService);

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const code = params.get('code');
      const state = params.get('state');
      const savedState = sessionStorage.getItem('gh-oauth-state');

      if (!code || !state || !savedState || state !== savedState) {
        this.toast.error('Falha ao validar retorno do GitHub');
        this.router.navigate(['login']);
        return;
      }

      sessionStorage.removeItem('gh-oauth-state');

      this.auth.exchangeGithubCode(code).subscribe({
        next: () => {
          this.router.navigate(['home']);
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Não foi possível finalizar o login com GitHub');
          this.router.navigate(['login']);
        },
      });
    });
  }
}

