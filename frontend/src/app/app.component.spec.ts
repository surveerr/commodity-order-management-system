import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { AppComponent } from "./app.component";
describe("AppComponent", () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient()],
    }).compileComponents();
  });
  it("creates the app shell", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
  it("starts on the dashboard tab", () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.tab).toBe("dashboard");
  });
});
