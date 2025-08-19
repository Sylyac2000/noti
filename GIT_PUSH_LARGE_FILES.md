### Résoudre l’erreur de push Git due à de gros fichiers (cache Angular, artefacts de build)

**Symptôme**
- Push refusé par GitHub avec un message indiquant des fichiers > 100 Mo (ex. `frontend/.angular/cache/.../*.pack`).

**Cause**
- Des fichiers générés (cache Angular, dossiers de build, IDE) ont été ajoutés par erreur dans l’index Git et committés.

**Solution rapide (ce que nous avons fait)**
1. Ajouter des règles dans `.gitignore` pour ignorer ces dossiers.
2. Retirer les fichiers déjà suivis par Git, sans les supprimer du disque, avec `git rm --cached`.
3. Réécrire le dernier commit (amend) pour qu’il n’inclue plus ces fichiers.
4. Pousser à nouveau.

---

### Règles `.gitignore` utilisées
```gitignore
/frontend/node_modules/
# Ignore Angular cache and build outputs
/frontend/.angular/
/frontend/dist/

# Ignore common build/IDE artifacts
/backend/target/
/.idea/
/backend/.idea/
```

### Commandes utilisées
- Retirer du suivi Git les caches et builds déjà indexés:
```bash
git rm -r --cached frontend/.angular backend/.idea backend/target frontend/dist
```

- Amender le dernier commit pour refléter ces suppressions (et l’update du `.gitignore`):
```bash
git add .gitignore
git commit --amend -m "chore: ignore caches and build artifacts; untrack large cache and dist files"
```

- Pousser à nouveau:
```bash
git push
```

> Remarque: si l’“amend” refuse de s’exécuter pour cause d’identité Git non configurée, configurez votre identité locale dans ce dépôt:
```bash
git config user.name "Votre Nom"
git config user.email "votre.email@example.com"
```

Si besoin ponctuel, vous pouvez exporter temporairement l’identité le temps d’une commande:
```bash
GIT_AUTHOR_NAME="Votre Nom" GIT_AUTHOR_EMAIL="votre.email@example.com" \
GIT_COMMITTER_NAME="Votre Nom" GIT_COMMITTER_EMAIL="votre.email@example.com" \
  git commit --amend -m "chore: ignore caches and build artifacts; untrack large cache and dist files"
```

### Pourquoi éviter de committer ces dossiers
- `frontend/.angular/`: cache et artefacts temporaires du build Angular
- `frontend/dist/`: résultats de build, régénérés à chaque compilation
- `backend/target/`: artefacts de build Maven
- `.idea/`: fichiers spécifiques à l’IDE, propres à l’environnement développeur

Ces éléments gonflent le dépôt et risquent d’atteindre les limites GitHub.

### Et si le gros fichier a déjà été poussé ?
- Utilisez un outil d’historique (ex: `git filter-repo` ou BFG Repo-Cleaner) pour le retirer de tout l’historique, puis force-pushez. Ceci est plus intrusif et doit être coordonné avec l’équipe.
