// Classe représentant une carte de recette
export class TemplateCards {
    // Constructeur qui prend les données d'une recette en paramètre
    constructor(data) {
    this.image = data.image;
    this.time = data.time;
    this.name = data.name;
    this.description = data.description;
    this.ingredientsList = data.ingredients;
    }
    
    // Méthode pour afficher la carte de recette
    display() {
        // Création de la carte de recette
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('card');
        recipeCard.setAttribute('aria-label', 'carte de recette');
        recipeCard.setAttribute('tabindex', '0');

        // Partie supérieure de la carte
        const topCard = document.createElement('div');
        topCard.classList.add('card-top');

        const topElementImg = document.createElement('img');
        topElementImg.classList.add('card-img-top');
        topElementImg.setAttribute('src', `assets/photos/${this.image}`);
        topElementImg.setAttribute('alt', this.name);

        const topElementTime = document.createElement('div');
        topElementTime.classList.add('card-time');
        topElementTime.textContent = `${this.time}min`;

        topCard.appendChild(topElementImg);
        topCard.appendChild(topElementTime);

        recipeCard.appendChild(topCard);

        // Corps principal de la carte
        const bodyCard = document.createElement('div');
        bodyCard.classList.add('card-body');

        const titleCard = document.createElement('h2');
        titleCard.textContent = this.name;

        const subtitleOneCard = document.createElement('h3');
        subtitleOneCard.textContent = 'RECETTE';

        const descriptionCard = document.createElement('p');
        descriptionCard.textContent = this.description;

        const subtitleTwoCard = document.createElement('h3');
        subtitleTwoCard.textContent = 'INGRÉDIENTS';

        bodyCard.appendChild(titleCard);
        bodyCard.appendChild(subtitleOneCard);
        bodyCard.appendChild(descriptionCard);
        bodyCard.appendChild(subtitleTwoCard);


        const smallGridCard = document.createElement('div');
        smallGridCard.classList.add('small-grid');

        // Ajout des ingrédients à la carte
        this.ingredientsList.forEach((item) => {

            const detailsCard = document.createElement('div');

            const title = document.createElement('h4');
            title.textContent = item.ingredient;

            const span = document.createElement('span');
            span.textContent = `${item.quantity || '-'}${item.unit || ''}`.trim();

            detailsCard.appendChild(title);
            detailsCard.appendChild(span);

            smallGridCard.appendChild(detailsCard);
            bodyCard.appendChild(smallGridCard);
        
        });

        recipeCard.appendChild(bodyCard);

        // Retourne la carte pour l'ajouter au DOM
        return recipeCard;  

    }
}