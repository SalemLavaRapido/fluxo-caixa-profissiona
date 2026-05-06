-- EXECUTAR NO SUPABASE SQL EDITOR
-- Sistema completo de Mensalistas com Veículos e Lavagens

-- =====================================================
-- 1. TABELA DE CLIENTES MENSALISTAS
-- =====================================================
CREATE TABLE clientes_estacionamento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    valor_mensal NUMERIC(10,2) DEFAULT 0,
    dia_vencimento INTEGER DEFAULT 10,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para clientes
ALTER TABLE clientes_estacionamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_clientes" ON clientes_estacionamento 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_clientes" ON clientes_estacionamento 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_clientes" ON clientes_estacionamento 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_clientes" ON clientes_estacionamento 
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 2. TABELA DE VEÍCULOS (múltiplos por cliente)
-- =====================================================
CREATE TABLE veiculos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES clientes_estacionamento(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    placa TEXT NOT NULL,
    modelo TEXT,
    cor TEXT,
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para veículos
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_veiculos" ON veiculos 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_veiculos" ON veiculos 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_veiculos" ON veiculos 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_veiculos" ON veiculos 
FOR DELETE USING (auth.uid() = user_id);

-- Índice para busca por placa
CREATE INDEX idx_veiculos_placa ON veiculos(placa);
CREATE INDEX idx_veiculos_cliente ON veiculos(cliente_id);

-- =====================================================
-- 3. TABELA DE LAVAGENS
-- =====================================================
CREATE TABLE lavagens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    veiculo_id UUID REFERENCES veiculos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    data_lavagem TIMESTAMPTZ DEFAULT NOW(),
    valor NUMERIC(10,2) DEFAULT 0,
    tipo_lavagem TEXT DEFAULT 'simples',
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para lavagens
ALTER TABLE lavagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_lavagens" ON lavagens 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_lavagens" ON lavagens 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_lavagens" ON lavagens 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_lavagens" ON lavagens 
FOR DELETE USING (auth.uid() = user_id);

-- Índice para busca por veículo
CREATE INDEX idx_lavagens_veiculo ON lavagens(veiculo_id);
CREATE INDEX idx_lavagens_data ON lavagens(data_lavagem);

-- =====================================================
-- 4. TABELA DE PAGAMENTOS MENSALIDADE
-- =====================================================
CREATE TABLE pagamentos_mensalidade (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES clientes_estacionamento(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    mes_referencia TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    data_pagamento TIMESTAMPTZ DEFAULT NOW(),
    forma_pagamento TEXT DEFAULT 'dinheiro',
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para pagamentos
ALTER TABLE pagamentos_mensalidade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_pagamentos" ON pagamentos_mensalidade 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_pagamentos" ON pagamentos_mensalidade 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_pagamentos" ON pagamentos_mensalidade 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_pagamentos" ON pagamentos_mensalidade 
FOR DELETE USING (auth.uid() = user_id);

-- Índice
CREATE INDEX idx_pagamentos_cliente ON pagamentos_mensalidade(cliente_id);
CREATE INDEX idx_pagamentos_mes ON pagamentos_mensalidade(mes_referencia);
