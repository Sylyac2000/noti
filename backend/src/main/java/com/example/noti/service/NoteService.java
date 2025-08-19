package com.example.noti.service;

import com.example.noti.entity.Note;
import com.example.noti.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class NoteService {
    
    @Autowired
    private NoteRepository noteRepository;
    
    public List<Note> getAllNotes() {
        return noteRepository.findAllByOrderByDateModificationDesc();
    }
    
    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }
    
    public Note saveNote(Note note) {
        return noteRepository.save(note);
    }
    
    public Note updateNote(Long id, Note noteDetails) {
        Optional<Note> optionalNote = noteRepository.findById(id);
        if (optionalNote.isPresent()) {
            Note note = optionalNote.get();
            note.setTitre(noteDetails.getTitre());
            note.setContenu(noteDetails.getContenu());
            return noteRepository.save(note);
        }
        return null;
    }
    
    public boolean deleteNote(Long id) {
        if (noteRepository.existsById(id)) {
            noteRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public List<Note> searchNotes(String keyword) {
        return noteRepository.findByTitreOrContenuContaining(keyword);
    }
    
    public List<Note> getNotesByTitle(String titre) {
        return noteRepository.findByTitreContainingIgnoreCase(titre);
    }
}