import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {LoadingController, ToastController} from '@ionic/angular';
import {GraphqlService} from '../services/graphql.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
})
export class CadastroPage implements OnInit {
  public form: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    private grapQL: GraphqlService,
    private router: Router,
    private loading: LoadingController,
    private toastController: ToastController,
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      senha: ['', [Validators.required]]
    });
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
    });

    await toast.present();
  }

  async submit() {
    if (this.form.valid) {
      const load = await this.loading.create({
        message: 'Cadastrando...',
      });

      await load.present();

      this.grapQL
        .cadastrar(this.form.value)
        .subscribe(({ data }) => {
          console.log(data);
          load?.dismiss();
          this.router.navigate(['/login']);
        }, (err) => {
          console.error(err);
          load?.dismiss();
          this.showToast('Ocorreu um erro');
        });
    } else {
      console.log(this.form.errors);
      this.showToast('Preencha o formulario corretamente');
    }
  }

  ngOnInit() {
  }

}
