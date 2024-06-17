import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, concatMap, delay, filter, map, merge, of, switchMap, tap, timer } from 'rxjs';
import { LocalStorageHelperService } from '../shared/local-storage-helper.service';

export interface CredencialRequest {
  username: string,
  password: string
}

export enum Estado {
  Logado = 'Logado',
  Nao_Logado = 'Não Logado'
}

export interface EstadoLogin {
  estado: Estado,
  token?: string
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor() {
    this.consultarStatusLogin();
  }

  private localStorageHelper = inject(LocalStorageHelperService)

  private _efetuarLoginAction = new BehaviorSubject<CredencialRequest>({username: '', password: ''});
  private _consultarEstadoLoginAction = new  BehaviorSubject<boolean>(true);

  private _resultadoValidacaoCredencial$: Observable<EstadoLogin> = this._efetuarLoginAction.pipe(
    filter(c => c.username !== '' && c.password !== ''),
    concatMap(
      this.validarCredenciais.bind(this)
    ), 
    catchError(err => {
      console.error(`Ocorreu um erro: ${err}`)
      return of({estado: Estado.Nao_Logado})
    })
  );

  resultadoLogin$: Observable<boolean> = this._resultadoValidacaoCredencial$.pipe(
    map(val => val.estado === Estado.Logado),
    tap(_ => this.consultarStatusLogin()),
  );

  estadoAtualLogin$ = this._consultarEstadoLoginAction
            .pipe(
              switchMap(() => {
                const token = this.localStorageHelper.getItem('token')
                if (token){
                  return of({
                    estado: Estado.Logado,
                    token: token
                  })
                }
                
                return of({
                  estado: Estado.Nao_Logado
                })
              })
            );

  isLogado$: Observable<boolean> = this.estadoAtualLogin$.pipe (
    map(val => val.estado === Estado.Logado),
  );          

  public efetuarLogin(credencial: CredencialRequest){
    this._efetuarLoginAction.next(credencial);
  }

  public consultarStatusLogin(){
    //console.log('chamou o consultar estatus')
    this._consultarEstadoLoginAction.next(true);
  }

  private validarCredenciais(credencial: CredencialRequest): Observable<EstadoLogin> {
    const usuarios: CredencialRequest[] =  [
      {
        username: 'marcos',
        password: '123'
      }
    ]

    const result = usuarios.some(item => item.username === credencial.username && item.password === credencial.password)
    console.log(`Olá, aqui o resultado ${result}.`)
    
    if (result){
      this.localStorageHelper.setItem('token', 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6Im1hcmNvcyIsImV4cCI6MTc1MDExNzk0MSwiaWF0IjoxNzE4NTgxOTQxfQ.sMHbcUdISAmomsmBr3LZP8gCyGzlVnT2hhC7Za-U2dM')
      return of({
        estado: Estado.Logado,
        token: 'xpto'
      })
    }
    return of({
      estado: Estado.Nao_Logado
    })

  }
}
