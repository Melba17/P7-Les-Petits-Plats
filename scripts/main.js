// Importation des modules
import { recipes } from './api/recipes.js';
import { TemplateCards } from './pattern/templateCard.js';
import { createFiltersButtons } from './utils/dropdowns.js';

////////////////////////// ROLE DU FICHIER MAIN.JS ///////////////////////////////////////////////////////////////////////////
/////// Filtrage des recettes : Il choisit quelles recettes afficher en fonction des filtres que l'utilisateur a sélectionnés.
/////// Affichage des recettes : Il montre les recettes sur la page.
/////// Gestion des sélections : Il garde une trace des ingrédients, appareils et ustensiles que l'utilisateur a sélectionnés pour filtrer les recettes.
/////// EN BREF : s’occupe de quoi afficher (les recettes filtrées) et comment les afficher en fonction des choix de l'utilisateur.

// Variables globales pour stocker les sélections
let selectedIngredients = [];
let selectedAppliances = [];
let selectedUstensils = [];

// Fonction pour récupérer les données des recettes
function getData() {
    return recipes;  // Retourne les recettes importées
}

// Fonction pour afficher les cartes de recettes
function showRecipeCards(recipes) {
    const cardSection = document.querySelector(".grid");
    if (cardSection) {
        cardSection.innerHTML = ''; // Vide la section des cartes avant d'ajouter les nouvelles cartes

        recipes.forEach(recipe => {
            const card = new TemplateCards(recipe);
            cardSection.appendChild(card.display());
        });

        // Supprimer le message d'erreur si des recettes sont affichées
        const errorMessage = document.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    } else {
        console.error('.grid non trouvé');
    }
}

// Fonction pour afficher le message d'erreur
function showError() {
    const cardSection = document.querySelector(".grid");
    if (cardSection) {
        cardSection.innerHTML = ''; // Vide la section des cartes

        // Créer le message d'erreur
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = 'Aucune recette ne correspond à votre recherche <i class="fa-solid fa-xmark cross-item" aria-label="fermer le message"></i>';

        // Ajouter l'événement pour fermer le message
        errorMessage.querySelector('.cross-item').addEventListener('click', () => {
            errorMessage.remove();
        });

        cardSection.appendChild(errorMessage);
    } else {
        console.error('.grid non trouvé pour afficher le message d\'erreur');
    }
}

// Fonction pour mettre à jour le compteur de recettes
function updateRecipeCounter(count) {
    // Sélectionne l'élément HTML avec la classe '.counter'
    const counterElement = document.querySelector('.counter');
    
    // Vérifie si l'élément '.counter' existe sur la page
    if (counterElement) {
        // Si la valeur de 'count' est 'null' (ce qui signifie que aucun filtre n'est appliqué)
        if (count === null) {
            // Met à jour le texte de l'élément '.counter' avec le texte par défaut "1500 recettes"
            counterElement.textContent = '1500 recettes';
        } else {
            // Sinon, 'count' contient le nombre de recettes restantes après application des filtres
            // Met à jour le texte de l'élément '.counter' avec le nombre de recettes et ajuste le texte pour le pluriel
            counterElement.textContent = `${count} recette${count > 1 ? 's' : ''}`;
        }
    } else {
        console.error('.counter non trouvé');
    }
}

// Fonction responsable du filtrage des recettes en fonction des sélections faites par l'utilisateur et de l'affichage des cartes recettes restantes
function filterAndShowRecipes() {
    // Appelle la fonction getData() pour récupérer les données des recettes
    const data = getData();
    
    // Filtre les recettes en fonction des sélections effectuées
    const filteredRecipes = data.filter(recipe =>
        // Vérifie si chaque ingrédient sélectionné est présent dans les ingrédients de la recette
        selectedIngredients.every(ingredient =>
            recipe.ingredients.some(ing => ing.ingredient.toLowerCase() === ingredient.toLowerCase())
        ) &&
        // Vérifie si chaque appareil sélectionné est présent dans l'appareil de la recette
        selectedAppliances.every(appliance =>
            recipe.appliance.toLowerCase() === appliance.toLowerCase()
        ) &&
        // Vérifie si chaque ustensile sélectionné est présent dans les ustensiles de la recette
        selectedUstensils.every(ustensil =>
            recipe.ustensils.some(ust => ust.toLowerCase() === ustensil.toLowerCase())
        )
    );

    if (filteredRecipes.length > 0) {
        // Affiche les cartes de recettes filtrées
        showRecipeCards(filteredRecipes);
    } else {
        showError(); // Affiche le message d'erreur si aucune recette n'est trouvée
    }
    
    // Met à jour le compteur de recettes avec le nombre de recettes filtrées
    updateRecipeCounter(filteredRecipes.length);
}

