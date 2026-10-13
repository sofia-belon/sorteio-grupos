/*
|--------------------------------------------------------------------------
| Ponto de entrada JavaScript para os comandos Ace
|--------------------------------------------------------------------------
|
| Registra o hook do TypeScript e delega para bin/console.ts
|
*/
import 'ts-node-maintained/register/esm'

await import('./bin/console.js')
