package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.dto.AgrupamentoDTO;
import com.financas.pessoais.financasweb.model.*;
import com.financas.pessoais.financasweb.repository.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/lancamentos")
@CrossOrigin(origins = "*")
public class LancamentoController {

    private final LancamentoRepository repository;
    private final CategoriaRepository categoriaRepo;
    private final ContaRepository contaRepo;
    private final ResponsavelRepository responsavelRepo;
    private final MetaFinanceiraRepository metaRepo;

    public LancamentoController(LancamentoRepository repository,
                                CategoriaRepository categoriaRepo,
                                ContaRepository contaRepo,
                                ResponsavelRepository responsavelRepo,
                                MetaFinanceiraRepository metaRepo) {
        this.repository = repository;
        this.categoriaRepo = categoriaRepo;
        this.contaRepo = contaRepo;
        this.responsavelRepo = responsavelRepo;
        this.metaRepo = metaRepo;
    }

    // 🔹 LISTAR TODOS
    @GetMapping
    public List<Lancamento> listar() {
        return repository.findAll();
    }

    // 🔹 CRIAR
    @PostMapping
    public Lancamento salvar(@Valid @RequestBody Lancamento lancamento) {
        vincularRelacionamentos(lancamento);
        tratarMetaFinanceira(lancamento);
        return repository.save(lancamento);
    }

    // 🔹 ATUALIZAR
    @PutMapping("/{id}")
    public Lancamento atualizar(@PathVariable Long id, @Valid @RequestBody Lancamento lancamento) {
        Lancamento existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lançamento não encontrado"));

        lancamento.setId(existente.getId());
        vincularRelacionamentos(lancamento);
        tratarMetaFinanceira(lancamento);

        return repository.save(lancamento);
    }

    // 🔹 DELETAR
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Lançamento não encontrado");
        }
        repository.deleteById(id);
    }

    // 🔹 Agrupamentos
    @GetMapping("/categorias")
    public List<AgrupamentoDTO> despesasPorCategoria(
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Integer mes) {
        LocalDate now = LocalDate.now();
        int a = (ano != null) ? ano : now.getYear();
        int m = (mes != null) ? mes : now.getMonthValue();
        return repository.despesasPorCategoria(a, m);
    }

    @GetMapping("/responsaveis")
    public List<AgrupamentoDTO> despesasPorResponsavel(
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Integer mes) {
        LocalDate now = LocalDate.now();
        int a = (ano != null) ? ano : now.getYear();
        int m = (mes != null) ? mes : now.getMonthValue();
        return repository.despesasPorResponsavel(a, m);
    }

    @GetMapping("/bancos")
    public List<AgrupamentoDTO> despesasPorBanco(
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Integer mes) {
        LocalDate now = LocalDate.now();
        int a = (ano != null) ? ano : now.getYear();
        int m = (mes != null) ? mes : now.getMonthValue();
        return repository.despesasPorBanco(a, m);
    }

    // 🔹 Vincular Categoria / Conta / Responsável
    private void vincularRelacionamentos(Lancamento lancamento) {
        if (lancamento.getCategoria() != null && lancamento.getCategoria().getId() != null) {
            Categoria categoria = categoriaRepo.findById(lancamento.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
            lancamento.setCategoria(categoria);
        }

        if (lancamento.getContaOuCartao() != null && lancamento.getContaOuCartao().getId() != null) {
            Conta conta = contaRepo.findById(lancamento.getContaOuCartao().getId())
                    .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            lancamento.setContaOuCartao(conta);
        }

        if (lancamento.getResponsavel() != null && lancamento.getResponsavel().getId() != null) {
            Responsavel responsavel = responsavelRepo.findById(lancamento.getResponsavel().getId())
                    .orElseThrow(() -> new RuntimeException("Responsável não encontrado"));
            lancamento.setResponsavel(responsavel);
        }

        if (lancamento.getMeta() != null && lancamento.getMeta().getId() != null) {
            MetaFinanceira meta = metaRepo.findById(lancamento.getMeta().getId())
                    .orElseThrow(() -> new RuntimeException("Meta financeira não encontrada"));
            lancamento.setMeta(meta);
        }
    }

    // 🔸 NOVO: Tratamento automático de lançamentos ligados a metas
    private void tratarMetaFinanceira(Lancamento lancamento) {
        if (lancamento.getMeta() == null) return;

        String tipo = lancamento.getTipo();
        BigDecimal valor = lancamento.getValor() != null ? lancamento.getValor() : BigDecimal.ZERO;

        if ("TRANSFERENCIA_META".equalsIgnoreCase(tipo)) {
            lancamento.setDescricao("Transferência para meta: " + lancamento.getMeta().getDescricao());
            lancamento.setValor(valor.abs()); // sempre positivo
        } else if ("RESGATE_META".equalsIgnoreCase(tipo)) {
            lancamento.setDescricao("Resgate da meta: " + lancamento.getMeta().getDescricao());
            lancamento.setValor(valor.abs().negate()); // negativo para resgatar
        }
    }
}
