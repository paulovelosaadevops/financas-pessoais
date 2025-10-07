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
import java.util.List;

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
    public ResponseEntity<byte[]> exportarLancamentos(
            @RequestParam int mes,
            @RequestParam int ano,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long responsavelId,
            @RequestParam(required = false) Long contaId) {
        try {
            LocalDate inicio = LocalDate.of(ano, mes, 1);
            LocalDate fim = LocalDate.of(ano, mes, inicio.lengthOfMonth());

            // 🔹 Agora busca lançamentos filtrados conforme parâmetros recebidos
            List<Lancamento> lancamentos = lancamentoRepository.buscarLancamentosFiltrados(
                    ano, mes, tipo, categoriaId, responsavelId, contaId
            );

            try (Workbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("Lançamentos");
                int rowIdx = 0;

                // ===== Estilos =====
                Font normalFont = workbook.createFont();
                normalFont.setFontHeightInPoints((short) 11);
                normalFont.setFontName("Arial");

                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerFont.setColor(IndexedColors.WHITE.getIndex());
                headerFont.setFontName("Arial");

                CellStyle headerStyle = workbook.createCellStyle();
                headerStyle.setFont(headerFont);
                headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                headerStyle.setAlignment(HorizontalAlignment.CENTER);
                headerStyle.setBorderBottom(BorderStyle.THIN);
                headerStyle.setBorderTop(BorderStyle.THIN);
                headerStyle.setBorderLeft(BorderStyle.THIN);
                headerStyle.setBorderRight(BorderStyle.THIN);

                CellStyle normalStyle = workbook.createCellStyle();
                normalStyle.setFont(normalFont);
                normalStyle.setBorderBottom(BorderStyle.THIN);
                normalStyle.setBorderTop(BorderStyle.THIN);
                normalStyle.setBorderLeft(BorderStyle.THIN);
                normalStyle.setBorderRight(BorderStyle.THIN);

                CellStyle alternateStyle = workbook.createCellStyle();
                alternateStyle.cloneStyleFrom(normalStyle);
                alternateStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
                alternateStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                CellStyle moneyStyle = workbook.createCellStyle();
                moneyStyle.cloneStyleFrom(normalStyle);
                DataFormat format = workbook.createDataFormat();
                moneyStyle.setDataFormat(format.getFormat("R$ #,##0.00"));

                // ===== Cabeçalho =====
                String[] colunas = {"Data", "Tipo", "Categoria", "Descrição", "Valor", "Conta", "Responsável"};
                Row header = sheet.createRow(rowIdx++);
                for (int i = 0; i < colunas.length; i++) {
                    Cell cell = header.createCell(i);
                    cell.setCellValue(colunas[i]);
                    cell.setCellStyle(headerStyle);
                }

                BigDecimal totalReceita = BigDecimal.ZERO;
                BigDecimal totalDespesa = BigDecimal.ZERO;

                // ===== Lançamentos Variáveis =====
                for (Lancamento l : lancamentos) {
                    Row row = sheet.createRow(rowIdx++);
                    boolean linhaPar = rowIdx % 2 == 0;
                    CellStyle estilo = linhaPar ? alternateStyle : normalStyle;

                    row.createCell(0).setCellValue(l.getData() != null ? l.getData().toString() : "");
                    row.createCell(1).setCellValue(l.getTipo() != null ? l.getTipo() : "");
                    row.createCell(2).setCellValue(l.getCategoria() != null ? l.getCategoria().getNome() : "");
                    row.createCell(3).setCellValue(l.getDescricao() != null ? l.getDescricao() : "");
                    row.createCell(4).setCellValue(l.getValor() != null ? l.getValor().doubleValue() : 0.0);
                    row.createCell(5).setCellValue(l.getContaOuCartao() != null ? l.getContaOuCartao().getNome() : "");
                    row.createCell(6).setCellValue(l.getResponsavel() != null ? l.getResponsavel().getNome() : "");

                    for (int i = 0; i <= 6; i++) {
                        if (i == 4) row.getCell(i).setCellStyle(moneyStyle);
                        else row.getCell(i).setCellStyle(estilo);
                    }

                    if ("RECEITA".equalsIgnoreCase(l.getTipo())) {
                        totalReceita = totalReceita.add(l.getValor() != null ? l.getValor() : BigDecimal.ZERO);
                    } else if ("DESPESA".equalsIgnoreCase(l.getTipo())) {
                        totalDespesa = totalDespesa.add(l.getValor() != null ? l.getValor() : BigDecimal.ZERO);
                    }
                }

                // ===== Despesas Fixas =====
                for (DespesaFixa dfItem : despesasFixas) {
                    if (dfItem.getFimRecorrencia() == null ||
                            (dfItem.getFimRecorrencia().getYear() > ano ||
                                    (dfItem.getFimRecorrencia().getYear() == ano &&
                                            dfItem.getFimRecorrencia().getMonthValue() >= mes))) {

                        Row row = sheet.createRow(rowIdx++);
                        boolean linhaPar = rowIdx % 2 == 0;
                        CellStyle estilo = linhaPar ? alternateStyle : normalStyle;

                        row.createCell(0).setCellValue("Mensal");
                        row.createCell(1).setCellValue("DESPESA FIXA");
                        row.createCell(2).setCellValue(dfItem.getCategoria() != null ? dfItem.getCategoria().getNome() : "");
                        row.createCell(3).setCellValue(dfItem.getDescricao() != null ? dfItem.getDescricao() : "");
                        row.createCell(4).setCellValue(dfItem.getValor() != null ? dfItem.getValor().doubleValue() : 0.0);
                        row.createCell(5).setCellValue(dfItem.getConta() != null ? dfItem.getConta().getNome() : "");
                        row.createCell(6).setCellValue(dfItem.getResponsavel() != null ? dfItem.getResponsavel().getNome() : "");

                        for (int i = 0; i <= 6; i++) {
                            if (i == 4) row.getCell(i).setCellStyle(moneyStyle);
                            else row.getCell(i).setCellStyle(estilo);
                        }

                        totalDespesa = totalDespesa.add(dfItem.getValor() != null ? dfItem.getValor() : BigDecimal.ZERO);
                    }
                }

                // ===== Totais =====
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

                // ===== Largura padrão =====
                int[] larguras = {3500, 3000, 4500, 9000, 4000, 4000, 4000};
                for (int i = 0; i < larguras.length; i++) {
                    sheet.setColumnWidth(i, larguras[i]);
                }

                // ===== Finaliza =====
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
