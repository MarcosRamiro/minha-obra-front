import { Injectable,  computed, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, delay, filter, map, of, switchMap, tap } from 'rxjs';
import { LocalStorageHelperService } from '../shared/local-storage-helper.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CredencialRequest, Estado, Usuario } from '../shared/interfaces';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private _localStorageHelper = inject(LocalStorageHelperService)

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
    const usuarios: CredencialRequest[] =  [
      {
        username: 'marcos',
        password: '123'
      }
    ]

    this.limparDadosDeLogin();

    const result = usuarios.some(item => item.username === credencial.username && item.password === credencial.password)
    
    let token_value = 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJleHAiOjE3NTA0NjQ3MjMsInVzZXIiOiJtYXJjb3MiLCJpYXQiOjE3MTg5Mjg3MjN9.dsvGSHZUJG2Ae609ecapfru04m85nFmSmPD7DY-W7JE';
    
    if (result){
      this._localStorageHelper.setItem('token', token_value)
      return of({
        isLogado: true,
        isLoading: false,
        usuario: {
          nome: 'Marcos'
        },
        dataLogin: new Date(),
        dataExpiracao: new Date()
      })
    }
    return of({
      isLoading: false,
      isLogado: false,
      usuario: undefined,
      dataLogin: undefined,
      dataExpiracao: undefined
    })

  }

  deslogar(){
    this.limparDadosDeLogin();
    this.consultarStatusLogin();
  }

  private limparDadosDeLogin(){
    this._localStorageHelper.removeItem('token');
  }
}
