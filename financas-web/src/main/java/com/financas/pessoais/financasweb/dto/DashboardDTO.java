package com.financas.pessoais.financasweb.dto;

import com.financas.pessoais.financasweb.model.Lancamento;

import java.math.BigDecimal;
import java.util.List;

public class DashboardDTO {

    // Totais
    private BigDecimal totalReceitas;
    private BigDecimal totalDespesas; // apenas variáveis
    private BigDecimal totalFixas;    // apenas fixas
    private BigDecimal saldo;

    // Despesas variáveis (lancamentos)
    private List<AgrupamentoDTO> categorias;
    private List<AgrupamentoDTO> responsaveis;
    private List<AgrupamentoDTO> bancos;

    // Despesas fixas (parametrizadas)
    private List<AgrupamentoDTO> fixasCategorias;
    private List<AgrupamentoDTO> fixasResponsaveis;

    // Receitas
    private List<AgrupamentoDTO> receitasCategorias;
    private List<AgrupamentoDTO> receitasResponsaveis;
    private List<AgrupamentoDTO> receitasBancos;

    // Série mensal (3 barras)
    private List<MensalDTO> mensal;

    // Últimos lançamentos
    private List<Lancamento> ultimosLancamentos;

    public DashboardDTO() {}

    // Getters e Setters
    public BigDecimal getTotalReceitas() { return totalReceitas; }
    public void setTotalReceitas(BigDecimal totalReceitas) { this.totalReceitas = totalReceitas; }

    public BigDecimal getTotalDespesas() { return totalDespesas; }
    public void setTotalDespesas(BigDecimal totalDespesas) { this.totalDespesas = totalDespesas; }

    public BigDecimal getTotalFixas() { return totalFixas; }
    public void setTotalFixas(BigDecimal totalFixas) { this.totalFixas = totalFixas; }

    public BigDecimal getSaldo() { return saldo; }
    public void setSaldo(BigDecimal saldo) { this.saldo = saldo; }

    public List<AgrupamentoDTO> getCategorias() { return categorias; }
    public void setCategorias(List<AgrupamentoDTO> categorias) { this.categorias = categorias; }

    public List<AgrupamentoDTO> getResponsaveis() { return responsaveis; }
    public void setResponsaveis(List<AgrupamentoDTO> responsaveis) { this.responsaveis = responsaveis; }

    public List<AgrupamentoDTO> getBancos() { return bancos; }
    public void setBancos(List<AgrupamentoDTO> bancos) { this.bancos = bancos; }

    public List<AgrupamentoDTO> getFixasCategorias() { return fixasCategorias; }
    public void setFixasCategorias(List<AgrupamentoDTO> fixasCategorias) { this.fixasCategorias = fixasCategorias; }

    public List<AgrupamentoDTO> getFixasResponsaveis() { return fixasResponsaveis; }
    public void setFixasResponsaveis(List<AgrupamentoDTO> fixasResponsaveis) { this.fixasResponsaveis = fixasResponsaveis; }

    public List<AgrupamentoDTO> getReceitasCategorias() { return receitasCategorias; }
    public void setReceitasCategorias(List<AgrupamentoDTO> receitasCategorias) { this.receitasCategorias = receitasCategorias; }

    public List<AgrupamentoDTO> getReceitasResponsaveis() { return receitasResponsaveis; }
    public void setReceitasResponsaveis(List<AgrupamentoDTO> receitasResponsaveis) { this.receitasResponsaveis = receitasResponsaveis; }

    public List<AgrupamentoDTO> getReceitasBancos() { return receitasBancos; }
    public void setReceitasBancos(List<AgrupamentoDTO> receitasBancos) { this.receitasBancos = receitasBancos; }

    public List<MensalDTO> getMensal() { return mensal; }
    public void setMensal(List<MensalDTO> mensal) { this.mensal = mensal; }

    public List<Lancamento> getUltimosLancamentos() { return ultimosLancamentos; }
    public void setUltimosLancamentos(List<Lancamento> ultimosLancamentos) { this.ultimosLancamentos = ultimosLancamentos; }
}
