// filter.js : gère la logique de filtrage des recettes et l'état des filtres sélectionnés, en bref, applique les filtres aux recettes.

import { showRecipeCards, updateRecipeCounter, adjustGridMargin, addRemoveIcon } from './ui.js';
import { updateDropdownOptions } from './dropdown.js';
import { closeDropdown } from './ui.js';
import { getMainSearchResults } from './state.js';
import { getData } from '../main.js';

// Variables qui stockent les éléments sélectionnés par l'utilisateur dans les menus déroulants
let selectedIngredients = [];
let selectedAppliances = [];
let selectedUstensils = [];

let lastSelectedFilter = null;  // Dernier filtre sélectionné
let isGridMarginAdjusted = false;  // Indique si la marge de la grille a été ajustée

/* /////////////////////////////////////////////
   OBTENIR LA LISTE DES ÉLÉMENTS SÉLECTIONNÉS
//////////////////////////////////////////// */
function getSelectedList(type) {
    switch (type) {
        case 'ingredient': 
            return selectedIngredients;  // Retourne la liste des ingrédients sélectionnés
        case 'appliance': 
            return selectedAppliances;  // Retourne la liste des appareils sélectionnés
        case 'ustensil': 
            return selectedUstensils;  // Retourne la liste des ustensiles sélectionnés
        default: 
            console.error('Type de filtre inconnu:', type);  // Affiche une erreur si le type est inconnu
            return [];
    }
}

/* /////////////////////////////////////////////
   VÉRIFICATION SI UN ÉLÉMENT EST SÉLECTIONNÉ
/////////////////////////////////////////////*/
export function isItemSelected(type, item) {
    const selectedList = getSelectedList(type);  // Récupère la liste des éléments sélectionnés pour le type donné
    return selectedList.includes(item.toLowerCase());  // Retourne vrai si l'élément est sélectionné
}

/* //////////////////////////////////////////////
   MISE À JOUR DU DERNIER FILTRE SÉLECTIONNÉ
///////////////////////////////////////////// */
function updateLastSelectedFilter(filter) {
 lastSelectedFilter = filter;  // Met à jour la variable avec le dernier filtre sélectionné
}

/* //////////////////////////////////////////
            SÉLECTION D'UN FILTRE
////////////////////////////////////////// */
// Fonction qui met en forme la liste contenue dans le filtre sélectionné
function selectFilter(type, item, recipes) {
    const selectedList = getSelectedList(type);  // Récupère la liste des éléments sélectionnés pour le type donné
    const lowerItem = item?.toLowerCase();  // Convertit l'élément en minuscule / ? vérifie si item n'est pas null ou undefined avant de lancer la méthode toLowerCase()
    const index = selectedList.indexOf(lowerItem);  // Cherche l'index de l'élément dans la liste grâce à indexOf

    // Si l'élément n'est pas trouvé (-1)...
    if (index === -1) {
        selectedList.push(lowerItem);  // ...Ajoute l'élément 
        updateLastSelectedFilter(item);  // Met à jour le dernier filtre sélectionné
    } else {
        selectedList.splice(index, 1);  // Supprime (splice) l'élément s'il est déjà sélectionné à l'index en question
        updateLastSelectedFilter(selectedList.length > 0 ? selectedList[selectedList.length - 1] : null);  // Met à jour la liste du filtre sélectionné jusqu'à son dernier élément
    }

    filterAndShowRecipes(recipes);  // Filtre et affiche les recettes
    updateSelectedItems();  // Met à jour les éléments visuels sous les filtres
    adjustGridMargin();  // Ajuste la marge de la grille
    closeDropdown();  // Ferme le menu déroulant
}

/* ///////////////////////////////////////////////////////
     SÉLECTION D'UN ÉLÉMENT DANS UNE LISTE DEROULANTE
////////////////////////////////////////////////////// */
// Fonction qui met en évidence l'item sélectionné par l'utilisateur
export function selectItem(type, item, recipes) {
    selectFilter(type, item, recipes);  // Sélectionne et applique le filtre pour l'élément donné
    const itemElement = document.querySelector(`.item[data-value="${item.toLowerCase()}"]`);  // Sélectionne l'élément dans le DOM
    if (itemElement) {
        itemElement.classList.add('choice-item');  // Ajoute la classe pour mettre en évidence l'élément sélectionné
        addRemoveIcon(itemElement, item);  // Ajoute l'icône de suppression
    }
}

