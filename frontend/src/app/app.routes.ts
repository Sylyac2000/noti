import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { NoteListComponent } from './components/note-list/note-list.component';
import { NoteFormComponent } from './components/note-form/note-form.component';
import { NoteDetailComponent } from './components/note-detail/note-detail.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'notes', 
    component: NoteListComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'notes/new', 
    component: NoteFormComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'notes/:id', 
    component: NoteDetailComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'notes/:id/edit', 
    component: NoteFormComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['user', 'admin'] }
  },
  { path: '**', redirectTo: '' }
];