export interface Estado {
    isLogado: boolean
    isLoading: boolean,
    usuario?: Usuario,
    dataLogin?: Date,
    dataExpiracao?: Date
}

export interface Usuario {
    nome: string,

}

export interface CredencialRequest {
    username: string,
    password: string
}

export interface Token {
  role: string,
  exp: number,
  user: string,
  iat: number
}

export interface ResponseApiCredencials {
  status: boolean,
  token?: string
}
