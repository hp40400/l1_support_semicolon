import { Injectable } from '@angular/core';
import { SharingService } from './sharing.service';
import { ClarificationService } from './clarification.service';
import { NotificationService } from './notification.service';
import { Feedback } from '../model/clarification.model';
import { Router } from '@angular/router';

@Injectable()
export class UtilityService {
    clarificationList: any[] = [];
    subscription: any;

    constructor(
        private sharingService: SharingService,
        private clarificationService: ClarificationService,
        private notifyService: NotificationService,
        private router: Router) { }

    async getClarificationListData() {
        this.clarificationList = [];
        await this.clarificationService.getClarificationList()
            .then((response) => {
                if (response?.status === 'success' && response?.data?.clarificationList?.length > 0) {
                    const clarificationList = response.data.clarificationList;
                    clarificationList.forEach(element => {
                        if (element && element['_id']) {
                            const menuItemObj = {
                                menuId: element['_id'],
                                menuTitle: element.title,
                            }
                            this.clarificationList.push(menuItemObj);
                        }
                    });
                }
                this.sharingService.setClarificationList(this.clarificationList);
            });
    }

    async getSelectedClarificationData(clarificationId) {
        let conversationArray = [];
        await this.clarificationService.getSelectedClarification(clarificationId)
            .then((res) => {
                if (res?.status === 'success') {
                    conversationArray = res?.data?.clarificationData?.conversations;
                    this.sharingService.setSelectedClarificationArray(conversationArray);
                    this.sharingService.setFeedback(res?.data?.clarificationData?.feedback);
                    this.sharingService.setClarificationTitle(res?.data?.clarificationData?.title);
                } 
            });
    }

    async editExistingclarificationData(clarificationId: string, title: string) {
        await this.clarificationService.updateClarificationTitle(clarificationId, title)
            .then((res) => {
                this.notifyService.showSuccess("Clarification title modified successfully !!",
                    "Notification");
                    
                    this.sharingService.setClarificationTitle(title);
                    this.getClarificationListData();
            })
            .catch((err) => {
                this.notifyService.showError("Error Occured while modifiying the clarification title !!",
                    "Notification");
                console.log('err', err);
            });
    }

    async deleteExistingclarificationData(clarificationId: string) {
        await this.clarificationService.deleteClarification(clarificationId)
            .then((res) => {
                this.notifyService.showSuccess("Clarification Deleted successfully !!",
                    "Notification");
                    this.getClarificationListData();
                    this.router.navigate(['clarification']);
                    this.sharingService.setClarificationTitle('');
            })
            .catch((err) => {
                this.notifyService.showError("Error Occured while deleting the Clarification !!",
                    "Notification");
                console.log('err', err);
            });
    }

    async sendFeedback(clarificationId: string, feedback: Feedback) {
        await this.clarificationService.addFeedback(clarificationId, feedback)
            .then((res) => {
                console.log(res);
                if (res?.status === 'success' && res?.message) {
                    const message = res.message;
                    this.sharingService.setFeedbackResponse(message);
                }
                this.notifyService.showSuccess("Feedback added successfully !!",
                    "Notification");
                location.reload();
            })
            .catch((err) => {
                this.notifyService.showError("Error Occured while sending the Feedback!!",
                    "Notification");
                console.log('err', err);
            });
    }
}
