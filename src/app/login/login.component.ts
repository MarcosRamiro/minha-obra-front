import { Component, OnInit, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { map } from 'rxjs';

import { CredencialRequest, LoginService } from './login.service';

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

  resultadoLogin = this.loginService.resultadoLogin
  isLogado = this.loginService.isLogado
  mensagemLogadoNaoLogado = computed(
    () => {
      if (this.isLogado()){
        return "Usuário já está logado."
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
    this.loginService.efetuarLogin(
      {
        username: this.myForm.value.username,
        password: this.myForm.value.password
      } as CredencialRequest
    );
  }

  deslogar(){
   console.log("deslogar");
   this.loginService.deslogar(); 
  }

}
