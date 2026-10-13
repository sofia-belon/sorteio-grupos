/**
 * Usuário logado, no formato que a API devolve (sem a senha).
 * Compartilhado entre o servidor e o front-end.
 */
export interface Usuario {
  id: number
  nome: string
  email: string
}
