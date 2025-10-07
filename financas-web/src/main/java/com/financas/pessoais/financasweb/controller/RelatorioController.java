package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.model.DespesaFixa;
import com.financas.pessoais.financasweb.model.Lancamento;
import com.financas.pessoais.financasweb.repository.DespesaFixaRepository;
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
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/relatorios")
@CrossOrigin(origins = "*")
public class RelatorioController {

    private final LancamentoRepository lancamentoRepository;
    private final DespesaFixaRepository despesaFixaRepository;

    public RelatorioController(LancamentoRepository lancamentoRepository,
                               DespesaFixaRepository despesaFixaRepository) {
        this.lancamentoRepository = lancamentoRepository;
        this.despesaFixaRepository = despesaFixaRepository;
    }

    @GetMapping("/exportar")
    public ResponseEntity<byte[]> exportarLancamentos(@RequestParam int mes, @RequestParam int ano) {
        try {
            System.setProperty("java.awt.headless", "true");

            LocalDate inicio = LocalDate.of(ano, mes, 1);
            LocalDate fim = LocalDate.of(ano, mes, inicio.lengthOfMonth());

            List<Lancamento> lancamentos = lancamentoRepository.findByDataBetween(inicio, fim);
            List<DespesaFixa> despesasFixas = despesaFixaRepository.findAll();

            try (Workbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("Relatório Financeiro");
                int rowIdx = 0;

                // 🎨 Estilos visuais omitidos aqui (iguais à versão anterior)...
                Font normalFont = workbook.createFont();
                normalFont.setFontHeightInPoints((short) 11);
                normalFont.setFontName("Arial");

                CellStyle normalStyle = workbook.createCellStyle();
                normalStyle.setFont(normalFont);
                normalStyle.setBorderBottom(BorderStyle.THIN);
                normalStyle.setBorderTop(BorderStyle.THIN);
                normalStyle.setBorderLeft(BorderStyle.THIN);
                normalStyle.setBorderRight(BorderStyle.THIN);

                CellStyle moneyStyle = workbook.createCellStyle();
                moneyStyle.cloneStyleFrom(normalStyle);
                DataFormat df = workbook.createDataFormat();
                moneyStyle.setDataFormat(df.getFormat("R$ #,##0.00"));

                // Cabeçalho do relatório
                String mesExtenso = inicio.getMonth()
                        .getDisplayName(TextStyle.FULL, new Locale("pt", "BR"))
                        .toUpperCase();

                Row titleRow = sheet.createRow(rowIdx++);
                titleRow.createCell(0).setCellValue("Relatório Financeiro - Família Bertão");
                sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 6));

                Row subtitleRow = sheet.createRow(rowIdx++);
                subtitleRow.createCell(0).setCellValue("Período: " + mesExtenso + " / " + ano);
                sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(1, 1, 0, 6));
                rowIdx++;

                // Cabeçalho da tabela
                String[] colunas = {"Data", "Tipo", "Categoria", "Descrição", "Valor", "Conta/Cartão", "Responsável"};
                Row header = sheet.createRow(rowIdx++);
                for (int i = 0; i < colunas.length; i++) {
                    header.createCell(i).setCellValue(colunas[i]);
                }

                BigDecimal totalReceita = BigDecimal.ZERO;
                BigDecimal totalDespesa = BigDecimal.ZERO;

                // 🧾 Lançamentos variáveis
                for (Lancamento l : lancamentos) {
                    Row row = sheet.createRow(rowIdx++);
                    String data = (l.getData() != null) ? l.getData().toString() : "";
                    String tipo = (l.getTipo() != null) ? l.getTipo() : "";
                    String categoria = (l.getCategoria() != null) ? l.getCategoria().getNome() : "";
                    String descricao = (l.getDescricao() != null) ? l.getDescricao() : "";
                    double valor = (l.getValor() != null) ? l.getValor().doubleValue() : 0.0;
                    String conta = (l.getContaOuCartao() != null) ? l.getContaOuCartao().getNome() : "";
                    String responsavel = (l.getResponsavel() != null) ? l.getResponsavel().getNome() : "";

                    row.createCell(0).setCellValue(data);
                    row.createCell(1).setCellValue(tipo);
                    row.createCell(2).setCellValue(categoria);
                    row.createCell(3).setCellValue(descricao);
                    row.createCell(4).setCellValue(valor);
                    row.createCell(5).setCellValue(conta);
                    row.createCell(6).setCellValue(responsavel);

                    row.getCell(4).setCellStyle(moneyStyle);

                    if ("RECEITA".equalsIgnoreCase(tipo))
                        totalReceita = totalReceita.add(l.getValor());
                    else
                        totalDespesa = totalDespesa.add(l.getValor());
                }

                // 💡 Despesas fixas (como DESPESA)
                for (DespesaFixa dfItem : despesasFixas) {
                    if (dfItem.getDataInicio().getMonthValue() <= mes &&
                            (dfItem.getDataFim() == null || dfItem.getDataFim().getMonthValue() >= mes)) {

                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(inicio.withDayOfMonth(1).toString());
                        row.createCell(1).setCellValue("DESPESA");
                        row.createCell(2).setCellValue(dfItem.getCategoria().getNome());
                        row.createCell(3).setCellValue(dfItem.getDescricao());
                        row.createCell(4).setCellValue(dfItem.getValor().doubleValue());
                        row.createCell(5).setCellValue(dfItem.getContaOuCartao().getNome());
                        row.createCell(6).setCellValue(dfItem.getResponsavel().getNome());

                        row.getCell(4).setCellStyle(moneyStyle);

                        totalDespesa = totalDespesa.add(dfItem.getValor());
                    }
                }

                // Totais
                rowIdx++;
                Row totalR = sheet.createRow(rowIdx++);
                totalR.createCell(3).setCellValue("Total Receitas:");
                totalR.createCell(4).setCellValue(totalReceita.doubleValue());
                totalR.getCell(4).setCellStyle(moneyStyle);

                Row totalD = sheet.createRow(rowIdx++);
                totalD.createCell(3).setCellValue("Total Despesas:");
                totalD.createCell(4).setCellValue(totalDespesa.doubleValue());
                totalD.getCell(4).setCellStyle(moneyStyle);

                Row saldo = sheet.createRow(rowIdx++);
                saldo.createCell(3).setCellValue("Saldo:");
                saldo.createCell(4).setCellValue(totalReceita.subtract(totalDespesa).doubleValue());
                saldo.getCell(4).setCellStyle(moneyStyle);

                // Ajuste de largura
                int[] larguras = {4000, 3000, 5000, 10000, 4000, 5000, 5000};
                for (int i = 0; i < larguras.length; i++) {
                    sheet.setColumnWidth(i, larguras[i]);
                }

                ByteArrayOutputStream out = new ByteArrayOutputStream();
                workbook.write(out);

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=relatorio-lancamentos-" + mes + "-" + ano + ".xlsx")
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(out.toByteArray());
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao gerar relatório: " + e.getMessage(), e);
        }
    }
}
