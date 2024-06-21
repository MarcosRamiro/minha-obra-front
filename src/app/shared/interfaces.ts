export interface Estado {
    isLogado: boolean
    isLoading: boolean,
    usuario: Usuario | undefined,
    dataLogin: Date | undefined,
    dataExpiracao: Date | undefined
}

export interface Usuario {
    nome: string,
    
}

export interface CredencialRequest {
    username: string,
    password: string
}
