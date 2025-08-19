import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Note } from '../../models/note.model';
import { NoteService } from '../../services/note.service';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="row mb-4">
        <div class="col-md-8">
          <h2 class="mb-0">
            <i class="fas fa-sticky-note me-2"></i>
            Mes Notes
          </h2>
        </div>
        <div class="col-md-4">
          <div class="search-container">
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Rechercher..." 
                [(ngModel)]="searchKeyword"
                (keyup.enter)="searchNotes()">
              <button class="btn btn-outline-primary" type="button" (click)="searchNotes()">
                <i class="fas fa-search"></i>
              </button>
              <button class="btn btn-outline-secondary" type="button" (click)="clearSearch()" *ngIf="searchKeyword">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col">
          <a routerLink="/notes/new" class="btn btn-primary">
            <i class="fas fa-plus me-2"></i>
            Nouvelle Note
          </a>
          <span class="ms-3 text-muted">
            {{ notes.length }} note{{ notes.length > 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <div class="row" *ngIf="loading">
        <div class="col text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>

      <div class="row" *ngIf="!loading && notes.length === 0">
        <div class="col text-center">
          <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            {{ searchKeyword ? 'Aucune note trouvée pour cette recherche.' : 'Aucune note disponible. Créez votre première note !' }}
          </div>
        </div>
      </div>

      <div class="row" *ngIf="!loading && notes.length > 0">
        <div class="col-md-6 col-lg-4 mb-3" *ngFor="let note of notes">
          <div class="card note-card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ note.titre }}</h5>
              <p class="card-text note-content flex-grow-1">{{ note.contenu }}</p>
              <div class="text-muted small mb-2">
                <i class="fas fa-clock me-1"></i>
                Modifié: {{ formatDate(note.dateModification) }}
              </div>
              <div class="d-flex gap-2">
                <a [routerLink]="['/notes', note.id]" class="btn btn-outline-primary btn-sm">
                  <i class="fas fa-eye me-1"></i>
                  Voir
                </a>
                <a [routerLink]="['/notes', note.id, 'edit']" class="btn btn-outline-secondary btn-sm">
                  <i class="fas fa-edit me-1"></i>
                  Modifier
                </a>
                <button class="btn btn-outline-danger btn-sm" (click)="deleteNote(note.id!)">
                  <i class="fas fa-trash me-1"></i>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './note-list.component.css'
})
export class NoteListComponent implements OnInit {
  notes: Note[] = [];
  searchKeyword: string = '';
  loading: boolean = true;

  constructor(private noteService: NoteService) { }

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.loading = true;
    this.noteService.getAllNotes().subscribe({
      next: (data) => {
        this.notes = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notes:', error);
        this.loading = false;
      }
    });
  }

  searchNotes(): void {
    if (this.searchKeyword.trim()) {
      this.loading = true;
      this.noteService.searchNotes(this.searchKeyword.trim()).subscribe({
        next: (data) => {
          this.notes = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la recherche:', error);
          this.loading = false;
        }
      });
    } else {
      this.loadNotes();
    }
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.loadNotes();
  }

  deleteNote(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      this.noteService.deleteNote(id).subscribe({
        next: () => {
          this.loadNotes();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}