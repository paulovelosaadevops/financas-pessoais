package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.dto.AgrupamentoDTO;
import com.financas.pessoais.financasweb.model.Lancamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface LancamentoRepository extends JpaRepository<Lancamento, Long> {

    // ==============================================================
    // NOVOS MÉTODOS BASEADOS EM INTERVALO (evitam erro de mês misturado)
    // ==============================================================

    @Query("""
           SELECT COALESCE(SUM(l.valor),0)
             FROM Lancamento l
            WHERE l.tipo = 'RECEITA'
              AND l.data BETWEEN :inicio AND :fim
           """)
    BigDecimal totalReceitasPeriodo(LocalDate inicio, LocalDate fim);

    @Query("""
           SELECT COALESCE(SUM(l.valor),0)
             FROM Lancamento l
            WHERE l.tipo = 'DESPESA'
              AND l.data BETWEEN :inicio AND :fim
           """)
    BigDecimal totalDespesasPeriodo(LocalDate inicio, LocalDate fim);

    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(c.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.categoria c
            WHERE l.tipo = 'DESPESA'
              AND l.data BETWEEN :inicio AND :fim
            GROUP BY c.nome
           """)
    List<AgrupamentoDTO> despesasPorCategoriaPeriodo(LocalDate inicio, LocalDate fim);

    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(r.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.responsavel r
            WHERE l.tipo = 'DESPESA'
              AND l.data BETWEEN :inicio AND :fim
            GROUP BY r.nome
           """)
    List<AgrupamentoDTO> despesasPorResponsavelPeriodo(LocalDate inicio, LocalDate fim);

    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(c.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.contaOuCartao c
            WHERE l.tipo = 'DESPESA'
              AND l.data BETWEEN :inicio AND :fim
            GROUP BY c.nome
           """)
    List<AgrupamentoDTO> despesasPorBancoPeriodo(LocalDate inicio, LocalDate fim);

    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(c.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.categoria c
            WHERE l.tipo = 'RECEITA'
              AND l.data BETWEEN :inicio AND :fim
            GROUP BY c.nome
           """)
    List<AgrupamentoDTO> receitasPorCategoriaPeriodo(LocalDate inicio, LocalDate fim);

    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(r.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.responsavel r
            WHERE l.tipo = 'RECEITA'
              AND l.data BETWEEN :inicio AND :fim
            GROUP BY r.nome
           """)
    List<AgrupamentoDTO> receitasPorResponsavelPeriodo(LocalDate inicio, LocalDate fim);

    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(c.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.contaOuCartao c
            WHERE l.tipo = 'RECEITA'
              AND l.data BETWEEN :inicio AND :fim
            GROUP BY c.nome
           """)
    List<AgrupamentoDTO> receitasPorBancoPeriodo(LocalDate inicio, LocalDate fim);

    // ==============================================================
    // MANTÉM todos os métodos anteriores (NÃO remover!)
    // ==============================================================

    List<Lancamento> findByDataBetween(LocalDate dataInicio, LocalDate dataFim);

    @Query("""
           SELECT COALESCE(SUM(l.valor),0)
             FROM Lancamento l
            WHERE l.tipo = 'RECEITA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
           """)
    BigDecimal totalReceitas(int ano, int mes);

    @Query("""
           SELECT COALESCE(SUM(l.valor),0)
             FROM Lancamento l
            WHERE l.tipo = 'DESPESA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
           """)
    BigDecimal totalDespesas(int ano, int mes);

    @Query("""
           SELECT YEAR(l.data), MONTH(l.data),
                  SUM(CASE WHEN l.tipo = 'RECEITA' THEN l.valor ELSE 0 END),
                  SUM(CASE WHEN l.tipo = 'DESPESA' THEN l.valor ELSE 0 END)
             FROM Lancamento l
            GROUP BY YEAR(l.data), MONTH(l.data)
            ORDER BY YEAR(l.data), MONTH(l.data)
           """)
    List<Object[]> receitasVsDespesasMensal();

    @Query("SELECT l FROM Lancamento l ORDER BY l.data DESC")
    List<Lancamento> ultimosLancamentos();
}
