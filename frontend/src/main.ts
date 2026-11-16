import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { AppComponent } from "./app/app.component";
import { authGuard } from "./app/core/auth.guard";
import { authInterceptor } from "./app/core/auth.interceptor";
import { WorkspaceRouteComponent } from "./app/workspace-route.component";
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter([
      { path: "", component: AppComponent },
      {
        path: "workspace",
        canActivate: [authGuard],
        component: WorkspaceRouteComponent,
      },
    ]),
  ],
}).catch((e) => console.error(e));
