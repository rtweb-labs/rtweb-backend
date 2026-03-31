const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware = função que roda ANTES do controller
// Verifica se o token JWT é válido em toda rota protegida
module.exports = (req, res, next) => {
  // Pega o token do header da requisição
  // O frontend envia assim: Authorization: Bearer eyJhbGci...
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // pega só o token, sem "Bearer"

  // Se não tem token → acesso negado
  if (!token) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  // Verifica se o token é válido e não expirou
  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ erro: "Token inválido ou expirado" });
    }

    // Token válido → salva os dados do usuário na requisição
    // e passa para o próximo (controller)
    req.usuario = usuario;
    next(); // next() = "pode continuar para o controller"
  });
};
