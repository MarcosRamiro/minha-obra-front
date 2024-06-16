import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, concatMap, filter, of } from 'rxjs';

export interface CredencialRequest {
  username: string,
  password: string
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private _efetuarLoginAction = new BehaviorSubject<CredencialRequest>({username: '', password: ''});
  
  statusLogin$ = this._efetuarLoginAction.pipe(
    filter(c => c.username !== '' && c.password !== ''),
    concatMap(
      this.validarCredenciais
    ),
    catchError ( err => {
      console.error(`Ocorreu um erro: ${err}`)
      return of(false)
    })
  )

  public efetuarLogin(credencial: CredencialRequest){
    this._efetuarLoginAction.next(credencial);
  }

  constructor() {}

  private validarCredenciais(credencial: CredencialRequest): Observable<boolean> {
    const usuarios: CredencialRequest[] =  [
      {
        username: 'marcos',
        password: '123'
      }
    ]

    const result = usuarios.some(item => item.username === credencial.username && item.password === credencial.password)
    console.log(`Olá, aqui o resultado ${result}.`)
    
    return of(result)

  }
}
