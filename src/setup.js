const pool = require("./config/database");

const criarTabelas = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        login VARCHAR(50) UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        cargo VARCHAR(50) DEFAULT 'operador',
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) UNIQUE NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nome VARCHAR(150) NOT NULL,
        descricao TEXT,
        categoria_id INTEGER REFERENCES categorias(id),
        unidade VARCHAR(30) DEFAULT 'unidade',
        quantidade NUMERIC(10,2) DEFAULT 0,
        qtd_minima NUMERIC(10,2) DEFAULT 0,
        preco NUMERIC(10,2),
        data_compra DATE,
        validade DATE,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS movimentacoes (
        id SERIAL PRIMARY KEY,
        produto_id INTEGER REFERENCES produtos(id) NOT NULL,
        usuario_id INTEGER REFERENCES usuarios(id) NOT NULL,
        tipo VARCHAR(10) CHECK (tipo IN ('entrada', 'saida')) NOT NULL,
        quantidade NUMERIC(10,2) NOT NULL,
        observacao TEXT,
        criado_em TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS notificacoes (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(150) NOT NULL,
        mensagem TEXT,
        tipo VARCHAR(50),
        lida BOOLEAN DEFAULT false,
        criado_em TIMESTAMP DEFAULT NOW()
      );
    `);

    const bcrypt = require("bcrypt");
    const hash = await bcrypt.hash("admin123", 10);
    await pool.query(
      `INSERT INTO usuarios (nome, login, senha, cargo)
       VALUES ('Administrador', 'admin', $1, 'admin')
       ON CONFLICT (login) DO NOTHING`,
      [hash],
    );

    console.log("✅ Tabelas criadas com sucesso!");
  } catch (erro) {
    console.error("❌ Erro ao criar tabelas:", erro.message);
  }
};

module.exports = criarTabelas;
