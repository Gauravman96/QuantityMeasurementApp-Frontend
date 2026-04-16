import { Component, OnInit, PLATFORM_ID, Inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { APP_PATHS } from '../../core/config/app-config';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  activeAction: string = 'COMPARE';
  arithmeticOp: string = 'ADD';
  errorMsg: string = '';
  loading: boolean = false;

  resultData: {
    label: string;
    mainLine: string;
    answer: string;
    isEqual?: boolean;
  } | null = null;

  value1: number = 0;
  unit1: string = 'FEET';
  measurementType1: string = 'LENGTH';

  value2: number = 0;
  unit2: string = 'INCH';
  measurementType2: string = 'LENGTH';

  targetUnit: string = 'INCH';

  unitOptions: Record<string, string[]> = {
    LENGTH: ['FEET', 'INCH', 'CM', 'METER'],
    WEIGHT: ['KG', 'GRAM', 'POUND', 'OUNCE'],
    VOLUME: ['LITER', 'ML', 'GALLON', 'CUP']
  };

  get availableUnits(): string[] {
    return this.unitOptions[this.measurementType1] || [];
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        localStorage.setItem('token', token);
        window.history.replaceState({}, document.title, '/dashboard');
      }

      this.route.queryParams.subscribe(params => {
        if (params['token']) {
          this.authService.saveToken(params['token']);
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }
      });

      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/login']);
      }
    }
  }

  setAction(action: string) {
    this.activeAction = action;
    this.resultData = null;
    this.errorMsg = '';
    if (action === 'ARITHMETIC') {
      this.arithmeticOp = 'ADD';
    }
  }

  setArithmeticOp(op: string) {
    this.arithmeticOp = op;
    this.resultData = null;
    this.errorMsg = '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onTypeChange() {
    const units = this.unitOptions[this.measurementType1];
    this.unit1 = units[0];
    this.unit2 = units[1] || units[0];
    this.targetUnit = units[1] || units[0];
    this.measurementType2 = this.measurementType1;
    this.resultData = null;
    this.errorMsg = '';
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  calculate() {
    this.resultData = null;
    this.errorMsg = '';
    this.loading = true;
    this.cdr.detectChanges();

    if (!this.authService.isLoggedIn()) {
      this.errorMsg = 'Not logged in. Redirecting...';
      setTimeout(() => this.router.navigate(['/login']), 1500);
      this.loading = false;
      return;
    }

    let url = '';
    if (this.activeAction === 'COMPARE') {
      url = `${APP_PATHS.quantityApi}/compare`;
    } else if (this.activeAction === 'CONVERT') {
      url = `${APP_PATHS.quantityApi}/convert`;
    } else if (this.activeAction === 'ARITHMETIC') {
      if (this.arithmeticOp === 'ADD') {
        url = `${APP_PATHS.quantityApi}/add`;
      }
      if (this.arithmeticOp === 'SUBTRACT') {
        url = `${APP_PATHS.quantityApi}/subtract`;
      }
      if (this.arithmeticOp === 'MULTIPLY') {
        url = `${APP_PATHS.quantityApi}/multiply`;
      }
      if (this.arithmeticOp === 'DIVIDE') {
        url = `${APP_PATHS.quantityApi}/divide`;
      }
    }

    const data = this.activeAction === 'CONVERT'
      ? {
          thisQuantityDTO: {
            value: this.value1,
            unit: this.unit1,
            measurementType: this.measurementType1
          },
          thatQuantityDTO: {
            value: 0,
            unit: this.targetUnit,
            measurementType: this.measurementType1
          }
        }
      : {
          thisQuantityDTO: {
            value: this.value1,
            unit: this.unit1,
            measurementType: this.measurementType1
          },
          thatQuantityDTO: {
            value: this.value2,
            unit: this.unit2,
            measurementType: this.measurementType2
          }
        };

    const activeAction = this.activeAction;
    const arithmeticOp = this.arithmeticOp;
    const value1 = this.value1;
    const unit1 = this.unit1;
    const value2 = this.value2;
    const unit2 = this.unit2;
    const targetUnit = this.targetUnit;

    this.http.post<any>(url, data).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.loading = false;

          if (res.error === true) {
            this.errorMsg = res.errorMessage || 'Operation failed on server.';
            this.cdr.detectChanges();
            return;
          }

          if (activeAction === 'COMPARE') {
            const isEqual = res.resultString === 'true';
            this.resultData = {
              label: 'Compare Result',
              mainLine: `${value1} ${unit1}  vs  ${value2} ${unit2}`,
              answer: isEqual ? 'Both are EQUAL' : 'They are NOT equal',
              isEqual
            };
          } else if (activeAction === 'CONVERT') {
            this.resultData = {
              label: 'Convert Result',
              mainLine: `${value1} ${unit1}  ->  ${targetUnit}`,
              answer: (res.resultValue !== null && res.resultValue !== undefined)
                ? `${res.resultValue} ${res.resultUnit || targetUnit}`
                : `Conversion from ${unit1} to ${targetUnit} not supported yet`
            };
          } else if (activeAction === 'ARITHMETIC') {
            const opSymbol =
              arithmeticOp === 'ADD' ? '+' :
              arithmeticOp === 'SUBTRACT' ? '-' :
              arithmeticOp === 'MULTIPLY' ? 'x' : '/';

            this.resultData = {
              label: `${arithmeticOp} Result`,
              mainLine: `${value1} ${unit1}  ${opSymbol}  ${value2} ${unit2}`,
              answer: (res.resultValue !== null && res.resultValue !== undefined)
                ? `${res.resultValue} ${res.resultUnit || ''}`
                : 'Operation not supported yet'
            };
          }

          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.loading = false;

          if (err.status === 0) {
            this.errorMsg = 'Cannot reach the backend service.';
          } else if (err.status === 401) {
            this.errorMsg = 'Session expired. Please login again.';
            this.authService.logout();
            this.router.navigate(['/login']);
          } else if (err.status === 403) {
            this.errorMsg = 'Access denied (403).';
          } else if (err.status === 400) {
            this.errorMsg = 'Bad request (400). Check values entered.';
          } else if (err.status === 500) {
            this.errorMsg = 'Server error (500). Check backend logs.';
          } else {
            this.errorMsg = `Unexpected error ${err.status}.`;
          }

          this.cdr.detectChanges();
        });
      }
    });
  }
}
