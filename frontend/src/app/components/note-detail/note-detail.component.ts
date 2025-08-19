import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Note } from '../../models/note.model';
import { NoteService } from '../../services/note.service';

@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="row justify-content-center" *ngIf="loading">
        <div class="col text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>

      <div class="row justify-content-center" *ngIf="!loading && note">
        <div class="col-md-10">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h2 class="mb-0">{{ note.titre }}</h2>
              <div class="btn-group">
                <a [routerLink]="['/notes', note.id, 'edit']" class="btn btn-outline-primary">
                  <i class="fas fa-edit me-1"></i>
                  Modifier
                </a>
                <button class="btn btn-outline-danger" (click)="deleteNote()">
                  <i class="fas fa-trash me-1"></i>
                  Supprimer
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="note-content">
                <pre class="note-text">{{ note.contenu }}</pre>
              </div>
            </div>
            <div class="card-footer text-muted">
              <div class="row">
                <div class="col-md-6">
                  <small>
                    <i class="fas fa-calendar-plus me-1"></i>
                    Créé le: {{ formatDate(note.dateCreation) }}
                  </small>
                </div>
                <div class="col-md-6 text-md-end">
                  <small>
                    <i class="fas fa-calendar-edit me-1"></i>
                    Modifié le: {{ formatDate(note.dateModification) }}
                  </small>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-3">
            <a routerLink="/notes" class="btn btn-secondary">
              <i class="fas fa-arrow-left me-2"></i>
              Retour à la liste
            </a>
          </div>
        </div>
      </div>

      <div class="row justify-content-center" *ngIf="!loading && !note">
        <div class="col-md-8">
          <div class="alert alert-danger text-center">
            <h4><i class="fas fa-exclamation-triangle me-2"></i>Note non trouvée</h4>
            <p>La note demandée n'existe pas ou a été supprimée.</p>
            <a routerLink="/notes" class="btn btn-primary">
              <i class="fas fa-arrow-left me-2"></i>
              Retour à la liste
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './note-detail.component.css'
})
export class NoteDetailComponent implements OnInit {
  note: Note | null = null;
  loading: boolean = true;

  constructor(
    private noteService: NoteService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadNote(id);
      }
    });
  }

  loadNote(id: number): void {
    this.loading = true;
    this.noteService.getNoteById(id).subscribe({
      next: (data) => {
        this.note = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la note:', error);
        this.loading = false;
      }
    });
  }

  deleteNote(): void {
    if (this.note && confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      this.noteService.deleteNote(this.note.id!).subscribe({
        next: () => {
          this.router.navigate(['/notes']);
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