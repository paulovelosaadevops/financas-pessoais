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
        List<Lancamento> lancamentos = lancamentoRepository.findByDataBetween(
                LocalDate.of(ano, mes, 1),
                LocalDate.of(ano, mes, LocalDate.of(ano, mes, 1).lengthOfMonth())
        );

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Lançamentos");
            int rowIdx = 0;

            // Cabeçalho
            Row header = sheet.createRow(rowIdx++);
            String[] colunas = {"Data", "Tipo", "Categoria", "Descrição", "Valor", "Conta/Cartão", "Responsável"};
            for (int i = 0; i < colunas.length; i++) {
                header.createCell(i).setCellValue(colunas[i]);
            }

            BigDecimal totalReceita = BigDecimal.ZERO;
            BigDecimal totalDespesa = BigDecimal.ZERO;

            // Dados
            for (Lancamento l : lancamentos) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(l.getData().toString());
                row.createCell(1).setCellValue(l.getTipo());
                row.createCell(2).setCellValue(l.getCategoria() != null ? l.getCategoria().getNome() : "");
                row.createCell(3).setCellValue(l.getDescricao() != null ? l.getDescricao() : "");
                row.createCell(4).setCellValue(l.getValor().doubleValue());
                row.createCell(5).setCellValue(l.getContaOuCartao() != null ? l.getContaOuCartao().getNome() : "");
                row.createCell(6).setCellValue(l.getResponsavel() != null ? l.getResponsavel().getNome() : "");

                if ("RECEITA".equalsIgnoreCase(l.getTipo()))
                    totalReceita = totalReceita.add(l.getValor());
                else
                    totalDespesa = totalDespesa.add(l.getValor());
            }

            // Totais
            Row totalRow = sheet.createRow(rowIdx++);
            totalRow.createCell(3).setCellValue("Total Receitas:");
            totalRow.createCell(4).setCellValue(totalReceita.doubleValue());

            Row totalRow2 = sheet.createRow(rowIdx++);
            totalRow2.createCell(3).setCellValue("Total Despesas:");
            totalRow2.createCell(4).setCellValue(totalDespesa.doubleValue());

            Row totalRow3 = sheet.createRow(rowIdx++);
            totalRow3.createCell(3).setCellValue("Saldo:");
            totalRow3.createCell(4).setCellValue(totalReceita.subtract(totalDespesa).doubleValue());

            for (int i = 0; i < colunas.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=relatorio-lancamentos-" + mes + "-" + ano + ".xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar relatório", e);
        }
    }
}
