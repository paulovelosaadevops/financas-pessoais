package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.dto.AgrupamentoDTO;
import com.financas.pessoais.financasweb.model.Lancamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface LancamentoRepository extends JpaRepository<Lancamento, Long> {

    // ===== Novo método para exportação de relatório =====
    List<Lancamento> findByDataBetween(LocalDate dataInicio, LocalDate dataFim);

    // ===== Totais GERAIS (sem filtro)
    @Query("SELECT COALESCE(SUM(l.valor),0) FROM Lancamento l WHERE l.tipo = 'RECEITA'")
    BigDecimal totalReceitas();

    @Query("SELECT COALESCE(SUM(l.valor),0) FROM Lancamento l WHERE l.tipo = 'DESPESA'")
    BigDecimal totalDespesas();

    // ===== Totais por mês/ano =====
    @Query("""
           SELECT COALESCE(SUM(l.valor),0)
             FROM Lancamento l
            WHERE l.tipo = 'RECEITA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
           """)
    BigDecimal totalReceitas(int ano, int mes);

    @Query("""
           SELECT COALESCE(SUM(l.valor),0)
             FROM Lancamento l
            WHERE l.tipo = 'DESPESA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
           """)
    BigDecimal totalDespesas(int ano, int mes);

    // ===== DESPESAS VARIÁVEIS — agrupamentos por mês/ano =====
    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(c.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.categoria c
            WHERE l.tipo = 'DESPESA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
            GROUP BY c.nome
           """)
    List<AgrupamentoDTO> despesasPorCategoria(int ano, int mes);

    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(r.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.responsavel r
            WHERE l.tipo = 'DESPESA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
            GROUP BY r.nome
           """)
    List<AgrupamentoDTO> despesasPorResponsavel(int ano, int mes);

    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(c.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.contaOuCartao c
            WHERE l.tipo = 'DESPESA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
            GROUP BY c.nome
           """)
    List<AgrupamentoDTO> despesasPorBanco(int ano, int mes);

    // ===== RECEITAS — agrupamentos por mês/ano =====
    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(c.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.categoria c
            WHERE l.tipo = 'RECEITA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
            GROUP BY c.nome
           """)
    List<AgrupamentoDTO> receitasPorCategoria(int ano, int mes);

    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(r.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.responsavel r
            WHERE l.tipo = 'RECEITA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
            GROUP BY r.nome
           """)
    List<AgrupamentoDTO> receitasPorResponsavel(int ano, int mes);

    @Query("""
           SELECT new com.financas.pessoais.financasweb.dto.AgrupamentoDTO(c.nome, COALESCE(SUM(l.valor),0))
             FROM Lancamento l JOIN l.contaOuCartao c
            WHERE l.tipo = 'RECEITA'
              AND YEAR(l.data) = :ano AND MONTH(l.data) = :mes
            GROUP BY c.nome
           """)
    List<AgrupamentoDTO> receitasPorBanco(int ano, int mes);

    // ===== Série mensal =====
    @Query("""
           SELECT YEAR(l.data), MONTH(l.data),
                  SUM(CASE WHEN l.tipo = 'RECEITA' THEN l.valor ELSE 0 END),
                  SUM(CASE WHEN l.tipo = 'DESPESA' THEN l.valor ELSE 0 END)
             FROM Lancamento l
            GROUP BY YEAR(l.data), MONTH(l.data)
            ORDER BY YEAR(l.data), MONTH(l.data)
           """)
    List<Object[]> receitasVsDespesasMensal();

    @Query("SELECT l FROM Lancamento l ORDER BY l.data DESC")
    List<Lancamento> ultimosLancamentos();

    @Query("""
           SELECT COUNT(l) > 0 FROM Lancamento l
            WHERE l.descricao = :descricao AND l.data = :data AND l.valor = :valor
           """)
    boolean existsByDescricaoAndDataAndValor(String descricao, LocalDate data, BigDecimal valor);

    // ===== 🔹 Filtro dinâmico para relatórios (novo método correto) =====
    @Query("""
           SELECT l FROM Lancamento l
            WHERE (:ano IS NULL OR YEAR(l.data) = :ano)
              AND (:mes IS NULL OR MONTH(l.data) = :mes)
              AND (:tipo IS NULL OR UPPER(l.tipo) = UPPER(:tipo))
              AND (:categoriaId IS NULL OR l.categoria.id = :categoriaId)
              AND (:responsavelId IS NULL OR l.responsavel.id = :responsavelId)
              AND (:contaId IS NULL OR l.contaOuCartao.id = :contaId)
            ORDER BY l.data DESC
           """)
    List<Lancamento> buscarLancamentosFiltrados(
            Integer ano,
            Integer mes,
            String tipo,
            Long categoriaId,
            Long responsavelId,
            Long contaId
    );
}
