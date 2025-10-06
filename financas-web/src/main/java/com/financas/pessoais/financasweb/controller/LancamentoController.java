package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.dto.AgrupamentoDTO;
import com.financas.pessoais.financasweb.model.*;
import com.financas.pessoais.financasweb.repository.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/lancamentos")
@CrossOrigin(origins = "http://localhost:5173")
public class LancamentoController {

    private final LancamentoRepository repository;
    private final CategoriaRepository categoriaRepo;
    private final ContaRepository contaRepo;
    private final ResponsavelRepository responsavelRepo;

    public LancamentoController(LancamentoRepository repository,
                                CategoriaRepository categoriaRepo,
                                ContaRepository contaRepo,
                                ResponsavelRepository responsavelRepo) {
        this.repository = repository;
        this.categoriaRepo = categoriaRepo;
        this.contaRepo = contaRepo;
        this.responsavelRepo = responsavelRepo;
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
        return repository.save(lancamento);
    }

    // 🔹 ATUALIZAR
    @PutMapping("/{id}")
    public Lancamento atualizar(@PathVariable Long id, @Valid @RequestBody Lancamento lancamento) {
        Lancamento existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lançamento não encontrado"));

        lancamento.setId(existente.getId()); // garante que atualiza em vez de criar
        vincularRelacionamentos(lancamento);

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

    // 🔹 Agrupamentos (agora com ano/mês opcionais)
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

    // 🔹 Utilitário privado para vincular Categoria, Conta e Responsável
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
    }
}
