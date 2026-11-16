import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  category: string;
  indicativePrice: number;
  active: boolean;
  orderActivityCount: number;
}
export interface TradeOrder {
  id: number;
  orderNumber: string;
  instrumentId: string;
  orderType: "BUY" | "SELL";
  quantity: number;
  price: number;
  status: string;
  remarks: string;
  createdBy: string;
  createdAt: string;
}
@Injectable({ providedIn: "root" })
export class ApiService {
  private http = inject(HttpClient);
  private base = "/api";
  login(username: string, password: string) {
    return this.http.post<{ token: string; username: string; role: string }>(
      `${this.base}/auth/login`,
      { username, password },
    );
  }
  instruments(q = ""): Observable<Instrument[]> {
    return this.http.get<Instrument[]>(`${this.base}/instruments`, {
      params: q ? new HttpParams().set("q", q) : undefined,
    });
  }
  createInstrument(i: Instrument) {
    return this.http.post<Instrument>(`${this.base}/instruments`, i);
  }
  updateInstrument(i: Instrument) {
    return this.http.put<Instrument>(`${this.base}/instruments/${i.id}`, i);
  }
  setInstrumentStatus(i: Instrument) {
    return this.http.patch<Instrument>(
      `${this.base}/instruments/${i.id}/status`,
      null,
      { params: { active: String(!i.active) } },
    );
  }
  orders(params: Record<string, string> = {}) {
    return this.http.get<{
      content: TradeOrder[];
      totalElements: number;
      totalPages: number;
    }>("/api/orders", { params });
  }
  createOrder(o: unknown) {
    return this.http.post<TradeOrder>("/api/orders", o);
  }
  action(id: number, action: "approve" | "reject" | "cancel") {
    return this.http.patch<TradeOrder>(`/api/orders/${id}/${action}`, {});
  }
  dashboard() {
    return this.http.get<{
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      recent: TradeOrder[];
    }>("/api/orders/dashboard");
  }
}
