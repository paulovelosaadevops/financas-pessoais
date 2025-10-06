package com.financas.pessoais.financasweb.repository;

import com.financas.pessoais.financasweb.dto.AgrupamentoDTO;
import com.financas.pessoais.financasweb.model.Lancamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface LancamentoRepository extends JpaRepository<Lancamento, Long> {

    // ===== Totais GERAIS (sem filtro) — mantidos por compatibilidade
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

    // ===== Série mensal (toda a base): receitas e variáveis =====
    @Query("""
           SELECT YEAR(l.data), MONTH(l.data),
                  SUM(CASE WHEN l.tipo = 'RECEITA' THEN l.valor ELSE 0 END),
                  SUM(CASE WHEN l.tipo = 'DESPESA' THEN l.valor ELSE 0 END)
             FROM Lancamento l
            GROUP BY YEAR(l.data), MONTH(l.data)
            ORDER BY YEAR(l.data), MONTH(l.data)
           """)
    List<Object[]> receitasVsDespesasMensal();

    // Últimos lançamentos
    @Query("SELECT l FROM Lancamento l ORDER BY l.data DESC")
    List<Lancamento> ultimosLancamentos();

    // usado pelo service p/ evitar duplicados
    @Query("""
           SELECT COUNT(l) > 0 FROM Lancamento l
            WHERE l.descricao = :descricao AND l.data = :data AND l.valor = :valor
           """)
    boolean existsByDescricaoAndDataAndValor(String descricao, LocalDate data, BigDecimal valor);
}
