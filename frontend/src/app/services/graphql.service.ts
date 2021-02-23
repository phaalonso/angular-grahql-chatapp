import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import {AutenticacaoService} from './autenticacao.service';

export interface User {
  name: string;
  email: string;
  senha?: string;
}

export interface Message {
  id: string;
  content: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
  constructor(
    private apollo: Apollo,
    private auth: AutenticacaoService,
  ) {}

  public subscribeToMessages() {
    return this.apollo
      .watchQuery({
        query: gql`
          {
            chat {
              id
              user {
                name
              }
              content
            }
          }
        `,
        pollInterval:  300,
        partialRefetch: true,
      });
  }

  public sendMessage(content: string) {
    console.log(this.auth.getLoginData);
    const sendMessageMutation = gql`
      mutation {
        sendMessage(userID: "${this.auth.getLoginData.id}", content: "${content}") {
          id
          content
          user {
            name
            email
          }
        }
      }
    `;

    console.log('Enviando a mensagem', content);

    return new Promise<Message>((res, reject) => {
      this.apollo
        .mutate({
          mutation: sendMessageMutation,
        })
        .subscribe(
          ({ data }) => {
            const { sendMessage } = data as any;
            const { id, content, user } = sendMessage;

            res({
              id,
              content,
              user: {
                name: user.name,
                email: user.email,
              },
            });
          },
          (err) => {
            console.error('There is a error', err);
            reject(err);
          }
        );
    });
  }

  public cadastrar(usuario: User) {
    const cadastroMutation = gql`
      mutation {
        createUser(name: "${usuario.name}", email: "${usuario.email}", senha: "${usuario.senha}") {
          id
        }
      }
    `;

    return this.apollo.mutate({
      mutation: cadastroMutation,
    });
  }
}
