package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.model.Lancamento;
import com.financas.pessoais.financasweb.repository.LancamentoRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/relatorios")
@CrossOrigin(origins = "*")
public class RelatorioController {

    private final LancamentoRepository lancamentoRepository;

    public RelatorioController(LancamentoRepository lancamentoRepository) {
        this.lancamentoRepository = lancamentoRepository;
    }

    @GetMapping("/exportar")
    public ResponseEntity<byte[]> exportarLancamentos(@RequestParam int mes, @RequestParam int ano) {
        try {
            // Obtém o intervalo de datas do mês solicitado
            LocalDate inicio = LocalDate.of(ano, mes, 1);
            LocalDate fim = LocalDate.of(ano, mes, inicio.lengthOfMonth());

            // Busca lançamentos no intervalo
            List<Lancamento> lancamentos = lancamentoRepository.findByDataBetween(inicio, fim);

            try (Workbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("Lançamentos");
                int rowIdx = 0;

                // Cabeçalho
                Row header = sheet.createRow(rowIdx++);
                String[] colunas = {"Data", "Tipo", "Categoria", "Descrição", "Valor", "Conta/Cartão", "Responsável"};
                for (int i = 0; i < colunas.length; i++) {
                    Cell cell = header.createCell(i);
                    cell.setCellValue(colunas[i]);
                }

                BigDecimal totalReceita = BigDecimal.ZERO;
                BigDecimal totalDespesa = BigDecimal.ZERO;

                // Dados
                for (Lancamento l : lancamentos) {
                    Row row = sheet.createRow(rowIdx++);

                    // Campos com tratamento de nulos
                    String data = (l.getData() != null) ? l.getData().toString() : "";
                    String tipo = (l.getTipo() != null) ? l.getTipo() : "";
                    String categoria = (l.getCategoria() != null) ? l.getCategoria().getNome() : "";
                    String descricao = (l.getDescricao() != null) ? l.getDescricao() : "";
                    Double valor = (l.getValor() != null) ? l.getValor().doubleValue() : 0.0;
                    String conta = (l.getContaOuCartao() != null) ? l.getContaOuCartao().getNome() : "";
                    String responsavel = (l.getResponsavel() != null) ? l.getResponsavel().getNome() : "";

                    // Preenche linha
                    row.createCell(0).setCellValue(data);
                    row.createCell(1).setCellValue(tipo);
                    row.createCell(2).setCellValue(categoria);
                    row.createCell(3).setCellValue(descricao);
                    row.createCell(4).setCellValue(valor);
                    row.createCell(5).setCellValue(conta);
                    row.createCell(6).setCellValue(responsavel);

                    // Totais
                    if ("RECEITA".equalsIgnoreCase(tipo)) {
                        totalReceita = totalReceita.add(l.getValor() != null ? l.getValor() : BigDecimal.ZERO);
                    } else if ("DESPESA".equalsIgnoreCase(tipo)) {
                        totalDespesa = totalDespesa.add(l.getValor() != null ? l.getValor() : BigDecimal.ZERO);
                    }
                }

                // Totais no final
                Row totalRow = sheet.createRow(rowIdx++);
                totalRow.createCell(3).setCellValue("Total Receitas:");
                totalRow.createCell(4).setCellValue(totalReceita.doubleValue());

                Row totalRow2 = sheet.createRow(rowIdx++);
                totalRow2.createCell(3).setCellValue("Total Despesas:");
                totalRow2.createCell(4).setCellValue(totalDespesa.doubleValue());

                Row totalRow3 = sheet.createRow(rowIdx++);
                totalRow3.createCell(3).setCellValue("Saldo:");
                totalRow3.createCell(4).setCellValue(totalReceita.subtract(totalDespesa).doubleValue());

                // Ajusta largura automática
                for (int i = 0; i < colunas.length; i++) {
                    sheet.autoSizeColumn(i);
                }

                // Converte para bytes e retorna
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                workbook.write(out);

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=relatorio-lancamentos-" + mes + "-" + ano + ".xlsx")
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(out.toByteArray());
            }

        } catch (Exception e) {
            // Loga a exceção no console do Render (útil para debug remoto)
            e.printStackTrace();
            throw new RuntimeException("Erro ao gerar relatório: " + e.getMessage(), e);
        }
    }
}
