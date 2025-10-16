package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.model.DespesaFixa;
import com.financas.pessoais.financasweb.model.DespesaFixaPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DespesaFixaPagamentoRepository extends JpaRepository<DespesaFixaPagamento, Long> {

    Optional<DespesaFixaPagamento> findByDespesaFixaAndMesReferenciaAndAnoReferencia(
            DespesaFixa despesaFixa, Integer mesReferencia, Integer anoReferencia
    );

    // 🔹 Adicione esta nova linha abaixo:
    List<DespesaFixaPagamento> findByMesReferenciaAndAnoReferencia(Integer mesReferencia, Integer anoReferencia);
}
