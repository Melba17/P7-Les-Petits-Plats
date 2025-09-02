/*
// searchVersion2.js : GESTION DE LA BARRE DE RECHERCHE PRINCIPALE

import { showRecipeCards, updateRecipeCounter, showError } from './ui.js';  
import { filterAndShowRecipes } from './filter.js'; 
import { updateDropdownOptions } from './dropdown.js'; 
import { setMainSearchResults } from './state.js';
import { getData } from '../main.js';

let typingTimer; // Timer (minuteur) utilisé pour détecter quand l'utilisateur a fini de taper
const typingInterval = 500; // Intervalle/délai en millisecondes avant d'exécuter la recherche ou message d'erreur


///////////////////////////////////////////////////////////////////////////////////////
  VERSION N°2 AVEC filter() - GESTION DE L'INPUT DE LA BARRE DE RECHERCHE
  (remplace la version n°1 à base de boucles for imbriquées)
/////////////////////////////////////////////////////////////////////////////////////// 
export function handleSearchInput() {
    const recipes = getData();  // Récupère les recettes via la fonction `getData`

    const searchInput = document.querySelector('.searchbar');  // Sélectionne la barre de recherche principale
    const crossIcon = document.querySelector('.cross-icon');  // Sélectionne l'icône de la croix pour réinitialiser la recherche

    searchInput.addEventListener('input', function () {
        clearTimeout(typingTimer); // Annule le précédent timer dès que l'utilisateur retape
        typingTimer = setTimeout(() => { // Lance la recherche après 500 ms de pause de frappe
        
            const query = searchInput.value.toLowerCase().trim();  // Récupère la valeur de la barre de recherche et la nettoie

            const errorContainer = document.querySelector('.error-container');  // Sélectionne le conteneur pour afficher les messages d'erreur
            if (errorContainer) {
                errorContainer.innerHTML = '';  // Efface le message d'erreur avant une nouvelle recherche
            }

            // Règle métier : moins de 3 caractères => on réinitialise tout
            if (query.length < 3) {
                setMainSearchResults(null);
                showRecipeCards(recipes);
                updateRecipeCounter();              // valeur par défaut (ex: 1500)
                updateDropdownOptions(recipes);
                filterAndShowRecipes();             // réinitialise les filtres secondaires
                return;
            }
            
            const terms = extractSearchTerms(query);  // Extrait les différents termes de la requête

            ////////////////////// VERSION N°2 DE TRI /////////////////////////////////////////////////
            // Objectif : garder uniquement les recettes qui "matchent" TOUS les termes saisis.
            // Outils :
            // - recipes.filter(...)    => sélectionne les éléments qui vérifient un prédicat
            // - terms.every(...)       => impose que CHAQUE terme corresponde quelque part dans la recette
            // - array.some(...)        => vérifie qu'AU MOINS un élément du tableau correspond (ici, un ingrédient)
            //
            // Détail de la correspondance pour un terme :
            // - On génère ses variantes singulier/pluriel (ex : "tomate" ↔ "tomates").
            // - On cherche une correspondance PARTIELLE (includes) à partir de 3 caractères dans :
            //     • le nom (recipe.name)
            //     • la description (recipe.description)
            //     • OU au moins un ingrédient (recipe.ingredients[].ingredient)
            const filteredRecipes = recipes.filter((recipe) => {
                // Normalisation défensive : on évite les erreurs si certaines propriétés sont manquantes
                const name = (recipe?.name || '').toLowerCase();
                const description = (recipe?.description || '').toLowerCase();
                const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];

                // La recette est conservée si POUR CHAQUE terme,
                // on trouve le singulier OU le pluriel dans le nom, la description ou les ingrédients.
                return terms.every((term) => {
                    const { singular, plural } = getSingularAndPluralForms(term);

                    // Correspondance dans le nom
                    const nameMatch =
                        name.includes(singular) || name.includes(plural);

                    // Correspondance dans la description
                    const descriptionMatch =
                        description.includes(singular) || description.includes(plural);

                    // Correspondance dans AU MOINS un ingrédient
                    const ingredientsMatch = ingredients.some((ing) => {
                        const label = (ing?.ingredient || '').toLowerCase();
                        return label.includes(singular) || label.includes(plural);
                    });

                    // Si l'un des trois blocs matche, le terme est validé pour cette recette
                    return nameMatch || descriptionMatch || ingredientsMatch;
                });
            });

            // Affichage des recettes filtrées
            if (filteredRecipes.length > 0) {
                setMainSearchResults(filteredRecipes);     // Enregistre les recettes filtrées (état principal)
                updateDropdownOptions(filteredRecipes);     // Met à jour les options du menu déroulant
                showRecipeCards(filteredRecipes);           // Affiche les cartes
                updateRecipeCounter(filteredRecipes.length);// Met à jour le compteur
            } else {
                setMainSearchResults([]);                   // Aucun résultat
                showRecipeCards([]);                        // Vide la grille
                updateDropdownOptions([]);                  // Vide les options
                updateRecipeCounter(0);                     // Compteur à 0
                showError(document.querySelector('.error-container'), query); // Message d'erreur
            }
        }, typingInterval);
    });

    // Pour gérer la croix de la barre de recherche principale
    if (searchInput && crossIcon) {
        searchInput.addEventListener('input', () => {
            crossIcon.classList.toggle('visible', searchInput.value.length > 2);  // Affiche ou cache la croix selon la longueur du texte
        });
    }

    crossIcon.addEventListener('click', () => {
        searchInput.value = '';                  // Réinitialise la barre de recherche
        crossIcon.classList.remove('visible');   // Cache la croix
        setMainSearchResults(null);              // Réinitialise l'état
        updateRecipeCounter();                   // Réinitialise le compteur
        showRecipeCards(recipes);                // Affiche toutes les recettes
        updateDropdownOptions(recipes);          // Met à jour le menu déroulant
        filterAndShowRecipes();                  // Réinitialise les filtres secondaires

        // Efface le message d'erreur en cas de réinitialisation
        const errorContainer = document.querySelector('.error-container');
        if (errorContainer) {
            errorContainer.innerHTML = '';
        }
    });
}

////////////////////////////////////////////////
   GÉNÉRATION DES FORMES SINGULIÈRE ET PLURIELLE
//////////////////////////////////////////////// 
// Fonction qui génère les formes singulière et plurielle d'un terme donné
function getSingularAndPluralForms(term) {
    if (term.endsWith('s')) {  // Si le terme se termine par un "s", on assume qu'il est au pluriel
        return {
            singular: term.slice(0, -1),  // La forme singulière est obtenue en retirant le dernier "s"
            plural: term  // La forme plurielle est le terme tel quel
        };
    } else {
        return {
            singular: term,  // La forme singulière est le terme tel quel
            plural: term + 's'  // La forme plurielle est obtenue en ajoutant un "s"
        };
    }
}

//////////////////////////////////////////
   EXTRACTION DES TERMES DE RECHERCHE
///////////////////////////////////////////
// Fonction qui extrait les termes individuels (mots ou groupes de mots) d'une chaîne de caractères
function extractSearchTerms(query) {
    const terms = []; // Tableau qui va stocker les termes extraits
    let currentTerm = ''; // Variable pour accumuler chaque terme
    
    for (let i = 0; i < query.length; i++) {
        const char = query[i]; // Récupère chaque caractère de la chaîne de recherche
        if (char === ' ') { // Si un espace est rencontré, cela marque la fin d'un terme
            if (currentTerm) {
                terms.push(currentTerm.trim()); // Ajoute le terme au tableau après l'avoir nettoyé
                currentTerm = ''; // Réinitialise la variable pour le prochain terme
            }
        } else {
            currentTerm += char; // Ajoute le caractère actuel au terme en cours
        }
    }
    // Si il reste encore un terme non suivi d'un espace (dernier terme), on l'ajoute au tableau
    if (currentTerm) {
        terms.push(currentTerm.trim()); 
    }

    return terms; // Retourne la liste des termes extraits
}
*/