package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.model.Conta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContaRepository extends JpaRepository<Conta, Long> {
}
