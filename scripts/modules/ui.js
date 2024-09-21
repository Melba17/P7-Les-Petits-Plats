// ui.js : GESTION DE L'INTERFACE UTILISATEUR (AFFICHAGE DES RECETTES, MARGES, COMPTEUR, ETC.)

import { TemplateCards } from '../pattern/templateCard.js';
import { deselectItem, updateSelectedItems, filterAndShowRecipes } from './filter.js';

/* /////////////////////////////////////////////////
   AFFICHAGE DES CARTES DE RECETTES - VISUEL
//////////////////////////////////////////////// */
export function showRecipeCards(recipes) {
    const cardSection = document.querySelector(".grid");  // Sélectionne l'élément où les cartes de recettes seront affichées.
    if (cardSection) {
        cardSection.innerHTML = '';  // Vide la section des cartes pour éviter un empilement des anciennes cartes.
        recipes.forEach(recipe => {  // Pour chaque recette dans la liste `recipes`, crée et ajoute une nouvelle carte.
            const card = new TemplateCards(recipe);  // Crée une carte de recette à partir du template `TemplateCards`.
            cardSection.appendChild(card.display());  // Ajoute la carte à la section de la grille.
        });
    } else {
        console.error('.grid non trouvé');  // Affiche une erreur si l'élément `.grid` n'est pas trouvé.
    }
}

/* //////////////////////////////////////////
   MISE À JOUR DU COMPTEUR DE RECETTES
////////////////////////////////////////// */
export function updateRecipeCounter(count) {
    const counterElement = document.querySelector('.counter');  // Sélectionne l'élément du compteur de recettes.
    if (counterElement) {
        // Met à jour le texte du compteur en fonction du nombre de recettes. Si `count` est nul, affiche 1500.
        counterElement.textContent = count === null ? '1500 recettes' : `${count} recette${count > 1 ? 's' : ''}`;
    } else {
        console.error('.counter non trouvé');  // Affiche une erreur si l'élément `.counter` n'est pas trouvé.
    }
}

/* //////////////////////////////////////////
   GESTION DE L'ICÔNE DU MENU DÉROULANT
////////////////////////////////////////// */
// Fonction qui gère l'icône de flèche dans le menu déroulant
export function toggleDropdownIcon(button, isExpanded) {
    button.setAttribute('aria-expanded', !isExpanded);  // Inverse l'état du menu (ouvert/fermé)
    const icon = button.querySelector('.dropdown-icon');
    icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';  // Fait pivoter l'icône de flèche
    const content = button.nextElementSibling;
    content.style.display = isExpanded ? 'none' : 'block';  // Affiche ou cache le contenu du menu
}

/* //////////////////////////////////////////
   FERMETURE DES MENUS DÉROULANTS
////////////////////////////////////////// */
export function closeDropdown() {
    const dropdowns = ['#dropdownIngredientsButton', '#dropdownAppliancesButton', '#dropdownUstensilsButton'];  // Liste des boutons de menus déroulants.
    dropdowns.forEach(selector => {
        const button = document.querySelector(selector);  // Sélectionne chaque bouton de menu déroulant.
        if (button) {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';  // Vérifie si le menu est ouvert.
            if (isExpanded) {
                toggleDropdownIcon(button, true);  // Bascule la flèche vers l'état fermé.
            }
            button.setAttribute("aria-expanded", "false");  // Change l'attribut pour marquer le menu comme fermé.
            button.classList.remove('show');  // Retire la classe `show` pour fermer le menu visuellement.
            const content = document.querySelector(`${selector.replace('Button', '')} .dropdown-content`);  // Sélectionne le contenu du menu déroulant...
            if (content) {
                content.style.display = 'none';  // ...et le cache.
            }
        }
    });
}


