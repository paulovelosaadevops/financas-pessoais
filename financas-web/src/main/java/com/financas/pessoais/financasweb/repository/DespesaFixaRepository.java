package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.dto.AgrupamentoDTO;
import com.financas.pessoais.financasweb.model.DespesaFixa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface DespesaFixaRepository extends JpaRepository<DespesaFixa, Long> {

    // 🔹 Total geral de despesas fixas ativas no período
    @Query("""
        SELECT COALESCE(SUM(d.valor), 0)
          FROM DespesaFixa d
         WHERE (d.fimRecorrencia IS NULL OR d.fimRecorrencia >= :inicio)
      """)
    BigDecimal totalDespesasFixasAtivas(@Param("inicio") LocalDate inicio);

    // 🔹 Total de despesas fixas filtradas por tipoPagamento
    @Query("""
        SELECT COALESCE(SUM(d.valor), 0)
          FROM DespesaFixa d
         WHERE (d.fimRecorrencia IS NULL OR d.fimRecorrencia >= :inicio)
           AND UPPER(d.tipoPagamento) = UPPER(:tipoPagamento)
      """)
    BigDecimal totalPorTipoPagamento(@Param("inicio") LocalDate inicio, @Param("tipoPagamento") String tipoPagamento);

    // 🔹 Agrupamento por categoria
    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(c.nome, COALESCE(SUM(d.valor),0))
             FROM DespesaFixa d
             LEFT JOIN d.categoria c
            WHERE (d.fimRecorrencia IS NULL
                   OR YEAR(d.fimRecorrencia) > :ano
                   OR (YEAR(d.fimRecorrencia) = :ano AND MONTH(d.fimRecorrencia) >= :mes))
            GROUP BY c.nome
           """)
    List<AgrupamentoDTO> despesasFixasPorCategoria(int ano, int mes);

    // 🔹 Agrupamento por responsável
    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(r.nome, COALESCE(SUM(d.valor),0))
             FROM DespesaFixa d
             LEFT JOIN d.responsavel r
            WHERE (d.fimRecorrencia IS NULL
                   OR YEAR(d.fimRecorrencia) > :ano
                   OR (YEAR(d.fimRecorrencia) = :ano AND MONTH(d.fimRecorrencia) >= :mes))
            GROUP BY r.nome
           """)
    List<AgrupamentoDTO> despesasFixasPorResponsavel(int ano, int mes);

    // 🔹 Busca geral de fixas ativas
    @Query("""
           SELECT d
             FROM DespesaFixa d
            WHERE (d.fimRecorrencia IS NULL
                   OR YEAR(d.fimRecorrencia) > :ano
                   OR (YEAR(d.fimRecorrencia) = :ano AND MONTH(d.fimRecorrencia) >= :mes))
           """)
    List<DespesaFixa> findDespesasFixasAtivas(int ano, int mes);

    // 🔹 Busca fixas ativas por tipoPagamento ("CREDITO" ou "DEBITO")
    @Query("""
           SELECT d
             FROM DespesaFixa d
            WHERE (d.fimRecorrencia IS NULL
                   OR YEAR(d.fimRecorrencia) > :ano
                   OR (YEAR(d.fimRecorrencia) = :ano AND MONTH(d.fimRecorrencia) >= :mes))
              AND UPPER(d.tipoPagamento) = UPPER(:tipoPagamento)
           """)
    List<DespesaFixa> findDespesasFixasAtivasPorTipo(int ano, int mes, @Param("tipoPagamento") String tipoPagamento);
}
