const pool = require("../config/database");

// GET /notificacoes
const listar = async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM notificacoes ORDER BY criado_em DESC",
    );
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

// PUT /notificacoes/:id/lida
const marcarLida = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE notificacoes SET lida=true WHERE id=$1", [id]);
    res.json({ mensagem: "Notificação marcada como lida" });
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

// PUT /notificacoes/todas/lida
const marcarTodasLidas = async (req, res) => {
  try {
    await pool.query("UPDATE notificacoes SET lida=true");
    res.json({ mensagem: "Todas as notificações marcadas como lidas" });
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

module.exports = { listar, marcarLida, marcarTodasLidas };
