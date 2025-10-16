package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.model.MetaFinanceira;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MetaFinanceiraRepository extends JpaRepository<MetaFinanceira, Long> {

    @Query("""
        SELECT 
            m.id AS idMeta,
            m.descricao AS descricao,
            m.valorMeta AS valorMeta,
            COALESCE(SUM(l.valor), 0) AS atingido,
            (COALESCE(SUM(l.valor), 0) / m.valorMeta * 100) AS percentual
        FROM MetaFinanceira m
        LEFT JOIN Lancamento l
            ON l.meta = true
            AND MONTH(l.data) = m.mesReferencia
            AND YEAR(l.data) = m.anoReferencia
            AND (m.categoria IS NULL OR l.categoria = m.categoria)
        WHERE m.ativa = true
        GROUP BY m.id, m.descricao, m.valorMeta
        ORDER BY m.anoReferencia DESC, m.mesReferencia DESC
    """)
    List<Object[]> progressoMetas();
}
