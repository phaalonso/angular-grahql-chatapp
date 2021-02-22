import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

export interface User {
  name: string;
  email: string;
}

export interface Message {
  content: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
  constructor(private apollo: Apollo) {}

  public subscribeToMessages(cb) {
    this.apollo
      .watchQuery({
        query: gql`
          {
            chat {
              user {
                name
              }
              content
            }
          }
        `,
        pollInterval: 1000
      })
      .valueChanges.subscribe(cb);
  }

  public sendMessage(userID: string, content: string) {
    const sendMessageMutation = gql`
      mutation {
        sendMessage(userID: "${userID}", content: "${content}") {
          user {
            name
            email
          }
          content
        }
      }
    `;

    console.log('Enviando a mensagem', content);

    return new Promise<Message>((res, reject) => {
      this.apollo
        .mutate({
          mutation: sendMessageMutation,
          variables: {
            userID,
            content,
          },
        })
        .subscribe(
          ({ data }) => {
            const { sendMessage } = data as any;
            const { content, user } = sendMessage;

            res({
              content,
              user: {
                name: user.name,
                email: user.email
              }
            });
          },
          (err) => {
            console.error('There is a error', err);
            reject(err);
          }
        );
    });
  }
}
