package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.model.Lancamento;
import com.financas.pessoais.financasweb.repository.DespesaFixaRepository;
import com.financas.pessoais.financasweb.repository.LancamentoRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
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
        // 🔹 Define o período exato do mês
        LocalDate inicio = LocalDate.of(ano, mes, 1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        // Totais principais — agora usando o intervalo corretamente
        BigDecimal receitas = lancamentoRepository.totalReceitasPeriodo(inicio, fim);
        BigDecimal despesasVariaveis = lancamentoRepository.totalDespesasPeriodo(inicio, fim);
        BigDecimal despesasFixas = despesaFixaRepository.totalDespesasFixasAtivas(inicio, fim);

        BigDecimal saldo = receitas.subtract(despesasVariaveis.add(despesasFixas));

        Map<String, Object> dados = new HashMap<>();
        dados.put("totalReceitas", receitas);
        dados.put("totalDespesas", despesasVariaveis);
        dados.put("totalFixas", despesasFixas);
        dados.put("saldo", saldo);

        // Variáveis
        dados.put("categorias", lancamentoRepository.despesasPorCategoriaPeriodo(inicio, fim));
        dados.put("responsaveis", lancamentoRepository.despesasPorResponsavelPeriodo(inicio, fim));
        dados.put("bancos", lancamentoRepository.despesasPorBancoPeriodo(inicio, fim));

        // Fixas (filtradas corretamente)
        dados.put("fixasCategorias", despesaFixaRepository.despesasFixasPorCategoria(ano, mes));
        dados.put("fixasResponsaveis", despesaFixaRepository.despesasFixasPorResponsavel(ano, mes));

        // Receitas
        dados.put("receitasCategorias", lancamentoRepository.receitasPorCategoriaPeriodo(inicio, fim));
        dados.put("receitasResponsaveis", lancamentoRepository.receitasPorResponsavelPeriodo(inicio, fim));
        dados.put("receitasBancos", lancamentoRepository.receitasPorBancoPeriodo(inicio, fim));

        // Mensal — correção para usar o mesmo método filtrado de fixas
        List<Object[]> mensal = lancamentoRepository.receitasVsDespesasMensal();
        dados.put("mensal", mensal.stream().map(row -> {
            int anoRow = ((Number) row[0]).intValue();
            int mesRow = ((Number) row[1]).intValue();
            LocalDate inicioRow = LocalDate.of(anoRow, mesRow, 1);
            LocalDate fimRow = inicioRow.withDayOfMonth(inicioRow.lengthOfMonth());

            Map<String, Object> item = new HashMap<>();
            item.put("ano", anoRow);
            item.put("mes", mesRow);
            item.put("receitas", row[2]);
            item.put("variaveis", row[3]);
            item.put("fixas", despesaFixaRepository.totalDespesasFixasAtivas(inicioRow, fimRow));
            return item;
        }).toList());

        // Últimos lançamentos
        List<Lancamento> ultimos = lancamentoRepository.ultimosLancamentos();
        dados.put("ultimosLancamentos", ultimos);

        return dados;
    }
}
