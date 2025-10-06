package com.financas.pessoais.financasweb.dto;

import java.math.BigDecimal;

public class AgrupamentoDTO {

    private String nome;
    private BigDecimal total;

    public AgrupamentoDTO(String nome, BigDecimal total) {
        this.nome = nome;
        this.total = total;
    }

    public String getNome() {
        return nome;
    }

    public BigDecimal getTotal() {
        return total;
    }
}
