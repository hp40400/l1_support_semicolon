import { Component, OnInit, ViewChild } from "@angular/core";
import { SharingService } from "src/app/services/sharing.service";
import { ClarificationService } from '../../services/clarification.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],

})
export class FooterComponent implements OnInit {
  inputClarification: string;
  chats: any[] = [];
  id: number = 0;
  subscription: any;
  clarificationId: string = '';
  public userInput: string;
  constructor(
    private router: Router,
    public sharingService: SharingService,
    public clarificationService: ClarificationService,
    public notifyService: NotificationService) { }

  ngOnInit() {
  }

  async sendMessage() {
    this.sharingService.setSendFeedbackBtnClicked(false);
    if (this.inputClarification.trim() === '') {
      return;
    }
    try {
      if(this.sharingService.getClarificationId()) {
        this.sendClarification(this.sharingService.getClarificationId());
      } else {
        this.addNewClarificationToTheList();
      }
    } catch (err) {
      console.log(err);
    }
  }

  async addNewClarificationToTheList() {
    let clarificationId = '';
    this.sharingService.setSendFeedbackBtnClicked(false);
    this.sharingService.setFeedback({is_satisfied: null, reason: null});
    const newClarificationObj = { title: "New Clarification" };
    this.sharingService.setSelectedClarificationArray([]);
    this.sharingService.setFeedbackResponse(null);
    this.clarificationService.createNewClarification(newClarificationObj)
      .then((res) => {
        if (res?.status === "success" && res?.data?.newClarification) {
          clarificationId = res.data.newClarification['_id'];
          this.router.navigate([`clarification/${clarificationId}`]);
          this.sharingService.setIsNewClarificationClicked(false);
          this.sharingService.setClarificationId(clarificationId);
          this.sendClarification(this.sharingService.getClarificationId());
        }
        
        //need to implement getMenuItem part for sidebar.
      })
      .catch((err) => {
        this.notifyService.showError("Error Occured while adding new clarification title !!", "Notification");
        console.log('err', err);
        this.sharingService.setIsNewClarificationClicked(false);
        this.sharingService.setClarificationId('');
      });
  }

  sendClarification(clarificationId: string) {
    const requestObj = { request: this.inputClarification };
    let conversationArray = this.sharingService.getSelectedClarificationArray();
    conversationArray.push(requestObj);
    this.inputClarification = '';
    this.clarificationService.updateExistingClarification(clarificationId, requestObj)
      .then((res) => {
        if (res?.status === 'success') {
          conversationArray.pop();
          conversationArray.push(res?.data?.newConversationData);
          this.sharingService.setSelectedClarificationArray(conversationArray);
        } 
      })
      .catch((err) => {
        this.notifyService.showError("Error Occured while modifying the Clarification !!",
          "Notification");
        console.log('err', err);
      });
  }


  sendFeedback() {
    this.sharingService.setSendFeedbackBtnClicked(true);
    this.sharingService.setFeedback({is_satisfied: null, reason: null});
  }
}
