CREATE TABLE IF NOT EXISTS notes  (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    contenu TEXT NOT NULL,
    date_creation TIMESTAMP NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO notes (titre, contenu, date_creation, date_modification) VALUES
('Ma première note', 'Ceci est le contenu de ma première note de test.', NOW(), NOW()),
('Note de travail', 'Réunion équipe demain à 14h - Préparer présentation projet.', NOW(), NOW()),
('Liste de courses', 'Pain, lait, œufs, fromage, salade, tomates.', NOW(), NOW()),
('Idées projet', 'Application mobile pour la gestion des tâches quotidiennes avec notifications push.', NOW(), NOW());