/* //////////////////////////////////////////////////////////////////
   AJOUT D'UNE ICÔNE DE SUPPRESSION SUR UN ÉLÉMENT SÉLECTIONNÉ
///////////////////////////////////////////////////////////////// */
// Fonction pour ajouter une icône de suppression à un élément sélectionné
export function addRemoveIcon(itemElement, type, item) {
    const removeIcon = document.createElement('i');  // Crée un élément icône
    removeIcon.className = 'fa-solid fa-circle-xmark remove-icon';  // Définit la classe de l'icône
    removeIcon.setAttribute('aria-label', 'Supprimer la sélection');  // Ajoute une description ARIA pour l'accessibilité

    // Gère l'événement de clic sur l'icône de suppression
    removeIcon.addEventListener('click', e => {
        e.stopPropagation();  // Empêche la propagation du clic vers d'autres éléments
        deselectItem(type, item);  // Désélectionne l'élément
        itemElement.classList.remove('choice-item');  // Retire la mise en évidence de l'élément sélectionné
        removeRemoveIcon(itemElement);  // Supprime l'icône de suppression
        updateSelectedItems();  // Met à jour visuellement les éléments sous les filtres
        filterAndShowRecipes();  // Réapplique les filtres et affiche les recettes
    });

    itemElement.appendChild(removeIcon);  // Ajoute l'icône à l'élément
}

/* //////////////////////////////////////////
   SUPPRESSION DE L'ICÔNE DE SUPPRESSION
////////////////////////////////////////// */
// Fonction pour supprimer l'icône de suppression d'un élément
export function removeRemoveIcon(itemElement) {
    const removeIcon = itemElement.querySelector('.remove-icon');  // Sélectionne l'icône de suppression
    if (removeIcon) {
        removeIcon.remove();  // Supprime l'icône si elle est présente
    }
}


/* //////////////////////////////////////////
   AJUSTEMENT DE LA MARGE DE LA GRILLE
////////////////////////////////////////// */
export function adjustGridMargin() {
    const grid = document.querySelector('.grid');  // Sélectionne la grille des cartes de recettes.
    if (grid) {
        grid.style.marginTop = '30px';  // Ajuste la marge supérieure de la grille.
    } else {
        console.log('.grid non trouvé');  // Affiche une erreur si l'élément `.grid` n'est pas trouvé.
    }
}

/* //////////////////////////////////////////
   AFFICHAGE D'UN MESSAGE D'ERREUR
////////////////////////////////////////// */
export function showError(container, query) {
    // Si aucun conteneur d'erreur n'est passé, essaie de trouver un conteneur existant, sinon en crée un nouveau.
    if (!container) {
        let existingContainer = document.querySelector('.error-container');  // Cherche un conteneur d'erreur existant.
        if (!existingContainer) {
            existingContainer = document.createElement('div');  // Crée un nouveau conteneur s'il n'en existe pas.
            existingContainer.className = 'error-container';  // Attribue la classe `error-container`.
            document.body.appendChild(existingContainer);  // Ajoute le conteneur d'erreur au corps du document.
        }
        container = existingContainer;  // Utilise le conteneur existant ou créé.
    }

    const errorMessage = document.createElement('div');  // Crée un div pour le message d'erreur.
    errorMessage.className = 'error-message';  // Ajoute la classe `error-message` pour le styliser.

    const messageText = document.createElement('span');  // Crée un span pour le texte du message d'erreur.
    messageText.textContent = "Aucune recette ne contient ";  // Définit le texte principal du message d'erreur.
    errorMessage.appendChild(messageText);  // Ajoute le texte principal au message d'erreur.

    const errorQuery = document.createElement('span');  // Crée un span pour l'élément causant l'erreur 
    errorQuery.className = 'error-item';  // Ajoute la classe `error-item` pour styliser cet élément.
    errorQuery.textContent = query;  // Définit le texte de l'élément en erreur (ce qui a été recherché).
    errorMessage.appendChild(errorQuery);  // Ajoute l'élément en erreur au message.

    const additionalText = document.createElement('span');  // Crée un span pour ajouter un texte supplémentaire après l'élément en erreur.
    additionalText.textContent = ". Essayez une autre recherche svp.";  // Définit le texte supplémentaire.
    errorMessage.appendChild(additionalText);  // Ajoute le texte supplémentaire au message d'erreur.

    container.innerHTML = '';  // Vide le conteneur d'erreur existant pour éviter d'afficher plusieurs erreurs en même temps.
    container.appendChild(errorMessage);  // Ajoute le nouveau message d'erreur au conteneur.
}
