import {
  ChangeDetectionStrategy, Component, EventEmitter,
  Injectable, Output, computed, inject, input, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { delay, map, of } from 'rxjs';
import { NocType } from '../core/models';

export interface PaymentResult {
  orderId: string;
  paymentId: string;
  challanNumber: string;
  amount: number;
  paidAt: string;
}

@Injectable({ providedIn: 'root' })
export class MockPaymentService {
  calculateFee(_nocType: NocType, _treeCount: number): number {
    return 2000; // ₹2,000 flat fee per requirements v4 (PAY-01); confirm per-tree vs flat with PMRDA
  }

  processPayment(amount: number) {
    const orderId = 'order_' + Math.random().toString(36).substring(2, 14).toUpperCase();
    const paymentId = 'pay_' + Math.random().toString(36).substring(2, 18);
    const seq = String(Math.floor(Math.random() * 90000) + 10000);
    const challanNumber = `PMRDA/CHALLAN/2026/${seq}`;
    const result: PaymentResult = { orderId, paymentId, challanNumber, amount, paidAt: new Date().toISOString() };
    return of(result).pipe(delay(2200));
  }
}

type ModalState = 'idle' | 'processing' | 'success';

@Component({
  selector: 'app-payment-modal',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rp-backdrop" (click)="onBackdrop($event)">
      <div class="rp-modal" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="rp-header">
          <div class="rp-brand">
            <div class="rp-logo"><i class="fa-solid fa-bolt"></i></div>
            <div>
              <div class="rp-merchant">PMRDA Tree Authority</div>
              <div class="rp-amount">₹{{ amtDisplay() }}</div>
            </div>
          </div>
          @if (state() !== 'success') {
            <button class="rp-close" (click)="cancel()">✕</button>
          }
        </div>

        <!-- Idle: payment form -->
        @if (state() === 'idle') {
          <div class="rp-tabs">
            @for (t of tabs; track t.id) {
              <button class="rp-tab" [class.active]="tab() === t.id" (click)="tab.set(t.id)">{{ t.label }}</button>
            }
          </div>

          <!-- UPI -->
          @if (tab() === 'upi') {
            <div class="rp-body">
              <div class="rp-field">
                <label>UPI ID / VPA</label>
                <input class="rp-input" [(ngModel)]="upiId" placeholder="yourname@hdfc  or  8888888888@upi" />
                <span class="rp-hint">Works with HDFC, SBI, ICICI, or any UPI bank</span>
              </div>
              <div class="rp-divider"><span>OR pay with app</span></div>
              <div class="rp-apps">
                @for (a of upiApps; track a.name) {
                  <button class="rp-app-btn" (click)="upiId = a.handle; pay()">
                    <span class="rp-app-icon" [style.background]="a.color">{{ a.icon }}</span>
                    <span>{{ a.name }}</span>
                  </button>
                }
              </div>
              <button class="rp-pay-btn" [disabled]="!upiId.trim()" (click)="pay()">
                <i class="fa-solid fa-lock"></i> Pay ₹{{ amtDisplay() }}
              </button>
            </div>
          }

          <!-- Cards -->
          @if (tab() === 'cards') {
            <div class="rp-body">
              <div class="rp-field">
                <label>Card Number</label>
                <input class="rp-input" [(ngModel)]="cardNum" placeholder="0000  0000  0000  0000" maxlength="19" />
              </div>
              <div class="rp-row">
                <div class="rp-field">
                  <label>Expiry</label>
                  <input class="rp-input" [(ngModel)]="cardExp" placeholder="MM / YY" maxlength="5" />
                </div>
                <div class="rp-field">
                  <label>CVV</label>
                  <input class="rp-input" [(ngModel)]="cardCvv" placeholder="•••" maxlength="3" type="password" />
                </div>
              </div>
              <div class="rp-field">
                <label>Name on Card</label>
                <input class="rp-input" [(ngModel)]="cardName" placeholder="RAJESH KUMAR" />
              </div>
              <div class="rp-bank-logos">
                <span class="rp-bank-tag hdfc">HDFC</span>
                <span class="rp-bank-tag sbi">SBI</span>
                <span class="rp-bank-tag icici">ICICI</span>
                <span class="rp-bank-tag axis">Axis</span>
              </div>
              <button class="rp-pay-btn" [disabled]="!cardNum || !cardExp || !cardCvv" (click)="pay()">
                <i class="fa-solid fa-lock"></i> Pay ₹{{ amtDisplay() }}
              </button>
            </div>
          }

          <!-- Net Banking -->
          @if (tab() === 'nb') {
            <div class="rp-body">
              <div class="rp-nb-grid">
                @for (b of banks; track b.code) {
                  <button class="rp-nb-btn" [class.selected]="selBank() === b.code" (click)="selBank.set(b.code)">
                    <i class="fa-solid fa-building-columns"></i>
                    <span>{{ b.name }}</span>
                  </button>
                }
              </div>
              <button class="rp-pay-btn" style="margin-top:16px" [disabled]="!selBank()" (click)="pay()">
                <i class="fa-solid fa-lock"></i> Pay ₹{{ amtDisplay() }}
              </button>
            </div>
          }

          <!-- Wallets -->
          @if (tab() === 'wallets') {
            <div class="rp-body">
              <div class="rp-nb-grid">
                @for (w of wallets; track w) {
                  <button class="rp-nb-btn" [class.selected]="selWallet() === w" (click)="selWallet.set(w)">
                    <i class="fa-solid fa-wallet"></i>
                    <span>{{ w }}</span>
                  </button>
                }
              </div>
              <button class="rp-pay-btn" style="margin-top:16px" [disabled]="!selWallet()" (click)="pay()">
                <i class="fa-solid fa-lock"></i> Pay ₹{{ amtDisplay() }}
              </button>
            </div>
          }
        }

        <!-- Processing -->
        @if (state() === 'processing') {
          <div class="rp-processing">
            <div class="rp-spinner-wrap">
              <div class="rp-spinner-ring"></div>
              <i class="fa-solid fa-lock rp-spinner-icon"></i>
            </div>
            <p class="rp-proc-title">Processing your payment…</p>
            <p class="rp-proc-sub">Please do not close or refresh this page</p>
          </div>
        }

        <!-- Success -->
        @if (state() === 'success') {
          <div class="rp-success">
            <div class="rp-success-ring">
              <i class="fa-solid fa-check"></i>
            </div>
            <h3>Payment Successful!</h3>
            <p class="rp-success-sub">₹{{ amtDisplay() }} paid to PMRDA Tree Authority</p>
            <div class="rp-receipt">
              <div class="rp-receipt-row">
                <span>Payment ID</span><span class="mono">{{ result()!.paymentId }}</span>
              </div>
              <div class="rp-receipt-row">
                <span>Challan No.</span><span class="mono">{{ result()!.challanNumber }}</span>
              </div>
              <div class="rp-receipt-row">
                <span>Amount</span><span>₹{{ amtDisplay() }}</span>
              </div>
              <div class="rp-receipt-row">
                <span>Date &amp; Time</span><span>{{ paidAtFormatted() }}</span>
              </div>
            </div>
            <button class="rp-done-btn" (click)="done()">
              <i class="fa-solid fa-circle-check"></i> Continue to Application
            </button>
          </div>
        }

        <div class="rp-footer">
          <i class="fa-solid fa-lock"></i> 256-bit SSL secured by Razorpay
        </div>
      </div>
    </div>
  `,
  styles: `
    .rp-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .rp-modal {
      background: #fff; border-radius: 8px; width: 100%; max-width: 460px;
      box-shadow: 0 20px 60px rgba(0,0,0,.4); overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* Header */
    .rp-header {
      background: linear-gradient(135deg, #002970 0%, #1a50c8 100%);
      padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;
    }
    .rp-brand { display: flex; align-items: center; gap: 12px; }
    .rp-logo {
      width: 38px; height: 38px; background: rgba(255,255,255,.15); border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 18px;
    }
    .rp-merchant { color: rgba(255,255,255,.8); font-size: 12px; font-weight: 500; }
    .rp-amount { color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -.5px; }
    .rp-close {
      background: rgba(255,255,255,.15); border: none; color: #fff; width: 28px; height: 28px;
      border-radius: 50%; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center;
    }
    .rp-close:hover { background: rgba(255,255,255,.25); }

    /* Tabs */
    .rp-tabs {
      display: flex; border-bottom: 2px solid #eee; padding: 0 20px; background: #fafafa;
    }
    .rp-tab {
      padding: 12px 14px; background: none; border: none; font-size: 13px; font-weight: 500;
      color: #888; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px;
      transition: color .15s, border-color .15s;
    }
    .rp-tab.active { color: #528FF0; border-color: #528FF0; }
    .rp-tab:hover { color: #528FF0; }

    /* Body */
    .rp-body { padding: 20px; }
    .rp-field { margin-bottom: 14px; }
    .rp-field label { display: block; font-size: 12px; font-weight: 600; color: #444; margin-bottom: 6px; }
    .rp-input {
      width: 100%; padding: 10px 12px; border: 1.5px solid #ddd; border-radius: 6px;
      font-size: 14px; outline: none; box-sizing: border-box; transition: border-color .15s;
    }
    .rp-input:focus { border-color: #528FF0; }
    .rp-hint { font-size: 11px; color: #999; margin-top: 4px; display: block; }
    .rp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .rp-divider { text-align: center; margin: 16px 0 12px; position: relative; }
    .rp-divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #eee; }
    .rp-divider span { position: relative; background: #fff; padding: 0 12px; font-size: 12px; color: #999; }

    /* UPI apps */
    .rp-apps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
    .rp-app-btn {
      background: #f5f7ff; border: 1.5px solid #e8ecff; border-radius: 8px; padding: 10px 4px;
      cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 600; color: #333; transition: border-color .15s;
    }
    .rp-app-btn:hover { border-color: #528FF0; }
    .rp-app-icon { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #fff; }

    /* Bank logos */
    .rp-bank-logos { display: flex; gap: 8px; margin: 8px 0 16px; flex-wrap: wrap; }
    .rp-bank-tag { padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; color: #fff; }
    .hdfc { background: #003366; } .sbi { background: #1a237e; }
    .icici { background: #c62828; } .axis { background: #8e0000; }

    /* Net banking */
    .rp-nb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .rp-nb-btn {
      background: #fafafa; border: 1.5px solid #e5e5e5; border-radius: 8px; padding: 12px 10px;
      cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; color: #333;
      transition: border-color .15s, background .15s;
    }
    .rp-nb-btn:hover { border-color: #528FF0; background: #f0f5ff; }
    .rp-nb-btn.selected { border-color: #528FF0; background: #eef3ff; color: #528FF0; font-weight: 600; }
    .rp-nb-btn i { color: #528FF0; }

    /* Pay button */
    .rp-pay-btn {
      width: 100%; padding: 13px; background: #528FF0; color: #fff; border: none;
      border-radius: 6px; font-size: 15px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: background .15s; letter-spacing: .3px;
    }
    .rp-pay-btn:hover:not(:disabled) { background: #3b6fd4; }
    .rp-pay-btn:disabled { opacity: .5; cursor: not-allowed; }

    /* Processing */
    .rp-processing { padding: 48px 20px; text-align: center; }
    .rp-spinner-wrap { position: relative; width: 64px; height: 64px; margin: 0 auto 20px; }
    .rp-spinner-ring {
      position: absolute; inset: 0; border-radius: 50%;
      border: 3px solid #e0e0e0; border-top-color: #528FF0;
      animation: rp-spin 1s linear infinite;
    }
    .rp-spinner-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #528FF0; font-size: 20px; }
    @keyframes rp-spin { to { transform: rotate(360deg); } }
    .rp-proc-title { font-size: 16px; font-weight: 600; color: #333; margin: 0 0 6px; }
    .rp-proc-sub { font-size: 13px; color: #999; margin: 0; }

    /* Success */
    .rp-success { padding: 32px 24px; text-align: center; }
    .rp-success-ring {
      width: 64px; height: 64px; background: #22c55e; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
      font-size: 26px; color: #fff;
      animation: rp-pop .4s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes rp-pop { from { transform: scale(.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .rp-success h3 { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #1a1a1a; }
    .rp-success-sub { color: #666; font-size: 14px; margin: 0 0 20px; }
    .rp-receipt { background: #f8f9fa; border-radius: 8px; padding: 14px 16px; text-align: left; margin-bottom: 20px; }
    .rp-receipt-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 13px; color: #555; }
    .rp-receipt-row:not(:last-child) { border-bottom: 1px solid #eee; }
    .rp-receipt-row .mono { font-family: monospace; font-size: 12px; color: #333; font-weight: 600; }
    .rp-done-btn {
      width: 100%; padding: 13px; background: #22c55e; color: #fff; border: none;
      border-radius: 6px; font-size: 15px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .rp-done-btn:hover { background: #16a34a; }

    /* Footer */
    .rp-footer { padding: 10px 20px; background: #fafafa; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #aaa; }
    .rp-footer i { margin-right: 4px; }
  `,
})
export class PaymentModal {
  private readonly svc = inject(MockPaymentService);

  readonly amount = input.required<number>();

  @Output() readonly paid = new EventEmitter<PaymentResult>();
  @Output() readonly cancelled = new EventEmitter<void>();

  protected readonly state = signal<ModalState>('idle');
  protected readonly tab = signal('upi');
  protected readonly result = signal<PaymentResult | null>(null);
  protected readonly selBank = signal('');
  protected readonly selWallet = signal('');

  protected upiId = '';
  protected cardNum = '';
  protected cardExp = '';
  protected cardCvv = '';
  protected cardName = '';

  protected readonly amtDisplay = computed(() => this.amount().toLocaleString('en-IN'));

  protected readonly paidAtFormatted = computed(() => {
    const r = this.result();
    if (!r) return '';
    return new Date(r.paidAt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  });

  protected readonly tabs = [
    { id: 'upi', label: 'UPI' },
    { id: 'cards', label: 'Cards' },
    { id: 'nb', label: 'Net Banking' },
    { id: 'wallets', label: 'Wallets' },
  ];

  protected readonly upiApps = [
    { name: 'GPay', handle: 'demo@gpay', color: '#4285f4', icon: 'G' },
    { name: 'PhonePe', handle: 'demo@ybl', color: '#5f259f', icon: 'P' },
    { name: 'Paytm', handle: 'demo@paytm', color: '#00baf2', icon: 'T' },
    { name: 'BHIM', handle: 'demo@upi', color: '#f26522', icon: 'B' },
  ];

  protected readonly banks = [
    { code: 'HDFC', name: 'HDFC Bank' },
    { code: 'SBI', name: 'State Bank' },
    { code: 'ICICI', name: 'ICICI Bank' },
    { code: 'AXIS', name: 'Axis Bank' },
    { code: 'KOTAK', name: 'Kotak Bank' },
    { code: 'BOB', name: 'Bank of Baroda' },
  ];

  protected readonly wallets = ['Paytm Wallet', 'Amazon Pay', 'Mobikwik', 'Freecharge'];

  protected pay() {
    this.state.set('processing');
    this.svc.processPayment(this.amount()).subscribe((res) => {
      this.result.set(res);
      this.state.set('success');
    });
  }

  protected done() {
    this.paid.emit(this.result()!);
  }

  protected cancel() {
    this.cancelled.emit();
  }

  protected onBackdrop(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('rp-backdrop')) this.cancel();
  }
}
