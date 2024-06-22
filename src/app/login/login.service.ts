import { Injectable,  computed, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, delay, filter, map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LocalStorageHelperService } from '../shared/local-storage-helper.service';
import { CredencialRequest, Estado, ResponseApiCredencials, Usuario } from '../shared/interfaces';
import { JWTTokenService } from './JWTToken.service';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private _localStorageHelper = inject(LocalStorageHelperService)
  private jwtService = inject(JWTTokenService)

  private _efetuarLoginAction = new BehaviorSubject<CredencialRequest>({username: '', password: ''});
  private _consultarEstadoLoginAction = new  BehaviorSubject<boolean>(true);

  private state = signal<Estado>( {
    isLogado: false,
    isLoading: false,
    usuario: undefined,
    dataLogin: undefined,
    dataExpiracao: undefined

  });

  isLogado = computed(() => this.state().isLogado)
  isLoading = computed(() => this.state().isLoading)
  usuario = computed(() => this.state().usuario)
  dataLogin = computed(() => this.state().dataLogin)
  dataExpiracao = computed(() => this.state().dataExpiracao)

  constructor (){
    this._efetuarLoginAction.pipe(
      filter(c => c.username !== '' && c.password !== ''),
      tap(_ => this.setLoading(true)),
      switchMap(this.validarCredenciais.bind(this)),
      catchError(err => {
        console.error(`Ocorreu um erro: ${err}`)
        return of({
          isLogado: false,
          isLoading: false,
          usuario: undefined,
          dataLogin: undefined,
          dataExpiracao: undefined
        })
      }),
      delay(1000),
      tap(resultado => this.setStateLoging(resultado.isLogado)),
      tap(resultado => this.setUsuario(resultado.usuario)),
      tap(_ => this.setLoading(false)),
      takeUntilDestroyed(),
    ).subscribe(val => console.log(`_resultadoValidacaoCredencial: ${JSON.stringify(val)}`))

    this._consultarEstadoLoginAction
      .pipe(
        tap(_ => this.setLoading(true)),
        map(_ => this._localStorageHelper.getItem('token')),
        delay(400),
        tap(token => {
            this.setStateLoging(!!token);
            this.setUsuario(token ? { nome: 'Marcos'} : undefined)
        }),
        tap(_ => this.setLoading(false)),
        filter(token => !!token),
        takeUntilDestroyed()
      ).subscribe(val => console.log(`_consultarEstadoLoginAction: ${val}`))
  }

  private setStateLoging(isLogado: boolean){
    this.state.update(state => ({
      ...state,
      isLogado: isLogado
    }));
  }

  private setLoading(isLoading: boolean){
    this.state.update(state => ({
      ...state,
      isLoading: isLoading
    }));
  }

  private setUsuario(usuario: Usuario | undefined){
    if (usuario){
      this.state.update(state => ({
        ...state,
        usuario: usuario
      }));
    }
  }

  public efetuarLogin(credencial: CredencialRequest){
    this._efetuarLoginAction.next(credencial);
  }

  public consultarStatusLogin(){
    console.log('chamou o consultar estatus')
    this._consultarEstadoLoginAction.next(true);
  }

  private validarCredenciais(credencial: CredencialRequest): Observable<Estado> {

    this.limparDadosDeLogin();

    return this.callApiValidate(credencial).pipe(
              tap(res => {
                if (res.status){
                  this._localStorageHelper.setItem('token', res.token)
                }
              }),
              map(this.tratarRetornoApiValidate)
            );
  }

  private tratarRetornoApiValidate({status, token }: ResponseApiCredencials): Estado {
    if (status){

      //this.jwtService.setToken(token+'');

      //console.log(this.jwtService.getDecodeToken());

      return {
        isLogado: true,
        isLoading: false,
        usuario: {
          nome: `Marcos`
        },
        dataLogin: new Date(),
        dataExpiracao: new Date()
      }
    } else {
      return {
        isLogado: false,
        isLoading: false
      }

    }
  }

  private callApiValidate(credencial: CredencialRequest): Observable<ResponseApiCredencials>{
    const usuarios: CredencialRequest[] =  [
      {
        username: 'marcos',
        password: '123'
      }
    ]

    let token_value = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImRlMDgwNTRjYjc5MzUzYWZkNzY2ZGQ2MzViNmZlM2QwIn0.eyJzdWIiOiJtYXJjb3NyYW1pcm8iLCJleHAiOjE3NTA1NzEwNzAsImlhdCI6MTcxOTAyNDA0NiwiZGlzcGxheW5hbWUiOiJNYXJjb3MgUmFtaXJvIiwiZW1haWwiOiJtYXJjb3NAZW1haWwuY29tIn0.54TFdh504rbWCbXQDewBNO3WmEcdEShan4Q8uRiMPaduFhx9zi8aOhcVdJwRyYksPNCd9lEuhlCrgpDJbSG7Ww';

    const result = usuarios.some(item => item.username === credencial.username && item.password === credencial.password)

    if(result) {
      return of({ status: true, token: token_value })
    }

    return of({status: false})

  }

  deslogar(){
    this.limparDadosDeLogin();
    this.consultarStatusLogin();
  }

  private limparDadosDeLogin(){
    this._localStorageHelper.removeItem('token');
  }
}
