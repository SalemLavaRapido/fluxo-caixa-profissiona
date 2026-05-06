-- Adicionar coluna forma_pagamento na tabela entradas
ALTER TABLE entradas ADD COLUMN forma_pagamento TEXT;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'entradas' AND column_name = 'forma_pagamento';
