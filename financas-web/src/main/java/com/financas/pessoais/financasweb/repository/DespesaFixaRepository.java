package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.dto.AgrupamentoDTO;
import com.financas.pessoais.financasweb.model.DespesaFixa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface DespesaFixaRepository extends JpaRepository<DespesaFixa, Long> {

    @Query("SELECT COALESCE(SUM(d.valor),0) FROM DespesaFixa d")
    BigDecimal totalDespesasFixas();

    @Query("""
        SELECT COALESCE(SUM(d.valor), 0)
          FROM DespesaFixa d
         WHERE d.fimRecorrencia IS NULL OR d.fimRecorrencia >= :inicio
    """)
    BigDecimal totalDespesasFixasAtivas(LocalDate inicio, LocalDate fim);

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

    @Query("""
           SELECT d
             FROM DespesaFixa d
            WHERE (d.fimRecorrencia IS NULL
                   OR YEAR(d.fimRecorrencia) > :ano
                   OR (YEAR(d.fimRecorrencia) = :ano AND MONTH(d.fimRecorrencia) >= :mes))
           """)
    List<DespesaFixa> findDespesasFixasAtivas(int ano, int mes);
}
