import { Injectable,  computed, inject, signal } from '@angular/core';
import { 
  BehaviorSubject,
  Observable,
  finalize,
  catchError,
  delay,
  filter,
  map,
  of,
  switchMap,
  tap,
  from,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LocalStorageHelperService } from '../shared/local-storage-helper.service';
import { CredencialRequest, Estado, ResponseApiCredencials, Usuario } from '../shared/interfaces';
import { JwtTokenService } from '../shared/jwt-token.service';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private _localStorageHelper = inject(LocalStorageHelperService)
  private jwtService = inject(JwtTokenService)

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
  hasErroDeLogin = signal<boolean>(false)

  constructor (){
    this._efetuarLoginAction.pipe(
      tap(() => console.log('iniciou validacao de credenciais')),
      filter(c => c.username !== '' && c.password !== ''),
      tap(_ => this.setLoading(true)),
      tap(_ => this.setErroDeLogin(false)),
      switchMap((credencial) => this.validarCredenciais(credencial)),
      delay(1000),
      tap(estado => this.setStateLoging(estado.isLogado)),
      tap(estado => this.setUsuario(estado.usuario)),
      tap(_ => this.setLoading(false)),
      tap(estado => this.setErroDeLogin(estado.isLogado === false)),
      catchError(err => {
        console.log(`Ocorreu um erro, e vai parar de atualizar o login: ${err}`)
        return of({
          isLogado: false,
          isLoading: false,
        })
      }),
      finalize(() => console.log('finalizouuuu')),
      takeUntilDestroyed(),
    ).subscribe(val => console.log(`_resultadoValidacaoCredencial: ${JSON.stringify(val)}`))

    this._consultarEstadoLoginAction
      .pipe(
        tap(_ => this.setLoading(true)),
        map(_ => this._localStorageHelper.getItem('token')),
        switchMap(token => this.getEstadoFromToken(token)),
        delay(400),
        tap(estado => {
            this.setStateLoging(estado.isLogado);
            this.setUsuario(estado.usuario)
        }),
        tap(_ => this.setLoading(false)),
        filter(estado => estado.isLogado),
        takeUntilDestroyed()
      ).subscribe(val => console.log(`_consultarEstadoLoginAction: ${JSON.stringify(val)}`))
  }

  private setErroDeLogin(isErroLogin: boolean){
    this.hasErroDeLogin.set(isErroLogin)
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
              switchMap(res => this.tratarRetornoApiValidate(res)),
              catchError(err => {
                console.log(`ops, ${err}`)
                return of({
                  isLogado: false,
                  isLoading: false
                })
              })
            );
  }

  private getEstadoFromToken(token: string): Observable<Estado> {

    const retornoNegativo = {
      isLogado: false,
      isLoading: false
    } as Estado

    return of(token).pipe(
              map(token => {
                
                if(!token || this.jwtService.isTokenExpired(token)) {
                  return retornoNegativo
                }
          
                const user = this.jwtService.getUser(token)
                const iat = this.jwtService.getCreatedTime(token)
                const exp = this.jwtService.getExpiryTime(token)
                const email = this.jwtService.getEmailId(token)
            
                console.log(this.jwtService.getDecodeToken(token))
            
                return {
                  isLogado: true,
                  isLoading: false,
                  usuario: {
                    nome: user,
                    email: email
                  },
                  dataLogin: new Date(iat),
                  dataExpiracao: new Date(exp)
                } as Estado
              }),
              catchError(err => {
                console.log(`Erro ao tentar obter o estado a partir do token: ${err}`)
                return of(retornoNegativo)
              })
            )
    
  }

  private tratarRetornoApiValidate({status, token}: ResponseApiCredencials): Observable<Estado> {

    if (!status){
      return of({
        isLogado: false,
        isLoading: false
      })
    }

    return this.getEstadoFromToken(token).pipe(
        tap(estado => estado.isLogado &&  this._localStorageHelper.setItem('token', token))
      )
    
  }

  private callApiValidate(credencial: CredencialRequest): Observable<ResponseApiCredencials>{
    const usuarios: CredencialRequest[] =  [
      {
        username: 'marcos',
        password: '123'
      }
    ]

    const token_value = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImRlMDgwNTRjYjc5MzUzYWZkNzY2ZGQ2MzViNmZlM2QwIn0.eyJzdWIiOiJtYXJjb3NyYW1pcm8iLCJleHAiOjE3NTA1ODQwMzAwMDAsImlhdCI6MTcxOTA0ODAzMDAwMCwiZGlzcGxheW5hbWUiOiJNYXJjb3MgUmFtaXJvIiwiZW1haWwiOiJtYXJjb3NAZW1haWwuY29tIn0.oSIBe_JDTh-O9oBANCs7eA8G8z52Ja2YBlXRTe0-NgSP8cT45x-gYtR_7g0b6vOkzbmXw_zR0RS9mPhMylh9Tw';
    
    // expirado
    //const token_value = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImRlMDgwNTRjYjc5MzUzYWZkNzY2ZGQ2MzViNmZlM2QwIn0.eyJzdWIiOiJtYXJjb3NyYW1pcm8iLCJleHAiOjE3MTkwNDgwMzAwMDAsImlhdCI6MTcxOTA0ODAzMDAwMCwiZGlzcGxheW5hbWUiOiJNYXJjb3MgUmFtaXJvIiwiZW1haWwiOiJtYXJjb3NAZW1haWwuY29tIn0.-93qu6j1GSj8q0eLbDFkoJjgSfWK-fpGjbW0F4oRR_QLT9UhzosUbWWhW-5HOLn0wNz6s93iDcPeezWfEKtJeQ';

    const result = usuarios.some(item => item.username === credencial.username && item.password === credencial.password)

    if(result) {
      return of({ status: true, token: token_value })
    }

    return of({status: false, token: ''})

  }

  deslogar(){
    this.limparDadosDeLogin();
    this.consultarStatusLogin();
  }

  private limparDadosDeLogin(){
    this._localStorageHelper.removeItem('token');
  }
}
