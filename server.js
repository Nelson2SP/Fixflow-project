// server.js - Backend para assistência técnica
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== CONEXÃO COM SUPABASE =====
// IMPORTANTE: Depois que criar as tabelas, você vai substituir essas variáveis
const supabaseUrl = 'https://SEU_PROJETO.supabase.co';
const supabaseKey = 'SUA_CHAVE_ANON';
const supabase = createClient(supabaseUrl, supabaseKey);

// ===== ROTA DE TESTE (para ver se o servidor está vivo) =====
app.get('/', (req, res) => {
  res.json({ 
    mensagem: '🔥 API FixFlow está no ar!', 
    status: 'online',
    versao: '1.0.0'
  });
});

// ===== ROTA PARA LISTAR OS (exemplo) =====
app.get('/api/os', async (req, res) => {
  try {
    // Por enquanto, retorna dados de exemplo
    res.json([
      { id: 1, cliente: 'João Silva', aparelho: 'iPhone 13', status: 'EM MANUTENÇÃO' },
      { id: 2, cliente: 'Maria Souza', aparelho: 'Samsung S23', status: 'PRONTO' },
    ]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// ===== INICIALIZAÇÃO =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor FixFlow rodando na porta ${PORT}`);
});
