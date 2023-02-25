import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Feedback } from '../model/clarification.model';

@Injectable()

export class SharingService {
  private addChatSource = new BehaviorSubject<string>('false');
  private addClarifications = new BehaviorSubject<any>([]);

  public addChat$ = this.addChatSource.asObservable();
  public clarifications$ = this.addClarifications.asObservable();
  
  isNewClarificationClicked: boolean = false;
  clarificationId: string = '';
  clarificationTitle: string = '';
  conversationArray: any[] = [];
  clarificationList: any[] = [];
  chatStatus: boolean = true;
  isFeedbackOn: boolean = false;
  feedbackMessage: string = null;
  feedback: Feedback = {
    is_satisfied : null,
    reason : null
  };
  keywordsArray: any = [];

  constructor() {
    this.addChat$.subscribe(status => window.localStorage.setItem('addChat', status));
  }

  //   getAddChat(): Observable<string> {
  //     let chatStatus = window.localStorage.getItem('addChat');
  //     chatStatus = (chatStatus === 'false' || chatStatus == null) ? 'true' : 'false';
  //     this.addChatSource.next(chatStatus);
  //     return this.addChat$;
  //   }

  getAddChatTrue(): Observable<string> {
    let chatStatus = 'true';
    this.addChatSource.next(chatStatus);
    return this.addChat$;
  }

  getAddChatFalse(): Observable<string> {
    let chatStatus = 'false';
    this.addChatSource.next(chatStatus);
    return this.addChat$;
  }

  setSelectedClarificationArray(val: any) {
    this.conversationArray = val;
  }

  getSelectedClarificationArray() {
    return this.conversationArray;
  }

  setIsNewClarificationClicked(val: any) {
    this.isNewClarificationClicked = val;
  }

  getIsNewClarificationClicked() {
    return this.isNewClarificationClicked;
  }

  setClarificationId(val: any) {
    this.clarificationId = val;
  }

  getClarificationId() {
    return this.clarificationId;
  }

  setClarificationTitle(val: string) {
    this.clarificationTitle = val;
  }

  getClarificationTitle() {
    return this.clarificationTitle;
  }

  setClarificationList(val: any) {
    this.clarificationList = val;
  }

  getClarificationList() {
    return this.clarificationList;
  }

  setSendFeedbackBtnClicked(val: boolean) {
    this.isFeedbackOn = val;
  }

  getSendFeedbackBtnClicked() {
    return this.isFeedbackOn;
  }

  setFeedbackResponse(val: string) {
    this.feedbackMessage = val;
  }

  getFeedbackResponse() {
    return this.feedbackMessage;
  }

  setFeedback(val: Feedback) {
    this.feedback = val;
  }
  
  getFeedback() {
    return this.feedback;
  }

  getKeywords() {
    return this.keywordsArray;
  }

  setKeywords(val: any) {
    this.keywordsArray = val;
  }

}