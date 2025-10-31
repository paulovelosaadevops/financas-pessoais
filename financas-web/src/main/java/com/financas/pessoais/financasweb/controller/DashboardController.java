package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.model.DespesaFixa;
import com.financas.pessoais.financasweb.model.DespesaFixaPagamento;
import com.financas.pessoais.financasweb.model.Lancamento;
import com.financas.pessoais.financasweb.repository.DespesaFixaPagamentoRepository;
import com.financas.pessoais.financasweb.repository.DespesaFixaRepository;
import com.financas.pessoais.financasweb.repository.LancamentoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final LancamentoRepository lancamentoRepository;
    private final DespesaFixaRepository despesaFixaRepository;
    private final DespesaFixaPagamentoRepository pagamentoRepository;

    public DashboardController(
            LancamentoRepository lancamentoRepository,
            DespesaFixaRepository despesaFixaRepository,
            DespesaFixaPagamentoRepository pagamentoRepository
    ) {
        this.lancamentoRepository = lancamentoRepository;
        this.despesaFixaRepository = despesaFixaRepository;
        this.pagamentoRepository = pagamentoRepository;
    }

    @GetMapping
    public Map<String, Object> getDashboard(
            @RequestParam int ano,
            @RequestParam int mes
    ) {
        long startAll = System.currentTimeMillis();
        Map<String, Object> dados = new HashMap<>();

        LocalDate inicio = LocalDate.of(ano, mes, 1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        // 🔹 Bloqueia meses anteriores a nov/2025
        if (inicio.isBefore(LocalDate.of(2025, 11, 1))) {
            Map<String, Object> vazio = new HashMap<>();
            vazio.put("mensagem", "Dados disponíveis apenas a partir de novembro/2025");
            vazio.put("totalReceitas", BigDecimal.ZERO);
            vazio.put("totalDespesas", BigDecimal.ZERO);
            vazio.put("totalFixas", BigDecimal.ZERO);
            vazio.put("saldo", BigDecimal.ZERO);
            vazio.put("categorias", Collections.emptyList());
            vazio.put("responsaveis", Collections.emptyList());
            vazio.put("bancos", Collections.emptyList());
            vazio.put("fixasCategorias", Collections.emptyList());
            vazio.put("fixasResponsaveis", Collections.emptyList());
            vazio.put("receitasCategorias", Collections.emptyList());
            vazio.put("receitasResponsaveis", Collections.emptyList());
            vazio.put("receitasBancos", Collections.emptyList());
            vazio.put("mensal", Collections.emptyList());
            vazio.put("despesasFixas", Collections.emptyList());
            vazio.put("ultimosLancamentos", Collections.emptyList());
            return vazio;
        }

        // ============================================================
        // 🔹 Totais principais (mantém toda sua lógica)
        // ============================================================
        BigDecimal receitas = Optional.ofNullable(lancamentoRepository.totalReceitasPeriodo(inicio, fim)).orElse(BigDecimal.ZERO);

        LocalDate inicioBuscaSalario = inicio.minusDays(5);
        LocalDate fimBuscaSalario = fim.plusDays(5);

        List<Lancamento> receitasSalariais = lancamentoRepository.findUltimosLancamentosPorPeriodo(inicioBuscaSalario, fimBuscaSalario)
                .stream()
                .filter(l -> l.getCategoria() != null && l.getCategoria().getNome().equalsIgnoreCase("SALÁRIO"))
                .collect(Collectors.toList());

        BigDecimal salarioFimMesAnterior = receitasSalariais.stream()
                .filter(l -> l.getData().isBefore(inicio) && l.getData().getDayOfMonth() > 15)
                .map(Lancamento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal salarioFimMesAtual = receitasSalariais.stream()
                .filter(l -> l.getData().isAfter(inicio) && l.getData().getDayOfMonth() > 15)
                .map(Lancamento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        receitas = receitas.add(salarioFimMesAnterior);
        receitas = receitas.subtract(salarioFimMesAtual);

        BigDecimal despesasVariaveis = Optional.ofNullable(lancamentoRepository.totalDespesasPeriodo(inicio, fim)).orElse(BigDecimal.ZERO);
        BigDecimal despesasFixas = Optional.ofNullable(despesaFixaRepository.totalDespesasFixasAtivas(inicio, fim)).orElse(BigDecimal.ZERO);
        BigDecimal saldo = receitas.subtract(despesasVariaveis.add(despesasFixas));

        dados.put("totalReceitas", receitas);
        dados.put("totalDespesas", despesasVariaveis);
        dados.put("totalFixas", despesasFixas);
        dados.put("saldo", saldo);

        // ============================================================
        // 🔹 Pagamentos do mês (corrigido)
        // ============================================================
        List<DespesaFixaPagamento> pagamentosMes = new ArrayList<>();
        pagamentosMes.addAll(pagamentoRepository.findByDataPagamentoBetween(inicio, fim));
        pagamentosMes.addAll(pagamentoRepository.findByMesReferenciaAndAnoReferencia(mes, ano));

        Map<Long, DespesaFixaPagamento> mapaPagamentos = pagamentosMes.stream()
                .filter(p -> p.getDespesaFixa() != null)
                .collect(Collectors.toMap(
                        p -> p.getDespesaFixa().getId(),
                        p -> p,
                        (a, b) -> a.getDataPagamento() != null ? a : b
                ));

        List<DespesaFixa> despesasFixasList = despesaFixaRepository.findAll();
        List<Map<String, Object>> fixasComStatus = new ArrayList<>(despesasFixasList.size());
        for (DespesaFixa df : despesasFixasList) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", df.getId());
            item.put("descricao", df.getDescricao());
            item.put("valor", df.getValor());
            item.put("tipoPagamento", df.getTipoPagamento());

            LocalDate dataVencimento = LocalDate.of(ano, mes,
                    Math.min(df.getDiaVencimento(), inicio.lengthOfMonth()));
            item.put("dataVencimento", dataVencimento);

            DespesaFixaPagamento pagamento = mapaPagamentos.get(df.getId());
            item.put("pago", pagamento != null && Boolean.TRUE.equals(pagamento.getPago()));
            item.put("dataPagamento", pagamento != null ? pagamento.getDataPagamento() : null);

            fixasComStatus.add(item);
        }
        dados.put("despesasFixas", fixasComStatus);

        // ============================================================
        // 🔹 Agrupamentos (mantidos)
        // ============================================================
        dados.put("categorias", lancamentoRepository.despesasPorCategoriaPeriodo(inicio, fim));
        dados.put("responsaveis", lancamentoRepository.despesasPorResponsavelPeriodo(inicio, fim));
        dados.put("bancos", lancamentoRepository.despesasPorBancoPeriodo(inicio, fim));
        dados.put("fixasCategorias", despesaFixaRepository.despesasFixasPorCategoria(ano, mes));
        dados.put("fixasResponsaveis", despesaFixaRepository.despesasFixasPorResponsavel(ano, mes));
        dados.put("receitasCategorias", lancamentoRepository.receitasPorCategoriaPeriodo(inicio, fim));
        dados.put("receitasResponsaveis", lancamentoRepository.receitasPorResponsavelPeriodo(inicio, fim));
        dados.put("receitasBancos", lancamentoRepository.receitasPorBancoPeriodo(inicio, fim));

        // ============================================================
        // 🔹 Mensal (mantido)
        // ============================================================
        Map<Integer, BigDecimal> fixasPorMes = new HashMap<>();
        for (int m = 1; m <= 12; m++) {
            LocalDate inicioM = LocalDate.of(ano, m, 1);
            LocalDate fimM = inicioM.withDayOfMonth(inicioM.lengthOfMonth());
            fixasPorMes.put(m, Optional.ofNullable(despesaFixaRepository.totalDespesasFixasAtivas(inicioM, fimM)).orElse(BigDecimal.ZERO));
        }

        Map<String, Map<String, Object>> mapaMensal = new HashMap<>();
        List<Object[]> mensal = lancamentoRepository.receitasVsDespesasMensal();
        for (Object[] row : mensal) {
            int anoRow = ((Number) row[0]).intValue();
            int mesRow = ((Number) row[1]).intValue();
            BigDecimal receitasRow = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
            BigDecimal variaveisRow = row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO;
            BigDecimal fixasRow = fixasPorMes.getOrDefault(mesRow, BigDecimal.ZERO);

            Map<String, Object> item = new HashMap<>();
            item.put("ano", anoRow);
            item.put("mes", mesRow);
            item.put("receitas", receitasRow);
            item.put("variaveis", variaveisRow);
            item.put("fixas", fixasRow);

            mapaMensal.put(anoRow + "-" + mesRow, item);
        }

        for (int m = 1; m <= 12; m++) {
            String chave = ano + "-" + m;
            if (!mapaMensal.containsKey(chave)) {
                Map<String, Object> vazio = new HashMap<>();
                vazio.put("ano", ano);
                vazio.put("mes", m);
                vazio.put("receitas", BigDecimal.ZERO);
                vazio.put("variaveis", BigDecimal.ZERO);
                vazio.put("fixas", fixasPorMes.getOrDefault(m, BigDecimal.ZERO));
                mapaMensal.put(chave, vazio);
            }
        }

        List<Map<String, Object>> listaMensal = new ArrayList<>(mapaMensal.values());
        listaMensal.sort(Comparator.comparing(a -> (Integer) a.get("mes")));
        dados.put("mensal", listaMensal);

        // ============================================================
        // 🔹 Últimos lançamentos (inalterado)
        // ============================================================
        List<Lancamento> ultimos = lancamentoRepository.findUltimosLancamentosPorPeriodo(inicio, fim);
        List<Map<String, Object>> ultimosFormatados = ultimos.stream().map(l -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", l.getId());
            map.put("descricao", l.getDescricao());
            map.put("valor", l.getValor());
            map.put("data", l.getData());
            map.put("categoria", l.getCategoria() != null ? l.getCategoria().getNome() : null);
            map.put("responsavel", l.getResponsavel() != null ? l.getResponsavel().getNome() : null);
            return map;
        }).collect(Collectors.toList());
        dados.put("ultimosLancamentos", ultimosFormatados);

        long endAll = System.currentTimeMillis();
        System.out.println("[Dashboard] total=" + (endAll - startAll) + "ms");
        return dados;
    }

    // ============================================================
    // 🔹 Pagamento manual (mantido igual)
    // ============================================================
    @PostMapping("/despesas-fixas/pagar/{id}")
    public ResponseEntity<?> pagarDespesaFixa(
            @PathVariable Long id,
            @RequestParam Integer mes,
            @RequestParam Integer ano,
            @RequestParam Boolean pago
    ) {
        DespesaFixa despesa = despesaFixaRepository.findById(id).orElse(null);
        if (despesa == null) return ResponseEntity.notFound().build();

        Optional<DespesaFixaPagamento> pagamentoOpt =
                pagamentoRepository.findByDespesaFixaAndMesReferenciaAndAnoReferencia(despesa, mes, ano);

        DespesaFixaPagamento pagamento = pagamentoOpt.orElse(new DespesaFixaPagamento());
        pagamento.setDespesaFixa(despesa);
        pagamento.setMesReferencia(mes);
        pagamento.setAnoReferencia(ano);
        pagamento.setPago(pago);
        pagamento.setDataPagamento(pago ? LocalDate.now() : null);

        pagamentoRepository.save(pagamento);
        return ResponseEntity.ok("Despesa marcada como " + (pago ? "paga" : "não paga") + " para " + mes + "/" + ano);
    }
}
