package com.financas.pessoais.financasweb.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
public class Lancamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @NotNull(message = "A data é obrigatória")
    private LocalDate data;

    @NotBlank(message = "O tipo é obrigatório (RECEITA ou DESPESA)")
    private String tipo;

    @ManyToOne
    private Categoria categoria;

    @ManyToOne
    private Conta contaOuCartao;

    @ManyToOne
    private Responsavel responsavel;

    private String descricao;

    @NotNull(message = "O valor é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
    private BigDecimal valor;

    private boolean recorrente;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dataFimRecorrencia;

    private boolean parcelado;

    @Min(value = 1, message = "Número de parcelas deve ser pelo menos 1")
    private Integer parcelasFaltantes;

    // 🔹 Associação opcional com MetaFinanceira
    @ManyToOne
    @JoinColumn(name = "meta_id", nullable = true)
    private MetaFinanceira meta;

    // ✅ Getters e Setters corretos
    public MetaFinanceira getMeta() {
        return meta;
    }

    public void setMeta(MetaFinanceira meta) {
        this.meta = meta;
    }
}
