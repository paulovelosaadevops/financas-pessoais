package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.model.DespesaFixaPagamento;
import com.financas.pessoais.financasweb.model.DespesaFixa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface DespesaFixaPagamentoRepository extends JpaRepository<DespesaFixaPagamento, Long> {

    Optional<DespesaFixaPagamento> findByDespesaFixaAndMesReferenciaAndAnoReferencia(
            DespesaFixa despesaFixa, Integer mesReferencia, Integer anoReferencia
    );

    @Query("SELECT p FROM DespesaFixaPagamento p WHERE p.mesReferencia = :mes AND p.anoReferencia = :ano")
    List<DespesaFixaPagamento> findAllByMesAno(Integer mes, Integer ano);
}
