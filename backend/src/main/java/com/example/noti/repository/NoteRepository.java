package com.example.noti.repository;

import com.example.noti.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    
    List<Note> findByTitreContainingIgnoreCase(String titre);
    
    List<Note> findByContenuContainingIgnoreCase(String contenu);
    
    @Query("SELECT n FROM Note n WHERE n.titre LIKE %:keyword% OR n.contenu LIKE %:keyword%")
    List<Note> findByTitreOrContenuContaining(@Param("keyword") String keyword);
    
    List<Note> findAllByOrderByDateModificationDesc();
}