// Fonction gère l'ajout ou la suppression des ingrédients dans la liste des sélections faite par l'utilisateur sous les boutons de filtres = gestion uniquement  de la liste des items choisis par l'utilisateur (le visuel lui est gérer par function updateSelectedItems() plus bas )
function selectIngredient(ingredient) {
    // Convertit l'ingrédient sélectionné en minuscules pour uniformiser la comparaison
    const index = selectedIngredients.indexOf(ingredient.toLowerCase());
    
    // Vérifie si l'ingrédient est déjà dans la liste des ingrédients sélectionnés
    if (index === -1) {
        // Si l'ingrédient n'est pas trouvé dans la liste, l'ajoute
        selectedIngredients.push(ingredient.toLowerCase());
    } else {
        // Si l'ingrédient est déjà dans la liste, le retire
        selectedIngredients.splice(index, 1);
    }
    
    // Vérifie si au moins une des sélections (ingrédients, appareils, ustensiles) est non vide
    if (selectedIngredients.length || selectedAppliances.length || selectedUstensils.length) {
        // Si des filtres sont appliqués, filtre et affiche les recettes
        filterAndShowRecipes();
    } else {
        // Si aucun filtre n'est appliqué, affiche toutes les recettes et réinitialise le compteur
        showRecipeCards(getData());
        updateRecipeCounter(null); // Réinitialise le compteur pour afficher le texte par défaut
    }
    
    // Met à jour l'affichage des éléments sélectionnés sous les boutons de filtre
    updateSelectedItems();
    
    // Ajuste la marge de la grille pour tenir compte des changements
    adjustGridMargin();
    
    // Ferme les menus déroulants ouverts
    closeDropdown();
}

// Fonction pour gérer la sélection des appareils
function selectAppliance(appliance) {
    const index = selectedAppliances.indexOf(appliance.toLowerCase());
    if (index === -1) {
        selectedAppliances.push(appliance.toLowerCase());
    } else {
        selectedAppliances.splice(index, 1);
    }
    if (selectedIngredients.length || selectedAppliances.length || selectedUstensils.length) {
        filterAndShowRecipes();
    } else {
        showRecipeCards(getData());
        updateRecipeCounter(null); // Réinitialise le compteur pour afficher le texte par défaut
    }
    updateSelectedItems();
    adjustGridMargin();
    closeDropdown();
}

// Fonction pour gérer la sélection des ustensiles
function selectUstensil(ustensil) {
    const index = selectedUstensils.indexOf(ustensil.toLowerCase());
    if (index === -1) {
        selectedUstensils.push(ustensil.toLowerCase());
    } else {
        selectedUstensils.splice(index, 1);
    }
    if (selectedIngredients.length || selectedAppliances.length || selectedUstensils.length) {
        filterAndShowRecipes();
    } else {
        showRecipeCards(getData());
        updateRecipeCounter(null); // Réinitialise le compteur pour afficher le texte par défaut
    }
    updateSelectedItems();
    adjustGridMargin();
    closeDropdown();
}

// Fonction pour mettre à jour et fermer les menus déroulants des filtres
function closeDropdown() {
    // Définit un tableau de sélecteurs CSS pour les boutons de menu déroulant = cible les éléments par leur ID
    const dropdowns = ['#dropdownIngredientsButton', '#dropdownAppliancesButton', '#dropdownUstensilsButton'];
    
    // Itère sur chaque sélecteur dans le tableau
    dropdowns.forEach(selector => {
        // Sélectionne le bouton du menu déroulant correspondant au sélecteur actuel
        const button = document.querySelector(selector);
        
        // Vérifie si le bouton a été trouvé dans le DOM
        if (button) {
            // Désactive l'attribut 'aria-expanded' pour indiquer que le menu est fermé
            button.setAttribute("aria-expanded", "false");
            
            // Supprime la classe 'show' pour masquer visuellement le menu déroulant
            button.classList.remove('show');
            
            // Sélectionne le contenu du menu déroulant en remplaçant 'Button' par une chaîne vide dans le sélecteur
            const content = document.querySelector(`${selector.replace('Button', '')} .dropdown-content`);
            
            // Vérifie si le contenu du menu déroulant a été trouvé
            if (content) {
                // Cache le contenu du menu déroulant en définissant son style 'display' à 'none'
                content.style.display = 'none';
            }
        }
    });
}

