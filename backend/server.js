// ===== SERVIDOR FIXFLOW =====

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ===== CONFIGURAÇÃO =====

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ===== CONEXÃO COM SUPABASE =====
// As credenciais ficam nas Environment Variables do Render.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('ERRO: SUPABASE_URL ou SUPABASE_KEY não configuradas.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ===== ROTA PRINCIPAL / TESTE =====

app.get('/', (req, res) => {
    res.json({
        mensagem: '🔥 API FixFlow está no ar!',
        status: 'online',
        versao: '1.0.0'
    });
});

// ===== LISTAR ORDENS DE SERVIÇO =====

app.get('/api/os', async (req, res) => {
    try {
        const { data: ordens, error } = await supabase
            .from('ordens_servico')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        const total = ordens?.length || 0;

        const emManutencao =
            ordens?.filter(o => o.status === 'EM MANUTENÇÃO').length || 0;

        const pronto =
            ordens?.filter(o => o.status === 'PRONTO').length || 0;

        const entregue =
            ordens?.filter(o => o.status === 'ENTREGUE').length || 0;

        const aguardandoPeca =
            ordens?.filter(o => o.status === 'AGUARDANDO PEÇA').length || 0;

        res.json({
            sucesso: true,
            kpis: {
                total,
                emManutencao,
                pronto,
                entregue,
                aguardandoPeca
            },
            registros: ordens || []
        });

    } catch (error) {
        console.error('Erro ao listar OS:', error);

        res.status(500).json({
            sucesso: false,
            erro: error.message
        });
    }
});

// ===== CRIAR ORDEM DE SERVIÇO =====

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

        // Contar OS existentes
        const { count, error: countError } = await supabase
            .from('ordens_servico')
            .select('*', {
                count: 'exact',
                head: true
            });

        if (countError) {
            throw countError;
        }

        const numero_os =
            `OS-${String((count || 0) + 1).padStart(4, '0')}`;

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
            }])
            .select();

        if (error) {
            throw error;
        }

        res.json({
            sucesso: true,
            data
        });

    } catch (error) {
        console.error('Erro ao criar OS:', error);

        res.status(500).json({
            sucesso: false,
            erro: error.message
        });
    }
});

// ===== ATUALIZAR ORDEM DE SERVIÇO =====

app.put('/api/os/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('ordens_servico')
            .update(updates)
            .match({ id })
            .select();

        if (error) {
            throw error;
        }

        res.json({
            sucesso: true,
            data
        });

    } catch (error) {
        console.error('Erro ao atualizar OS:', error);

        res.status(500).json({
            sucesso: false,
            erro: error.message
        });
    }
});

// ===== EXCLUIR ORDEM DE SERVIÇO =====

app.delete('/api/os/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('ordens_servico')
            .delete()
            .match({ id });

        if (error) {
            throw error;
        }

        res.json({
            sucesso: true,
            mensagem: 'OS excluída com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao excluir OS:', error);

        res.status(500).json({
            sucesso: false,
            erro: error.message
        });
    }
});

// ===== INICIALIZAÇÃO DO SERVIDOR =====

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🔥 Servidor FixFlow rodando na porta ${PORT}`);
});
