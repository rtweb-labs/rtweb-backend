const pool = require("../config/database");

// GET /produtos — lista todos os produtos
const listar = async (req, res) => {
  try {
    const { busca, categoria_id } = req.query;

    let query = `
      SELECT p.*, c.nome as categoria_nome 
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.ativo = true
    `;
    const params = [];

    // Filtro de busca por nome ou código
    if (busca) {
      params.push(`%${busca}%`);
      query += ` AND (p.nome ILIKE $${params.length} OR p.codigo ILIKE $${params.length})`;
    }

    // Filtro por categoria
    if (categoria_id) {
      params.push(categoria_id);
      query += ` AND p.categoria_id = $${params.length}`;
    }

    query += " ORDER BY p.nome ASC";

    const resultado = await pool.query(query, params);
    res.json(resultado.rows);
  } catch (erro) {
    console.error("Erro ao listar produtos:", erro);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

// GET /produtos/:id — busca um produto pelo id
const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      `SELECT p.*, c.nome as categoria_nome 
       FROM produtos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = $1 AND p.ativo = true`,
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

// POST /produtos — cria um produto novo
const criar = async (req, res) => {
  try {
    const {
      codigo,
      nome,
      descricao,
      categoria_id,
      unidade,
      quantidade,
      qtd_minima,
      preco,
      data_compra,
      validade,
    } = req.body;

    if (!codigo || !nome) {
      return res.status(400).json({ erro: "Código e nome são obrigatórios" });
    }

    const resultado = await pool.query(
      `INSERT INTO produtos (codigo, nome, descricao, categoria_id, unidade, quantidade, qtd_minima, preco, data_compra, validade)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        codigo,
        nome,
        descricao,
        categoria_id,
        unidade || "unidade",
        quantidade || 0,
        qtd_minima || 0,
        preco,
        data_compra,
        validade,
      ],
    );

    // Registra a movimentação de entrada
    if (quantidade > 0) {
      await pool.query(
        `INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, observacao)
         VALUES ($1, $2, 'entrada', $3, 'Cadastro inicial')`,
        [resultado.rows[0].id, req.usuario.id, quantidade],
      );
    }

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    if (erro.code === "23505") {
      return res.status(400).json({ erro: "Código já cadastrado" });
    }
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

// PUT /produtos/:id — atualiza um produto
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      descricao,
      categoria_id,
      unidade,
      quantidade,
      qtd_minima,
      preco,
      data_compra,
      validade,
    } = req.body;

    const resultado = await pool.query(
      `UPDATE produtos 
       SET nome=$1, descricao=$2, categoria_id=$3, unidade=$4, quantidade=$5, qtd_minima=$6, preco=$7, data_compra=$8, validade=$9
       WHERE id=$10 AND ativo=true
       RETURNING *`,
      [
        nome,
        descricao,
        categoria_id,
        unidade,
        quantidade,
        qtd_minima,
        preco,
        data_compra,
        validade,
        id,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

// DELETE /produtos/:id — soft delete (não apaga, só desativa)
const deletar = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "UPDATE produtos SET ativo=false WHERE id=$1 RETURNING *",
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json({ mensagem: "Produto removido com sucesso" });
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

// GET /produtos/dashboard — dados para o dashboard
const dashboard = async (req, res) => {
  try {
    const total = await pool.query(
      "SELECT COUNT(*) FROM produtos WHERE ativo=true",
    );
    const baixo = await pool.query(
      "SELECT COUNT(*) FROM produtos WHERE ativo=true AND quantidade <= qtd_minima",
    );
    const vencendo = await pool.query(
      `SELECT COUNT(*) FROM produtos WHERE ativo=true AND validade BETWEEN NOW() AND NOW() + INTERVAL '7 days'`,
    );
    const vencidos = await pool.query(
      "SELECT COUNT(*) FROM produtos WHERE ativo=true AND validade < NOW()",
    );

    res.json({
      total: parseInt(total.rows[0].count),
      estoque_baixo: parseInt(baixo.rows[0].count),
      vencendo: parseInt(vencendo.rows[0].count),
      vencidos: parseInt(vencidos.rows[0].count),
    });
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, deletar, dashboard };
