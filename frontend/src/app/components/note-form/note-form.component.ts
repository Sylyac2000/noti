import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Note } from '../../models/note.model';
import { NoteService } from '../../services/note.service';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h3 class="mb-0">
                <i class="fas fa-edit me-2"></i>
                {{ isEdit ? 'Modifier la note' : 'Nouvelle note' }}
              </h3>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #noteForm="ngForm">
                <div class="mb-3">
                  <label for="titre" class="form-label">
                    Titre <span class="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="titre"
                    name="titre"
                    [(ngModel)]="note.titre" 
                    required
                    #titre="ngModel"
                    placeholder="Saisissez le titre de votre note">
                  <div class="invalid-feedback" *ngIf="titre.invalid && titre.touched">
                    Le titre est obligatoire.
                  </div>
                </div>

                <div class="mb-3">
                  <label for="contenu" class="form-label">
                    Contenu <span class="text-danger">*</span>
                  </label>
                  <textarea 
                    class="form-control" 
                    id="contenu"
                    name="contenu"
                    [(ngModel)]="note.contenu" 
                    required
                    #contenu="ngModel"
                    rows="10"
                    placeholder="Saisissez le contenu de votre note..."></textarea>
                  <div class="invalid-feedback" *ngIf="contenu.invalid && contenu.touched">
                    Le contenu est obligatoire.
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <button 
                      type="submit" 
                      class="btn btn-primary me-2"
                      [disabled]="noteForm.invalid || saving">
                      <i class="fas fa-save me-2"></i>
                      <span *ngIf="!saving">{{ isEdit ? 'Mettre à jour' : 'Créer' }}</span>
                      <span *ngIf="saving">
                        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sauvegarde...
                      </span>
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-secondary"
                      (click)="goBack()">
                      <i class="fas fa-arrow-left me-2"></i>
                      Annuler
                    </button>
                  </div>
                  <div class="text-muted small" *ngIf="isEdit && note.dateModification">
                    <i class="fas fa-clock me-1"></i>
                    Dernière modification: {{ formatDate(note.dateModification) }}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './note-form.component.css'
})
export class NoteFormComponent implements OnInit {
  note: Note = {
    titre: '',
    contenu: ''
  };
  isEdit: boolean = false;
  saving: boolean = false;
  noteId: number | null = null;

  constructor(
    private noteService: NoteService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.noteId = +params['id'];
        this.isEdit = true;
        this.loadNote();
      }
    });
  }

  loadNote(): void {
    if (this.noteId) {
      this.noteService.getNoteById(this.noteId).subscribe({
        next: (data) => {
          this.note = data;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de la note:', error);
          this.router.navigate(['/notes']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.note.titre.trim() && this.note.contenu.trim()) {
      this.saving = true;
      
      if (this.isEdit && this.noteId) {
        this.noteService.updateNote(this.noteId, this.note).subscribe({
          next: () => {
            this.saving = false;
            this.router.navigate(['/notes']);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.saving = false;
          }
        });
      } else {
        this.noteService.createNote(this.note).subscribe({
          next: () => {
            this.saving = false;
            this.router.navigate(['/notes']);
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.saving = false;
          }
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/notes']);
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