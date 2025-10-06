package com.financas.pessoais.financasweb.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    // RECEITA ou DESPESA
    private String tipo;
}
