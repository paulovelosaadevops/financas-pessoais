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
    public Map<String, Object> getDashboard(@RequestParam int ano, @RequestParam int mes) {
        long startAll = System.currentTimeMillis();
        Map<String, Object> dados = new HashMap<>();

        LocalDate inicio = LocalDate.of(ano, mes, 1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        // 🔹 Totais principais
        BigDecimal receitas = lancamentoRepository.totalReceitasPeriodo(inicio, fim);
        BigDecimal despesasVariaveis = lancamentoRepository.totalDespesasPeriodo(inicio, fim);
        BigDecimal despesasFixas = despesaFixaRepository.totalDespesasFixasAtivas(inicio, fim);
        BigDecimal saldo = receitas.subtract(despesasVariaveis.add(despesasFixas));

        dados.put("totalReceitas", receitas);
        dados.put("totalDespesas", despesasVariaveis);
        dados.put("totalFixas", despesasFixas);
        dados.put("saldo", saldo);

        // 🔹 Pagamentos do mês
        long t1 = System.currentTimeMillis();
        List<DespesaFixaPagamento> pagamentosMes =
                pagamentoRepository.findByMesReferenciaAndAnoReferencia(mes, ano);
        Map<Long, DespesaFixaPagamento> mapaPagamentos = pagamentosMes.stream()
                .collect(Collectors.toMap(
                        p -> p.getDespesaFixa().getId(),
                        p -> p,
                        (a, b) -> a
                ));
        long t2 = System.currentTimeMillis();

        // 🔹 Monta lista de fixas
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
        long t3 = System.currentTimeMillis();

        // 🔹 Agrupamentos principais
        dados.put("categorias", lancamentoRepository.despesasPorCategoriaPeriodo(inicio, fim));
        dados.put("responsaveis", lancamentoRepository.despesasPorResponsavelPeriodo(inicio, fim));
        dados.put("bancos", lancamentoRepository.despesasPorBancoPeriodo(inicio, fim));

        dados.put("fixasCategorias", despesaFixaRepository.despesasFixasPorCategoria(ano, mes));
        dados.put("fixasResponsaveis", despesaFixaRepository.despesasFixasPorResponsavel(ano, mes));

        dados.put("receitasCategorias", lancamentoRepository.receitasPorCategoriaPeriodo(inicio, fim));
        dados.put("receitasResponsaveis", lancamentoRepository.receitasPorResponsavelPeriodo(inicio, fim));
        dados.put("receitasBancos", lancamentoRepository.receitasPorBancoPeriodo(inicio, fim));

        // 🔹 Pré-calcula totais fixas por mês
        Map<Integer, BigDecimal> fixasPorMes = new HashMap<>();
        for (int m = 1; m <= 12; m++) {
            LocalDate inicioM = LocalDate.of(ano, m, 1);
            LocalDate fimM = inicioM.withDayOfMonth(inicioM.lengthOfMonth());
            fixasPorMes.put(m, despesaFixaRepository.totalDespesasFixasAtivas(inicioM, fimM));
        }

        // 🔹 Inicializa o mapa mensal
        Map<String, Map<String, Object>> mapaMensal = new HashMap<>();

        // 🔹 Adiciona meses existentes
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

        // 🔹 Garante todos os meses do ano
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

        // 🔹 Converte em lista ordenada
        List<Map<String, Object>> listaMensal = new ArrayList<>(mapaMensal.values());
        listaMensal.sort(Comparator.comparing(a -> (Integer) a.get("mes")));
        dados.put("mensal", listaMensal);

        // 🔹 Últimos lançamentos leves
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
        System.out.println("[Dashboard] pagamentos=" + (t2 - t1) + "ms | fixas=" + (t3 - t2) + "ms | total=" + (endAll - startAll) + "ms");

        return dados;
    }

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
