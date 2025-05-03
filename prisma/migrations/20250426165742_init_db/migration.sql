-- CreateEnum
CREATE TYPE "EtatPresence" AS ENUM ('PRESENT', 'ABSENT');

-- CreateEnum
CREATE TYPE "SexeUtilisateur" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "QuestionEtat" AS ENUM ('repondre', 'attandre', 'bloquer');

-- CreateEnum
CREATE TYPE "Responsabilite" AS ENUM ('chapter_1', 'chapter_2', 'chapter_3', 'introduction_resume_conclustion');

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
    "idC" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Compte_pkey" PRIMARY KEY ("idC")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "idU" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "image" TEXT,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "bio" TEXT,
    "sexe" "SexeUtilisateur" NOT NULL,
    "idC" INTEGER NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("idU")
);

-- CreateTable
CREATE TABLE "Presence" (
    "etudiantId" INTEGER NOT NULL,
    "idDP" INTEGER NOT NULL,
    "etat" "EtatPresence" NOT NULL,

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("etudiantId","idDP")
);

-- CreateTable
CREATE TABLE "DatePresence" (
    "idDP" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatePresence_pkey" PRIMARY KEY ("idDP")
);

-- CreateTable
CREATE TABLE "Etudiant" (
    "idU" INTEGER NOT NULL,
    "matricule" TEXT NOT NULL,
    "noteFinal" DOUBLE PRECISION,
    "idB" INTEGER NOT NULL,

    CONSTRAINT "Etudiant_pkey" PRIMARY KEY ("idU")
);

-- CreateTable
CREATE TABLE "Binome" (
    "idB" SERIAL NOT NULL,
    "responsabilite" "Responsabilite",
    "idG" INTEGER NOT NULL,

    CONSTRAINT "Binome_pkey" PRIMARY KEY ("idB")
);

-- CreateTable
CREATE TABLE "Groupe" (
    "idG" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "idS" INTEGER,
    "enseignantRId" INTEGER,

    CONSTRAINT "Groupe_pkey" PRIMARY KEY ("idG")
);

-- CreateTable
CREATE TABLE "Note" (
    "note" DOUBLE PRECISION NOT NULL,
    "idEtape" INTEGER NOT NULL,
    "idB" INTEGER NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("idEtape","idB")
);

-- CreateTable
CREATE TABLE "Enseignant" (
    "idU" INTEGER NOT NULL,

    CONSTRAINT "Enseignant_pkey" PRIMARY KEY ("idU")
);

-- CreateTable
CREATE TABLE "EnseignantResponsable" (
    "idU" INTEGER NOT NULL,

    CONSTRAINT "EnseignantResponsable_pkey" PRIMARY KEY ("idU")
);

-- CreateTable
CREATE TABLE "EnseignantPrincipal" (
    "idU" INTEGER NOT NULL,

    CONSTRAINT "EnseignantPrincipal_pkey" PRIMARY KEY ("idU")
);

-- CreateTable
CREATE TABLE "Administrateur" (
    "idU" INTEGER NOT NULL,

    CONSTRAINT "Administrateur_pkey" PRIMARY KEY ("idU")
);

-- CreateTable
CREATE TABLE "Annonce" (
    "idA" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "idU" INTEGER,

    CONSTRAINT "Annonce_pkey" PRIMARY KEY ("idA")
);

-- CreateTable
CREATE TABLE "Sujet" (
    "idS" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enseignantRId" INTEGER,

    CONSTRAINT "Sujet_pkey" PRIMARY KEY ("idS")
);

-- CreateTable
CREATE TABLE "referencesSujet" (
    "idRef" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "idS" INTEGER NOT NULL,

    CONSTRAINT "referencesSujet_pkey" PRIMARY KEY ("idRef")
);

-- CreateTable
CREATE TABLE "prerequisSujet" (
    "idPre" SERIAL NOT NULL,
    "prerequis" TEXT NOT NULL,
    "idS" INTEGER NOT NULL,

    CONSTRAINT "prerequisSujet_pkey" PRIMARY KEY ("idPre")
);

-- CreateTable
CREATE TABLE "Cas" (
    "idCas" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "détails" TEXT NOT NULL,
    "idS" INTEGER NOT NULL,
    "idB" INTEGER NOT NULL,

    CONSTRAINT "Cas_pkey" PRIMARY KEY ("idCas")
);

