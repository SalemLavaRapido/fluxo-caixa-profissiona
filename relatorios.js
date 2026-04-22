// Sistema de Relatórios
class RelatoriosSystem {
    constructor() {
        this.jsPDF = window.jspdf.jsPDF;
    }

    // Gerar relatório PDF
    async gerarRelatorioPDF(filtros = {}) {
        try {
            // Mostrar loading
            authSystem.showLoading(true);

            // Carregar dados
            await entradasSystem.carregarEntradas(filtros);
            await saidasSystem.carregarSaidas(filtros);

            // Criar documento PDF
            const doc = new this.jsPDF();

            // Configurações do documento
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            let yPosition = 20;

            // Cabeçalho
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('Relatório Financeiro', pageWidth / 2, yPosition, { align: 'center' });
            
            yPosition += 10;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Período: ${this.formatarPeriodo(filtros)}`, pageWidth / 2, yPosition, { align: 'center' });
            
            yPosition += 10;
            doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });

            yPosition += 20;

            // Resumo Financeiro
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Resumo Financeiro', 20, yPosition);
            
            yPosition += 10;

            const totalEntradas = entradasSystem.calcularTotal();
            const totalSaidas = saidasSystem.calcularTotal();
            const saldoFinal = totalEntradas - totalSaidas;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total de Entradas: ${this.formatarDinheiro(totalEntradas)}`, 20, yPosition);
            yPosition += 7;
            doc.text(`Total de Saídas: ${this.formatarDinheiro(totalSaidas)}`, 20, yPosition);
            yPosition += 7;
            doc.setFont('helvetica', 'bold');
            doc.text(`Saldo Final: ${this.formatarDinheiro(saldoFinal)}`, 20, yPosition);

            yPosition += 20;

            // Verificar se precisa de nova página
            if (yPosition > pageHeight - 50) {
                doc.addPage();
                yPosition = 20;
            }

            // Entradas
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Entradas', 20, yPosition);
            
            yPosition += 10;

            if (entradasSystem.entradas.length > 0) {
                // Cabeçalho da tabela
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('Data', 20, yPosition);
                doc.text('Descrição', 50, yPosition);
                doc.text('Categoria', 120, yPosition);
                doc.text('Valor', 170, yPosition);
                
                yPosition += 7;

                // Linha separadora
                doc.setLineWidth(0.5);
                doc.line(20, yPosition, 190, yPosition);
                yPosition += 5;

                // Dados das entradas
                doc.setFont('helvetica', 'normal');
                entradasSystem.entradas.forEach(entrada => {
                    if (yPosition > pageHeight - 30) {
                        doc.addPage();
                        yPosition = 20;
                        
                        // Repetir cabeçalho
                        doc.setFont('helvetica', 'bold');
                        doc.text('Data', 20, yPosition);
                        doc.text('Descrição', 50, yPosition);
                        doc.text('Categoria', 120, yPosition);
                        doc.text('Valor', 170, yPosition);
                        yPosition += 7;
                        doc.line(20, yPosition, 190, yPosition);
                        yPosition += 5;
                        doc.setFont('helvetica', 'normal');
                    }

                    doc.text(entradasSystem.formatarData(entrada.data), 20, yPosition);
                    doc.text(this.truncarTexto(entrada.descricao, 50), 50, yPosition);
                    doc.text(entradasSystem.formatarCategoria(entrada.categoria), 120, yPosition);
                    doc.text(this.formatarDinheiro(entrada.valor), 170, yPosition);
                    yPosition += 6;
                });
            } else {
                doc.setFont('helvetica', 'italic');
                doc.text('Nenhuma entrada encontrada', 20, yPosition);
            }

            yPosition += 15;

            // Verificar se precisa de nova página
            if (yPosition > pageHeight - 50) {
                doc.addPage();
                yPosition = 20;
            }

            // Saídas
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Saídas', 20, yPosition);
            
            yPosition += 10;

            if (saidasSystem.saidas.length > 0) {
                // Cabeçalho da tabela
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('Data', 20, yPosition);
                doc.text('Descrição', 50, yPosition);
                doc.text('Categoria', 120, yPosition);
                doc.text('Tipo', 150, yPosition);
                doc.text('Valor', 170, yPosition);
                
                yPosition += 7;

                // Linha separadora
                doc.setLineWidth(0.5);
                doc.line(20, yPosition, 190, yPosition);
                yPosition += 5;

                // Dados das saídas
                doc.setFont('helvetica', 'normal');
                saidasSystem.saidas.forEach(saida => {
                    if (yPosition > pageHeight - 30) {
                        doc.addPage();
                        yPosition = 20;
                        
                        // Repetir cabeçalho
                        doc.setFont('helvetica', 'bold');
                        doc.text('Data', 20, yPosition);
                        doc.text('Descrição', 50, yPosition);
                        doc.text('Categoria', 120, yPosition);
                        doc.text('Tipo', 150, yPosition);
                        doc.text('Valor', 170, yPosition);
                        yPosition += 7;
                        doc.line(20, yPosition, 190, yPosition);
                        yPosition += 5;
                        doc.setFont('helvetica', 'normal');
                    }

                    doc.text(saidasSystem.formatarData(saida.data), 20, yPosition);
                    doc.text(this.truncarTexto(saida.descricao, 45), 50, yPosition);
                    doc.text(saidasSystem.formatarCategoria(saida.categoria), 120, yPosition);
                    doc.text(saida.tipo === 'fixo' ? 'Fixo' : 'Var', 150, yPosition);
                    doc.text(this.formatarDinheiro(saida.valor), 170, yPosition);
                    yPosition += 6;
                });
            } else {
                doc.setFont('helvetica', 'italic');
                doc.text('Nenhuma saída encontrada', 20, yPosition);
            }

            // Rodapé
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
            }

