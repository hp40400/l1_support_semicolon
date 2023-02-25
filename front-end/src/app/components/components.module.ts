import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { FooterComponent } from "./footer/footer.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { FormsModule } from "@angular/forms";
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [CommonModule, RouterModule, NgbModule, FormsModule, ToastrModule],
  declarations: [FooterComponent, SidebarComponent],
  exports: [FooterComponent, SidebarComponent]
})
export class ComponentsModule {}