/* ////////////////////////////////////////////////////////////////
        DÉSÉLECTION D'UN ÉLÉMENT DANS LA LISTE DEROULANTE
//////////////////////////////////////////////////////////////// */
// Pour enlever la mise en évidence d'un item dans une liste déroulante
export function deselectItem(type, item) {
    const selectedList = getSelectedList(type);  // Récupère la liste des éléments sélectionnés pour le type donné
    const lowerItem = item.toLowerCase();  // Convertit l'élément en minuscule
    const index = selectedList.indexOf(lowerItem);  // Cherche l'index de l'élément dans la liste

    if (index !== -1) {
        // Supprime l'élément de la liste des filtres sélectionnés
        selectedList.splice(index, 1);  

        // Met à jour l'élément dans la liste déroulante (supprimer la classe `choice-item`)
        const itemElement = document.querySelector(`.item[data-value="${lowerItem}"]`);
        if (itemElement) {
            itemElement.classList.remove('choice-item');  // Retire la mise en évidence de l'élément
        }

        updateSelectedItems();  // Met à jour l'affichage les tags sélectionnés 
        filterAndShowRecipes();  // Réapplique les filtres restants et affiche les recettes

        // Si tous les filtres sont désélectionnés, réinitialise tout
        if (selectedIngredients.length === 0 && selectedAppliances.length === 0 && selectedUstensils.length === 0) {
            updateDropdownOptions(getData());  // Remet les listes déroulantes à leur état initial avec toutes les recettes
            showRecipeCards(getData());  // Affiche toutes les recettes
            updateRecipeCounter();  // Met à jour le compteur
            resetChoiceItems();  // Réinitialise l'état visuel des éléments sélectionnés
        }
    }
}


function resetChoiceItems() {
    const choiceItems = document.querySelectorAll('.choice-item');
    choiceItems.forEach(item => item.classList.remove('choice-item'));  // Supprime la classe 'choice-item' de tous les éléments
}


/* //////////////////////////////////////////
        MISES A JOUR GLOBALES
////////////////////////////////////////// */
// Fonctions qui mettent à jour et affichent aussi bien les filtres que les cartes recettes
// Raccourcis pour utiliser "selectFilter" dans chaque filtre ou simplification de son appel
export function selectIngredient(ingredient, recipes) {
    selectFilter('ingredient', ingredient, recipes);  
}

export function selectAppliance(appliance, recipes) {
    selectFilter('appliance', appliance, recipes);  
}

export function selectUstensil(ustensil, recipes) {
    selectFilter('ustensil', ustensil, recipes);  
}

/* //////////////////////////////////////////
    FILTRAGE ET AFFICHAGE DES RECETTES
////////////////////////////////////////// */
// Fonction qui gère les filtres supplémentaires, issus des menus déroulants, sur les résultats de la recherche principale faite par l'utilisateur
export function filterAndShowRecipes(recipes) {
    const mainSearchResults = getMainSearchResults();

    // Vérifie que 'recipes' est bien défini avant de l'utiliser
    const data = mainSearchResults !== null ? mainSearchResults : (recipes || getData());

    const filteredRecipes = data.filter(recipe =>
        selectedIngredients.every(ingredient =>
            recipe.ingredients.some(ing => ing.ingredient.toLowerCase() === ingredient.toLowerCase())
        ) &&
        selectedAppliances.every(appliance =>
            recipe.appliance.toLowerCase() === appliance.toLowerCase()
        ) &&
        selectedUstensils.every(ustensil =>
            recipe.ustensils.some(ust => ust.toLowerCase() === ustensil.toLowerCase())
        )
    );

    updateDropdownOptions(filteredRecipes);
    showRecipeCards(filteredRecipes);

    let recipeCount;
    if (selectedIngredients.length === 0 && selectedAppliances.length === 0 && selectedUstensils.length === 0) {
        recipeCount = mainSearchResults === null ? 1500 : mainSearchResults.length;
    } else {
        recipeCount = filteredRecipes.length;
    }

    updateRecipeCounter(recipeCount);

    // Ajuste la marge de la grille si nécessaire
    if (filteredRecipes.length === 0 || (selectedIngredients.length > 0 || selectedAppliances.length > 0 || selectedUstensils.length > 0)) {
        if (!isGridMarginAdjusted) {
            adjustGridMargin();  // Ajuste la marge de la grille
            isGridMarginAdjusted = true;  // Marque la grille comme ajustée
        }
    }
}

