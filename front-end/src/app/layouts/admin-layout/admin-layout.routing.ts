import { Routes } from "@angular/router";
import { ClarificationsComponent } from '../../pages/clarifications/clarifications.component';



export const AdminLayoutRoutes: Routes = [
  {
    path: "clarification", component: ClarificationsComponent,
    children: [
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: ':id',
        component: ClarificationsComponent
      }
    ]
  },
];
