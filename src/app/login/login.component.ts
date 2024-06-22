import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { map } from 'rxjs';

import {  LoginService } from './login.service';
import { CredencialRequest } from '../shared/interfaces';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit  {

  private loginService = inject(LoginService);
  myForm: FormGroup;

  isLogado = this.loginService.isLogado
  idLoading = this.loginService.isLoading
  usuario = this.loginService.usuario
  hasErroDeLogin = this.loginService.hasErroDeLogin
     
  mensagemLogadoNaoLogado = computed(
    () => {
      if (this.isLogado()){
        return `Olá, ${this.usuario()?.nome}, seja bem-vindo!`
      } else {
        return "Usuário não logado."
      }
    }
  );

    
  constructor(){

    this.myForm = new FormGroup({
      username: new FormControl(''),
      password: new FormControl('')
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    console.log('call onSubmit')
    this.loginService.efetuarLogin(
      {
        username: this.myForm.value.username,
        password: this.myForm.value.password
      } as CredencialRequest
    );
  }

  deslogar(){
   console.log("deslogar");
   this.myForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
    });
   this.loginService.deslogar(); 
  }

}
