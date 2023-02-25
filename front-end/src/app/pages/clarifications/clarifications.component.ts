import { Component, OnInit } from '@angular/core';
import { Clarification, Feedback } from 'src/app/model/clarification.model';
import { SharingService } from 'src/app/services/sharing.service';
import { UtilityService } from 'src/app/services/utility.service';

let speech = new SpeechSynthesisUtterance();

function readText(txt){ speech.text = txt; speech.rate =1; speech.volume = 1; speech.pitch =1; speech.lang="en-US"; window.speechSynthesis.speak(speech); }

@Component({
  selector: 'app-clarifications',
  templateUrl: './clarifications.component.html',
  styleUrls: ["./clarifications.component.scss"]
})

export class ClarificationsComponent implements OnInit {
  isNewClStarted: boolean = false;
  isContinueExistingCl: boolean = false;
  isRename: boolean = false;
  isFeedback: boolean = false;
  isDelete: boolean = false;
  isInitialLanding: boolean = true;
  clarificationArray: Clarification[] = [];
  chatstarted: boolean = false;
  is_satisfied: any = null;
  reason: any = null;

  constructor(public sharingService: SharingService, private utilityService: UtilityService) { }

  ngOnInit() {
    this.is_satisfied = null;
    this.reason = null;
    this.sharingService.addChat$.subscribe(
      status => {
        if (status) {
          this.chatstarted = status == 'true';
          if(!this.chatstarted) {
            this.isNewClStarted = false;
            this.isContinueExistingCl = false;
            this.isRename = false;
            this.isFeedback = false;
            this.isDelete = false;
            this.isInitialLanding = true;
          }
        }
      }
    );
  }

  onClickeRadioOption() {
    if(this.is_satisfied) {
      this.reason = null;
    }
  }

  showUserGuideData(data: string) {
    switch (data) {
      case 'newCl': {
        this.isNewClStarted = true;
        this.isContinueExistingCl = false;
        this.isRename = false;
        this.isFeedback = false;
        this.isDelete = false;
        this.isInitialLanding = false;
        break;
      }
      case 'continueEx': {
        this.isContinueExistingCl = true;
        this.isNewClStarted = false;
        this.isRename = false;
        this.isFeedback = false;
        this.isDelete = false;
        this.isInitialLanding = false;
        break;
      }
      case 'rename': {
        this.isRename = true;
        this.isNewClStarted = false;
        this.isContinueExistingCl = false;
        this.isFeedback = false;
        this.isDelete = false;
        this.isInitialLanding = false;
        break;
      }
      case 'feedback': {
        this.isFeedback = true;
        this.isNewClStarted = false;
        this.isContinueExistingCl = false;
        this.isRename = false;
        this.isDelete = false; 
        this.isInitialLanding = false;
        break;
      }
      case 'delete': {
        this.isDelete = true;
        this.isNewClStarted = false;
        this.isContinueExistingCl = false;
        this.isRename = false;
        this.isFeedback = false;
        this.isInitialLanding = false;
        break;
      }
      default: {
        this.isNewClStarted = false;
        this.isContinueExistingCl = false;
        this.isRename = false;
        this.isFeedback = false;
        this.isDelete = false;
        this.isInitialLanding = true;
        break;
      }
    }
  }

  back() {
    this.isNewClStarted = false;
    this.isContinueExistingCl = false;
    this.isRename = false;
    this.isFeedback = false;
    this.isDelete = false;
    this.isInitialLanding = true;
  }

  readMesg(text: string) {
    readText(text);
  }

  stopRead() {
    window.speechSynthesis.cancel();
  }

  async sendFeedbackReason() {
    let feedbackModel: Feedback;
    if(this.is_satisfied) {
      feedbackModel = {
        is_satisfied: true,
        reason: null
      }
    } else {
      feedbackModel = {
        is_satisfied: false,
        reason: this.reason
      }
    }
    try {
      await this.utilityService.sendFeedback(this.sharingService.getClarificationId(), feedbackModel);
      if(this.sharingService.getFeedbackResponse()) {
        this.is_satisfied = null;
        this.reason = null;
      }
    } catch(err) {
      console.log('error ', err);
    }
  }

  cancel() {
    this.sharingService.setSendFeedbackBtnClicked(false);
    this.is_satisfied = null;
    this.reason = null;
  }
}