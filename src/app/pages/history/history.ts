import { Component, OnInit, PLATFORM_ID, Inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { APP_PATHS } from '../../core/config/app-config';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class HistoryComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  history: any[] = [];
  filteredHistory: any[] = [];
  loading: boolean = false;
  errorMsg: string = '';
  selectedOperation: string = 'ALL';

  operations = ['ALL', 'COMPARE', 'CONVERT', 'ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/login']);
        return;
      }
      this.loadHistory();
    }
  }

  // 🔥 LOAD HISTORY
  loadHistory() {
    this.loading = true;
    this.errorMsg = '';

    this.http.get<any[]>(`${APP_PATHS.historyApi}/me`)
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.loading = false;
            this.history = res;
            this.filterByOperation(this.selectedOperation);
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.loading = false;
            if (err.status === 401) {
              this.authService.logout();
              this.router.navigate(['/login']);
            } else {
              this.errorMsg = 'Failed to load history.';
            }
            this.cdr.detectChanges();
          });
        }
      });
  }

  filterByOperation(op: string) {
    this.selectedOperation = op;
    if (op === 'ALL') {
      this.filteredHistory = this.history;
    } else {
      this.filteredHistory = this.history.filter(h => h.operation === op);
    }
  }

  getOperationSymbol(op: string): string {
    switch(op) {
      case 'ADD':      return '➕';
      case 'SUBTRACT': return '➖';
      case 'MULTIPLY': return '✖️';
      case 'DIVIDE':   return '➗';
      case 'COMPARE':  return '🔁';
      case 'CONVERT':  return '🔄';
      default:         return '📊';
    }
  }

  getResultDisplay(item: any): string {
    if (item.operation === 'COMPARE') {
      return item.resultString === 'true' ? 'EQUAL ✅' : 'NOT EQUAL ❌';
    }
    if (item.resultValue !== null && item.resultValue !== undefined) {
      return `${item.resultValue} ${item.resultUnit || ''}`;
    }
    return 'N/A';
  }

  // DELETE ONE
// deleteOne(id: number) {
//   if (!confirm('Delete this record?')) return;

//   this.http.delete(`http://localhost:8080/api/v1/history/${id}`, { responseType: 'text' })
//     .subscribe({
//       next: () => {
//         this.history = this.history.filter(h => h.id !== id);
//         this.filterByOperation(this.selectedOperation);
//       },
//       error: () => {
//         alert('Delete failed');
//       }
//     });
// }
deleteOne(id: number) {
  if (!confirm('Delete this record?')) return;

  this.http.delete(`${APP_PATHS.historyApi}/${id}`, {
    responseType: 'text'
  })
  .subscribe({
    next: () => {
      this.ngZone.run(() => {
        this.history = this.history.filter(h => h.id !== id);
        this.filterByOperation(this.selectedOperation);

        this.cdr.detectChanges();   // 🔥 MAIN FIX
      });
    },
    error: () => {
      alert('Delete failed');
    }
  });
}

// DELETE ALL
// deleteAll() {
//   if (!confirm('Delete ALL history?')) return;

//   this.http.delete(`http://localhost:8080/api/v1/history/all`, { responseType: 'text' })
//     .subscribe({
//       next: () => {
//         this.history = [];
//         this.filteredHistory = [];
//       },
//       error: () => {
//         alert('Delete all failed');
//       }
//     });
// }
deleteAll() {
  if (!confirm('Delete ALL history?')) return;

  this.http.delete(`${APP_PATHS.historyApi}/all`, {
    responseType: 'text'
  })
  .subscribe({
    next: () => {
      this.ngZone.run(() => {
        this.history = [];
        this.filteredHistory = [];

        this.cdr.detectChanges();   // 🔥 MAIN FIX
      });
    },
    error: () => {
      alert('Delete all failed');
    }
  });
}


goToDashboard() {
  this.router.navigate(['/dashboard']);
}

logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
}
}
