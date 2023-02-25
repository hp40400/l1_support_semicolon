import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { SharingService } from "src/app/services/sharing.service";
import { ClarificationService } from '../../services/clarification.service';
import { Router } from "@angular/router";
import { NotificationService } from '../../services/notification.service';
import { UtilityService } from '../../services/utility.service';
import { MenuItem } from "src/app/model/clarification.model";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"]
})
export class SidebarComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = [];
  newChatStarted: boolean = true;
  existingChatId: string;
  clarificationList: any[] = [];
  isEditEnable: boolean = false;
  isDeleteEnable: boolean = false;
  menuItemTitle: string = '';
  constructor(
    public sharingService: SharingService,
    private clarificationService: ClarificationService,
    private notifyService: NotificationService,
    private utilityService: UtilityService,
    private router: Router, 
    private cd: ChangeDetectorRef) {

      this.router.events.subscribe(data=> {
        this.sharingService.setClarificationId((window.location.href.toString().split('/'))[5]);
      });
  }

  subscription: any;

  ngOnInit() {
    if(this.sharingService.getClarificationId()) {
      this.utilityService.getSelectedClarificationData(this.sharingService.getClarificationId());
    }
    this.getMenuItem();
    this.newChatStarted ? localStorage.setItem('newChatStarted', 'true') : localStorage.setItem('newChatStarted', 'false');
  }

  async getMenuItem() {
    await this.utilityService.getClarificationListData();
    this.menuItems = [];
    const menuItemsData = this.sharingService.getClarificationList();
    if (menuItemsData?.length > 0) {
      menuItemsData?.forEach(data => {
        if (data) {
          this.menuItems?.push(
            {
              id: data.menuId,
              path: `clarification/${data.menuId}`,
              title: data.menuTitle,
              icon: "icon-world",
              class: ""
            }
          );
        }
      });
    } 
  }

  async clickNewClarification() {
    this.newChatStarted = true;
    this.sharingService.setSendFeedbackBtnClicked(false);
    this.sharingService.setFeedbackResponse(null);
    this.sharingService.setFeedback({is_satisfied: null, reason: null});
    this.newChatStarted ? localStorage.setItem('newChatStarted', 'true') : localStorage.setItem('newChatStarted', 'false');
    await this.addNewClarificationToTheList();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.sharingService.getAddChatFalse().subscribe();

    // localStorage.setItem('chatId', '');
    // this.existingChatId = '';
    // if (this.subscription) {
    //   this.subscription.unsubscribe();
    // }
    // this.subscription = this.sharingService.getAddChatFalse().subscribe();
    this.isEditEnable = false;
    this.isDeleteEnable = false;
  }

  async addNewClarificationToTheList() {
    const newClarificationObj = { title: "New Clarification" };
    this.menuItemTitle = 'New Clarification';
    this.sharingService.setClarificationTitle(this.menuItemTitle);
    let clarificationId = '';
    this.sharingService.setSelectedClarificationArray([]);
    await this.clarificationService.createNewClarification(newClarificationObj)
      .then((res) => {
        if (res?.status === "success" && res?.data?.newClarification) {
          clarificationId = res.data.newClarification['_id'];
        }
        this.router.navigate([`clarification/${clarificationId}`]);
        this.sharingService.setIsNewClarificationClicked(true);
        this.sharingService.setClarificationId(clarificationId);
        this.getMenuItem();
      })
      .catch((err) => {
        this.notifyService.showError("Error Occured while adding new clarification title !!", "Notification");
        this.sharingService.setIsNewClarificationClicked(false);
        this.sharingService.setClarificationId('');
        console.log('err', err);
      });
    this.newChatStarted = false;
  }

  clickExistingClarification(clarificationId: string, title: string) {
    this.sharingService.setFeedback({is_satisfied: null, reason: null});
    this.menuItemTitle = title;
    this.sharingService.setClarificationTitle(this.menuItemTitle);
    this.newChatStarted = false;
    this.sharingService.setSendFeedbackBtnClicked(false);
    this.sharingService.setFeedbackResponse(null);
    this.newChatStarted ? localStorage.setItem('newChatStarted', 'true') : localStorage.setItem('newChatStarted', 'false');
    this.isEditEnable = false;
    this.isDeleteEnable = false;

    this.existingChatId = clarificationId;
    this.utilityService.getSelectedClarificationData(clarificationId);
    
    this.sharingService.setClarificationId(clarificationId);
  }

  onEdit() {
    this.menuItemTitle = this.sharingService.getClarificationTitle();
    this.isEditEnable = true;
  }

  cancelEdit(){
    this.isEditEnable = false;
  }

  onDelete() {
    this.isDeleteEnable = true;
  }

  cancelDelete(){
    this.isDeleteEnable = false;
  }

  async editExistingClarificationTitle(clarificationId: string, title: string) {
    const editedTitle = title === ''? 'New Clarification': title;
    try {
      await this.utilityService.editExistingclarificationData(clarificationId, editedTitle);
      await this.getMenuItem();
    }
    catch (err) {
      console.log(err)
    }
    this.isEditEnable = false;
  }

  async deleteExistingClarification(clarificationId: string) {
    try {
      await this.utilityService.deleteExistingclarificationData(clarificationId);
      await this.getMenuItem();
    }
    catch (err) {
      console.log(err)
    }
    this.isDeleteEnable = false;
  }

  ngOnDestroy() {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
}
