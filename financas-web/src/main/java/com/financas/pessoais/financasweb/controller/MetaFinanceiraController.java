package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.dto.MetaFinanceiraDTO;
import com.financas.pessoais.financasweb.model.MetaFinanceira;
import com.financas.pessoais.financasweb.repository.MetaFinanceiraRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/metas")
@CrossOrigin(origins = "*")
public class MetaFinanceiraController {

    private final MetaFinanceiraRepository metaFinanceiraRepository;

    public MetaFinanceiraController(MetaFinanceiraRepository metaFinanceiraRepository) {
        this.metaFinanceiraRepository = metaFinanceiraRepository;
    }

    @GetMapping
    public List<MetaFinanceira> listar() {
        return metaFinanceiraRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<MetaFinanceira> criar(@RequestBody MetaFinanceira meta) {
        return ResponseEntity.ok(metaFinanceiraRepository.save(meta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MetaFinanceira> atualizar(@PathVariable Long id, @RequestBody MetaFinanceira meta) {
        return metaFinanceiraRepository.findById(id)
                .map(existente -> {
                    existente.setDescricao(meta.getDescricao());
                    existente.setTipo(meta.getTipo());
                    existente.setValorMeta(meta.getValorMeta());
                    existente.setMesReferencia(meta.getMesReferencia());
                    existente.setAnoReferencia(meta.getAnoReferencia());
                    existente.setCategoria(meta.getCategoria());
                    existente.setResponsavel(meta.getResponsavel());
                    existente.setAtiva(meta.isAtiva());
                    return ResponseEntity.ok(metaFinanceiraRepository.save(existente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!metaFinanceiraRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        metaFinanceiraRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/progresso")
    public List<MetaFinanceiraDTO> progresso() {
        return metaFinanceiraRepository.progressoMetas().stream()
                .map(obj -> new MetaFinanceiraDTO(
                        ((Number) obj[0]).longValue(),           // idMeta
                        (String) obj[1],                         // descricao
                        null,                                    // tipo (não usado na query)
                        (BigDecimal) obj[2],                     // valorMeta
                        (BigDecimal) obj[3],                     // atingido
                        (BigDecimal) obj[4],                     // percentual
                        null, null, true                         // mês/ano/ativa
                ))
                .collect(Collectors.toList());
    }
}
