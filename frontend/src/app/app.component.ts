
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { ApiService, Instrument, TradeOrder } from "./core/api.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<div class="shell">
    <header>
      <div>
        <small>NCDEX · ENGINEERING CHALLENGE</small>
        <h1>Commodity Order Management</h1>
      </div>
      <div *ngIf="user">
        <span>{{ user }} · {{ role }}</span>
        <button class="secondary" (click)="logout()">Logout</button>
      </div>
    </header>

    <main *ngIf="!token" class="login panel">
      <h2>Sign in</h2>
      <p>Use the local demonstration account.</p>
      <form (ngSubmit)="login()">
        <label>
          Username
          <input name="username" [(ngModel)]="username" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            [(ngModel)]="password"
            required
          />
        </label>
        <button [disabled]="busy">
          {{ busy ? "Signing in…" : "Sign in" }}
        </button>
      </form>
      <p class="hint">
        Admin: admin / Admin&#64;123 · Operations: operator / Operator&#64;123
      </p>
    </main>

    <main *ngIf="token">
      <nav>
        <button
          *ngIf="role === 'ADMIN'"
          [class.active]="tab === 'dashboard'"
          (click)="tab = 'dashboard'; loadDashboard()"
        >
          Dashboard
        </button>
        <button
          [class.active]="tab === 'instruments'"
          (click)="tab = 'instruments'; loadInstruments()"
        >
          Instruments
        </button>
        <button
          [class.active]="tab === 'orders'"
          (click)="tab = 'orders'; loadInstruments(); loadOrders()"
        >
          Orders
        </button>
      </nav>

      <p class="message" *ngIf="message">{{ message }}</p>

      <section *ngIf="tab === 'dashboard' && role === 'ADMIN'">
        <h2>Overview</h2>
        <div class="stats">
          <article>
            <small>Total orders</small>
            <strong>{{ dash?.total ?? "—" }}</strong>
          </article>
          <article>
            <small>Pending</small>
            <strong>{{ dash?.pending ?? "—" }}</strong>
          </article>
          <article>
            <small>Approved</small>
            <strong>{{ dash?.approved ?? "—" }}</strong>
          </article>
          <article>
            <small>Rejected</small>
            <strong>{{ dash?.rejected ?? "—" }}</strong>
          </article>
        </div>

        <h3>Recent orders</h3>
        <div class="panel">
          <table>
            <tr>
              <th>Order</th>
              <th>Instrument</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Status</th>
            </tr>
            <tr *ngFor="let o of dash?.recent">
              <td>{{ o.orderNumber }}</td>
              <td>{{ o.instrumentId }}</td>
              <td>{{ o.orderType }}</td>
              <td>{{ o.quantity }}</td>
              <td>
                <span class="pill">{{ o.status }}</span>
              </td>
            </tr>
          </table>
        </div>
      </section>

      <section *ngIf="tab === 'instruments'">
        <div class="heading">
          <div>
            <h2>Instruments</h2>
            <p>Commodity reference data</p>
          </div>
          <button
            *ngIf="role === 'ADMIN'"
            (click)="
              showInstrumentForm = !showInstrumentForm;
              editingInstrument = false;
              instrumentDraft = {
                id: '',
                symbol: '',
                name: '',
                category: 'ENERGY',
                indicativePrice: 1,
                active: true
              }
            "
          >
            {{ showInstrumentForm ? "Close" : "Add instrument" }}
          </button>
        </div>

        <input
          placeholder="Search by name or symbol"
          [(ngModel)]="query"
          (input)="loadInstruments()"
        />

        <form
          class="panel form-grid"
          *ngIf="showInstrumentForm"
          (ngSubmit)="saveInstrument()"
        >
          <label>
            ID
            <input
              name="id"
              [(ngModel)]="instrumentDraft.id"
              [disabled]="editingInstrument"
              required
            />
          </label>
          <label>
            Symbol
            <input
              name="symbol"
              [(ngModel)]="instrumentDraft.symbol"
              required
            />
          </label>
          <label>
            Name
            <input
              name="name"
              [(ngModel)]="instrumentDraft.name"
              required
            />
          </label>
          <label>
            Category
            <input
              name="category"
              [(ngModel)]="instrumentDraft.category"
              required
            />
          </label>
          <label>
            Indicative price
            <input
              name="price"
              type="number"
              min="0.01"
              [(ngModel)]="instrumentDraft.indicativePrice"
              required
            />
          </label>
          <button>
            {{ editingInstrument ? "Update instrument" : "Save instrument" }}
          </button>
        </form>

        <div class="panel">
          <table>
            <tr>
              <th>ID</th>
              <th>Symbol</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Activity</th>
              <th></th>
            </tr>
            <tr *ngFor="let i of instruments">
              <td>{{ i.id }}</td>
              <td>{{ i.symbol }}</td>
              <td>{{ i.name }}</td>
              <td>{{ i.category }}</td>
              <td>{{ i.indicativePrice }}</td>
              <td>{{ i.active ? "Active" : "Inactive" }}</td>
              <td>{{ i.orderActivityCount }}</td>
              <td class="actions">
                <button
                  *ngIf="role === 'ADMIN'"
                  (click)="editInstrument(i)"
                >
                  Edit
                </button>
                <button
                  class="secondary"
                  *ngIf="role === 'ADMIN'"
                  (click)="toggle(i)"
                >
                  {{ i.active ? "Deactivate" : "Activate" }}
                </button>
              </td>
            </tr>
          </table>
          <p *ngIf="!instruments.length">No instruments found.</p>
        </div>
      </section>

      <section *ngIf="tab === 'orders'">
        <div class="heading">
          <div>
            <h2>Orders</h2>
            <p>Submit and track commodity orders</p>
          </div>
          <button (click)="showOrderForm = !showOrderForm">
            {{ showOrderForm ? "Close" : "Create order" }}
          </button>
        </div>

        <form
          class="panel form-grid"
          *ngIf="showOrderForm"
          (ngSubmit)="createOrder()"
        >
          <label>
            Instrument
            <select
              name="instrument"
              [(ngModel)]="orderDraft.instrumentId"
              required
            >
              <option value="">Select instrument</option>
              <option
                *ngFor="let i of instruments"
                [value]="i.id"
                [disabled]="!i.active"
              >
                {{ i.name }} ({{ i.id }})
              </option>
            </select>
          </label>
          <label>
            Type
            <select name="type" [(ngModel)]="orderDraft.orderType">
              <option>BUY</option>
              <option>SELL</option>
            </select>
          </label>
          <label>
            Quantity
            <input
              name="quantity"
              type="number"
              min="1"
              [(ngModel)]="orderDraft.quantity"
              required
            />
          </label>
          <label>
            Indicative price
            <input
              name="price"
              type="number"
              min="0.01"
              [(ngModel)]="orderDraft.price"
              required
            />
          </label>
          <label class="wide">
            Remarks
            <input name="remarks" [(ngModel)]="orderDraft.remarks" />
          </label>
          <button [disabled]="busy">Submit order</button>
        </form>

        <div class="filters">
          <input
            placeholder="Search order number"
            [(ngModel)]="orderNumberFilter"
          />
          <input
            placeholder="Instrument ID"
            [(ngModel)]="instrumentFilter"
          />
          <select [(ngModel)]="statusFilter">
            <option value="">All statuses</option>
            <option>SUBMITTED</option>
            <option>APPROVED</option>
            <option>REJECTED</option>
            <option>CANCELLED</option>
          </select>
          <button
            class="secondary"
            (click)="orderPage = 0; loadOrders()"
          >
            Search / refresh
          </button>
        </div>

        <div class="panel">
          <table>
            <tr>
              <th>Order</th>
              <th>Instrument</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Created by</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
            <tr *ngFor="let o of orders">
              <td>{{ o.orderNumber }}</td>
              <td>{{ o.instrumentId }}</td>
              <td>{{ o.orderType }}</td>
              <td>{{ o.quantity }}</td>
              <td>{{ o.price }}</td>
              <td>{{ o.createdBy }}</td>
              <td>
                <span class="pill">{{ o.status }}</span>
              </td>
              <td class="actions">
                <button
                  *ngIf="role === 'ADMIN' && o.status === 'SUBMITTED'"
                  (click)="act(o, 'approve')"
                >
                  Approve
                </button>
                <button
                  class="secondary"
                  *ngIf="role === 'ADMIN' && o.status === 'SUBMITTED'"
                  (click)="act(o, 'reject')"
                >
                  Reject
                </button>
                <button
                  class="secondary"
                  *ngIf="
                    o.status === 'SUBMITTED' &&
                    (role === 'ADMIN' || o.createdBy === user)
                  "
                  (click)="act(o, 'cancel')"
                >
                  Cancel
                </button>
              </td>
            </tr>
          </table>

          <p *ngIf="!orders.length">No orders found.</p>

          <div class="filters">
            <button
              class="secondary"
              [disabled]="orderPage === 0"
              (click)="orderPage = orderPage - 1; loadOrders()"
            >
              Previous
            </button>
            <span>Page {{ orderPage + 1 }} of {{ totalPages || 1 }}</span>
            <button
              class="secondary"
              [disabled]="orderPage + 1 >= totalPages"
              (click)="orderPage = orderPage + 1; loadOrders()"
            >
              Next
            </button>
          </div>
          <small>{{ totalOrders }} total orders</small>
        </div>
      </section>
    </main>

    <footer>
      Learning/demo application · No real trading or financial transactions
    </footer>
  </div>`,
  styles: [],
})
export class AppComponent {
  private api = inject(ApiService);

  token = localStorage.getItem("token") || "";
  user = localStorage.getItem("username") || "";
  role = localStorage.getItem("role") || "";

  username = "operator";
  password = "Operator@123";
  busy = false;
  tab = "dashboard";
  message = "";
  query = "";
  statusFilter = "";
  orderNumberFilter = "";
  instrumentFilter = "";
  orderPage = 0;
  totalPages = 0;
  editingInstrument = false;

  instruments: Instrument[] = [];
  orders: TradeOrder[] = [];
  dash: any = null;
  totalOrders = 0;

  showInstrumentForm = false;
  showOrderForm = false;

  instrumentDraft: any = {
    id: "",
    symbol: "",
    name: "",
    category: "ENERGY",
    indicativePrice: 1,
    active: true,
  };

  orderDraft: any = {
    instrumentId: "",
    orderType: "BUY",
    quantity: 1,
    price: 1,
    remarks: "",
  };

  constructor() {
    if (this.token) {
      if (this.role === "ADMIN") {
        this.loadDashboard();
      } else {
        this.tab = "orders";
        this.loadInstruments();
        this.loadOrders();
      }
    }
  }

  login() {
    this.busy = true;

    this.api.login(this.username, this.password).subscribe({
      next: (r) => {
        this.token = r.token;
        this.user = r.username;
        this.role = r.role;

        localStorage.setItem("token", r.token);
        localStorage.setItem("username", r.username);
        localStorage.setItem("role", r.role);

        this.message = "Welcome " + r.username;
        this.busy = false;

        if (this.role === "ADMIN") {
          this.tab = "dashboard";
          this.loadDashboard();
        } else {
          this.tab = "orders";
          this.loadInstruments();
          this.loadOrders();
        }
      },
      error: (e) => {
        this.fail(e);
        this.busy = false;
      },
    });
  }

  logout() {
    localStorage.clear();
    this.token = "";
    this.user = "";
    this.role = "";
    this.message = "";
    this.tab = "dashboard";
    this.dash = null;
    this.instruments = [];
    this.orders = [];
  }

  fail(e: HttpErrorResponse) {
    this.message =
      e.error?.error ||
      e.error?.message ||
      "Request failed. Check services and permissions.";
  }

  loadDashboard() {
    if (this.role !== "ADMIN") {
      return;
    }

    this.api.dashboard().subscribe({
      next: (d) => (this.dash = d),
      error: (e) => this.fail(e),
    });
  }

  loadInstruments() {
    this.api.instruments(this.query).subscribe({
      next: (d) => (this.instruments = d),
      error: (e) => this.fail(e),
    });
  }

  loadOrders() {
    const p: any = {
      page: String(this.orderPage),
      size: "10",
    };

    if (this.statusFilter) p.status = this.statusFilter;
    if (this.instrumentFilter) p.instrumentId = this.instrumentFilter;
    if (this.orderNumberFilter) p.orderNumber = this.orderNumberFilter;

    this.api.orders(p).subscribe({
      next: (d) => {
        this.orders = d.content;
        this.totalOrders = d.totalElements;
        this.totalPages = d.totalPages;
      },
      error: (e) => this.fail(e),
    });
  }

  editInstrument(i: Instrument) {
    this.instrumentDraft = { ...i };
    this.editingInstrument = true;
    this.showInstrumentForm = true;
  }

  saveInstrument() {
    const request = this.editingInstrument
      ? this.api.updateInstrument({ ...this.instrumentDraft })
      : this.api.createInstrument({ ...this.instrumentDraft });

    request.subscribe({
      next: () => {
        this.message = this.editingInstrument
          ? "Instrument updated"
          : "Instrument created";

        this.showInstrumentForm = false;
        this.editingInstrument = false;
        this.loadInstruments();
      },
      error: (e) => this.fail(e),
    });
  }

  toggle(i: Instrument) {
    this.api.setInstrumentStatus(i).subscribe({
      next: () => this.loadInstruments(),
      error: (e) => this.fail(e),
    });
  }

  createOrder() {
    this.busy = true;

    this.api.createOrder(this.orderDraft).subscribe({
      next: () => {
        this.message = "Order submitted";
        this.showOrderForm = false;
        this.busy = false;
        this.loadOrders();
      },
      error: (e) => {
        this.fail(e);
        this.busy = false;
      },
    });
  }

  act(o: TradeOrder, a: "approve" | "reject" | "cancel") {
    this.api.action(o.id, a).subscribe({
      next: () => {
        this.message =
          a === "approve"
            ? "Order approved"
            : a === "reject"
              ? "Order rejected"
              : "Order cancelled";

        this.loadOrders();

        if (this.role === "ADMIN") {
          this.loadDashboard();
        }
      },
      error: (e) => this.fail(e),
    });
  }
}
