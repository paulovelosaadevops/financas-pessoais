package com.financas.pessoais.financasweb.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Responsavel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome; // Ex.: Paulo, Gabi
}
