-- Corrigir políticas RLS para tabela entradas

-- Habilitar RLS se não estiver
ALTER TABLE entradas ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own entradas" ON entradas;
DROP POLICY IF EXISTS "Users can insert own entradas" ON entradas;
DROP POLICY IF EXISTS "Users can update own entradas" ON entradas;
DROP POLICY IF EXISTS "Users can delete own entradas" ON entradas;

-- Criar novas políticas simples
CREATE POLICY "Enable insert for authenticated users" ON entradas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable select for authenticated users" ON entradas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON entradas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON entradas
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'entradas';