// Fonction pour ajuster la marge de la grille
function adjustGridMargin() {
    const grid = document.querySelector('.grid');
    if (grid) {
        grid.style.marginTop = '30px'; // Ajuste la marge en haut de la grille
    } else {
        console.log('.grid non trouvé');
    }
}

// Fonction pour mettre à jour l'affichage des éléments sélectionnés sous les boutons de filtres = s'occupe du visuel de la liste uniquement
function updateSelectedItems() {
    const optionsContainer = document.querySelector('.options-container') || createOptionsContainer();
    optionsContainer.innerHTML = ''; // Vide le conteneur avant d'ajouter les éléments sélectionnés

    selectedIngredients.forEach(ingredient => {
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-item';
        selectedItem.style.display = 'block'; // Assure que l'élément est visible

        const textContainer = document.createElement('span');
        textContainer.className = 'option-text';
        textContainer.textContent = ingredient;
        selectedItem.appendChild(textContainer);

        const closeIcon = document.createElement('i');
        closeIcon.className = 'fa-solid fa-xmark cross-item';
        closeIcon.setAttribute('aria-label', 'Supprimer la sélection');

        closeIcon.addEventListener('click', () => {
            selectIngredient(ingredient); // Utilise selectIngredient pour retirer l'ingrédient
        });

        selectedItem.appendChild(closeIcon);
        optionsContainer.appendChild(selectedItem);
    });

    selectedAppliances.forEach(appliance => {
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-item';
        selectedItem.style.display = 'block'; // Assure que l'élément est visible

        const textContainer = document.createElement('span');
        textContainer.className = 'option-text';
        textContainer.textContent = appliance;
        selectedItem.appendChild(textContainer);

        const closeIcon = document.createElement('i');
        closeIcon.className = 'fa-solid fa-xmark cross-item';
        closeIcon.setAttribute('aria-label', 'Supprimer la sélection');

        closeIcon.addEventListener('click', () => {
            selectAppliance(appliance); // Utilise selectAppliance pour retirer l'appareil
        });

        selectedItem.appendChild(closeIcon);
        optionsContainer.appendChild(selectedItem);
    });

    selectedUstensils.forEach(ustensil => {
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-item';
        selectedItem.style.display = 'block'; // Assure que l'élément est visible

        const textContainer = document.createElement('span');
        textContainer.className = 'option-text';
        textContainer.textContent = ustensil;
        selectedItem.appendChild(textContainer);

        const closeIcon = document.createElement('i');
        closeIcon.className = 'fa-solid fa-xmark cross-item';
        closeIcon.setAttribute('aria-label', 'Supprimer la sélection');

        closeIcon.addEventListener('click', () => {
            selectUstensil(ustensil); // Utilise selectUstensil pour retirer l'ustensile
        });

        selectedItem.appendChild(closeIcon);
        optionsContainer.appendChild(selectedItem);
    });
}

// Fonction pour créer le conteneur des éléments sélectionnés si nécessaire
function createOptionsContainer() {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    const flexContainer = document.querySelector('.flex');
    if (flexContainer) {
        flexContainer.parentNode.insertBefore(optionsContainer, flexContainer.nextSibling);
    } else {
        console.error('.flex non trouvé pour créer le conteneur');
    }
    return optionsContainer;
}

///// Fonction d'initialisation principale pour gérer l'affichage initial des recettes et des filtres
function initialize() {
    const data = getData();  // Appelle getData() une seule fois et stockage du résultat dans une variable
    showRecipeCards(data);  // Affiche les cartes avec toutes les recettes
    updateRecipeCounter(null);  // Initialise le compteur avec le texte par défaut
    createFiltersButtons(data, selectIngredient, selectAppliance, selectUstensil);  // Crée les boutons de filtres
}

initialize();  // Appelle la fonction d'initialisation