/* ////////////////////////////////////////////////
        CRÉATION DU CONTENEUR DES TAGS
/////////////////////////////////////////////// */
function createOptionsContainer() {
    const optionsContainer = document.createElement('div');  // Crée un nouveau conteneur
    optionsContainer.className = 'options-container';  // Définit la classe du conteneur
    const flexContainer = document.querySelector('.flex');  // Sélectionne l'élément flex (ligne des filtres)
    if (flexContainer) {
        flexContainer.parentNode.insertBefore(optionsContainer, flexContainer.nextSibling);  // Insère optionsContainer (tags) après flexContainer (boutons de filtres)
    } else {
        console.error('.flex non trouvé pour créer le conteneur');  // Affiche une erreur si l'élément flex n'est pas trouvé
    }
    return optionsContainer;
}

/* ////////////////////////////////////////////
   CRÉATION DES ÉLÉMENTS SÉLECTIONNÉS (TAGS)
//////////////////////////////////////////// */
// Mise en forme du tag
function createSelectedItems(type) {
    const selectedList = getSelectedList(type);  // Récupère la liste des éléments sélectionnés pour le type donné
    selectedList.forEach(item => {
        const selectedItem = document.createElement('div');  // Crée un nouveau div pour l'élément sélectionné
        selectedItem.className = 'selected-item';  // Définit la classe de l'élément
        selectedItem.tabIndex = '0';  // Rend l'élément focusable

        const textContainer = document.createElement('span');  // Crée un span pour le texte de l'élément
        textContainer.className = 'option-text';  // Définit la classe du texte
        textContainer.textContent = item;  // Définit le contenu textuel de l'élément

        const closeIcon = document.createElement('i');  // Crée l'icône de fermeture
        closeIcon.className = 'fa-solid fa-xmark cross-item';  // Définit la classe de l'icône
        closeIcon.setAttribute('aria-label', 'Supprimer la sélection');  // Définit l'attribut aria pour l'accessibilité
        closeIcon.addEventListener('click', () => {
            deselectItem(type, item);  // Supprime l'élément de la sélection
            updateSelectedItems();  // Met à jour l'affichage des éléments sélectionnés
            filterAndShowRecipes();  // Réapplique les filtres
        });

        // Ajoute la gestion des événements clavier pour désélectionner le tag
        selectedItem.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {  // Vérifie si la touche pressée est Enter ou Espace
                event.preventDefault();  // Empêche l'action par défaut
                deselectItem(type, item);  // Supprime l'élément de la sélection
                updateSelectedItems();  // Met à jour l'affichage des éléments sélectionnés
                filterAndShowRecipes();  // Réapplique les filtres
            }
        });

        selectedItem.appendChild(textContainer);  // Ajoute le texte à l'élément sélectionné
        selectedItem.appendChild(closeIcon);  // Ajoute l'icône de fermeture
        document.querySelector('.options-container').appendChild(selectedItem);  // Ajoute l'élément sélectionné au conteneur
    });
}

/* //////////////////////////////////////////////////
            MISE À JOUR DES TAGS 
///////////////////////////////////////////////// */
// Mise à jour des tags sous les filtres
export function updateSelectedItems() {
    const optionsContainer = document.querySelector('.options-container') || createOptionsContainer();  // Sélectionne ou crée le conteneur des éléments sélectionnés
    optionsContainer.innerHTML = '';  // Vide le conteneur

    // Crée et affiche les éléments sélectionnés pour chaque type/filtre (ingrédients, appareils, ustensiles)
    ['ingredient', 'appliance', 'ustensil'].forEach(createSelectedItems);
}