-- CreateTable
CREATE TABLE "VersionRapport" (
    "idVR" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "lien" TEXT NOT NULL,
    "idR" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VersionRapport_pkey" PRIMARY KEY ("idVR")
);

-- CreateTable
CREATE TABLE "EvaluationRaport" (
    "idER" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "idR" INTEGER NOT NULL,

    CONSTRAINT "EvaluationRaport_pkey" PRIMARY KEY ("idER")
);

-- CreateTable
CREATE TABLE "Rapport" (
    "idR" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idS" INTEGER NOT NULL,
    "idB" INTEGER NOT NULL,

    CONSTRAINT "Rapport_pkey" PRIMARY KEY ("idR")
);

-- CreateTable
CREATE TABLE "RapportFinal" (
    "idR" INTEGER NOT NULL,

    CONSTRAINT "RapportFinal_pkey" PRIMARY KEY ("idR")
);

-- CreateTable
CREATE TABLE "RapportEtape" (
    "idR" INTEGER NOT NULL,

    CONSTRAINT "RapportEtape_pkey" PRIMARY KEY ("idR")
);

-- CreateTable
CREATE TABLE "RapportTâches" (
    "idR" INTEGER NOT NULL,

    CONSTRAINT "RapportTâches_pkey" PRIMARY KEY ("idR")
);

-- CreateTable
CREATE TABLE "Etape" (
    "idEtape" SERIAL NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "rapportEtapeId" INTEGER NOT NULL,
    "idS" INTEGER NOT NULL,

    CONSTRAINT "Etape_pkey" PRIMARY KEY ("idEtape")
);

-- CreateTable
CREATE TABLE "Tâches" (
    "idTache" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "idR" INTEGER NOT NULL,

    CONSTRAINT "Tâches_pkey" PRIMARY KEY ("idTache")
);

-- CreateTable
CREATE TABLE "Question" (
    "idQ" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "reponse" TEXT NOT NULL,
    "etat" "QuestionEtat" NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "enseignantRId" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("idQ")
);

-- CreateTable
CREATE TABLE "Réunion" (
    "idRN" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "remarque" TEXT NOT NULL,
    "lien" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "idG" INTEGER NOT NULL,
    "enseignantRId" INTEGER NOT NULL,

    CONSTRAINT "Réunion_pkey" PRIMARY KEY ("idRN")
);

-- CreateTable
CREATE TABLE "Participation" (
    "etudiantId" INTEGER NOT NULL,
    "idRN" INTEGER NOT NULL,
    "etat" "EtatPresence" NOT NULL,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("etudiantId","idRN")
);

