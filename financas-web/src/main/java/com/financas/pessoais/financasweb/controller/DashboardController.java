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

        // Totais principais
        BigDecimal receitas = lancamentoRepository.totalReceitasPeriodo(inicio, fim);
        BigDecimal despesasVariaveis = lancamentoRepository.totalDespesasPeriodo(inicio, fim);
        BigDecimal despesasFixas = despesaFixaRepository.totalDespesasFixasAtivas(inicio, fim);

        BigDecimal saldo = receitas.subtract(despesasVariaveis.add(despesasFixas));

        Map<String, Object> dados = new HashMap<>();
        dados.put("totalReceitas", receitas);
        dados.put("totalDespesas", despesasVariaveis);
        dados.put("totalFixas", despesasFixas);
        dados.put("saldo", saldo);

        // Agrupamentos
        dados.put("categorias", lancamentoRepository.despesasPorCategoriaPeriodo(inicio, fim));
        dados.put("responsaveis", lancamentoRepository.despesasPorResponsavelPeriodo(inicio, fim));
        dados.put("bancos", lancamentoRepository.despesasPorBancoPeriodo(inicio, fim));

        // Fixas (com status de pagamento)
        List<DespesaFixa> despesasFixasList = despesaFixaRepository.findAll();
        List<Map<String, Object>> fixasComStatus = despesasFixasList.stream().map(df -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", df.getId());
            item.put("descricao", df.getDescricao());
            item.put("valor", df.getValor());
            item.put("diaVencimento", df.getDiaVencimento());
            item.put("tipoPagamento", df.getTipoPagamento());

            Optional<DespesaFixaPagamento> pagamentoOpt =
                    pagamentoRepository.findByDespesaFixaAndMesReferenciaAndAnoReferencia(df, mes, ano);

            boolean pago = pagamentoOpt.map(p -> Boolean.TRUE.equals(p.getPago())).orElse(false);
            LocalDate dataPagamento = pagamentoOpt.map(DespesaFixaPagamento::getDataPagamento).orElse(null);

            item.put("pago", pago);
            item.put("dataPagamento", dataPagamento);

            return item;
        }).collect(Collectors.toList());

        dados.put("despesasFixas", fixasComStatus);

        // Fixas agrupadas
        dados.put("fixasCategorias", despesaFixaRepository.despesasFixasPorCategoria(ano, mes));
        dados.put("fixasResponsaveis", despesaFixaRepository.despesasFixasPorResponsavel(ano, mes));

        // Receitas
        dados.put("receitasCategorias", lancamentoRepository.receitasPorCategoriaPeriodo(inicio, fim));
        dados.put("receitasResponsaveis", lancamentoRepository.receitasPorResponsavelPeriodo(inicio, fim));
        dados.put("receitasBancos", lancamentoRepository.receitasPorBancoPeriodo(inicio, fim));

        // Comparativo mensal
        List<Object[]> mensal = lancamentoRepository.receitasVsDespesasMensal();
        Map<String, Map<String, Object>> mapaMensal = new HashMap<>();

        for (Object[] row : mensal) {
            int anoRow = ((Number) row[0]).intValue();
            int mesRow = ((Number) row[1]).intValue();

            LocalDate inicioRow = LocalDate.of(anoRow, mesRow, 1);
            LocalDate fimRow = inicioRow.withDayOfMonth(inicioRow.lengthOfMonth());

            BigDecimal receitasRow = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
            BigDecimal variaveisRow = row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO;
            BigDecimal fixasRow = despesaFixaRepository.totalDespesasFixasAtivas(inicioRow, fimRow);

            Map<String, Object> item = new HashMap<>();
            item.put("ano", anoRow);
            item.put("mes", mesRow);
            item.put("receitas", receitasRow);
            item.put("variaveis", variaveisRow);
            item.put("fixas", fixasRow);

            mapaMensal.put(anoRow + "-" + mesRow, item);
        }

        // Garante todos os meses
        for (int m = 1; m <= 12; m++) {
            String chave = ano + "-" + m;
            if (!mapaMensal.containsKey(chave)) {
                LocalDate inicioM = LocalDate.of(ano, m, 1);
                LocalDate fimM = inicioM.withDayOfMonth(inicioM.lengthOfMonth());
                BigDecimal fixasMes = despesaFixaRepository.totalDespesasFixasAtivas(inicioM, fimM);

                Map<String, Object> vazio = new HashMap<>();
                vazio.put("ano", ano);
                vazio.put("mes", m);
                vazio.put("receitas", BigDecimal.ZERO);
                vazio.put("variaveis", BigDecimal.ZERO);
                vazio.put("fixas", fixasMes);
                mapaMensal.put(chave, vazio);
            }
        }

        List<Map<String, Object>> listaMensal = mapaMensal.values().stream()
                .sorted(Comparator.comparing(a -> (Integer) a.get("mes")))
                .toList();
        dados.put("mensal", listaMensal);

        // Últimos lançamentos
        List<Lancamento> ultimos = lancamentoRepository.findUltimosLancamentosPorPeriodo(inicio, fim);
        dados.put("ultimosLancamentos", ultimos);

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
        if (despesa == null) {
            return ResponseEntity.notFound().build();
        }

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
