const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
require("dotenv").config();

// POST /auth/login
const login = async (req, res) => {
  try {
    // Pega login e senha do corpo da requisição
    const { login, senha } = req.body;

    // Valida se os campos foram enviados
    if (!login || !senha) {
      return res.status(400).json({ erro: "Login e senha são obrigatórios" });
    }

    // Busca o usuário no banco pelo login
    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE login = $1 AND ativo = true",
      [login],
    );

    // Se não encontrou nenhum usuário
    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: "Login ou senha incorretos" });
    }

    const usuario = resultado.rows[0];

    // Compara a senha digitada com a senha criptografada no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Login ou senha incorretos" });
    }

    // Gera o token JWT com os dados do usuário
    // O token expira em 8 horas
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, cargo: usuario.cargo },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    // Retorna o token e os dados do usuário (sem a senha)
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        cargo: usuario.cargo,
      },
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

// GET /auth/me — retorna os dados do usuário logado
const me = async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id, nome, login, cargo FROM usuarios WHERE id = $1",
      [req.usuario.id],
    );
    res.json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

module.exports = { login, me };
