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
            LocalDate inicio = LocalDate.of(ano, mes, 1);
            LocalDate fim = LocalDate.of(ano, mes, inicio.lengthOfMonth());
            List<Lancamento> lancamentos = lancamentoRepository.findByDataBetween(inicio, fim);

            try (Workbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("Lançamentos");
                int rowIdx = 0;

                // 🎨 Fonte base
                Font normalFont = workbook.createFont();
                normalFont.setFontHeightInPoints((short) 11);
                normalFont.setFontName("Arial");

                // 🎨 Estilo do cabeçalho
                CellStyle headerStyle = workbook.createCellStyle();
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerFont.setColor(IndexedColors.WHITE.getIndex());
                headerFont.setFontName("Arial");
                headerStyle.setFont(headerFont);
                headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                headerStyle.setAlignment(HorizontalAlignment.CENTER);
                headerStyle.setBorderBottom(BorderStyle.THIN);
                headerStyle.setBorderTop(BorderStyle.THIN);
                headerStyle.setBorderLeft(BorderStyle.THIN);
                headerStyle.setBorderRight(BorderStyle.THIN);

                // 🎨 Estilo de linhas normais
                CellStyle normalStyle = workbook.createCellStyle();
                normalStyle.setFont(normalFont);
                normalStyle.setBorderBottom(BorderStyle.THIN);
                normalStyle.setBorderTop(BorderStyle.THIN);
                normalStyle.setBorderLeft(BorderStyle.THIN);
                normalStyle.setBorderRight(BorderStyle.THIN);

                // 🎨 Estilo de linhas alternadas (zebra)
                CellStyle alternateStyle = workbook.createCellStyle();
                alternateStyle.cloneStyleFrom(normalStyle);
                alternateStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
                alternateStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                // 🎨 Estilo para valores (moeda)
                CellStyle moneyStyle = workbook.createCellStyle();
                moneyStyle.cloneStyleFrom(normalStyle);
                DataFormat format = workbook.createDataFormat();
                moneyStyle.setDataFormat(format.getFormat("R$ #,##0.00"));

                // Cabeçalho
                String[] colunas = {"Data", "Tipo", "Categoria", "Descrição", "Valor", "Conta/Cartão", "Responsável"};
                Row header = sheet.createRow(rowIdx++);
                for (int i = 0; i < colunas.length; i++) {
                    Cell cell = header.createCell(i);
                    cell.setCellValue(colunas[i]);
                    cell.setCellStyle(headerStyle);
                }

                BigDecimal totalReceita = BigDecimal.ZERO;
                BigDecimal totalDespesa = BigDecimal.ZERO;

                // Dados
                for (Lancamento l : lancamentos) {
                    Row row = sheet.createRow(rowIdx++);
                    boolean linhaPar = rowIdx % 2 == 0;

                    CellStyle linhaStyle = linhaPar ? alternateStyle : normalStyle;

                    String data = (l.getData() != null) ? l.getData().toString() : "";
                    String tipo = (l.getTipo() != null) ? l.getTipo() : "";
                    String categoria = (l.getCategoria() != null) ? l.getCategoria().getNome() : "";
                    String descricao = (l.getDescricao() != null) ? l.getDescricao() : "";
                    Double valor = (l.getValor() != null) ? l.getValor().doubleValue() : 0.0;
                    String conta = (l.getContaOuCartao() != null) ? l.getContaOuCartao().getNome() : "";
                    String responsavel = (l.getResponsavel() != null) ? l.getResponsavel().getNome() : "";

                    // Preenche as células
                    row.createCell(0).setCellValue(data);
                    row.createCell(1).setCellValue(tipo);
                    row.createCell(2).setCellValue(categoria);
                    row.createCell(3).setCellValue(descricao);
                    row.createCell(4).setCellValue(valor);
                    row.createCell(5).setCellValue(conta);
                    row.createCell(6).setCellValue(responsavel);

                    // Aplica estilos
                    for (int i = 0; i <= 6; i++) {
                        if (i == 4) {
                            row.getCell(i).setCellStyle(moneyStyle);
                        } else {
                            row.getCell(i).setCellStyle(linhaStyle);
                        }
                    }

                    if ("RECEITA".equalsIgnoreCase(tipo)) {
                        totalReceita = totalReceita.add(l.getValor() != null ? l.getValor() : BigDecimal.ZERO);
                    } else if ("DESPESA".equalsIgnoreCase(tipo)) {
                        totalDespesa = totalDespesa.add(l.getValor() != null ? l.getValor() : BigDecimal.ZERO);
                    }
                }

                // Totais
                Row totalRow = sheet.createRow(rowIdx++);
                totalRow.createCell(3).setCellValue("Total Receitas:");
                totalRow.createCell(4).setCellValue(totalReceita.doubleValue());
                totalRow.getCell(4).setCellStyle(moneyStyle);

                Row totalRow2 = sheet.createRow(rowIdx++);
                totalRow2.createCell(3).setCellValue("Total Despesas:");
                totalRow2.createCell(4).setCellValue(totalDespesa.doubleValue());
                totalRow2.getCell(4).setCellStyle(moneyStyle);

                Row totalRow3 = sheet.createRow(rowIdx++);
                totalRow3.createCell(3).setCellValue("Saldo:");
                totalRow3.createCell(4).setCellValue(totalReceita.subtract(totalDespesa).doubleValue());
                totalRow3.getCell(4).setCellStyle(moneyStyle);

                // Larguras fixas seguras
                int[] larguras = {4000, 3000, 5000, 10000, 4000, 5000, 5000};
                for (int i = 0; i < larguras.length; i++) {
                    sheet.setColumnWidth(i, larguras[i]);
                }

                // Gera o arquivo
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
