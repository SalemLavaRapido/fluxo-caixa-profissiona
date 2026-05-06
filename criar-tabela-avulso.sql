-- EXECUTAR NO SUPABASE SQL EDITOR
-- Criar tabela de movimentação de veículos avulsos

CREATE TABLE movimentacao_avulso (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    placa TEXT NOT NULL,
    cliente_nome TEXT,
    telefone TEXT,
    data_entrada TIMESTAMPTZ DEFAULT NOW(),
    data_saida TIMESTAMPTZ,
    minutos INTEGER,
    horas INTEGER,
    valor NUMERIC(10,2),
    status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'finalizado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE movimentacao_avulso ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Usuários podem ver seus registros" ON movimentacao_avulso 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus registros" ON movimentacao_avulso 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus registros" ON movimentacao_avulso 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus registros" ON movimentacao_avulso 
FOR DELETE USING (auth.uid() = user_id);

-- Criar índice para busca por placa
CREATE INDEX idx_movimentacao_placa ON movimentacao_avulso(placa);
CREATE INDEX idx_movimentacao_status ON movimentacao_avulso(status);
