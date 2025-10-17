package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.dto.AgrupamentoDTO;
import com.financas.pessoais.financasweb.model.Lancamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface LancamentoRepository extends JpaRepository<Lancamento, Long> {

    // ==============================================================
    // NOVOS MÉTODOS — Filtro por período (para Dashboard)
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

    // 🔹 NOVO: total transferido para metas no período
    @Query("""
           SELECT COALESCE(SUM(l.valor),0)
             FROM Lancamento l
            WHERE l.tipo = 'TRANSFERENCIA_META'
              AND l.data BETWEEN :inicio AND :fim
           """)
    BigDecimal totalTransferenciasPeriodo(LocalDate inicio, LocalDate fim);

    // 🔹 NOVO: total resgatado de metas no período
    @Query("""
           SELECT COALESCE(SUM(l.valor),0)
             FROM Lancamento l
            WHERE l.tipo = 'RESGATE_META'
              AND l.data BETWEEN :inicio AND :fim
           """)
    BigDecimal totalResgatesPeriodo(LocalDate inicio, LocalDate fim);

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
    // ANTIGOS MÉTODOS — Mantidos para compatibilidade com controllers antigos
    // ==============================================================
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
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(c.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.categoria c
            WHERE l.tipo = 'DESPESA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
            GROUP BY c.nome
           """)
    List<AgrupamentoDTO> despesasPorCategoria(int ano, int mes);

    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(r.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.responsavel r
            WHERE l.tipo = 'DESPESA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
            GROUP BY r.nome
           """)
    List<AgrupamentoDTO> despesasPorResponsavel(int ano, int mes);

    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(c.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.contaOuCartao c
            WHERE l.tipo = 'DESPESA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
            GROUP BY c.nome
           """)
    List<AgrupamentoDTO> despesasPorBanco(int ano, int mes);

    @Query("""
           SELECT l FROM Lancamento l ORDER BY l.data DESC
           """)
    List<Lancamento> ultimosLancamentos();

    // ==============================================================
    // Métodos auxiliares
    // ==============================================================
    @Query("""
       SELECT l FROM Lancamento l
        WHERE (:ano IS NULL OR YEAR(l.data) = :ano)
          AND (:mes IS NULL OR MONTH(l.data) = :mes)
          AND (:tipo IS NULL OR l.tipo = :tipo)
          AND (:categoriaId IS NULL OR l.categoria.id = :categoriaId)
          AND (:responsavelId IS NULL OR l.responsavel.id = :responsavelId)
          AND (:contaId IS NULL OR l.contaOuCartao.id = :contaId)
        ORDER BY l.data DESC
       """)
    List<Lancamento> buscarLancamentosFiltrados(
            Integer ano,
            Integer mes,
            String tipo,
            Long categoriaId,
            Long responsavelId,
            Long contaId
    );

    @Query("""
    SELECT 
        YEAR(l.data) as ano,
        MONTH(l.data) as mes,
        SUM(CASE WHEN l.tipo = 'RECEITA' THEN l.valor ELSE 0 END) as total_receitas,
        SUM(CASE WHEN l.tipo = 'DESPESA' THEN l.valor ELSE 0 END) as total_despesas
    FROM Lancamento l
    GROUP BY YEAR(l.data), MONTH(l.data)
    ORDER BY ano, mes
""")
    List<Object[]> receitasVsDespesasMensal();

    @Query("""
    SELECT l
      FROM Lancamento l
     WHERE l.data BETWEEN :inicio AND :fim
     ORDER BY l.data DESC
""")
    List<Lancamento> findUltimosLancamentosPorPeriodo(@Param("inicio") LocalDate inicio,
                                                      @Param("fim") LocalDate fim);

}

@Query("SELECT COALESCE(SUM(l.valor), 0) FROM Lancamento l " +
        "WHERE l.tipo = 'RECEITA' AND l.data BETWEEN :inicio AND :fim")
BigDecimal totalReceitasPeriodo(LocalDate inicio, LocalDate fim);

@Query("SELECT COALESCE(SUM(l.valor), 0) FROM Lancamento l " +
        "WHERE l.tipo = 'RECEITA' AND l.mesCompetencia = :mes AND l.anoCompetencia = :ano")
BigDecimal totalReceitasCompetencia(Integer ano, Integer mes);
