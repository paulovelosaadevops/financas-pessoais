package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByTipo(String tipo);
}
