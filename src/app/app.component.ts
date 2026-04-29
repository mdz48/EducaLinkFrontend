import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'EducaLink';

  showDemoModal = false;
  serverReady = false;
  private pollTimer: any = null;
  private readonly POLL_INTERVAL_MS = 4000;
  private readonly SESSION_KEY = 'demoNoticeShown';

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (sessionStorage.getItem(this.SESSION_KEY) === '1') return;

    this.showDemoModal = true;
    this.pollHealth();
  }

  ngOnDestroy(): void {
    this.clearPoll();
  }

  private pollHealth(): void {
    this.authService.checkHealth().subscribe({
      next: () => {
        this.serverReady = true;
        this.clearPoll();
      },
      error: () => {
        this.pollTimer = setTimeout(() => this.pollHealth(), this.POLL_INTERVAL_MS);
      }
    });
  }

  private clearPoll(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  dismissDemoModal(): void {
    this.showDemoModal = false;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.SESSION_KEY, '1');
    }
  }
}
