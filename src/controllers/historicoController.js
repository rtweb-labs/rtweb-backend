const pool = require("../config/database");

// GET /historico
const listar = async (req, res) => {
  try {
    const { busca, tipo, data_inicio, data_fim } = req.query;

    let query = `
      SELECT m.*, p.nome as produto_nome, p.codigo as produto_codigo,
             u.nome as usuario_nome
      FROM movimentacoes m
      JOIN produtos p ON m.produto_id = p.id
      JOIN usuarios u ON m.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (busca) {
      params.push(`%${busca}%`);
      query += ` AND (p.nome ILIKE $${params.length} OR p.codigo ILIKE $${params.length})`;
    }

    if (tipo) {
      params.push(tipo);
      query += ` AND m.tipo = $${params.length}`;
    }

    if (data_inicio) {
      params.push(data_inicio);
      query += ` AND m.criado_em >= $${params.length}`;
    }

    if (data_fim) {
      params.push(data_fim);
      query += ` AND m.criado_em <= $${params.length}`;
    }

    query += " ORDER BY m.criado_em DESC";

    const resultado = await pool.query(query, params);
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

module.exports = { listar };
