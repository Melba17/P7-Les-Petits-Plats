// searchVersion1.js : GESTION DE LA BARRE DE RECHERCHE PRINCIPALE

import { showRecipeCards, updateRecipeCounter, showError } from './ui.js';  
import { filterAndShowRecipes } from './filter.js'; 
import { updateDropdownOptions } from './dropdown.js'; 
import { setMainSearchResults } from './state.js';
import { getData } from '../main.js';

let typingTimer;  // Timer utilisé pour détecter quand l'utilisateur a fini de taper
const typingInterval = 500;  // Intervalle en millisecondes avant d'exécuter la recherche

/* ///////////////////////////////////////////////////////////////////////////////////////////////
   VERSION N°2 AVEC FILTER() ET SOME() - GESTION DE L'INPUT DE LA BARRE DE RECHERCHE PRINCIPALE 
/////////////////////////////////////////////////////////////////////////////////////////////// */

export function handleSearchInput() {
    const recipes = getData();  // Récupère les recettes via la fonction `getData`

    const searchInput = document.querySelector('.searchbar');  // Sélectionne la barre de recherche principale
    const crossIcon = document.querySelector('.cross-icon');  // Sélectionne l'icône de la croix pour réinitialiser la recherche

    searchInput.addEventListener('input', function () {
        clearTimeout(typingTimer);  // Annule le précédent timer dès que l'utilisateur commence à taper

        typingTimer = setTimeout(() => {  // Lance un timer après que l'utilisateur a fini de taper
            const query = searchInput.value.toLowerCase().trim();  // Récupère la valeur de la barre de recherche et la nettoie

            const errorContainer = document.querySelector('.error-container');  // Sélectionne le conteneur pour afficher les messages d'erreur
            if (errorContainer) {
                errorContainer.innerHTML = '';  // Efface le message d'erreur avant d'exécuter une nouvelle recherche
            }

            if (query.length < 3) {  // Si la requête contient moins de 3 caractères, on réinitialise
                setMainSearchResults(null);  // Réinitialise les résultats de recherche
                showRecipeCards(recipes);  // Affiche toutes les recettes
                updateRecipeCounter(1500);  // Réinitialise le compteur à 1500
                updateDropdownOptions(recipes);  // Met à jour les options du menu déroulant
                filterAndShowRecipes();  // Réinitialise les filtres
                return;
            }

            const terms = extractSearchTerms(query);  // Extrait les différents termes de la requête
           
            /////////////////// VERSION N°2 DE TRI ///////////////////////////////
            // Filtrer les recettes en utilisant filter() et some()
            const filteredRecipes = recipes.filter(recipe => {
                return terms.every(term => {
                    const { singular, plural } = getSingularAndPluralForms(term);

                    // Tester si le terme (singulier/pluriel) est trouvé dans le titre, les ingrédients ou la description
                    const termPatternSingular = new RegExp(`\\b${singular}\\b`, 'i');
                    const termPatternPlural = new RegExp(`\\b${plural}\\b`, 'i');

                    // Vérifier le titre
                    const titleMatch = termPatternSingular.test(recipe.name) || termPatternPlural.test(recipe.name);

                    // Vérifier les ingrédients avec some()
                    const ingredientMatch = recipe.ingredients.some(ingredient => 
                        termPatternSingular.test(ingredient.ingredient) || termPatternPlural.test(ingredient.ingredient)
                    );

                    // Vérifier la description
                    const descriptionMatch = termPatternSingular.test(recipe.description) || termPatternPlural.test(recipe.description);

                    // Si le terme est trouvé dans l'un de ces trois champs, retourner true
                    return titleMatch || ingredientMatch || descriptionMatch;
                });
            });

            // Affichage des recettes filtrées
            if (filteredRecipes.length > 0) {
                setMainSearchResults(filteredRecipes);  // Enregistre les recettes filtrées
                updateDropdownOptions(filteredRecipes);  // Met à jour les options du menu déroulant
                showRecipeCards(filteredRecipes);  // Affiche les cartes des recettes filtrées
                updateRecipeCounter(filteredRecipes.length);  // Met à jour le compteur avec le nombre de recettes trouvées
            } else {
                setMainSearchResults([]);  // Si aucun résultat n'est trouvé
                showRecipeCards([]);  // Vide la grille des recettes
                updateDropdownOptions([]);  // Vide les options du menu déroulant
                updateRecipeCounter(0);  // Met le compteur à 0
                showError(document.querySelector('.error-container'), query);  // Affiche un message d'erreur
            }
        }, typingInterval);  // Le délai avant l'exécution de la recherche est défini à 500ms
    });

    // Pour gérer la croix de la barre de recherche principale
    if (searchInput && crossIcon) {
        searchInput.addEventListener('input', () => {
        crossIcon.classList.toggle('visible', searchInput.value.length > 2);  // Affiche ou cache la croix selon la longueur du texte
        });
    }

    crossIcon.addEventListener('click', () => {
    searchInput.value = '';  // Réinitialise la barre de recherche
    crossIcon.classList.remove('visible');  // Cache la croix
    setMainSearchResults(null);  // Réinitialise les résultats de recherche
    updateRecipeCounter(1500);  // Réinitialise le compteur
    showRecipeCards(recipes);  // Affiche toutes les recettes
    updateDropdownOptions(recipes);  // Met à jour les options du menu déroulant
    filterAndShowRecipes();  // Réinitialise les filtres

        // Efface le message d'erreur en cas de réinitialisation
        const errorContainer = document.querySelector('.error-container');
        if (errorContainer) {
        errorContainer.innerHTML = '';  // Vide le conteneur d'erreur
        }
    });
}


/* ////////////////////////////////////////////////
   GÉNÉRATION DES FORMES SINGULIÈRE ET PLURIELLE
//////////////////////////////////////////////// */
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

/* //////////////////////////////////////////
   EXTRACTION DES TERMES DE RECHERCHE
////////////////////////////////////////// */
// Fonction qui extrait les termes individuels (mots ou groupes de mots) d'une chaîne de caractères
function extractSearchTerms(query) {
    const terms = [];  // Tableau qui va stocker les termes extraits
    let currentTerm = '';  // Variable pour accumuler chaque terme

    for (let i = 0; i < query.length; i++) {
        const char = query[i];  // Récupère chaque caractère de la chaîne de recherche
        if (char === ' ') {  // Si un espace est rencontré, cela marque la fin d'un terme
            if (currentTerm) {
                terms.push(currentTerm.trim());  // Ajoute le terme au tableau après l'avoir nettoyé
                currentTerm = '';  // Réinitialise la variable pour le prochain terme
            }
        } else {
            currentTerm += char;  // Ajoute le caractère actuel au terme en cours
        }
    }

    if (currentTerm) {
        terms.push(currentTerm.trim());  // Ajoute le dernier terme s'il n'est pas suivi d'un espace
    }

    return terms;  // Retourne la liste des termes extraits
}
