import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Conexão com o SQLite usando o módulo nativo do Node (node:sqlite).
 * O banco inteiro é o arquivo tmp/db.sqlite3, criado na primeira execução.
 */
const pasta = join(process.cwd(), 'tmp')
mkdirSync(pasta, { recursive: true })

const db = new DatabaseSync(join(pasta, 'db.sqlite3'))

/**
 * Cria as tabelas caso ainda não existam (faz o papel das migrations).
 * Os integrantes de cada grupo ficam guardados como JSON numa coluna TEXT.
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS sorteios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tamanho_grupo INTEGER NOT NULL,
    total_participantes INTEGER NOT NULL,
    sorteado_em TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS grupos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sorteio_id INTEGER NOT NULL REFERENCES sorteios(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    integrantes TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    criado_em TEXT NOT NULL
  );
`)

export default db
