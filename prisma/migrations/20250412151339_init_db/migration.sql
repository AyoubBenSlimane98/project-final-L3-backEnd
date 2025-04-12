-- CreateEnum
CREATE TYPE "EtatPresence" AS ENUM ('PRESENT', 'ABSENT');

-- CreateEnum
CREATE TYPE "SexeUtilisateur" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "QuestionEtat" AS ENUM ('repondre', 'attrandre', 'bloquer');

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshtoken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "compteId" INTEGER NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeOTP" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "compteId" INTEGER NOT NULL,

    CONSTRAINT "CodeOTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compte" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "image" TEXT,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "bio" TEXT,
    "sexe" "SexeUtilisateur" NOT NULL,
    "compteId" INTEGER NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatePresence" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatePresence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presence" (
    "id" SERIAL NOT NULL,
    "etat" "EtatPresence" NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "dateId" INTEGER NOT NULL,

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etudiant" (
    "id" SERIAL NOT NULL,
    "matricule" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Etudiant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Binome" (
    "id" SERIAL NOT NULL,
    "responsabilite" TEXT,
    "etudiant1Id" INTEGER NOT NULL,
    "etudiant2Id" INTEGER,
    "groupeId" INTEGER NOT NULL,

    CONSTRAINT "Binome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "note" DOUBLE PRECISION NOT NULL,
    "binomeId" INTEGER NOT NULL,
    "etapeId" INTEGER NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groupe" (
    "id" SERIAL NOT NULL,
    "enseignantId" INTEGER,

    CONSTRAINT "Groupe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EtudiantResponsableEtape" (
    "id" SERIAL NOT NULL,
    "etudiantId" INTEGER NOT NULL,

    CONSTRAINT "EtudiantResponsableEtape_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EtudiantResponsableMemoire" (
    "id" SERIAL NOT NULL,
    "etudiantId" INTEGER NOT NULL,

    CONSTRAINT "EtudiantResponsableMemoire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enseignant" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Enseignant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnseignantResponsable" (
    "id" SERIAL NOT NULL,
    "enseignantId" INTEGER NOT NULL,

    CONSTRAINT "EnseignantResponsable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnseignantPrincipal" (
    "id" SERIAL NOT NULL,
    "enseignantId" INTEGER NOT NULL,

    CONSTRAINT "EnseignantPrincipal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Administrateur" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Administrateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Annonce" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updadedAt" TIMESTAMP(3) NOT NULL,
    "adminId" INTEGER NOT NULL,

    CONSTRAINT "Annonce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sujet" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enseignantId" INTEGER NOT NULL,

    CONSTRAINT "Sujet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referencesSujet" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "sujetId" INTEGER NOT NULL,

    CONSTRAINT "referencesSujet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prerequisSujet" (
    "id" SERIAL NOT NULL,
    "prerequis" TEXT NOT NULL,
    "sujetId" INTEGER NOT NULL,

    CONSTRAINT "prerequisSujet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cas" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "détails" TEXT NOT NULL,
    "sujetId" INTEGER NOT NULL,
    "binomeId" INTEGER NOT NULL,

    CONSTRAINT "Cas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersionRapport" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "lien" TEXT NOT NULL,
    "rapportId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VersionRapport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationRaport" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "rapportId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationRaport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rapport" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sujetId" INTEGER NOT NULL,
    "binomeId" INTEGER NOT NULL,

    CONSTRAINT "Rapport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RapportFinal" (
    "id" SERIAL NOT NULL,
    "rapportId" INTEGER NOT NULL,

    CONSTRAINT "RapportFinal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RapportEtape" (
    "id" SERIAL NOT NULL,
    "rapportId" INTEGER NOT NULL,

    CONSTRAINT "RapportEtape_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etape" (
    "id" SERIAL NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "rapportEtapeId" INTEGER NOT NULL,
    "sujetId" INTEGER NOT NULL,

    CONSTRAINT "Etape_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RapportTâches" (
    "id" SERIAL NOT NULL,
    "rapportId" INTEGER NOT NULL,

    CONSTRAINT "RapportTâches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tâches" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "rapportTâchesId" INTEGER NOT NULL,

    CONSTRAINT "Tâches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "reponse" TEXT NOT NULL,
    "etat" "QuestionEtat" NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "enseignantId" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Réunion" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "remarque" TEXT NOT NULL,
    "lien" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "groupeId" INTEGER NOT NULL,
    "enseignantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Réunion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" SERIAL NOT NULL,
    "etat" "EtatPresence" NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "reunionId" INTEGER NOT NULL,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_accessToken_key" ON "Token"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Token_refreshtoken_key" ON "Token"("refreshtoken");

-- CreateIndex
CREATE UNIQUE INDEX "Token_compteId_key" ON "Token"("compteId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeOTP_code_key" ON "CodeOTP"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CodeOTP_compteId_key" ON "CodeOTP"("compteId");

-- CreateIndex
CREATE UNIQUE INDEX "Compte_email_key" ON "Compte"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_compteId_key" ON "Utilisateur"("compteId");

-- CreateIndex
CREATE UNIQUE INDEX "Etudiant_matricule_key" ON "Etudiant"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Etudiant_userId_key" ON "Etudiant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Binome_etudiant1Id_key" ON "Binome"("etudiant1Id");

-- CreateIndex
CREATE UNIQUE INDEX "Binome_etudiant2Id_key" ON "Binome"("etudiant2Id");

-- CreateIndex
CREATE UNIQUE INDEX "EtudiantResponsableEtape_etudiantId_key" ON "EtudiantResponsableEtape"("etudiantId");

-- CreateIndex
CREATE UNIQUE INDEX "EtudiantResponsableMemoire_etudiantId_key" ON "EtudiantResponsableMemoire"("etudiantId");

-- CreateIndex
CREATE UNIQUE INDEX "Enseignant_userId_key" ON "Enseignant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EnseignantResponsable_enseignantId_key" ON "EnseignantResponsable"("enseignantId");

-- CreateIndex
CREATE UNIQUE INDEX "EnseignantPrincipal_enseignantId_key" ON "EnseignantPrincipal"("enseignantId");

-- CreateIndex
CREATE UNIQUE INDEX "Administrateur_userId_key" ON "Administrateur"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Rapport_sujetId_key" ON "Rapport"("sujetId");

-- CreateIndex
CREATE UNIQUE INDEX "RapportFinal_rapportId_key" ON "RapportFinal"("rapportId");

-- CreateIndex
CREATE UNIQUE INDEX "RapportEtape_rapportId_key" ON "RapportEtape"("rapportId");

-- CreateIndex
CREATE UNIQUE INDEX "Etape_rapportEtapeId_key" ON "Etape"("rapportEtapeId");

-- CreateIndex
CREATE UNIQUE INDEX "RapportTâches_rapportId_key" ON "RapportTâches"("rapportId");

-- CreateIndex
CREATE UNIQUE INDEX "Tâches_rapportTâchesId_key" ON "Tâches"("rapportTâchesId");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeOTP" ADD CONSTRAINT "CodeOTP_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "DatePresence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Binome" ADD CONSTRAINT "Binome_etudiant1Id_fkey" FOREIGN KEY ("etudiant1Id") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Binome" ADD CONSTRAINT "Binome_etudiant2Id_fkey" FOREIGN KEY ("etudiant2Id") REFERENCES "Etudiant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Binome" ADD CONSTRAINT "Binome_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_binomeId_fkey" FOREIGN KEY ("binomeId") REFERENCES "Binome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_etapeId_fkey" FOREIGN KEY ("etapeId") REFERENCES "Etape"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupe" ADD CONSTRAINT "Groupe_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtudiantResponsableEtape" ADD CONSTRAINT "EtudiantResponsableEtape_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtudiantResponsableMemoire" ADD CONSTRAINT "EtudiantResponsableMemoire_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enseignant" ADD CONSTRAINT "Enseignant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnseignantResponsable" ADD CONSTRAINT "EnseignantResponsable_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnseignantPrincipal" ADD CONSTRAINT "EnseignantPrincipal_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrateur" ADD CONSTRAINT "Administrateur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Administrateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sujet" ADD CONSTRAINT "Sujet_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referencesSujet" ADD CONSTRAINT "referencesSujet_sujetId_fkey" FOREIGN KEY ("sujetId") REFERENCES "Sujet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisSujet" ADD CONSTRAINT "prerequisSujet_sujetId_fkey" FOREIGN KEY ("sujetId") REFERENCES "Sujet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cas" ADD CONSTRAINT "Cas_sujetId_fkey" FOREIGN KEY ("sujetId") REFERENCES "Sujet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cas" ADD CONSTRAINT "Cas_binomeId_fkey" FOREIGN KEY ("binomeId") REFERENCES "Binome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionRapport" ADD CONSTRAINT "VersionRapport_rapportId_fkey" FOREIGN KEY ("rapportId") REFERENCES "Rapport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRaport" ADD CONSTRAINT "EvaluationRaport_rapportId_fkey" FOREIGN KEY ("rapportId") REFERENCES "Rapport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rapport" ADD CONSTRAINT "Rapport_sujetId_fkey" FOREIGN KEY ("sujetId") REFERENCES "Sujet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rapport" ADD CONSTRAINT "Rapport_binomeId_fkey" FOREIGN KEY ("binomeId") REFERENCES "Binome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RapportFinal" ADD CONSTRAINT "RapportFinal_rapportId_fkey" FOREIGN KEY ("rapportId") REFERENCES "Rapport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RapportEtape" ADD CONSTRAINT "RapportEtape_rapportId_fkey" FOREIGN KEY ("rapportId") REFERENCES "Rapport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etape" ADD CONSTRAINT "Etape_rapportEtapeId_fkey" FOREIGN KEY ("rapportEtapeId") REFERENCES "RapportEtape"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etape" ADD CONSTRAINT "Etape_sujetId_fkey" FOREIGN KEY ("sujetId") REFERENCES "Sujet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RapportTâches" ADD CONSTRAINT "RapportTâches_rapportId_fkey" FOREIGN KEY ("rapportId") REFERENCES "Rapport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tâches" ADD CONSTRAINT "Tâches_rapportTâchesId_fkey" FOREIGN KEY ("rapportTâchesId") REFERENCES "RapportTâches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Réunion" ADD CONSTRAINT "Réunion_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Réunion" ADD CONSTRAINT "Réunion_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_reunionId_fkey" FOREIGN KEY ("reunionId") REFERENCES "Réunion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
