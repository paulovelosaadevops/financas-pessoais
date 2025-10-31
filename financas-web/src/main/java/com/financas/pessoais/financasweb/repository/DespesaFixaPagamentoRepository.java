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

    // 🔹 Busca pagamento específico por despesa, mês e ano
    Optional<DespesaFixaPagamento> findByDespesaFixaAndMesReferenciaAndAnoReferencia(
            DespesaFixa despesaFixa, Integer mesReferencia, Integer anoReferencia
    );

    // 🔹 Busca todos os pagamentos por mês/ano de referência
    List<DespesaFixaPagamento> findByMesReferenciaAndAnoReferencia(
            Integer mesReferencia, Integer anoReferencia
    );

    // 🔹 Busca por data real de pagamento (para exibição do histórico no mês certo)
    List<DespesaFixaPagamento> findByDataPagamentoBetween(LocalDate inicio, LocalDate fim);
}
