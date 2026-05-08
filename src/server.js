const express = require("express");
const cors = require("cors");
require("dotenv").config();

const rotas = require("./routes/index");
const criarTabelas = require("./setup");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", rotas);

app.get("/", (req, res) => {
  res.json({ status: "RTweb API rodando ✅" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  await criarTabelas();
});
