// server.js - Backend para assistência técnica
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ===== CONFIGURAÇÃO DE CORS (CORRIGIDA) =====
app.use(cors({
  origin: '*', // ← TEM QUE ESTAR COM '*' (asterisco)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ===== CONEXÃO COM SUPABASE =====
// ⚠️ IMPORTANTE: Substitua pelos valores do SEU projeto!
const supabaseUrl = 'https://rkdpanqjecqdthwclhki.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZHBhbnFqZWNxZHRod2NsaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjQ3NjAsImV4cCI6MjA1OTYwMDc2MH0.BfT4p6DpqEPhHgRMPbWt95_f0hZxWoiLVZ-aL3lxd_A';
const supabase = createClient(supabaseUrl, supabaseKey);

// ===== ROTA DE TESTE =====
app.get('/', (req, res) => {
  res.json({ mensagem: '🔥 API FixFlow está no ar!', status: 'online', versao: '1.0.0' });
});

// ===== ROTA PARA LISTAR OS =====
app.get('/api/os', async (req, res) => {
  try {
    const { data: ordens, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

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

// ===== ROTA PARA CRIAR OS =====
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

    const { count, error: countError } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    const numero_os = `OS-${String((count || 0) + 1).padStart(4, '0')}`;

    const { data, error } = await supabase
      .from('ordens_servico')
      .insert([{
        numero_os,
        empresa_id: '11111111-1111-1111-1111-111111111111',
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

// ===== ROTA PARA ATUALIZAR OS =====
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

// ===== ROTA PARA EXCLUIR OS =====
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
