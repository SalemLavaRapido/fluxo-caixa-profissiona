-- EXECUTAR NO SUPABASE SQL EDITOR
-- Configurações necessárias para o sistema de mensalistas funcionar corretamente

-- 1. Verificar se as tabelas existem e criar se necessário
-- Tabela de clientes do estacionamento
CREATE TABLE IF NOT EXISTS clientes_estacionamento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    nome TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    valor_mensalidade NUMERIC(10,2) DEFAULT 150.00,
    data_vencimento DATE,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de veículos
CREATE TABLE IF NOT EXISTS veiculos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    cliente_id UUID REFERENCES clientes_estacionamento(id) ON DELETE CASCADE,
    placa TEXT NOT NULL,
    modelo TEXT,
    cor TEXT,
    tipo_veiculo TEXT DEFAULT 'carro',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de lavagens
CREATE TABLE IF NOT EXISTS lavagens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    veiculo_id UUID REFERENCES veiculos(id) ON DELETE CASCADE,
    data_lavagem TIMESTAMPTZ DEFAULT NOW(),
    tipo_lavagem TEXT DEFAULT 'simples',
    valor NUMERIC(10,2),
    tipo_cliente TEXT DEFAULT 'avulso',
    celular TEXT,
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pagamentos de mensalidade
CREATE TABLE IF NOT EXISTS pagamentos_mensalidade (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    cliente_id UUID REFERENCES clientes_estacionamento(id) ON DELETE CASCADE,
    valor_pago NUMERIC(10,2) NOT NULL,
    valor NUMERIC(10,2),
    data_pagamento TIMESTAMPTZ DEFAULT NOW(),
    mes_referencia TEXT,
    forma_pagamento TEXT DEFAULT 'dinheiro',
    status TEXT DEFAULT 'pago' CHECK (status IN ('pago', 'pendente')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar coluna valor_pago se não existir (para bancos existentes)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos_mensalidade' AND column_name = 'valor_pago') THEN
        ALTER TABLE pagamentos_mensalidade ADD COLUMN valor_pago NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos_mensalidade' AND column_name = 'status') THEN
        ALTER TABLE pagamentos_mensalidade ADD COLUMN status TEXT DEFAULT 'pago';
    END IF;
END $$;

-- Adicionar coluna data_entrada se não existir na tabela entradas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entradas' AND column_name = 'data_entrada') THEN
        ALTER TABLE entradas ADD COLUMN data_entrada TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Adicionar coluna placa se não existir na tabela entradas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entradas' AND column_name = 'placa') THEN
        ALTER TABLE entradas ADD COLUMN placa TEXT;
    END IF;
END $$;

-- Adicionar coluna cliente_id se não existir na tabela entradas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entradas' AND column_name = 'cliente_id') THEN
        ALTER TABLE entradas ADD COLUMN cliente_id UUID;
    END IF;
END $$;

-- Tabela de entradas do fluxo de caixa
CREATE TABLE IF NOT EXISTS entradas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    valor NUMERIC(10,2) NOT NULL,
    categoria TEXT DEFAULT 'mensalidade',
    descricao TEXT,
    data_entrada TIMESTAMPTZ DEFAULT NOW(),
    cliente_id UUID REFERENCES clientes_estacionamento(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS em todas as tabelas
ALTER TABLE clientes_estacionamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lavagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos_mensalidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE entradas ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS se não existirem
-- Políticas para clientes_estacionamento
DROP POLICY IF EXISTS "Usuários podem ver seus clientes" ON clientes_estacionamento;
CREATE POLICY "Usuários podem ver seus clientes" ON clientes_estacionamento 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus clientes" ON clientes_estacionamento;
CREATE POLICY "Usuários podem inserir seus clientes" ON clientes_estacionamento 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus clientes" ON clientes_estacionamento;
CREATE POLICY "Usuários podem atualizar seus clientes" ON clientes_estacionamento 
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus clientes" ON clientes_estacionamento;
CREATE POLICY "Usuários podem atualizar status de seus clientes" ON clientes_estacionamento 
FOR UPDATE USING (auth.uid() = user_id AND status IN ('ativo', 'inativo'));

-- Políticas para veículos
DROP POLICY IF EXISTS "Usuários podem ver seus veículos" ON veiculos;
CREATE POLICY "Usuários podem ver seus veículos" ON veiculos 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus veículos" ON veiculos;
CREATE POLICY "Usuários podem inserir seus veículos" ON veiculos 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus veículos" ON veiculos;
CREATE POLICY "Usuários podem atualizar seus veículos" ON veiculos 
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus veículos" ON veiculos;
CREATE POLICY "Usuários podem deletar seus veículos" ON veiculos 
FOR DELETE USING (auth.uid() = user_id);

-- Políticas para lavagens
DROP POLICY IF EXISTS "Usuários podem ver suas lavagens" ON lavagens;
CREATE POLICY "Usuários podem ver suas lavagens" ON lavagens 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas lavagens" ON lavagens;
CREATE POLICY "Usuários podem inserir suas lavagens" ON lavagens 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas lavagens" ON lavagens;
CREATE POLICY "Usuários podem deletar suas lavagens" ON lavagens 
FOR DELETE USING (auth.uid() = user_id);

-- Políticas para pagamentos_mensalidade
DROP POLICY IF EXISTS "Usuários podem ver seus pagamentos" ON pagamentos_mensalidade;
CREATE POLICY "Usuários podem ver seus pagamentos" ON pagamentos_mensalidade 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus pagamentos" ON pagamentos_mensalidade;
CREATE POLICY "Usuários podem inserir seus pagamentos" ON pagamentos_mensalidade 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para entradas
DROP POLICY IF EXISTS "Usuários podem ver suas entradas" ON entradas;
CREATE POLICY "Usuários podem ver suas entradas" ON entradas 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas entradas" ON entradas;
CREATE POLICY "Usuários podem inserir suas entradas" ON entradas 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes_estacionamento(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes_estacionamento(status);
CREATE INDEX IF NOT EXISTS idx_veiculos_user_id ON veiculos(user_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_cliente_id ON veiculos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_placa ON veiculos(placa);
CREATE INDEX IF NOT EXISTS idx_lavagens_user_id ON lavagens(user_id);
CREATE INDEX IF NOT EXISTS idx_lavagens_veiculo_id ON lavagens(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_lavagens_data ON lavagens(data_lavagem);
CREATE INDEX IF NOT EXISTS idx_pagamentos_user_id ON pagamentos_mensalidade(user_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_cliente_id ON pagamentos_mensalidade(cliente_id);
CREATE INDEX IF NOT EXISTS idx_entradas_user_id ON entradas(user_id);

-- 5. Criar triggers para updated_at automáticos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers às tabelas
DROP TRIGGER IF EXISTS update_clientes_estacionamento_updated_at ON clientes_estacionamento;
CREATE TRIGGER update_clientes_estacionamento_updated_at 
    BEFORE UPDATE ON clientes_estacionamento 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_veiculos_updated_at ON veiculos;
CREATE TRIGGER update_veiculos_updated_at 
    BEFORE UPDATE ON veiculos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. RESTAURAR CLIENTES QUE SUMIRAM (status 'inativo' → 'ativo')
-- Execute isto para recuperar clientes que desapareceram
UPDATE clientes_estacionamento 
SET status = 'ativo' 
WHERE status = 'inativo';

-- Verificar quantos foram restaurados
SELECT COUNT(*) as clientes_restaurados FROM clientes_estacionamento WHERE status = 'ativo';

-- 7. Verificar configuração final
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('clientes_estacionamento', 'veiculos', 'lavagens', 'pagamentos_mensalidade', 'entradas')
ORDER BY table_name, ordinal_position;

-- 8. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('clientes_estacionamento', 'veiculos', 'lavagens', 'pagamentos_mensalidade', 'entradas')
ORDER BY tablename, policyname;
