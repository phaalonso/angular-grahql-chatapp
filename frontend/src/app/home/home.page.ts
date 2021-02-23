import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacaoService } from '../services/autenticacao.service';
import { GraphqlService, Message } from '../services/graphql.service';

function mergeArray(arrays) {
  let jointArray = [];

  arrays.forEach((arr) => {
    jointArray = [...jointArray, ...arr];
  });

  return [...new Set([...jointArray])];
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnDestroy {
  @ViewChild('messages') messagesView: ElementRef;
  public messageList: Message[] = [];
  public messageForm: FormGroup;
  public loading = true;
  public error: any;

  private subscription;

  constructor(
    private grapQL: GraphqlService,
    private formBuilder: FormBuilder,
    private auth: AutenticacaoService,
    private router: Router
  ) {
    this.messageForm = this.formBuilder.group({
      content: ['', [Validators.required]],
    });

    this.subscribe();

    if (!this.auth.getLogado) {
      console.log('Nao ta logado, ????');
      this.router.navigate(['/login']);
      return;
    }
  }

  public async sendMessage() {
    console.log('Teste');
    if (this.messageForm.valid) {
      console.log('Teste');
      const res: Message = await this.grapQL.sendMessage(
        this.messageForm.value.content
      );

      this.messageForm.reset();
      this.scrollToBottom();
    } else {
      console.log(this.messageForm.errors);
    }
  }

  scrollToBottom() {
    const element = document.getElementsByClassName('messageList')[0];

    element.scrollTop = element.scrollHeight;
  }

  private subscribe() {
    console.log('Se inscrevendo');

    this.subscription = this.grapQL
      .subscribeToMessages()
      .valueChanges.subscribe((result: any) => {
        console.log('Mensagem: ', result?.data?.chat);
        this.messageList = mergeArray([
          this.messageList,
          result?.data?.chat as Message[],
        ]);
        console.log(this.messageList);

        this.scrollToBottom();
        this.loading = result.loading;
        this.error = result.error;
      }, err => console.error(err));
  }

  unsubscribe() {
    console.log('Removendo inscrição');
    this.subscription?.unsubscribe();
  }

  ngOnDestroy() {
    //this.unsubscribe();
  }

  logout() {
    this.unsubscribe();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
