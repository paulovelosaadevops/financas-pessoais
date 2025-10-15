package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.dto.DespesaFixaDTO;
import com.financas.pessoais.financasweb.model.DespesaFixa;
import com.financas.pessoais.financasweb.repository.DespesaFixaRepository;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<DespesaFixaDTO>> listar() {
        List<DespesaFixaDTO> lista = repository.findAll()
                .stream()
                .map(DespesaFixaDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    // 🔹 CRIAR
    @PostMapping
    public ResponseEntity<DespesaFixaDTO> criar(@RequestBody DespesaFixa despesaFixa) {
        if (despesaFixa.getTipoPagamento() == null || despesaFixa.getTipoPagamento().isBlank()) {
            despesaFixa.setTipoPagamento("DEBITO"); // valor padrão
        }
        DespesaFixa salvo = repository.save(despesaFixa);
        return ResponseEntity.ok(new DespesaFixaDTO(salvo));
    }

    // 🔹 ATUALIZAR
    @PutMapping("/{id}")
    public ResponseEntity<DespesaFixaDTO> atualizar(@PathVariable Long id, @RequestBody DespesaFixa despesaFixa) {
        despesaFixa.setId(id);
        if (despesaFixa.getTipoPagamento() == null || despesaFixa.getTipoPagamento().isBlank()) {
            despesaFixa.setTipoPagamento("DEBITO"); // segurança extra
        }
        DespesaFixa salvo = repository.save(despesaFixa);
        return ResponseEntity.ok(new DespesaFixaDTO(salvo));
    }

    // 🔹 DELETAR
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
