package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.dto.DespesaFixaDTO;
import com.financas.pessoais.financasweb.model.DespesaFixa;
import com.financas.pessoais.financasweb.repository.DespesaFixaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/parametros/despesas-fixas")
@CrossOrigin(origins = "*")
public class DespesaFixaController {

    private final DespesaFixaRepository repository;

    public DespesaFixaController(DespesaFixaRepository repository) {
        this.repository = repository;
    }

    // 🔹 LISTAR TODAS
    @GetMapping
    public List<DespesaFixaDTO> listar() {
        return repository.findAll()
                .stream()
                .map(DespesaFixaDTO::new)
                .collect(Collectors.toList());
    }

    // 🔹 CRIAR
    @PostMapping
    public DespesaFixaDTO criar(@RequestBody DespesaFixa despesaFixa) {
        DespesaFixa salvo = repository.save(despesaFixa);
        return new DespesaFixaDTO(salvo);
    }

    // 🔹 ATUALIZAR
    @PutMapping("/{id}")
    public DespesaFixaDTO atualizar(@PathVariable Long id, @RequestBody DespesaFixa despesaFixa) {
        despesaFixa.setId(id);
        DespesaFixa salvo = repository.save(despesaFixa);
        return new DespesaFixaDTO(salvo);
    }

    // 🔹 DELETAR
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
