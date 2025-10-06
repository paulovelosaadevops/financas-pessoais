package com.financas.pessoais.financasweb.dto;

import java.math.BigDecimal;

public class MensalDTO {
    private int ano;
    private int mes;
    private BigDecimal receitas;
    private BigDecimal variaveis;
    private BigDecimal fixas;

    public MensalDTO() {}

    public MensalDTO(int ano, int mes, BigDecimal receitas, BigDecimal variaveis, BigDecimal fixas) {
        this.ano = ano;
        this.mes = mes;
        this.receitas = receitas;
        this.variaveis = variaveis;
        this.fixas = fixas;
    }

    public int getAno() { return ano; }
    public void setAno(int ano) { this.ano = ano; }

    public int getMes() { return mes; }
    public void setMes(int mes) { this.mes = mes; }

    public BigDecimal getReceitas() { return receitas; }
    public void setReceitas(BigDecimal receitas) { this.receitas = receitas; }

    public BigDecimal getVariaveis() { return variaveis; }
    public void setVariaveis(BigDecimal variaveis) { this.variaveis = variaveis; }

    public BigDecimal getFixas() { return fixas; }
    public void setFixas(BigDecimal fixas) { this.fixas = fixas; }
}
