// Sistema de Saídas (Despesas)
class SaidasSystem {
    constructor() {
        this.saidas = [];
        this.editingId = null;
    }

    // Carregar saídas do Supabase
    async carregarSaidas(filtros = {}) {
        try {
            if (!supabase || !authSystem.isLoggedIn()) {
                return [];
            }

            let query = supabase
                .from('saidas')
                .select('*')
                .eq('user_id', authSystem.getCurrentUserId())
                .order('data', { ascending: false });

            // Aplicar filtros
            if (filtros.dataInicio) {
                query = query.gte('data', filtros.dataInicio);
            }
            if (filtros.dataFim) {
                query = query.lte('data', filtros.dataFim);
            }
            if (filtros.categoria) {
                query = query.eq('categoria', filtros.categoria);
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            this.saidas = data || [];
            return this.saidas;
        } catch (error) {
            console.error('Erro ao carregar saídas:', error);
            authSystem.showAlert('Erro ao carregar saídas: ' + error.message, 'danger');
            return [];
        }
    }

    // Salvar saída
    async salvarSaida(saida) {
        try {
            if (!supabase || !authSystem.isLoggedIn()) {
                return false;
            }

            // Adicionar user_id
            saida.user_id = authSystem.getCurrentUserId();

            let result;
            if (this.editingId) {
                // Atualizar
                result = await supabase
                    .from('saidas')
                    .update(saida)
                    .eq('id', this.editingId);
            } else {
                // Inserir
                result = await supabase
                    .from('saidas')
                    .insert([saida]);
            }

            if (result.error) {
                throw result.error;
            }

            authSystem.showAlert(
                this.editingId ? 'Saída atualizada com sucesso!' : 'Saída cadastrada com sucesso!',
                'success'
            );

            // Limpar edição
            this.editingId = null;

            // Recarregar dados
            await this.carregarSaidas();
            await this.renderizarTabela();

            return true;
        } catch (error) {
            console.error('Erro ao salvar saída:', error);
            authSystem.showAlert('Erro ao salvar saída: ' + error.message, 'danger');
            return false;
        }
    }

    // Excluir saída
    async excluirSaida(id) {
        try {
            if (!supabase || !authSystem.isLoggedIn()) {
                return false;
            }

            if (!confirm('Tem certeza que deseja excluir esta saída?')) {
                return false;
            }

            const { error } = await supabase
                .from('saidas')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            authSystem.showAlert('Saída excluída com sucesso!', 'success');

            // Recarregar dados
            await this.carregarSaidas();
            await this.renderizarTabela();

            return true;
        } catch (error) {
            console.error('Erro ao excluir saída:', error);
            authSystem.showAlert('Erro ao excluir saída: ' + error.message, 'danger');
            return false;
        }
    }

    // Editar saída
    editarSaida(id) {
        const saida = this.saidas.find(s => s.id === id);
        if (!saida) return;

        this.editingId = id;

        // Preencher formulário
        document.getElementById('saidaId').value = saida.id;
        document.getElementById('saidaData').value = saida.data;
        document.getElementById('saidaDescricao').value = saida.descricao;
        document.getElementById('saidaCategoria').value = saida.categoria;
        document.getElementById('saidaTipo').value = saida.tipo;
        document.getElementById('saidaValor').value = saida.valor;

        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('modalSaida'));
        modal.show();
    }

