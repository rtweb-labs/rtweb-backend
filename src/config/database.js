// Importa a biblioteca pg para conectar ao PostgreSQL
const { Pool } = require("pg");

// Carrega as variáveis do .env
require("dotenv").config();

// Cria um "pool" de conexões com o banco
// Pool = grupo de conexões reutilizáveis (mais eficiente que abrir uma nova conexão a cada requisição)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  family: 4, // força IPv4
});

// Testa a conexão quando o servidor iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Erro ao conectar ao banco:", err.message);
  } else {
    console.log("✅ Banco de dados conectado!");
    release();
  }
});

// Exporta o pool para ser usado nos controllers
module.exports = pool;
