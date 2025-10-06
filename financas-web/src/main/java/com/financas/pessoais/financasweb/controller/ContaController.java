package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.dto.ContaDTO;
import com.financas.pessoais.financasweb.model.Conta;
import com.financas.pessoais.financasweb.repository.ContaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/parametros/contas")
@CrossOrigin(origins = "http://localhost:5173")
public class ContaController {

    private final ContaRepository repository;

    public ContaController(ContaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ContaDTO> listar() {
        return repository.findAll().stream()
                .map(c -> new ContaDTO(c.getId(), c.getNome()))
                .collect(Collectors.toList());
    }

    @PostMapping
    public ContaDTO criar(@RequestBody Conta conta) {
        Conta saved = repository.save(conta);
        return new ContaDTO(saved.getId(), saved.getNome());
    }

    @PutMapping("/{id}")
    public ContaDTO atualizar(@PathVariable Long id, @RequestBody Conta conta) {
        conta.setId(id);
        Conta updated = repository.save(conta);
        return new ContaDTO(updated.getId(), updated.getNome());
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
