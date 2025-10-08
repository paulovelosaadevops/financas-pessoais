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

        // Mensal — compara receitas, variáveis e fixas mês a mês
        List<Object[]> mensal = lancamentoRepository.receitasVsDespesasMensal();

// Mapeia meses que já vieram do banco (ex: lançamentos)
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

// 🔹 Garante que meses sem lançamentos também apareçam
        LocalDate hoje = LocalDate.now();
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

        // 🔹 Converte o mapa em lista ordenada por mês
        List<Map<String, Object>> listaMensal = mapaMensal.values().stream()
                .sorted((a, b) -> ((Integer) a.get("mes")).compareTo((Integer) b.get("mes")))
                .toList();

        dados.put("mensal", listaMensal);


        // Últimos lançamentos
        // 🔹 Últimos lançamentos — apenas do mês/ano selecionados
        List<Lancamento> ultimos = lancamentoRepository.findUltimosLancamentosPorPeriodo(inicio, fim);
        dados.put("ultimosLancamentos", ultimos);

        return dados;
    }
}
