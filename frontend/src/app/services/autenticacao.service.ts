import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { GraphqlService, User } from './graphql.service';

interface LoginData {
  token: string;
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class AutenticacaoService {
  private loginData: LoginData;
  private logado = false;

  constructor(private apollo: Apollo) {}

  public login(user: User) {
    return new Promise((resolve, reject) => {
      this.apollo
        .mutate({
          mutation: gql`
        mutation {
          login(login: { email: "${user.email}", senha: "${user.senha}" }) {
            token
            id
          }
        }
      `,
        })
        .subscribe(
          (res) => {
            const { login } = res.data as any;

            if (login) {
              this.loginData = login;
              this.logado = true;
              resolve(true);
            }
            resolve(false);
          },
          (err) => reject(err)
        );
    });
  }

  logout() {
    this.logado = false;
  }

  public get getLogado() {
    return this.logado;
  }

  public get getLoginData() {
    return this.loginData;
  }
}
