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
        LocalDate inicio = LocalDate.of(ano, mes, 1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());
        Map<String, Object> dados = new HashMap<>();

        // 🔹 Totais principais
        BigDecimal receitas = lancamentoRepository.totalReceitasPeriodo(inicio, fim);
        BigDecimal despesasVariaveis = lancamentoRepository.totalDespesasPeriodo(inicio, fim);
        BigDecimal despesasFixas = despesaFixaRepository.totalDespesasFixasAtivas(inicio, fim);
        BigDecimal saldo = receitas.subtract(despesasVariaveis.add(despesasFixas));

        dados.put("totalReceitas", receitas);
        dados.put("totalDespesas", despesasVariaveis);
        dados.put("totalFixas", despesasFixas);
        dados.put("saldo", saldo);

        // 🔹 Agrupamentos principais
        dados.put("categorias", lancamentoRepository.despesasPorCategoriaPeriodo(inicio, fim));
        dados.put("responsaveis", lancamentoRepository.despesasPorResponsavelPeriodo(inicio, fim));
        dados.put("bancos", lancamentoRepository.despesasPorBancoPeriodo(inicio, fim));

        // 🔹 Busca única de pagamentos do mês (performance)
        List<DespesaFixaPagamento> pagamentosMes =
                pagamentoRepository.findByMesReferenciaAndAnoReferencia(mes, ano);

        Map<Long, DespesaFixaPagamento> mapaPagamentos = pagamentosMes.stream()
                .collect(Collectors.toMap(
                        p -> p.getDespesaFixa().getId(),
                        p -> p,
                        (a, b) -> a // ignora duplicatas
                ));

        // 🔹 Monta lista de fixas com status
        List<DespesaFixa> despesasFixasList = despesaFixaRepository.findAll();
        List<Map<String, Object>> fixasComStatus = despesasFixasList.stream().map(df -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", df.getId());
            item.put("descricao", df.getDescricao());
            item.put("valor", df.getValor());
            item.put("tipoPagamento", df.getTipoPagamento());

            LocalDate dataVencimento = LocalDate.of(ano, mes,
                    Math.min(df.getDiaVencimento(), inicio.lengthOfMonth()));
            item.put("dataVencimento", dataVencimento);

            DespesaFixaPagamento pagamento = mapaPagamentos.get(df.getId());
            boolean pago = pagamento != null && Boolean.TRUE.equals(pagamento.getPago());
            LocalDate dataPagamento = pagamento != null ? pagamento.getDataPagamento() : null;

            item.put("pago", pago);
            item.put("dataPagamento", dataPagamento);

            return item;
        }).collect(Collectors.toList());

        dados.put("despesasFixas", fixasComStatus);

        // 🔹 Agrupamentos de fixas
        dados.put("fixasCategorias", despesaFixaRepository.despesasFixasPorCategoria(ano, mes));
        dados.put("fixasResponsaveis", despesaFixaRepository.despesasFixasPorResponsavel(ano, mes));

        // 🔹 Receitas agrupadas
        dados.put("receitasCategorias", lancamentoRepository.receitasPorCategoriaPeriodo(inicio, fim));
        dados.put("receitasResponsaveis", lancamentoRepository.receitasPorResponsavelPeriodo(inicio, fim));
        dados.put("receitasBancos", lancamentoRepository.receitasPorBancoPeriodo(inicio, fim));

        // 🔹 Pré-calcula totais fixas por mês (evita 12 queries)
        Map<Integer, BigDecimal> fixasPorMes = new HashMap<>();
        for (int m = 1; m <= 12; m++) {
            LocalDate inicioM = LocalDate.of(ano, m, 1);
            LocalDate fimM = inicioM.withDayOfMonth(inicioM.lengthOfMonth());
            fixasPorMes.put(m, despesaFixaRepository.totalDespesasFixasAtivas(inicioM, fimM));
        }

        // 🔹 Comparativo mensal
        List<Object[]> mensal = lancamentoRepository.receitasVsDespesasMensal();
        Map<String, Map<String, Object>> mapaMensal = new HashMap<>();

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

        // 🔹 Garante meses vazios
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

        List<Map<String, Object>> listaMensal = mapaMensal.values().stream()
                .sorted(Comparator.comparing(a -> (Integer) a.get("mes")))
                .toList();
        dados.put("mensal", listaMensal);

        // 🔹 Últimos lançamentos — formato leve
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
