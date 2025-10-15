package com.financas.pessoais.financasweb.dto;

import com.financas.pessoais.financasweb.model.DespesaFixa;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DespesaFixaDTO {

    private Long id;
    private String descricao;
    private BigDecimal valor;
    private Integer diaVencimento;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate fimRecorrencia;

    private Long contaId;
    private String contaNome;
    private Long responsavelId;
    private String responsavelNome;
    private Long categoriaId;
    private String categoriaNome;

    private String tipoPagamento; // 🔹 NOVO CAMPO — "DEBITO" ou "CREDITO"

    public DespesaFixaDTO() {}

    public DespesaFixaDTO(DespesaFixa d) {
        this.id = d.getId();
        this.descricao = d.getDescricao();
        this.valor = d.getValor();
        this.diaVencimento = d.getDiaVencimento();
        this.fimRecorrencia = d.getFimRecorrencia();
        this.contaId = d.getConta() != null ? d.getConta().getId() : null;
        this.contaNome = d.getConta() != null ? d.getConta().getNome() : null;
        this.responsavelId = d.getResponsavel() != null ? d.getResponsavel().getId() : null;
        this.responsavelNome = d.getResponsavel() != null ? d.getResponsavel().getNome() : null;
        this.categoriaId = d.getCategoria() != null ? d.getCategoria().getId() : null;
        this.categoriaNome = d.getCategoria() != null ? d.getCategoria().getNome() : null;
        this.tipoPagamento = d.getTipoPagamento() != null ? d.getTipoPagamento() : "DEBITO"; // padrão seguro
    }

    public Long getId() { return id; }
    public String getDescricao() { return descricao; }
    public BigDecimal getValor() { return valor; }
    public Integer getDiaVencimento() { return diaVencimento; }
    public LocalDate getFimRecorrencia() { return fimRecorrencia; }
    public Long getContaId() { return contaId; }
    public String getContaNome() { return contaNome; }
    public Long getResponsavelId() { return responsavelId; }
    public String getResponsavelNome() { return responsavelNome; }
    public Long getCategoriaId() { return categoriaId; }
    public String getCategoriaNome() { return categoriaNome; }
    public String getTipoPagamento() { return tipoPagamento; }

    public void setId(Long id) { this.id = id; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public void setDiaVencimento(Integer diaVencimento) { this.diaVencimento = diaVencimento; }
    public void setFimRecorrencia(LocalDate fimRecorrencia) { this.fimRecorrencia = fimRecorrencia; }
    public void setContaId(Long contaId) { this.contaId = contaId; }
    public void setContaNome(String contaNome) { this.contaNome = contaNome; }
    public void setResponsavelId(Long responsavelId) { this.responsavelId = responsavelId; }
    public void setResponsavelNome(String responsavelNome) { this.responsavelNome = responsavelNome; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    public void setCategoriaNome(String categoriaNome) { this.categoriaNome = categoriaNome; }
    public void setTipoPagamento(String tipoPagamento) { this.tipoPagamento = tipoPagamento; }
}
