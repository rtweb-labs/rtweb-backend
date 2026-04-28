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

// GET /historico/grafico
const grafico = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        TO_CHAR(criado_em, 'Mon') AS mes,
        EXTRACT(MONTH FROM criado_em) AS mes_num,
        EXTRACT(YEAR FROM criado_em) AS ano,
        SUM(CASE WHEN tipo = 'entrada' THEN quantidade ELSE 0 END) AS entradas,
        SUM(CASE WHEN tipo = 'saida' THEN quantidade ELSE 0 END) AS saidas
      FROM movimentacoes
      WHERE criado_em >= NOW() - INTERVAL '9 months'
      GROUP BY mes, mes_num, ano
      ORDER BY ano, mes_num
    `);
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

// GET /historico/recentes
const recentes = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT DISTINCT ON (m.produto_id)
        p.nome,
        m.tipo,
        m.quantidade,
        m.criado_em
      FROM movimentacoes m
      JOIN produtos p ON m.produto_id = p.id
      ORDER BY m.produto_id, m.criado_em DESC
      LIMIT 3
    `);
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

module.exports = { listar, grafico, recentes };
