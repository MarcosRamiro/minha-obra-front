import { Component, inject } from '@angular/core';
import { LoginService } from '../login/login.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  loginService = inject(LoginService)

  isLogado = this.loginService.isLogado
  isLoading = this.loginService.isLoading
  usuario = this.loginService.usuario

}