-- CreateTable
CREATE TABLE "FeedBack" (
    "idF" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "idB" INTEGER NOT NULL,
    "idR" INTEGER NOT NULL,

    CONSTRAINT "FeedBack_pkey" PRIMARY KEY ("idF")
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
CREATE UNIQUE INDEX "Utilisateur_idC_key" ON "Utilisateur"("idC");

-- CreateIndex
CREATE UNIQUE INDEX "Etudiant_matricule_key" ON "Etudiant"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Groupe_idS_key" ON "Groupe"("idS");

-- CreateIndex
CREATE UNIQUE INDEX "Rapport_idS_key" ON "Rapport"("idS");

-- CreateIndex
CREATE UNIQUE INDEX "Etape_rapportEtapeId_key" ON "Etape"("rapportEtapeId");

-- CreateIndex
CREATE UNIQUE INDEX "Tâches_idR_key" ON "Tâches"("idR");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte"("idC") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeOTP" ADD CONSTRAINT "CodeOTP_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte"("idC") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_idC_fkey" FOREIGN KEY ("idC") REFERENCES "Compte"("idC") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("idU") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_idDP_fkey" FOREIGN KEY ("idDP") REFERENCES "DatePresence"("idDP") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_idU_fkey" FOREIGN KEY ("idU") REFERENCES "Utilisateur"("idU") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_idB_fkey" FOREIGN KEY ("idB") REFERENCES "Binome"("idB") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Binome" ADD CONSTRAINT "Binome_idG_fkey" FOREIGN KEY ("idG") REFERENCES "Groupe"("idG") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupe" ADD CONSTRAINT "Groupe_idS_fkey" FOREIGN KEY ("idS") REFERENCES "Sujet"("idS") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupe" ADD CONSTRAINT "Groupe_enseignantRId_fkey" FOREIGN KEY ("enseignantRId") REFERENCES "EnseignantResponsable"("idU") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_idEtape_fkey" FOREIGN KEY ("idEtape") REFERENCES "Etape"("idEtape") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_idB_fkey" FOREIGN KEY ("idB") REFERENCES "Binome"("idB") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enseignant" ADD CONSTRAINT "Enseignant_idU_fkey" FOREIGN KEY ("idU") REFERENCES "Utilisateur"("idU") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnseignantResponsable" ADD CONSTRAINT "EnseignantResponsable_idU_fkey" FOREIGN KEY ("idU") REFERENCES "Enseignant"("idU") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnseignantPrincipal" ADD CONSTRAINT "EnseignantPrincipal_idU_fkey" FOREIGN KEY ("idU") REFERENCES "Enseignant"("idU") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrateur" ADD CONSTRAINT "Administrateur_idU_fkey" FOREIGN KEY ("idU") REFERENCES "Utilisateur"("idU") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_idU_fkey" FOREIGN KEY ("idU") REFERENCES "Administrateur"("idU") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sujet" ADD CONSTRAINT "Sujet_enseignantRId_fkey" FOREIGN KEY ("enseignantRId") REFERENCES "EnseignantResponsable"("idU") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referencesSujet" ADD CONSTRAINT "referencesSujet_idS_fkey" FOREIGN KEY ("idS") REFERENCES "Sujet"("idS") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisSujet" ADD CONSTRAINT "prerequisSujet_idS_fkey" FOREIGN KEY ("idS") REFERENCES "Sujet"("idS") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cas" ADD CONSTRAINT "Cas_idS_fkey" FOREIGN KEY ("idS") REFERENCES "Sujet"("idS") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cas" ADD CONSTRAINT "Cas_idB_fkey" FOREIGN KEY ("idB") REFERENCES "Binome"("idB") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionRapport" ADD CONSTRAINT "VersionRapport_idR_fkey" FOREIGN KEY ("idR") REFERENCES "Rapport"("idR") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRaport" ADD CONSTRAINT "EvaluationRaport_idR_fkey" FOREIGN KEY ("idR") REFERENCES "Rapport"("idR") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rapport" ADD CONSTRAINT "Rapport_idS_fkey" FOREIGN KEY ("idS") REFERENCES "Sujet"("idS") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rapport" ADD CONSTRAINT "Rapport_idB_fkey" FOREIGN KEY ("idB") REFERENCES "Binome"("idB") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RapportFinal" ADD CONSTRAINT "RapportFinal_idR_fkey" FOREIGN KEY ("idR") REFERENCES "Rapport"("idR") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RapportEtape" ADD CONSTRAINT "RapportEtape_idR_fkey" FOREIGN KEY ("idR") REFERENCES "Rapport"("idR") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RapportTâches" ADD CONSTRAINT "RapportTâches_idR_fkey" FOREIGN KEY ("idR") REFERENCES "Rapport"("idR") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etape" ADD CONSTRAINT "Etape_rapportEtapeId_fkey" FOREIGN KEY ("rapportEtapeId") REFERENCES "RapportEtape"("idR") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etape" ADD CONSTRAINT "Etape_idS_fkey" FOREIGN KEY ("idS") REFERENCES "Sujet"("idS") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tâches" ADD CONSTRAINT "Tâches_idR_fkey" FOREIGN KEY ("idR") REFERENCES "RapportTâches"("idR") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("idU") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_enseignantRId_fkey" FOREIGN KEY ("enseignantRId") REFERENCES "EnseignantResponsable"("idU") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Réunion" ADD CONSTRAINT "Réunion_idG_fkey" FOREIGN KEY ("idG") REFERENCES "Groupe"("idG") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Réunion" ADD CONSTRAINT "Réunion_enseignantRId_fkey" FOREIGN KEY ("enseignantRId") REFERENCES "EnseignantResponsable"("idU") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("idU") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_idRN_fkey" FOREIGN KEY ("idRN") REFERENCES "Réunion"("idRN") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedBack" ADD CONSTRAINT "FeedBack_idB_fkey" FOREIGN KEY ("idB") REFERENCES "Binome"("idB") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedBack" ADD CONSTRAINT "FeedBack_idR_fkey" FOREIGN KEY ("idR") REFERENCES "Rapport"("idR") ON DELETE RESTRICT ON UPDATE CASCADE;
