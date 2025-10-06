package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.model.Categoria;
import com.financas.pessoais.financasweb.model.Conta;
import com.financas.pessoais.financasweb.model.Responsavel;
import com.financas.pessoais.financasweb.repository.CategoriaRepository;
import com.financas.pessoais.financasweb.repository.ContaRepository;
import com.financas.pessoais.financasweb.repository.ResponsavelRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/parametros")
@CrossOrigin(origins = "http://localhost:5173") // libera o frontend (Vite) acessar a API
public class ParametroController {

    private final CategoriaRepository categoriaRepository;
    private final ContaRepository contaRepository;
    private final ResponsavelRepository responsavelRepository;

    public ParametroController(
            CategoriaRepository categoriaRepository,
            ContaRepository contaRepository,
            ResponsavelRepository responsavelRepository
    ) {
        this.categoriaRepository = categoriaRepository;
        this.contaRepository = contaRepository;
        this.responsavelRepository = responsavelRepository;
    }

    @GetMapping("/categorias")
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }
}
