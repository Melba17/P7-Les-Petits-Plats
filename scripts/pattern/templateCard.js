/* //////////////////////////////////////////////
    CLASSE REPRÉSENTANT UNE CARTE DE RECETTE
///////////////////////////////////////////// */
export class TemplateCards {
    // CONSTRUCTEUR QUI PREND LES DONNÉES D'UNE RECETTE EN PARAMÈTRE
    constructor(data) {
        this.image = data.image;  // Stocke l'image de la recette
        this.time = data.time;  // Stocke le temps de préparation
        this.name = data.name;  // Stocke le nom de la recette
        this.description = data.description;  // Stocke la description de la recette
        this.ingredientsList = data.ingredients;  // Stocke la liste des ingrédients
    }

    // MÉTHODE POUR AFFICHER LA CARTE DE RECETTE
    display() {
        // CRÉATION DE LA CARTE DE RECETTE
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('card');  // Ajoute la classe CSS 'card' à la carte
        recipeCard.setAttribute('aria-label', 'carte de recette');  // Ajoute un label ARIA pour l'accessibilité
        recipeCard.setAttribute('tabindex', '0');  // Rend la carte focusable

        // PARTIE SUPÉRIEURE DE LA CARTE
        const topCard = document.createElement('div');
        topCard.classList.add('card-top');  // Ajoute la classe CSS 'card-top' pour la partie supérieure

        const topElementImg = document.createElement('img');
        topElementImg.classList.add('card-img-top');  // Ajoute la classe 'card-img-top' pour l'image
        topElementImg.setAttribute('src', `assets/photos/${this.image}`);  // Définit l'image source de la recette
        topElementImg.setAttribute('alt', this.name);  // Ajoute un texte alternatif avec le nom de la recette

        const topElementTime = document.createElement('div');
        topElementTime.classList.add('card-time');  // Ajoute la classe 'card-time' pour afficher le temps de préparation
        topElementTime.textContent = `${this.time}min`;  // Affiche le temps de préparation en minutes

        topCard.appendChild(topElementImg);  // Ajoute l'image à la partie supérieure de la carte
        topCard.appendChild(topElementTime);  // Ajoute le temps de préparation à la partie supérieure

        recipeCard.appendChild(topCard);  // Ajoute la partie supérieure à la carte

        // CORPS PRINCIPAL DE LA CARTE
        const bodyCard = document.createElement('div');
        bodyCard.classList.add('card-body');  // Ajoute la classe 'card-body' pour le corps de la carte

        const titleCard = document.createElement('h2');
        titleCard.textContent = this.name;  // Définit le titre de la recette

        const subtitleOneCard = document.createElement('h3');
        subtitleOneCard.textContent = 'RECETTE';  // Définit le sous-titre 'RECETTE'

        const descriptionCard = document.createElement('p');
        descriptionCard.textContent = this.description;  // Définit la description de la recette

        const subtitleTwoCard = document.createElement('h3');
        subtitleTwoCard.textContent = 'INGRÉDIENTS';  // Définit le sous-titre 'INGRÉDIENTS'

        // Ajoute les éléments au corps de la carte
        bodyCard.appendChild(titleCard);
        bodyCard.appendChild(subtitleOneCard);
        bodyCard.appendChild(descriptionCard);
        bodyCard.appendChild(subtitleTwoCard);

        const smallGridCard = document.createElement('div');
        smallGridCard.classList.add('small-grid');  // Ajoute la classe 'small-grid' pour organiser les ingrédients

        // AJOUT DES INGRÉDIENTS À LA CARTE
        this.ingredientsList.forEach((item) => {
            const detailsCard = document.createElement('div');

            const title = document.createElement('h4');
            title.textContent = item.ingredient;  // Définit le nom de l'ingrédient

            const span = document.createElement('span');
            // Affiche la quantité et l'unité de l'ingrédient (si disponibles)
            span.textContent = `${item.quantity || '-'}${item.unit || ''}`.trim();

            // Ajoute les détails à la carte
            detailsCard.appendChild(title);
            detailsCard.appendChild(span);

            smallGridCard.appendChild(detailsCard);  // Ajoute les détails de l'ingrédient à la grille
        });

        bodyCard.appendChild(smallGridCard);  // Ajoute la grille d'ingrédients au corps de la carte
        recipeCard.appendChild(bodyCard);  // Ajoute le corps à la carte complète

        // RETOURNE LA CARTE POUR L'AJOUTER AU DOM
        return recipeCard;  
    }
}
