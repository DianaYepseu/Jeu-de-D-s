class JeuDes{
  constructor(){
    this.multiNode = new MultiNode();
    this.multiNode.confirmerConnexion = () => this.confirmerConnexion();
    this.multiNode.confirmerAuthentification = (autresParticipants) => this.confirmerAuthentification(autresParticipants);
    this.multiNode.apprendreAuthentification = (pseudonyme) => this.apprendreAuthentification(pseudonyme);
    this.multiNode.recevoirVariable = (variable) => this.recevoirVariable(variable);
    this.listeJoueur = {};
    this.pseudonymeJoueur = "";
    this.pseudonymeAutreJoueur = "";
    this.listeScoresElement = document.getElementById("liste-scores");
    this.formulaireAuthentification = document.getElementById("formulaire-authentification");
    this.formulaireAuthentification.addEventListener("submit", (evenementsubmit) => this.soumettreAuthentificationJoueur(evenementsubmit))
    this.champPseudonyme = document.getElementById("champ-pseudonyme");
    this.boutonAuthentification = document.getElementById("bouton-authentification");
    this.formulaireJeu = document.getElementById("formulaire-jeu");
    this.formulaireJeu.addEventListener("submit", (evenementsubmit) => this.soumettreLancer(evenementsubmit))
    this.formulaireJeu.style.display = "none";
    this.champPointDuDe = document.getElementById("champ-point-de-de");
    this.champLancer = document.getElementById("champ-lancer");
    this.boutonLancer = document.getElementById("bouton-lancer");
    this.informationAutreJoueur = document.getElementById("information-autre-joueur");
    this.champPointDuDeAutreJoueur = document.getElementById("champ-point-de-de-autre-joueur");
    this.champNombreTour = document.getElementById("champ-nombre-tour");
    this.nombreTour = 0;
    this.valeurDEJoueur = 0;
    this.valeurDEAutreJoueur = 0;
  }


   incrementerNombreTours() {
    this.nombreTour++;
    this.champNombreTour.value = this.nombreTour;
    console.log("Nombre de lancers : " + this.nombreTour);
  }

  confirmerConnexion(){
    console.log("Je suis connecté.");
    this.pseudonymeJoueur = this.champPseudonyme.value;
    this.multiNode.demanderAuthentification(this.pseudonymeJoueur);
  }



  confirmerAuthentification(autresParticipants){
    console.log("Je suis authentifié.");
    console.log("Les autres participants sont " + JSON.stringify(autresParticipants));
    this.formulaireAuthentification.querySelector("fieldset").disabled = true;
    this.ajouterJoueur(this.pseudonymeJoueur);

    if(autresParticipants.length > 0){
      this.pseudonymeAutreJoueur = autresParticipants[0];
      this.ajouterJoueur(autresParticipants[0]);
      this.determinePremierJoueur();
    }

  }
  apprendreAuthentification(pseudonyme){
    console.log("Nouvel ami " + pseudonyme);
    this.ajouterJoueur(pseudonyme);
    this.pseudonymeAutreJoueur = pseudonyme;
    this.determinePremierJoueur();

  }

 afficherScores() {
    this.listeScoresElement.innerHTML = '';
    for (const pseudonyme in this.listeJoueur) {
      const score = this.listeJoueur[pseudonyme].pointDuDe;
      const li = document.createElement("li");
      li.textContent = `${pseudonyme}: ${score} points`;
      this.listeScoresElement.appendChild(li);
    }
  }

  ajouterJoueur(pseudonyme){
    console.log("ajouterJoueur : " + pseudonyme);
    this.listeJoueur[pseudonyme] = {pointDuDe : JeuDes.NOMBRE_POINT_DU_DE};
  }

 determinePremierJoueur() {
    let valeurInitiale = this.genererForceLancer();

    let message = {
        pseudonyme: this.pseudonymeJoueur,
        valeur: valeurInitiale
    };


    this.valeurDEJoueur = valeurInitiale;
    if (this.champPointDuDe) {
        this.champPointDuDe.value = `Valeur initiale : ${valeurInitiale}`;
    } else {
        console.error("champPointDuDe introuvable");
    }

    console.log(`determinePremierJoueur -> ${this.pseudonymeJoueur} valeur: ${valeurInitiale}`);

    this.multiNode.posterVariableTextuelle(JeuDes.MESSAGE.DETERMINER_PREMIER_TOUR, JSON.stringify(message));


    if (this.valeurDEJoueur === this.valeurDEAutreJoueur) {
        console.log("Égalité, on relance la détermination");
        this.determinePremierJoueur();
    } else if (this.valeurDEJoueur > this.valeurDEAutreJoueur) {
        console.log("C'est " + this.pseudonymeJoueur + " qui commence");
        this.boutonLancer.disabled = false;
    } else {
        console.log("C'est " + this.pseudonymeAutreJoueur + " qui commence");
        this.boutonLancer.disabled = true;
    }
}





 debutJeu(pseudonyme, valeur) {
    console.log(`debutJeu -> pseudo: ${pseudonyme}, valeur: ${valeur}`);

    if (this.pseudonymeJoueur === pseudonyme) {
        this.valeurDEJoueur = valeur;
        this.champPointDuDe.value = `Valeur initiale : ${valeur}`;
    } else {
        this.valeurDEAutreJoueur = valeur;
        this.champPointDuDeAutreJoueur.value = `Valeur initiale : ${valeur}`;
    }

    if (this.valeurDEJoueur && this.valeurDEAutreJoueur) {
        console.log(`Valeur de ${this.pseudonymeJoueur}: ${this.valeurDEJoueur}, Valeur de ${this.pseudonymeAutreJoueur}: ${this.valeurDEAutreJoueur}`);

        if (this.valeurDEJoueur > this.valeurDEAutreJoueur) {
            console.log("C'est " + this.pseudonymeJoueur + " qui commence");
            this.boutonLancer.disabled = false;
        } else if (this.valeurDEJoueur === this.valeurDEAutreJoueur) {
            console.log("Égalité, on relance la détermination");
            this.determinePremierJoueur();
        } else {
            console.log("C'est " + this.pseudonymeAutreJoueur + " qui commence");
            this.boutonLancer.disabled = true;
        }
    }

    this.afficherPartie();
}




  recevoirVariable(variable){
    console.log(`recevoirVariable() -> clé: ${variable.cle}, valeur: ${variable.valeur}`);

    let message = JSON.parse(variable.valeur);

    if (message.pseudonyme === this.pseudonymeJoueur) {
        switch (variable.cle) {
            case JeuDes.MESSAGE.POINT_DU_DE:
                this.changerPointduDeJoueur(message.valeur, message.de1, message.de2);
                break;
            case JeuDes.MESSAGE.DETERMINER_PREMIER_TOUR:
                this.debutJeu(message.pseudonyme, message.valeur);
                break;
            case JeuDes.MESSAGE.JEUDES:
                this.subirLancer(message.pseudonyme, message.valeur, message.de1, message.de2);
                this.boutonLancer.disabled = true;
                break;
        }
    } else {
        switch (variable.cle) {
           case JeuDes.MESSAGE.JEUDES:
                this.subirLancer(message.pseudonyme, message.valeur, message.de1, message.de2);
                this.boutonLancer.disabled = false;
                break;
            case JeuDes.MESSAGE.POINT_DU_DE:
                this.changerPointduDeAutreJoueur(message.valeur, message.de1, message.de2);
                break;
            case JeuDes.MESSAGE.DETERMINER_PREMIER_TOUR:
                this.debutJeu(message.pseudonyme, message.valeur);
                break;
        }
    }
}


  soumettreAuthentificationJoueur(evenementsubmit){
    console.log("soumettreAuthentificationJoueur");
    evenementsubmit.preventDefault();
    this.multiNode.connecter();
    this.boutonAuthentification.disabled = true;

  }

  afficherPartie(){

    this.informationAutreJoueur.innerHTML =
    this.informationAutreJoueur.innerHTML.replace("{nom-autre-joueur}", this.pseudonymeAutreJoueur);
    this.champPointDuDeAutreJoueur.value = this.listeJoueur[this.pseudonymeAutreJoueur].pointDuDe;
    this.champPointDuDe.value = this.listeJoueur[this.pseudonymeJoueur].pointDuDe;
    this.formulaireJeu.style.display = "block";

  }

  genererForceLancer(){
    return Math.floor(Math.random() * JeuDes.CHIFFRE_MAXIMUM) + 1;
  }

 soumettreLancer(evenementsubmit){
    console.log("soumettreLancer");
    evenementsubmit.preventDefault();
    this.incrementerNombreTours();
    let de1 = this.genererForceLancer();
    let de2 = this.genererForceLancer();
    let forceLancer = de1 + de2;

    console.log(`Dé 1: ${de1} | Dé 2: ${de2} | Somme: ${forceLancer}`);


    this.champPointDuDe.value = `de1 = ${de1} , de2 = ${de2}`;

    let message = {
      pseudonyme: this.pseudonymeJoueur,
      valeur: forceLancer,
      de1: de1,
      de2: de2
    };


    if (de1 === de2) {
        console.log("Doublé! Vous avez un tour supplémentaire.");
        this.incrementerNombreTours();
        this.boutonLancer.disabled = false;
    } else {
        this.boutonLancer.disabled = true;
        this.multiNode.posterVariableTextuelle(JeuDes.MESSAGE.JEUDES, JSON.stringify(message));
    }
}


  subirLancer(pseudonyme, valeur, de1, de2){
    console.log(`subirLancer() -> pseudo: ${pseudonyme}, valeur: ${valeur}, de1: ${de1}, de2: ${de2}`);

    let message = {
      pseudonyme: pseudonyme,
      valeur: this.listeJoueur[pseudonyme].pointDuDe + valeur,
      de1: de1,
      de2: de2
    };

    this.multiNode.posterVariableTextuelle(JeuDes.MESSAGE.POINT_DU_DE, JSON.stringify(message));


    if (de1 === de2) {
        console.log(`${pseudonyme} a un doublé! Il peut relancer.`);
    } else {
        this.boutonLancer.disabled = false;
    }
}






 changerPointduDeJoueur(nouveauPointDuDe, de1, de2) {
    console.log(`changerPointduDeJoueur() -> valeur: ${nouveauPointDuDe}, de1: ${de1}, de2: ${de2}`);

    this.listeJoueur[this.pseudonymeJoueur].pointDuDe = nouveauPointDuDe;


    this.champPointDuDe.value = `de1 = ${de1}, de2 = ${de2}`;

    this.afficherScores();
    this.validerFinPartie();
}

changerPointduDeAutreJoueur(nouveauPointDuDe, de1, de2) {
    console.log(`changerPointduDeAutreJoueur() -> valeur: ${nouveauPointDuDe}, de1: ${de1}, de2: ${de2}`);

    this.listeJoueur[this.pseudonymeAutreJoueur].pointDuDe = nouveauPointDuDe;


    this.champPointDuDeAutreJoueur.value = `de1 = ${de1}, de2 = ${de2}`;

    this.afficherScores();
    this.validerFinPartie();
}



   validerFinPartie(){
    console.log("validerFinPartie");
     if(this.listeJoueur[this.pseudonymeJoueur].pointDuDe >= 60){
      alert("Vous avez gagné!");
    }else if(this.listeJoueur[this.pseudonymeAutreJoueur].pointDuDe >= 60){
      alert("Vous avez perdu!");
    }
  }


}

JeuDes.NOMBRE_JOUEUR_REQUIS = 2;
JeuDes.NOMBRE_POINT_DU_DE = 0;
JeuDes.CHIFFRE_MAXIMUM = 6;
JeuDes.MESSAGE = {
    JEUDES : "JEUDES",
    POINT_DU_DE : "POINT_DU_DE",
    DETERMINER_PREMIER_TOUR : "DETERMINER_PREMIER_TOUR"
};

new JeuDes();
