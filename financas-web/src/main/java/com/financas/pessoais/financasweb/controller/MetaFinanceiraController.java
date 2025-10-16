package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.dto.MetaFinanceiraDTO;
import com.financas.pessoais.financasweb.model.Lancamento;
import com.financas.pessoais.financasweb.model.MetaFinanceira;
import com.financas.pessoais.financasweb.repository.LancamentoRepository;
import com.financas.pessoais.financasweb.repository.MetaFinanceiraRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/metas")
@CrossOrigin(origins = "*")
public class MetaFinanceiraController {

    private final MetaFinanceiraRepository metaFinanceiraRepository;
    private final LancamentoRepository lancamentoRepository;

    public MetaFinanceiraController(MetaFinanceiraRepository metaFinanceiraRepository,
                                    LancamentoRepository lancamentoRepository) {
        this.metaFinanceiraRepository = metaFinanceiraRepository;
        this.lancamentoRepository = lancamentoRepository;
    }

    // 🔹 Listar todas as metas
    @GetMapping
    public List<MetaFinanceira> listar() {
        return metaFinanceiraRepository.findAll();
    }

    // 🔹 Criar meta
    @PostMapping
    public ResponseEntity<MetaFinanceira> criar(@RequestBody MetaFinanceira meta) {
        return ResponseEntity.ok(metaFinanceiraRepository.save(meta));
    }

    // 🔹 Atualizar meta
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

    // 🔹 Excluir meta
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!metaFinanceiraRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        metaFinanceiraRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // 🔹 Progresso de todas as metas
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

    // ==========================================================
    // 🔸 NOVO: adicionar valor a uma meta (transferência)
    // ==========================================================
    @PostMapping("/{id}/adicionar")
    public ResponseEntity<?> adicionarValor(@PathVariable Long id, @RequestParam BigDecimal valor) {
        Optional<MetaFinanceira> metaOpt = metaFinanceiraRepository.findById(id);
        if (metaOpt.isEmpty()) return ResponseEntity.notFound().build();

        MetaFinanceira meta = metaOpt.get();

        // Cria um lançamento de transferência
        Lancamento lanc = new Lancamento();
        lanc.setData(LocalDate.now());
        lanc.setTipo("TRANSFERENCIA_META");
        lanc.setDescricao("Transferência para meta: " + meta.getDescricao());
        lanc.setValor(valor);
        lanc.setMeta(meta);

        lancamentoRepository.save(lanc);

        return ResponseEntity.ok("Valor de R$ " + valor + " adicionado à meta " + meta.getDescricao());
    }

    // ==========================================================
    // 🔸 NOVO: resgatar valor de uma meta
    // ==========================================================
    @PostMapping("/{id}/resgatar")
    public ResponseEntity<?> resgatarValor(@PathVariable Long id, @RequestParam BigDecimal valor) {
        Optional<MetaFinanceira> metaOpt = metaFinanceiraRepository.findById(id);
        if (metaOpt.isEmpty()) return ResponseEntity.notFound().build();

        MetaFinanceira meta = metaOpt.get();

        // Cria um lançamento de resgate
        Lancamento lanc = new Lancamento();
        lanc.setData(LocalDate.now());
        lanc.setTipo("RESGATE_META");
        lanc.setDescricao("Resgate da meta: " + meta.getDescricao());
        lanc.setValor(valor.negate()); // negativo para subtrair do saldo
        lanc.setMeta(meta);

        lancamentoRepository.save(lanc);

        return ResponseEntity.ok("Valor de R$ " + valor + " resgatado da meta " + meta.getDescricao());
    }
}
