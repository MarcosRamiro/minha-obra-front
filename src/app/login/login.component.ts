import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';

import { CredencialRequest, LoginService } from './login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private loginService = inject(LoginService);
  myForm: FormGroup;

  resultadoLogin$ = this.loginService.statusLogin$
  
  constructor(){
    this.myForm = new FormGroup({
      username: new FormControl(''),
      password: new FormControl('')
    });
  }

  onSubmit() {
    console.log(this.myForm.value);

    this.loginService.efetuarLogin(
      {
        username: this.myForm.value.username,
        password: this.myForm.value.password
      } as CredencialRequest
    );
  }

}
