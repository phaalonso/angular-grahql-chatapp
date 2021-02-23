import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {LoadingController, ToastController} from '@ionic/angular';
import {AutenticacaoService} from '../services/autenticacao.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private toastControl: ToastController,
    private loadingControl: LoadingController,
    private authService: AutenticacaoService,
    private router: Router,
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required]],
      senha: ['', [Validators.required]]
    });
  }

  async toast(message: string) {
    const toast = await this.toastControl.create({
      message,
      duration: 3000,
      position: 'bottom'
    });

    await toast.present();
  }

  async submit() {
    if (this.form.valid) {
      const load = await this.loadingControl.create({ message: 'Logando...' });
      await load.present();

      const res = await this.authService.login(this.form.value);

      if (res) {
        load?.dismiss();
        this.form.reset();
        this.router.navigate(['/home']);
      }

      load?.dismiss();
    } else {
      this.toast('Preencha o formulário corretamente');
    }
  }

  ngOnInit() {
  }

}
