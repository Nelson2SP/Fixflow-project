// server.js - Backend para assistência técnica
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
// Configuração de CORS para aceitar requisições de qualquer origem (necessário para a Vercel)
app.use(cors({
  origin: '*', // Permite qualquer domínio (para testes). Em produção, você pode restringir para o domínio da Vercel.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// ROTA PRINCIPAL (raiz)
app.get('/', (req, res) => {
  res.json({ 
    mensagem: '🔥 API FixFlow está no ar!', 
    status: 'online',
    versao: '1.0.0'
  });
});

// ===== CONEXÃO COM SUPABASE =====
// IMPORTANTE: Depois que criar as tabelas, você vai substituir essas variáveis
const supabaseUrl = 'https://nqxmojacgnblxfiqkkeo.supabase.co';
const supabaseKey = 'sb_publishable_tAoELxOpteV2pOjrYMMfAg_EWrQnvtv';
const supabase = createClient(supabaseUrl, supabaseKey);

// ===== ROTA DE TESTE (para ver se o servidor está vivo) =====
app.get('/', (req, res) => {
  res.json({ 
    mensagem: '🔥 API FixFlow está no ar!', 
    status: 'online',
    versao: '1.0.0'
  });
});

// ROTA: Listar todas as OS
app.get('/api/os', async (req, res) => {
  try {
    const { data: ordens, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calcular KPIs
    const total = ordens?.length || 0;
    const emManutencao = ordens?.filter(o => o.status === 'EM MANUTENÇÃO').length || 0;
    const pronto = ordens?.filter(o => o.status === 'PRONTO').length || 0;
    const entregue = ordens?.filter(o => o.status === 'ENTREGUE').length || 0;
    const aguardandoPeca = ordens?.filter(o => o.status === 'AGUARDANDO PEÇA').length || 0;

    res.json({
      sucesso: true,
      kpis: { total, emManutencao, pronto, entregue, aguardandoPeca },
      registros: ordens || []
    });

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// ROTA: Criar nova OS
app.post('/api/os', async (req, res) => {
  try {
    const { 
      cliente_nome, 
      cliente_telefone, 
      aparelho, 
      modelo, 
      problema, 
      tecnico, 
      prazo, 
      observacoes 
    } = req.body;

    // Contar quantas OS já existem para gerar número
    const { count, error: countError } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    const numero_os = `OS-${String((count || 0) + 1).padStart(4, '0')}`;

    const { data, error } = await supabase
      .from('ordens_servico')
      .insert([{
        numero_os,
        empresa_id: '11111111-1111-1111-1111-111111111111', // Depois trocamos pelo ID real
        cliente_nome,
        cliente_telefone,
        aparelho,
        modelo,
        problema,
        tecnico: tecnico || 'PENDENTE',
        prazo,
        status: 'RECEBIDO',
        observacoes
      }]);

    if (error) throw error;
    res.json({ sucesso: true, data });

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// ROTA: Atualizar OS
app.put('/api/os/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('ordens_servico')
      .update(updates)
      .match({ id });

    if (error) throw error;
    res.json({ sucesso: true, data });

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// ROTA: Excluir OS
app.delete('/api/os/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('ordens_servico')
      .delete()
      .match({ id });

    if (error) throw error;
    res.json({ sucesso: true, mensagem: 'OS excluída com sucesso!' });

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});
// ===== INICIALIZAÇÃO =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor FixFlow rodando na porta ${PORT}`);
});
