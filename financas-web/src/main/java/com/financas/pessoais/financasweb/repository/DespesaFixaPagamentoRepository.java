package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.model.DespesaFixa;
import com.financas.pessoais.financasweb.model.DespesaFixaPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DespesaFixaPagamentoRepository extends JpaRepository<DespesaFixaPagamento, Long> {

    Optional<DespesaFixaPagamento> findByDespesaFixaAndMesReferenciaAndAnoReferencia(
            DespesaFixa despesaFixa, Integer mesReferencia, Integer anoReferencia
    );

    List<DespesaFixaPagamento> findByMesReferenciaAndAnoReferencia(
            Integer mesReferencia, Integer anoReferencia
    );

    // 🔹 Mantido apenas por compatibilidade (sem uso no fluxo real)
    List<DespesaFixaPagamento> findByMesReferenciaSalarioAndAnoReferenciaSalario(
            Integer mesReferenciaSalario, Integer anoReferenciaSalario
    );

    // ✅ Novo método: busca por data real de pagamento
    List<DespesaFixaPagamento> findByDataPagamentoBetween(LocalDate inicio, LocalDate fim);
}
