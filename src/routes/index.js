const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const authController = require("../controllers/authController");
const produtosController = require("../controllers/produtosController");
const notificacoesController = require("../controllers/notificacoesController");
const historicoController = require("../controllers/historicoController");

// Rotas públicas (sem token)
router.post("/auth/login", authController.login);

// Rotas protegidas (precisam do token)
router.get("/auth/me", auth, authController.me);

router.get("/produtos/dashboard", auth, produtosController.dashboard);
router.get("/produtos", auth, produtosController.listar);
router.get("/produtos/:id", auth, produtosController.buscarPorId);
router.post("/produtos", auth, produtosController.criar);
router.put("/produtos/:id", auth, produtosController.atualizar);
router.delete("/produtos/:id", auth, produtosController.deletar);

router.get("/historico", auth, historicoController.listar);

router.get("/notificacoes", auth, notificacoesController.listar);
router.put(
  "/notificacoes/todas/lida",
  auth,
  notificacoesController.marcarTodasLidas,
);
router.put("/notificacoes/:id/lida", auth, notificacoesController.marcarLida);

module.exports = router;
