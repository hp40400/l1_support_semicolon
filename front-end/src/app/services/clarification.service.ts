import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable()
export class ClarificationService {
  readonly baseUrl = 'http://54.164.39.209:8081';

  options = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  public getClarificationList(): Promise<any> {
    const url = this.baseUrl + '/api/clarification';
    return this.http
      .get(url)
      .toPromise()
      .then((res) => (res ? res : null))
      .catch((error) => {
        this.handleAndLogError(error);
        return error;
      });
  }

  public getSelectedClarification(clarificationId: string) {
    const url = this.baseUrl + `/api/clarification/${clarificationId}`;
    return this.http
      .get(url, this.options)
      .toPromise()
      .then((res) => (res ? res : null))
      .catch((error) => {
        this.handleAndLogError(error);
        return error;
      });
  }

  public createNewClarification(data: any) {
    const url = this.baseUrl + '/api/clarification';
    const requestBody = {};
    requestBody['title'] = data['title'];
    return this.http
      .post(url, JSON.stringify(requestBody), this.options)
      .toPromise()
      .then((res) => (res ? res : null))
      .catch((error) => {
        this.handleAndLogError(error);
        return error;
      });
  }

  public addFeedback(clarificationId: string, data: any) {
    const url = this.baseUrl + `/api/clarification/feedback/${clarificationId}`;
    const requestBody = {};
    requestBody['is_satisfied'] = data['is_satisfied'];
    requestBody['reason'] = data['reason'];
    return this.http
      .patch(url, JSON.stringify(requestBody), this.options)
      .toPromise()
      .then((res) => (res ? res : null))
      .catch((error) => {
        this.handleAndLogError(error);
        return error;
      });
  }

  public updateExistingClarification(clarificationId: string, data: any) {
    const url = this.baseUrl + `/api/clarification/${clarificationId}`;
    const requestBody = {};
    requestBody['request'] = data['request'];
    return this.http
      .post(url, JSON.stringify(requestBody), this.options)
      .toPromise()
      .then((res) => (res ? res : null))
      .catch((error) => {
        this.handleAndLogError(error);
        return error;
      });
  }

  public updateClarificationTitle(clarificationId: string, data: any, limit: number = 20, offset: number = 1) {
    const url = this.baseUrl + `/api/clarification/${clarificationId}`;
    const requestBody = {};
    requestBody['title'] = data;
    return this.http
      .patch(url, JSON.stringify(requestBody), this.options)
      .toPromise()
      .then((res) => (res ? res : null))
      .catch((error) => {
        this.handleAndLogError(error);
        return error;
      });
  }


  public deleteClarification(clarificationId: string) {
    const url = this.baseUrl + `/api/clarification/${clarificationId}`;
    return this.http
      .delete(url)
      .toPromise()
      .then((res) => (res ? res : null))
      .catch(this.handleAndLogError);
  }

  handleError(error: any): Promise<any> {
    if (error && error.error && error.error.errorMsg) {
      return Promise.reject(error);
    } else if (error && error.error && error.error.message) {
      return Promise.reject(error.error || error);
    } else {
      return Promise.reject(error.message || error);
    }
  }

  handleAndLogError(error: any): Promise<any> {
    return this.handleError(error);
  }
}