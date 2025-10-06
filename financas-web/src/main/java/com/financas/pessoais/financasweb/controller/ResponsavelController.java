package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.dto.ResponsavelDTO;
import com.financas.pessoais.financasweb.model.Responsavel;
import com.financas.pessoais.financasweb.repository.ResponsavelRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/parametros/responsaveis")
@CrossOrigin(origins = "http://localhost:5173")
public class ResponsavelController {

    private final ResponsavelRepository repository;

    public ResponsavelController(ResponsavelRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ResponsavelDTO> listar() {
        return repository.findAll().stream()
                .map(r -> new ResponsavelDTO(r.getId(), r.getNome()))
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponsavelDTO criar(@RequestBody Responsavel responsavel) {
        Responsavel saved = repository.save(responsavel);
        return new ResponsavelDTO(saved.getId(), saved.getNome());
    }

    @PutMapping("/{id}")
    public ResponsavelDTO atualizar(@PathVariable Long id, @RequestBody Responsavel responsavel) {
        responsavel.setId(id);
        Responsavel updated = repository.save(responsavel);
        return new ResponsavelDTO(updated.getId(), updated.getNome());
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
