package com.financas.pessoais.financasweb.controller;

import com.financas.pessoais.financasweb.model.Categoria;
import com.financas.pessoais.financasweb.repository.CategoriaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    private final CategoriaRepository repository;

    public CategoriaController(CategoriaRepository repository) {
        this.repository = repository;
    }

    // Listar todas
    @GetMapping
    public List<Categoria> listar() {
        return repository.findAll();
    }

    // Buscar categorias por tipo (RECEITA ou DESPESA)
    @GetMapping("/tipo/{tipo}")
    public List<Categoria> listarPorTipo(@PathVariable String tipo) {
        return repository.findByTipo(tipo.toUpperCase());
    }

    // Criar nova categoria
    @PostMapping
    public Categoria salvar(@RequestBody Categoria categoria) {
        return repository.save(categoria);
    }

    // Atualizar categoria existente
    @PutMapping("/{id}")
    public Categoria atualizar(@PathVariable Long id, @RequestBody Categoria categoria) {
        categoria.setId(id);
        return repository.save(categoria);
    }

    // Excluir categoria
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