            // Salvar PDF
            const nomeArquivo = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(nomeArquivo);

            authSystem.showAlert('Relatório PDF gerado com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao gerar relatório PDF:', error);
            authSystem.showAlert('Erro ao gerar relatório PDF: ' + error.message, 'danger');
        } finally {
            authSystem.showLoading(false);
        }
    }

    // Gerar relatório em HTML (para impressão)
    async gerarRelatorioHTML(filtros = {}) {
        try {
            // Carregar dados
            await entradasSystem.carregarEntradas(filtros);
            await saidasSystem.carregarSaidas(filtros);

            // Calcular totais
            const totalEntradas = entradasSystem.calcularTotal();
            const totalSaidas = saidasSystem.calcularTotal();
            const saldoFinal = totalEntradas - totalSaidas;

            // Criar HTML do relatório
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Relatório Financeiro</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .resumo { background: #f5f5f5; padding: 20px; margin-bottom: 30px; border-radius: 5px; }
                        .section { margin-bottom: 30px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background: #f2f2f2; font-weight: bold; }
                        .text-right { text-align: right; }
                        .text-success { color: green; }
                        .text-danger { color: red; }
                        .text-bold { font-weight: bold; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Relatório Financeiro</h1>
                        <p>Período: ${this.formatarPeriodo(filtros)}</p>
                        <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
                    </div>

                    <div class="resumo">
                        <h2>Resumo Financeiro</h2>
                        <p><strong>Total de Entradas:</strong> <span class="text-success">${this.formatarDinheiro(totalEntradas)}</span></p>
                        <p><strong>Total de Saídas:</strong> <span class="text-danger">${this.formatarDinheiro(totalSaidas)}</span></p>
                        <p><strong>Saldo Final:</strong> <span class="text-bold ${saldoFinal >= 0 ? 'text-success' : 'text-danger'}">${this.formatarDinheiro(saldoFinal)}</span></p>
                    </div>

                    <div class="section">
                        <h2>Entradas</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th class="text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${entradasSystem.entradas.map(entrada => `
                                    <tr>
                                        <td>${entradasSystem.formatarData(entrada.data)}</td>
                                        <td>${entrada.descricao}</td>
                                        <td>${entradasSystem.formatarCategoria(entrada.categoria)}</td>
                                        <td class="text-right text-success">+${this.formatarDinheiro(entrada.valor)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="section">
                        <h2>Saídas</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th>Tipo</th>
                                    <th class="text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${saidasSystem.saidas.map(saida => `
                                    <tr>
                                        <td>${saidasSystem.formatarData(saida.data)}</td>
                                        <td>${saida.descricao}</td>
                                        <td>${saidasSystem.formatarCategoria(saida.categoria)}</td>
                                        <td>${saida.tipo === 'fixo' ? 'Fixo' : 'Variável'}</td>
                                        <td class="text-right text-danger">-${this.formatarDinheiro(saida.valor)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </body>
                </html>
            `;

            // Abrir em nova janela para impressão
            const novaJanela = window.open('', '_blank');
            novaJanela.document.write(html);
            novaJanela.document.close();

            // Aguardar carregar e mostrar diálogo de impressão
            setTimeout(() => {
                novaJanela.print();
            }, 500);

            authSystem.showAlert('Relatório aberto para impressão!', 'success');

        } catch (error) {
            console.error('Erro ao gerar relatório HTML:', error);
            authSystem.showAlert('Erro ao gerar relatório: ' + error.message, 'danger');
        }
    }

    // Exportar dados para CSV
    async exportarCSV(filtros = {}) {
        try {
            // Carregar dados
            await entradasSystem.carregarEntradas(filtros);
            await saidasSystem.carregarSaidas(filtros);

            // Criar CSV
            let csv = 'Tipo,Data,Descrição,Categoria,Valor\n';

            // Adicionar entradas
            entradasSystem.entradas.forEach(entrada => {
                csv += `Entrada,${entrada.data},"${entrada.descricao}","${entradasSystem.formatarCategoria(entrada.categoria)}",${entrada.valor}\n`;
            });

            // Adicionar saídas
            saidasSystem.saidas.forEach(saida => {
                csv += `Saída,${saida.data},"${saida.descricao}","${saidasSystem.formatarCategoria(saida.categoria)}",${saida.valor}\n`;
            });

            // Criar blob e download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            authSystem.showAlert('Dados exportados para CSV com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            authSystem.showAlert('Erro ao exportar CSV: ' + error.message, 'danger');
        }
    }

    // Formatar período
    formatarPeriodo(filtros) {
        if (filtros.dataInicio && filtros.dataFim) {
            return `de ${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} até ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}`;
        }
        return 'Todos os períodos';
    }

    // Formatar dinheiro
    formatarDinheiro(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(parseFloat(valor));
    }

    // Truncar texto para PDF
    truncarTexto(texto, maxLength) {
        if (texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength - 3) + '...';
    }
}

// Instância global
const relatoriosSystem = new RelatoriosSystem();

// Funções globais para acesso pelo HTML
function gerarRelatorioPDF() {
    const filtros = obterFiltrosAtuais();
    relatoriosSystem.gerarRelatorioPDF(filtros);
}

function gerarRelatorioHTML() {
    const filtros = obterFiltrosAtuais();
    relatoriosSystem.gerarRelatorioHTML(filtros);
}

function exportarCSV() {
    const filtros = obterFiltrosAtuais();
    relatoriosSystem.exportarCSV(filtros);
}

// Obter filtros atuais
function obterFiltrosAtuais() {
    const dataInicio = document.getElementById('dataInicio')?.value;
    const dataFim = document.getElementById('dataFim')?.value;
    const categoria = document.getElementById('filtroCategoria')?.value;

    const filtros = {};
    if (dataInicio) filtros.dataInicio = dataInicio;
    if (dataFim) filtros.dataFim = dataFim;
    if (categoria) filtros.categoria = categoria;

    return filtros;
}

// Exportar para uso em outros módulos
window.relatoriosSystem = relatoriosSystem;
window.gerarRelatorioPDF = gerarRelatorioPDF;
window.gerarRelatorioHTML = gerarRelatorioHTML;
window.exportarCSV = exportarCSV;
