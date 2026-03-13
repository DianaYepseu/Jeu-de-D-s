class JeuDes {
  constructor() {
    this.multiNode = new MultiNode();
    this.multiNode.confirmerConnexion = () => this.confirmerConnexion();
    this.multiNode.confirmerAuthentification = (autresParticipants) =>
      this.confirmerAuthentification(autresParticipants);
    this.multiNode.apprendreAuthentification = (pseudonyme) =>
      this.apprendreAuthentification(pseudonyme);
    this.multiNode.recevoirVariable = (variable) => this.recevoirVariable(variable);

    this.listeJoueur = {};
    this.pseudonymeJoueur = "";
    this.pseudonymeAutreJoueur = "";

    this.listeScoresElement = document.getElementById("liste-scores");
    this.formulaireAuthentification = document.getElementById("formulaire-authentification");
    this.champPseudonyme = document.getElementById("champ-pseudonyme");
    this.boutonAuthentification = document.getElementById("bouton-authentification");

    this.formulaireJeu = document.getElementById("formulaire-jeu");
    this.champPointDuDe = document.getElementById("champ-point-de-de");
    this.boutonLancer = document.getElementById("bouton-lancer");
    this.informationAutreJoueur = document.getElementById("information-autre-joueur");
    this.champPointDuDeAutreJoueur = document.getElementById("champ-point-de-de-autre-joueur");
    this.champNombreTour = document.getElementById("champ-nombre-tour");

    this.statusElement = document.getElementById("status");
    this.logElement = document.getElementById("log");

    this.die1Element = document.getElementById("die1");
    this.die2Element = document.getElementById("die2");

    this.endBackdrop = document.getElementById("end-backdrop");
    this.endTitle = document.getElementById("end-title");
    this.endText = document.getElementById("end-text");
    this.btnClose = document.getElementById("btn-close");
    this.btnReplay = document.getElementById("btn-replay");

    this.nombreTour = 0;
    this.valeurDEJoueur = null;
    this.valeurDEAutreJoueur = null;

    this.partieTerminee = false;
    this.premierTourPret = false;

    this.rejouerEnAttente = false;
    this.demandeRejouerRecue = false;
    this.reponseRejouerEnvoyee = false;
    this.monChoixFinPartie = null; // "rejouer" | "fermer" | null

    this.formulaireAuthentification.addEventListener("submit", (e) =>
      this.soumettreAuthentificationJoueur(e)
    );

    this.formulaireJeu.addEventListener("submit", (e) =>
      this.soumettreLancer(e)
    );

    if (this.btnReplay) {
      this.btnReplay.addEventListener("click", () => this.gererBoutonRejouer());
    }

    if (this.btnClose) {
      this.btnClose.addEventListener("click", () => this.gererBoutonFermer());
    }

    this.formulaireJeu.style.display = "none";
    this.boutonLancer.disabled = true;
    this.champNombreTour.value = "0";

    this.mettreAJourStatus("En attente d’authentification…");
  }

  log(message) {
    console.log(message);
  }

  horodatage() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    return `[${h} h ${m} min ${s} s]`;
  }

  ajouterHistorique(message) {
    this.log(message);

    if (!this.logElement) return;

    const p = document.createElement("p");
    p.textContent = `${this.horodatage()} ${message}`;
    this.logElement.prepend(p);
  }

  mettreAJourStatus(message) {
    if (this.statusElement) {
      this.statusElement.textContent = message;
    }
    this.log(message);
  }

  incrementerNombreTours() {
    this.nombreTour++;
    this.champNombreTour.value = this.nombreTour;
  }

  desactiverBoutonsFinPartie() {
    if (this.btnReplay) this.btnReplay.disabled = true;
    if (this.btnClose) this.btnClose.disabled = true;
  }

  activerBoutonsFinPartie() {
    if (this.btnReplay) this.btnReplay.disabled = false;
    if (this.btnClose) this.btnClose.disabled = false;
  }

  afficherModal(titre, texte) {
    if (this.endTitle) this.endTitle.textContent = titre;
    if (this.endText) this.endText.textContent = texte;
    if (this.endBackdrop) this.endBackdrop.style.display = "flex";
  }

  masquerModal() {
    if (this.endBackdrop) this.endBackdrop.style.display = "none";
  }

  confirmerConnexion() {
    this.pseudonymeJoueur = this.champPseudonyme.value.trim();

    if (!this.pseudonymeJoueur) {
      alert("Entre un pseudonyme.");
      this.boutonAuthentification.disabled = false;
      return;
    }

    this.ajouterHistorique(`${this.pseudonymeJoueur} tente de se connecter.`);
    this.multiNode.demanderAuthentification(this.pseudonymeJoueur);
  }

  confirmerAuthentification(autresParticipants) {
    this.formulaireAuthentification.querySelector("fieldset").disabled = true;
    this.ajouterJoueur(this.pseudonymeJoueur);
    this.afficherScores();

    this.ajouterHistorique(`${this.pseudonymeJoueur} est authentifié.`);

    if (autresParticipants.length > 0) {
      this.pseudonymeAutreJoueur = autresParticipants[0];
      this.ajouterJoueur(this.pseudonymeAutreJoueur);
      this.afficherScores();
      this.afficherPartie();
      this.determinePremierJoueur();
    } else {
      this.mettreAJourStatus("Authentifié. En attente d’un autre joueur…");
    }
  }

  apprendreAuthentification(pseudonyme) {
    if (pseudonyme === this.pseudonymeJoueur) return;
    if (this.listeJoueur[pseudonyme]) return;

    this.ajouterJoueur(pseudonyme);
    this.pseudonymeAutreJoueur = pseudonyme;
    this.afficherScores();
    this.afficherPartie();
    this.ajouterHistorique(`${pseudonyme} a rejoint la partie.`);
    this.determinePremierJoueur();
  }

  afficherScores() {
    this.listeScoresElement.innerHTML = "";

    for (const pseudonyme in this.listeJoueur) {
      const score = this.listeJoueur[pseudonyme].pointDuDe;
      const li = document.createElement("li");
      li.textContent = `${pseudonyme}: ${score} points`;
      this.listeScoresElement.appendChild(li);
    }
  }

  ajouterJoueur(pseudonyme) {
    if (!this.listeJoueur[pseudonyme]) {
      this.listeJoueur[pseudonyme] = { pointDuDe: 0 };
    }
  }

  afficherPartie() {
    if (!this.pseudonymeJoueur || !this.pseudonymeAutreJoueur) return;

    this.informationAutreJoueur.textContent = `Dés de ${this.pseudonymeAutreJoueur}`;
    this.champPointDuDe.value = this.listeJoueur[this.pseudonymeJoueur]?.pointDuDe ?? 0;
    this.champPointDuDeAutreJoueur.value =
      this.listeJoueur[this.pseudonymeAutreJoueur]?.pointDuDe ?? 0;

    this.formulaireJeu.style.display = "block";
  }

  genererForceLancer() {
    return Math.floor(Math.random() * JeuDes.CHIFFRE_MAXIMUM) + 1;
  }

  determinePremierJoueur() {
    if (!this.pseudonymeJoueur || !this.pseudonymeAutreJoueur) return;

    this.valeurDEJoueur = this.genererForceLancer();
    this.valeurDEAutreJoueur = null;
    this.premierTourPret = false;
    this.boutonLancer.disabled = true;

    this.champPointDuDe.value = `Valeur initiale : ${this.valeurDEJoueur}`;
    this.champPointDuDeAutreJoueur.value = "En attente...";

    this.multiNode.posterVariableTextuelle(
      JeuDes.MESSAGE.DETERMINER_PREMIER_TOUR,
      JSON.stringify({
        pseudonyme: this.pseudonymeJoueur,
        valeur: this.valeurDEJoueur,
      })
    );

    this.mettreAJourStatus("Détermination du premier joueur…");
  }

  debutJeu(pseudonyme, valeur) {
    if (pseudonyme === this.pseudonymeJoueur) {
      this.valeurDEJoueur = valeur;
      this.champPointDuDe.value = `Valeur initiale : ${valeur}`;
    } else {
      this.valeurDEAutreJoueur = valeur;
      this.champPointDuDeAutreJoueur.value = `Valeur initiale : ${valeur}`;
    }

    if (this.valeurDEJoueur === null || this.valeurDEAutreJoueur === null) return;
    if (this.premierTourPret) return;

    this.premierTourPret = true;

    if (this.valeurDEJoueur > this.valeurDEAutreJoueur) {
      this.boutonLancer.disabled = false;
      this.mettreAJourStatus("C’est à vous de commencer.");
      this.ajouterHistorique(
        `${this.pseudonymeJoueur} commence (${this.valeurDEJoueur} contre ${this.valeurDEAutreJoueur}).`
      );
    } else if (this.valeurDEJoueur < this.valeurDEAutreJoueur) {
      this.boutonLancer.disabled = true;
      this.mettreAJourStatus(`C’est à ${this.pseudonymeAutreJoueur} de commencer.`);
      this.ajouterHistorique(
        `${this.pseudonymeAutreJoueur} commence (${this.valeurDEAutreJoueur} contre ${this.valeurDEJoueur}).`
      );
    } else {
      this.mettreAJourStatus("Égalité, nouvelle détermination…");
      this.ajouterHistorique(
        `Égalité pour le premier tour (${this.valeurDEJoueur}-${this.valeurDEAutreJoueur}).`
      );
      setTimeout(() => this.determinePremierJoueur(), 300);
    }

    this.afficherPartie();
  }

  recevoirVariable(variable) {
    const message = JSON.parse(variable.valeur);

    switch (variable.cle) {
      case JeuDes.MESSAGE.POINT_DU_DE:
        if (message.pseudonyme === this.pseudonymeJoueur) {
          this.changerPointduDeJoueur(message.valeur, message.de1, message.de2);
        } else {
          this.changerPointduDeAutreJoueur(message.valeur, message.de1, message.de2);
        }
        break;

      case JeuDes.MESSAGE.DETERMINER_PREMIER_TOUR:
        this.debutJeu(message.pseudonyme, message.valeur);
        break;

      case JeuDes.MESSAGE.JEUDES:
        this.subirLancer(message.pseudonyme, message.valeur, message.de1, message.de2);
        break;

      case JeuDes.MESSAGE.DEMANDE_REJOUER:
        this.recevoirDemandeRejouer(message.pseudonyme);
        break;

      case JeuDes.MESSAGE.REPONSE_REJOUER:
        this.recevoirReponseRejouer(message.pseudonyme, message.accepte);
        break;

      case JeuDes.MESSAGE.REINITIALISER:
        this.reinitialiserPartie(false);
        break;
    }
  }

  soumettreAuthentificationJoueur(e) {
    e.preventDefault();
    this.multiNode.connecter();
    this.boutonAuthentification.disabled = true;
  }

  soumettreLancer(e) {
    e.preventDefault();

    if (this.partieTerminee) return;
    if (this.boutonLancer.disabled) return;

    this.incrementerNombreTours();

    const de1 = this.genererForceLancer();
    const de2 = this.genererForceLancer();
    const forceLancer = de1 + de2;
    const double = de1 === de2;

    this.afficherDes(de1, de2);
    this.champPointDuDe.value = `de1 = ${de1} , de2 = ${de2}`;

    this.ajouterHistorique(
      `${this.pseudonymeJoueur} lance: ${de1}+${de2}=${forceLancer}${double ? " (DOUBLÉ 🔥)" : ""}`
    );

    this.multiNode.posterVariableTextuelle(
      JeuDes.MESSAGE.JEUDES,
      JSON.stringify({
        pseudonyme: this.pseudonymeJoueur,
        valeur: forceLancer,
        de1: de1,
        de2: de2,
      })
    );
  }

  subirLancer(pseudonyme, valeur, de1, de2) {
    if (!this.listeJoueur[pseudonyme]) return;
    if (this.partieTerminee) return;

    const nouveauTotal = this.listeJoueur[pseudonyme].pointDuDe + valeur;
    const double = de1 === de2;

    this.multiNode.posterVariableTextuelle(
      JeuDes.MESSAGE.POINT_DU_DE,
      JSON.stringify({
        pseudonyme: pseudonyme,
        valeur: nouveauTotal,
        de1: de1,
        de2: de2,
      })
    );

    if (pseudonyme !== this.pseudonymeJoueur) {
      this.afficherDes(de1, de2);
    }

    this.ajouterHistorique(
      `${pseudonyme} a joué: ${de1}+${de2}=${valeur} → score ${nouveauTotal}${double ? " (DOUBLÉ 🔥)" : ""}`
    );

    if (double) {
      if (pseudonyme === this.pseudonymeJoueur) {
        this.boutonLancer.disabled = false;
        this.mettreAJourStatus("Doublé ! Vous rejouez.");
      } else {
        this.boutonLancer.disabled = true;
        this.mettreAJourStatus(`${pseudonyme} a fait un doublé et rejoue.`);
      }
    } else {
      if (pseudonyme === this.pseudonymeJoueur) {
        this.boutonLancer.disabled = true;
        this.mettreAJourStatus(`En attente du tour de ${this.pseudonymeAutreJoueur}…`);
      } else {
        this.boutonLancer.disabled = false;
        this.mettreAJourStatus("C’est votre tour.");
      }
    }
  }

  changerPointduDeJoueur(nouveauPointDuDe, de1, de2) {
    if (!this.listeJoueur[this.pseudonymeJoueur]) return;

    this.listeJoueur[this.pseudonymeJoueur].pointDuDe = nouveauPointDuDe;
    this.champPointDuDe.value = `de1 = ${de1}, de2 = ${de2}`;
    this.afficherScores();
    this.validerFinPartie();
  }

  changerPointduDeAutreJoueur(nouveauPointDuDe, de1, de2) {
    if (!this.listeJoueur[this.pseudonymeAutreJoueur]) return;

    this.listeJoueur[this.pseudonymeAutreJoueur].pointDuDe = nouveauPointDuDe;
    this.champPointDuDeAutreJoueur.value = `de1 = ${de1}, de2 = ${de2}`;
    this.afficherScores();
    this.validerFinPartie();
  }

  validerFinPartie() {
    if (this.partieTerminee) return;
    if (!this.pseudonymeJoueur || !this.pseudonymeAutreJoueur) return;

    const scoreJoueur = this.listeJoueur[this.pseudonymeJoueur]?.pointDuDe ?? 0;
    const scoreAutre = this.listeJoueur[this.pseudonymeAutreJoueur]?.pointDuDe ?? 0;

    if (scoreJoueur >= 60 || scoreAutre >= 60) {
      this.partieTerminee = true;
      this.boutonLancer.disabled = true;

      this.rejouerEnAttente = false;
      this.demandeRejouerRecue = false;
      this.reponseRejouerEnvoyee = false;
      this.monChoixFinPartie = null;

      this.activerBoutonsFinPartie();

      if (scoreJoueur >= 60) {
        this.mettreAJourStatus("Victoire !");
        this.ajouterHistorique(
          `Victoire ! Score final - ${this.pseudonymeJoueur}: ${scoreJoueur} | ${this.pseudonymeAutreJoueur}: ${scoreAutre}`
        );
        this.afficherModal("Victoire !", "Voulez-vous rejouer ?");
      } else {
        this.mettreAJourStatus("Défaite");
        this.ajouterHistorique(
          `Défaite Score final - ${this.pseudonymeJoueur}: ${scoreJoueur} | ${this.pseudonymeAutreJoueur}: ${scoreAutre}`
        );
        this.afficherModal("Défaite", "Voulez-vous rejouer ?");
      }
    }
  }

  gererBoutonRejouer() {
    if (!this.partieTerminee) return;
    if (this.monChoixFinPartie) return;

    this.monChoixFinPartie = "rejouer";
    this.desactiverBoutonsFinPartie();

    if (this.demandeRejouerRecue && !this.reponseRejouerEnvoyee) {
      this.envoyerReponseRejouer(true);
      return;
    }

    this.demanderRejouer();
  }

  gererBoutonFermer() {
    if (!this.partieTerminee) {
      this.masquerModal();
      return;
    }

    if (this.monChoixFinPartie) return;

    this.monChoixFinPartie = "fermer";
    this.desactiverBoutonsFinPartie();

    if (this.demandeRejouerRecue && !this.reponseRejouerEnvoyee) {
      this.envoyerReponseRejouer(false);
      return;
    }

    this.ajouterHistorique(`${this.pseudonymeJoueur} a choisi Fermer.`);
    this.mettreAJourStatus("Vous avez fermé la fenêtre de fin.");
    this.afficherModal("Choix enregistré", "Vous avez choisi Fermer. Boutons bloqués.");
  }

  demanderRejouer() {
    this.rejouerEnAttente = true;
    this.demandeRejouerRecue = false;
    this.reponseRejouerEnvoyee = false;

    this.ajouterHistorique(`${this.pseudonymeJoueur} a choisi Rejouer.`);
    this.mettreAJourStatus("Demande de rejouer envoyée. En attente de l’autre joueur…");
    this.afficherModal("En attente", "Vous avez choisi Rejouer. En attente de l’autre joueur.");

    this.multiNode.posterVariableTextuelle(
      JeuDes.MESSAGE.DEMANDE_REJOUER,
      JSON.stringify({
        pseudonyme: this.pseudonymeJoueur,
      })
    );
  }

  recevoirDemandeRejouer(pseudonyme) {
    if (pseudonyme === this.pseudonymeJoueur) return;
    if (!this.partieTerminee) return;

    this.demandeRejouerRecue = true;
    this.reponseRejouerEnvoyee = false;

    this.ajouterHistorique(`${pseudonyme} a choisi Rejouer.`);
    this.mettreAJourStatus(`${pseudonyme} veut rejouer.`);

    if (this.monChoixFinPartie === "fermer") {
      return;
    }

    if (this.monChoixFinPartie === "rejouer") {
      return;
    }

    this.activerBoutonsFinPartie();
    this.afficherModal(
      "Demande de revanche",
      `${pseudonyme} veut rejouer. Clique sur "Rejouer" pour accepter ou sur "Fermer" pour refuser.`
    );
  }

  envoyerReponseRejouer(accepte) {
    this.reponseRejouerEnvoyee = true;
    this.demandeRejouerRecue = false;

    this.ajouterHistorique(
      `${this.pseudonymeJoueur} a choisi ${accepte ? "Rejouer" : "Fermer"}.`
    );

    this.multiNode.posterVariableTextuelle(
      JeuDes.MESSAGE.REPONSE_REJOUER,
      JSON.stringify({
        pseudonyme: this.pseudonymeJoueur,
        accepte: accepte,
      })
    );

    if (accepte) {
      this.mettreAJourStatus("Vous avez accepté de rejouer.");
      this.afficherModal("Choix enregistré", "Vous avez accepté. En attente du redémarrage…");
    } else {
      this.mettreAJourStatus("Vous avez refusé de rejouer.");
      this.afficherModal("Choix enregistré", "Vous avez refusé. Boutons bloqués.");
    }
  }

  recevoirReponseRejouer(pseudonyme, accepte) {
    if (pseudonyme === this.pseudonymeJoueur) return;
    if (!this.partieTerminee) return;

    this.ajouterHistorique(
      `${pseudonyme} a choisi ${accepte ? "Rejouer" : "Fermer"}.`
    );

    if (!this.rejouerEnAttente) return;

    this.rejouerEnAttente = false;

    if (accepte) {
      this.mettreAJourStatus("Les deux joueurs ont choisi Rejouer.");
      this.ajouterHistorique("Les deux joueurs ont choisi Rejouer. Nouvelle partie.");
      this.afficherModal("Accord trouvé", "Les deux joueurs ont choisi Rejouer. Nouvelle partie…");

      this.multiNode.posterVariableTextuelle(
        JeuDes.MESSAGE.REINITIALISER,
        JSON.stringify({
          pseudonyme: this.pseudonymeJoueur,
        })
      );
    } else {
      this.mettreAJourStatus("L’autre joueur a refusé de rejouer.");
      this.ajouterHistorique("Rejouer refusé : l’autre joueur a choisi Fermer.");
      this.afficherModal(
        "Rejouer refusé",
        "L’autre joueur a choisi Fermer. Les boutons restent bloqués."
      );
      this.desactiverBoutonsFinPartie();
    }
  }

  reinitialiserPartie(depuisLocal = true) {
    this.partieTerminee = false;
    this.premierTourPret = false;

    this.rejouerEnAttente = false;
    this.demandeRejouerRecue = false;
    this.reponseRejouerEnvoyee = false;
    this.monChoixFinPartie = null;

    this.nombreTour = 0;
    this.valeurDEJoueur = null;
    this.valeurDEAutreJoueur = null;

    this.champNombreTour.value = "0";

    if (this.listeJoueur[this.pseudonymeJoueur]) {
      this.listeJoueur[this.pseudonymeJoueur].pointDuDe = 0;
    }

    if (this.listeJoueur[this.pseudonymeAutreJoueur]) {
      this.listeJoueur[this.pseudonymeAutreJoueur].pointDuDe = 0;
    }

    this.champPointDuDe.value = "0";
    this.champPointDuDeAutreJoueur.value = "0";
    this.afficherDes("-", "-");
    this.afficherScores();
    this.activerBoutonsFinPartie();
    this.masquerModal();
    this.mettreAJourStatus("Nouvelle partie.");
    this.ajouterHistorique("Partie réinitialisée (scores à 0). Relancez pour continuer.");

    if (depuisLocal) return;

    this.determinePremierJoueur();
  }

  afficherDes(de1, de2) {
    if (this.die1Element) this.die1Element.textContent = de1;
    if (this.die2Element) this.die2Element.textContent = de2;
  }
}

JeuDes.NOMBRE_JOUEUR_REQUIS = 2;
JeuDes.NOMBRE_POINT_DU_DE = 0;
JeuDes.CHIFFRE_MAXIMUM = 6;

JeuDes.MESSAGE = {
  JEUDES: "JEUDES",
  POINT_DU_DE: "POINT_DU_DE",
  DETERMINER_PREMIER_TOUR: "DETERMINER_PREMIER_TOUR",
  DEMANDE_REJOUER: "DEMANDE_REJOUER",
  REPONSE_REJOUER: "REPONSE_REJOUER",
  REINITIALISER: "REINITIALISER",
};

new JeuDes();
