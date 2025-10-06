package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.model.Lancamento;
import com.financas.pessoais.financasweb.repository.DespesaFixaRepository;
import com.financas.pessoais.financasweb.repository.LancamentoRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final LancamentoRepository lancamentoRepository;
    private final DespesaFixaRepository despesaFixaRepository;

    public DashboardController(LancamentoRepository lancamentoRepository,
                               DespesaFixaRepository despesaFixaRepository) {
        this.lancamentoRepository = lancamentoRepository;
        this.despesaFixaRepository = despesaFixaRepository;
    }

    @GetMapping
    public Map<String, Object> getDashboard(@RequestParam int ano, @RequestParam int mes) {

        BigDecimal receitas = lancamentoRepository.totalReceitas(ano, mes);
        BigDecimal despesasVariaveis = lancamentoRepository.totalDespesas(ano, mes);
        BigDecimal despesasFixas = despesaFixaRepository.totalDespesasFixasAtivas(ano, mes);

        BigDecimal saldo = receitas.subtract(despesasVariaveis.add(despesasFixas));

        Map<String, Object> dados = new HashMap<>();
        dados.put("totalReceitas", receitas);
        dados.put("totalDespesas", despesasVariaveis);
        dados.put("totalFixas", despesasFixas);
        dados.put("saldo", saldo);

        // Variáveis
        dados.put("categorias", lancamentoRepository.despesasPorCategoria(ano, mes));
        dados.put("responsaveis", lancamentoRepository.despesasPorResponsavel(ano, mes));
        dados.put("bancos", lancamentoRepository.despesasPorBanco(ano, mes));

        // Fixas
        dados.put("fixasCategorias", despesaFixaRepository.despesasFixasPorCategoria(ano, mes));
        dados.put("fixasResponsaveis", despesaFixaRepository.despesasFixasPorResponsavel(ano, mes));

        // Receitas
        dados.put("receitasCategorias", lancamentoRepository.receitasPorCategoria(ano, mes));
        dados.put("receitasResponsaveis", lancamentoRepository.receitasPorResponsavel(ano, mes));
        dados.put("receitasBancos", lancamentoRepository.receitasPorBanco(ano, mes));

        // Mensal
        List<Object[]> mensal = lancamentoRepository.receitasVsDespesasMensal();
        dados.put("mensal", mensal.stream().map(row -> {
            int anoRow = ((Number) row[0]).intValue();
            int mesRow = ((Number) row[1]).intValue();
            Map<String, Object> item = new HashMap<>();
            item.put("ano", anoRow);
            item.put("mes", mesRow);
            item.put("receitas", row[2]);
            item.put("variaveis", row[3]);
            item.put("fixas", despesaFixaRepository.totalDespesasFixasAtivas(anoRow, mesRow));
            return item;
        }).toList());

        // Últimos lançamentos
        List<Lancamento> ultimos = lancamentoRepository.ultimosLancamentos();
        dados.put("ultimosLancamentos", ultimos);

        return dados;
    }
}
