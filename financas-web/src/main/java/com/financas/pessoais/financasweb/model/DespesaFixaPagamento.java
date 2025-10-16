package com.financas.pessoais.financasweb.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "despesa_fixa_pagamento")
public class DespesaFixaPagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "despesa_fixa_id")
    private DespesaFixa despesaFixa;

    private Integer mesReferencia;
    private Integer anoReferencia;
    private Boolean pago = false;
    private LocalDate dataPagamento;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DespesaFixa getDespesaFixa() { return despesaFixa; }
    public void setDespesaFixa(DespesaFixa despesaFixa) { this.despesaFixa = despesaFixa; }

    public Integer getMesReferencia() { return mesReferencia; }
    public void setMesReferencia(Integer mesReferencia) { this.mesReferencia = mesReferencia; }

    public Integer getAnoReferencia() { return anoReferencia; }
    public void setAnoReferencia(Integer anoReferencia) { this.anoReferencia = anoReferencia; }

    public Boolean getPago() { return pago; }
    public void setPago(Boolean pago) { this.pago = pago; }

    public LocalDate getDataPagamento() { return dataPagamento; }
    public void setDataPagamento(LocalDate dataPagamento) { this.dataPagamento = dataPagamento; }
}
