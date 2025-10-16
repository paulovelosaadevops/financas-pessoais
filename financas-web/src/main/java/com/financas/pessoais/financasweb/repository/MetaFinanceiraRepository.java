package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.model.MetaFinanceira;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetaFinanceiraRepository extends JpaRepository<MetaFinanceira, Long> {

    @Query("""
        SELECT 
            m.id,
            m.descricao,
            m.valorMeta,
            COALESCE(SUM(l.valor), 0) AS atingido,
            (COALESCE(SUM(l.valor), 0) / NULLIF(m.valorMeta, 0)) * 100 AS percentual
        FROM MetaFinanceira m
        LEFT JOIN Lancamento l ON l.meta = m
        GROUP BY m.id, m.descricao, m.valorMeta
        ORDER BY m.id
    """)
    List<Object[]> progressoMetas();
}
