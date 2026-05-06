-- EXECUTAR NO SUPABASE SQL EDITOR
-- Este script remove a restrição de categoria antiga e permite as novas categorias

-- 1. Remover a restrição antiga de categoria
ALTER TABLE entradas DROP CONSTRAINT IF EXISTS entradas_categoria_check;

-- 2. Criar nova restrição com as categorias corretas
ALTER TABLE entradas ADD CONSTRAINT entradas_categoria_check 
CHECK (categoria IN (
    'lavagem_carro', 
    'lavagem_moto', 
    'lavagem_caminhonete', 
    'mensalista', 
    'avulso', 
    'outros',
    'vendas',
    'servicos'
));

-- Verificar se funcionou
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'entradas' AND constraint_type = 'CHECK';
