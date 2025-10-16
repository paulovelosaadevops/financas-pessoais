package com.financas.pessoais.financasweb.dto;

import java.math.BigDecimal;

public class MetaFinanceiraDTO {
    private Long id;
    private String descricao;
    private String tipo;
    private BigDecimal valorMeta;
    private BigDecimal atingido;
    private BigDecimal percentual;
    private Integer mesReferencia;
    private Integer anoReferencia;
    private boolean ativa;

    public MetaFinanceiraDTO() {}

    public MetaFinanceiraDTO(Long id, String descricao, String tipo, BigDecimal valorMeta,
                             BigDecimal atingido, BigDecimal percentual, Integer mesReferencia,
                             Integer anoReferencia, boolean ativa) {
        this.id = id;
        this.descricao = descricao;
        this.tipo = tipo;
        this.valorMeta = valorMeta;
        this.atingido = atingido;
        this.percentual = percentual;
        this.mesReferencia = mesReferencia;
        this.anoReferencia = anoReferencia;
        this.ativa = ativa;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public BigDecimal getValorMeta() { return valorMeta; }
    public void setValorMeta(BigDecimal valorMeta) { this.valorMeta = valorMeta; }

    public BigDecimal getAtingido() { return atingido; }
    public void setAtingido(BigDecimal atingido) { this.atingido = atingido; }

    public BigDecimal getPercentual() { return percentual; }
    public void setPercentual(BigDecimal percentual) { this.percentual = percentual; }

    public Integer getMesReferencia() { return mesReferencia; }
    public void setMesReferencia(Integer mesReferencia) { this.mesReferencia = mesReferencia; }

    public Integer getAnoReferencia() { return anoReferencia; }
    public void setAnoReferencia(Integer anoReferencia) { this.anoReferencia = anoReferencia; }

    public boolean isAtiva() { return ativa; }
    public void setAtiva(boolean ativa) { this.ativa = ativa; }
}
