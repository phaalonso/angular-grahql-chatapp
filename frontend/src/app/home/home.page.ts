import { Component, ElementRef, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GraphqlService, Message} from '../services/graphql.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('messages') messagesView: ElementRef;
  public messageList: Message[] = [];
  public messageForm: FormGroup;
  public loading = true;
  public error: any;

  constructor(
    private grapQL: GraphqlService,
    private formBuilder: FormBuilder
  ) {
    this.messageForm = this.formBuilder.group({
      content: ['', Validators.required]
    });

    this.grapQL.subscribeToMessages((result: any) => {
      console.log(result?.data?.chat);
      this.messageList = [
        ...this.messageList,
        ...result?.data?.chat
      ]

      console.log(this.messageList);

      this.scrollToBottom();
      this.loading = result.loading;
      this.error = result.error;
    });
  }

  public async sendMessage() {
    console.log('Teste');
    if (this.messageForm.valid) {
      console.log('Teste');
      const res: Message = await this.grapQL.sendMessage('6032de558738cd3a58594a28', this.messageForm.value.content);

      if (res) {
        console.log(res);
        this.messageList = [...this.messageList, res];
      }
      this.messageForm.reset();
      this.scrollToBottom();
    } else {
      console.log(this.messageForm.errors)
    }
  }

  scrollToBottom() {
    const element = document.getElementsByClassName('messageList')[0];

    element.scrollTop = element.scrollHeight;
  }
}