    // Renderizar tabela
    async renderizarTabela() {
        const tbody = document.getElementById('tabelaSaidas');
        if (!tbody) return;

        if (this.saidas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <p>Nenhuma saída encontrada</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.saidas.map(saida => `
            <tr>
                <td>${this.formatarData(saida.data)}</td>
                <td>${saida.descricao}</td>
                <td><span class="badge bg-secondary">${this.formatarCategoria(saida.categoria)}</span></td>
                <td><span class="badge ${saida.tipo === 'fixo' ? 'bg-warning' : 'bg-info'}">${saida.tipo === 'fixo' ? 'Fixo' : 'Variável'}</span></td>
                <td class="text-danger fw-bold">-${this.formatarDinheiro(saida.valor)}</td>
                <td>
                    <button class="btn btn-sm btn-action btn-edit" onclick="saidasSystem.editarSaida('${saida.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-action btn-delete" onclick="saidasSystem.excluirSaida('${saida.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Obter categorias
    getCategorias() {
        return [
            { value: 'luz', label: 'Luz' },
            { value: 'agua', label: 'Água' },
            { value: 'aluguel', label: 'Aluguel' },
            { value: 'internet', label: 'Internet' },
            { value: 'funcionario', label: 'Funcionário' },
            { value: 'produtos', label: 'Produtos' },
            { value: 'vigilante', label: 'Vigilante' },
            { value: 'mei', label: 'MEI' },
            { value: 'prefeitura', label: 'Prefeitura' },
            { value: 'outros', label: 'Outros' }
        ];
    }

    // Obter categorias antigas (para compatibilidade)
    getCategoriasAntigas() {
        return [
            { value: 'funcionarios', label: 'Funcionários' },
            { value: 'fornecedores', label: 'Fornecedores' },
            { value: 'impostos', label: 'Impostos' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'transporte', label: 'Transporte' },
            { value: 'outras', label: 'Outras' }
        ];
    }

    // Preencher select de categorias
    preencherCategorias() {
        const select = document.getElementById('saidaCategoria');
        if (!select) return;

        const categorias = this.getCategorias();
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.value;
            option.textContent = cat.label;
            select.appendChild(option);
        });
    }

    // Preencher select de filtros
    preencherFiltros() {
        const select = document.getElementById('filtroCategoria');
        if (!select) return;

        // Se já foi preenchido pelas entradas, não preencher novamente
        if (select.children.length > 1) return;

        const categorias = this.getCategorias();
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.value;
            option.textContent = cat.label;
            select.appendChild(option);
        });
    }

    // Calcular total
    calcularTotal() {
        return this.saidas.reduce((total, saida) => total + parseFloat(saida.valor), 0);
    }

    // Calcular total por tipo
    calcularTotalPorTipo() {
        const totais = {
            fixo: 0,
            variavel: 0
        };

        this.saidas.forEach(saida => {
            totais[saida.tipo] = (totais[saida.tipo] || 0) + parseFloat(saida.valor);
        });

        return totais;
    }

    // Formatar data
    formatarData(dataString) {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    }

    // Formatar dinheiro
    formatarDinheiro(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(parseFloat(valor));
    }

    // Formatar categoria
    formatarCategoria(categoria) {
        const categorias = {
            'luz': 'Luz',
            'agua': 'Água',
            'aluguel': 'Aluguel',
            'internet': 'Internet',
            'funcionario': 'Funcionário',
            'produtos': 'Produtos',
            'vigilante': 'Vigilante',
            'mei': 'MEI',
            'prefeitura': 'Prefeitura',
            'outros': 'Outros',
            // Categorias antigas (compatibilidade)
            'funcionarios': 'Funcionários',
            'fornecedores': 'Fornecedores',
            'impostos': 'Impostos',
            'marketing': 'Marketing',
            'transporte': 'Transporte',
            'outras': 'Outras'
        };
        return categorias[categoria] || categoria;
    }
}

// Instância global
const saidasSystem = new SaidasSystem();

// Funções globais para acesso pelo HTML
function openModalSaida() {
    // Limpar formulário
    document.getElementById('formSaida').reset();
    document.getElementById('saidaId').value = '';
    
    // Definir data atual
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('saidaData').value = hoje;
    
    // Limpar edição
    saidasSystem.editingId = null;
    
    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('modalSaida'));
    modal.show();
}

function salvarSaida() {
    const saida = {
        data: document.getElementById('saidaData').value,
        descricao: document.getElementById('saidaDescricao').value,
        categoria: document.getElementById('saidaCategoria').value,
        tipo: document.getElementById('saidaTipo').value,
        valor: parseFloat(document.getElementById('saidaValor').value)
    };

    // Validação
    if (!saida.data || !saida.descricao || !saida.categoria || !saida.tipo || !saida.valor) {
        authSystem.showAlert('Preencha todos os campos!', 'warning');
        return;
    }

    if (saida.valor <= 0) {
        authSystem.showAlert('O valor deve ser maior que zero!', 'warning');
        return;
    }

    // Salvar
    saidasSystem.salvarSaida(saida).then(success => {
        if (success) {
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalSaida'));
            modal.hide();
        }
    });
}

// Exportar para uso em outros módulos
window.saidasSystem = saidasSystem;
window.openModalSaida = openModalSaida;
window.salvarSaida = salvarSaida;
