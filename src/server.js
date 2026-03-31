const express = require("express");
const cors = require("cors");
require("dotenv").config();

const rotas = require("./routes/index");

const app = express();

// Permite requisições do frontend React
app.use(cors());

// Permite receber JSON no body das requisições
app.use(express.json());

// Todas as rotas da API
app.use("/api", rotas);

// Rota de teste — confirma que o servidor está no ar
app.get("/", (req, res) => {
  res.json({ status: "RTweb API rodando ✅" });
});

// Inicia o servidor na porta definida no .env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
