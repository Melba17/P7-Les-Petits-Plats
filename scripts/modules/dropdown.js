// dropdown.js : gère l'interface et le comportement des menus déroulants où l'utilisateur sélectionne ces filtres, en bref, gère les menus de sélection des filtres.
import { selectItem, deselectItem, updateSelectedItems, filterAndShowRecipes, isItemSelected } from './filter.js';
import { getMainSearchResults } from './state.js';
import { toggleDropdownIcon, addRemoveIcon, removeRemoveIcon } from './ui.js';

/* ///////////////////////////////////////////////////////
   CRÉATION D'UN ÉLÉMENT DOM AVEC ATTRIBUTS ET ENFANTS 
/////////////////////////////////////////////////////// */
// Fonction qui crée un élément DOM avec ses attributs et enfants
function createElement(type, attributes = {}, children = []) {
    const element = document.createElement(type);  // Crée un élément pour un type donné
    // Méthode Object.keys(attributes) renvoie un tableau contenant les noms des propriétés (ou clés) d'un objet
    // element.setAttribute(attr, attributes[attr]) ajoute à l'élément HTML un attribut dont le nom attr correspond à la propriété en question, et attributes[attr] à la valeur de cette propriété
    Object.keys(attributes).forEach(attr => element.setAttribute(attr, attributes[attr]));  
    children.forEach(child => element.appendChild(child));  // Ajoute les enfants
    return element;  // Retourne l'élément créé
}


/* ////////////////////////////////////////////////////////////
    FONCTION POUR CRÉER VISUELLEMENT UN MENU DÉROULANT
//////////////////////////////////////////////////////////////*/
function createDropdown(id, label, items, selectItem) { 
    let dropdownWrapper = document.querySelector(`#${id}`);  // Sélectionne le conteneur du menu déroulant par son ID
    
    // Si le conteneur n'existe pas, on le crée
    if (!dropdownWrapper) {
        // Crée un élément `div` pour contenir le menu déroulant
        dropdownWrapper = createElement('div', { class: 'dropdown-wrapper', id: id });
        
        // Crée un bouton pour ouvrir/fermer le menu déroulant
        const button = createElement('button', {
            class: 'dropdown',  // Ajoute la classe CSS 'dropdown'
            type: 'button',  // Définit le type du bouton comme 'button'
            id: `${id}Button`,  // Définit l'ID unique pour ce bouton
            'aria-haspopup': 'listbox',  // Attribut ARIA indiquant que ce bouton contrôle une liste
            'aria-expanded': 'false',  // Définit l'état initial du menu (fermé)
            'aria-label': `Filtre ${label.toLowerCase()}`  // Ajoute un label ARIA pour l'accessibilité
        }, [
            createElement('span', {}, [document.createTextNode(label)]),  // Ajoute le label textuel du bouton
            createElement('i', { class: 'fa-solid fa-angle-down dropdown-icon' })  // Ajoute l'icône de flèche pour indiquer l'état du menu
        ]);

        // Crée le contenu du menu déroulant (la liste d'éléments)
        const content = createElement('div', {
            class: 'dropdown-content',  // Ajoute la classe CSS 'dropdown-content'
            role: 'listbox',  // Définit le rôle ARIA comme 'listbox'
            'aria-labelledby': `${id}Button`  // Lie ce contenu au bouton pour l'accessibilité
        });

        // Ajoute le bouton et le contenu au conteneur du menu déroulant
        dropdownWrapper.append(button, content);
        document.querySelector('.dropdowns').appendChild(dropdownWrapper);  // Ajoute le menu déroulant à la section .dropdowns du DOM

        // Crée un conteneur pour la liste d'éléments du menu
        const listContainer = createElement('div', { class: 'list-container' });
        content.appendChild(listContainer);  // Ajoute le conteneur de la liste dans le contenu du menu déroulant

        // GESTION DE L'OUVERTURE/FERMETURE DU MENU
        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';  // Vérifie si le menu est déjà ouvert
            toggleDropdownIcon(button, isExpanded);  // Gère l'icône du menu (rotation de l'icône de flèche)

            // Si le menu est fermé, on donne le focus au premier élément de la liste
            if (!isExpanded) {
                const firstItem = listContainer.querySelector('.item');  // Sélectionne le premier élément de la liste
                if (firstItem) {
                    firstItem.focus();  // Applique le focus uniquement si l'élément existe
                }
            }
        });

        // GESTION DE LA SÉLECTION PAR CLIC
        listContainer.addEventListener('click', (event) => {
            // Vérifie si l'élément cliqué est un item
            if (event.target.classList.contains('item')) {               
                updateSelectedItems();
                filterAndShowRecipes();
            }
        }); 

        // GESTION DE LA NAVIGATION CLAVIER
        listContainer.addEventListener('keydown', (event) => {
            // Vérifie si l'élément actuellement focalisé est un item
            if (event.target.classList.contains('item')) {
                // Vérifie si la touche pressée est 'Enter' ou 'Space'
                if (event.key === 'Enter' || event.key === ' ') {
                    // Empêche le comportement par défaut (ex. : faire défiler la page pour la touche 'Space')
                    event.preventDefault();
                    // Simule un clic sur l'élément focalisé
                    event.target.click();
                    // Met à jour les items sélectionnés et filtre les recettes
                    updateSelectedItems();
                    filterAndShowRecipes();
                }
            }
        });

        // Passe le type d'élément (filterType) à la fonction createSearchArea
        const filterType = id === 'dropdownIngredients' ? 'ingredient': 
                                   id === 'dropdownAppliances' ? 'appliance': 
                                   id === 'dropdownUstensils' ? 'ustensil': null;
                        
        createSearchArea(listContainer, items, selectItem, filterType);  // Crée la zone de recherche dans le menu déroulant avec le type approprié
    }
}

/* //////////////////////////////////////////////////////////////////////////
   OBJET POUR STOCKER LES ÉLÉMENTS FILTRÉS APRÈS LA PREMIÈRE RECHERCHE
////////////////////////////////////////////////////////////////////////// */
let firstFilteredItems = {
    ingredients: [], // Stocke la liste des ingrédients filtrés
    appliances: [], // idem pour les appareils
    ustensils: []   // // idem pour les ustensiles
}

/* ///////////////////////////////////////////
        REMPLISSAGE DE CREATEDROPDOWN
////////////////////////////////////////// */
// Fonction qui crée les boutons pour les listes déroulantes des filtres (ingrédients, appareils, ustensiles)
export function createFiltersButtons(recipes) {  
    const mainSearchResults = getMainSearchResults();  // Récupère les résultats de la recherche principale
    
    // Crée les menus déroulants pour chaque type de filtre (ingrédients, appareils, ustensiles)
    // flatMap est utilisé pour aplatir les tableaux imbriqués afin d'obtenir une seule liste d'éléments
    // selectItem est exécutée lorsqu'un utilisateur sélectionne un item dans la liste => mise en évidence en jaune avec croix
    createDropdown('dropdownIngredients', 'Ingrédients', recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient)), (item) => selectItem('ingredient', item, recipes), mainSearchResults, recipes);
    createDropdown('dropdownAppliances', 'Appareils', recipes.map(recipe => recipe.appliance), (item) => selectItem('appliance', item, recipes), mainSearchResults, recipes);
    createDropdown('dropdownUstensils', 'Ustensiles', recipes.flatMap(recipe => recipe.ustensils), (item) => selectItem('ustensil', item, recipes), mainSearchResults, recipes);
}


/* ////////////////////////////////////////////////////////
   MISE À JOUR DE LA LISTE DANS UN SEUL MENU DÉROULANT
//////////////////////////////////////////////////////// */
// Fonction qui met à jour les éléments dans le menu déroulant (dropdown)
function updateDropdown(id, items, type, recipes) {
    const dropdownList = document.querySelector(`#${id} .list-container`);  // Sélectionne la liste du menu déroulant par son ID
    if (!dropdownList) return console.error(`#${id} .list-container non trouvé`);  // Affiche une erreur si la liste n'est pas trouvée

    dropdownList.innerHTML = '';  // Réinitialise la liste déroulante

    // Parcourt chaque élément à ajouter à la liste déroulante
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';  // Définit la classe `item` pour chaque élément
        itemElement.tabIndex = '0';  // Rend l'élément focusable
        itemElement.textContent = item;  // Définit le contenu textuel de l'élément

        // Si l'élément est déjà sélectionné, on ajoute la classe `choice-item`
        if (isItemSelected(type, item)) {
            itemElement.classList.add('choice-item');
            addRemoveIcon(itemElement, type, item);  // Ajoute l'icône de suppression
        }

        // Gère la logique de sélection/désélection des éléments au clic
        itemElement.addEventListener('click', () => {
            if (itemElement.classList.contains('choice-item')) {
                deselectItem(type, item);  // Désélectionne l'élément
                itemElement.classList.remove('choice-item');
                removeRemoveIcon(itemElement);  // Supprime l'icône de suppression
            } else {
                selectItem(type, item, recipes);  // Sélectionne l'élément
                itemElement.classList.add('choice-item');
                addRemoveIcon(itemElement, type, item);  // Ajoute l'icône de suppression
            }
            
            updateSelectedItems();  // Met à jour visuellement les éléments sélectionnés
            filterAndShowRecipes(recipes);  // Filtre et affiche les recettes en fonction des sélections
        });

        dropdownList.appendChild(itemElement);  // Ajoute l'élément à la liste déroulante
    });
}

/* ////////////////////////////////////////////////////////////////////////////////////////////////
        MISE À JOUR DE L'ENSEMBLE DES LISTES DEROULANTES SIMULTANEMENT EN UTILISANT 
        UPDATEDROPDOWN LORSQUE L'UTILISATEUR UTILISE LES FILTRES OU RECOMMENCE SA RECHERCHE
/////////////////////////////////////////////////////////////////////////////////////////////// */
export function updateDropdownOptions(filteredRecipes) {
    const ingredients = new Set();  // Un Set est une structure de données qui garantit que chaque élément est unique. Cela permet d'éviter les doublons dans les listes de filtres
    const appliances = new Set();  // idem
    const ustensils = new Set();  // idem

    // Remplit les Sets avec les ingrédients, appareils et ustensiles filtrés
    filteredRecipes.forEach(recipe => {
        recipe.ingredients.forEach(ing => ingredients.add(ing.ingredient.toLowerCase()));
        appliances.add(recipe.appliance.toLowerCase());
        recipe.ustensils.forEach(ust => ustensils.add(ust.toLowerCase()));
    });

    // Array.from : Une fois que les Sets ont été remplis avec les ingrédients, appareils et ustensiles uniques, ils sont convertis en tableaux à l'aide de Array.from(). Cela est nécessaire car les menus déroulants attendent des listes d'éléments, pas des Sets
    // Les tableaux sont ensuite stockés dans l'objet appelé firstFilteredItems déclaré vide au départ en haut du fichier
    firstFilteredItems.ingredients = Array.from(ingredients);
    firstFilteredItems.appliances = Array.from(appliances);
    firstFilteredItems.ustensils = Array.from(ustensils);

    // Met à jour les listes déroulantes avec les nouvelles options filtrées 
    // (Id, Liste, Type, Carte recette)
    updateDropdown('dropdownIngredients', firstFilteredItems.ingredients, 'ingredient', filteredRecipes);
    updateDropdown('dropdownAppliances', firstFilteredItems.appliances, 'appliance', filteredRecipes);
    updateDropdown('dropdownUstensils', firstFilteredItems.ustensils, 'ustensil', filteredRecipes);
}

/* //////////////////////////////////////////////////////
   GÉNÉRATION D'ID UNIQUE POUR LES ZONES DE RECHERCHE
////////////////////////////////////////////////////// */
// Fonction qui génère un ID unique pour chaque barre de recherche
let idCounter = 0;  // Compteur d'ID
function generateUniqueId(prefix = '') {
    idCounter += 1;  // Incrémente le compteur
    return `${prefix}-${idCounter}`;  // Retourne search-1, search-2 ou search-3 pour un id unique par barre de recherche du menu déroulant
}

/* ///////////////////////////////////////////////////////////
   GESTION DE LA ZONE DE RECHERCHE DANS LE MENU DÉROULANT
////////////////////////////////////////////////////////// */
// Fonction qui gère la zone de recherche dans les menus déroulants
function createSearchArea(listContainer, items, selectItem, filterType) {
    const searchContainer = createElement('div', {
        style: 'position: sticky; top: 0; background-color: white; z-index: 1; padding: 10px;'  // Style pour garder la zone de recherche visible
    });

    const uniqueId = generateUniqueId('search');
    const searchInput = createElement('input', {
        type: 'search',
        class: 'search-filters',
        id: uniqueId,
        name: uniqueId,
        'aria-label': 'Rechercher parmi les éléments',
        tabindex: '0'  // Champ de recherche pour filtrer les éléments dans le menu déroulant
    });

    const iconSearch = createElement('i', {
        class: 'fa-solid fa-magnifying-glass filters-icon',  // Icône de loupe pour le champ de recherche
        'aria-hidden': 'true'
    });

    const clearIcon = createElement('i', {
        class: 'fa-solid fa-xmark clear-icon',  // Icône pour effacer la recherche
        'aria-label': 'Supprimer la saisie',
        tabindex: '0'
    });

    searchContainer.append(iconSearch, searchInput, clearIcon);  // Ajoute les icônes et le champ de recherche
    listContainer.parentNode.insertBefore(searchContainer, listContainer);  // Place la zone de recherche au-dessus de la liste

    const listItems = [...new Set(items.map(item => item.toLowerCase()))];  // Récupère la liste d'éléments filtrés de manière unique
    displayList(listContainer, listItems, selectItem, filterType);  // Affiche les éléments dans la liste

    // Gestion de la recherche dans les éléments du menu déroulant
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();  // Récupère la valeur tapée par l'utilisateur
        clearIcon.style.display = query ? 'block' : 'none';  // Affiche ou cache l'icône de suppression selon le texte

        let remainingItems;
        if (filterType === 'ingredient') {
            remainingItems = firstFilteredItems.ingredients;  // Utilise la liste filtrée des ingrédients
        } else if (filterType === 'appliance') {
            remainingItems = firstFilteredItems.appliances;  // Utilise la liste filtrée des appareils
        } else if (filterType === 'ustensil') {
            remainingItems = firstFilteredItems.ustensils;  // Utilise la liste filtrée des ustensiles
        }

        let filteredItems = remainingItems.filter(item => item.includes(query));  // Filtre les éléments selon la recherche
        displayList(listContainer, filteredItems, selectItem, filterType);  // Affiche les éléments filtrés
    });

    // Gestion du bouton pour effacer la recherche
    clearIcon.addEventListener('click', () => {
        searchInput.value = '';  // Réinitialise le champ de recherche
        clearIcon.style.display = 'none';  // Cache l'icône de suppression
        searchInput.focus();  // Redonne le focus au champ de recherche

        let remainingItems;
        if (filterType === 'ingredient') {
            remainingItems = firstFilteredItems.ingredients;
        } else if (filterType === 'appliance') {
            remainingItems = firstFilteredItems.appliances;
        } else if (filterType === 'ustensil') {
            remainingItems = firstFilteredItems.ustensils;
        }

        displayList(listContainer, remainingItems, selectItem, filterType);  // Réaffiche la liste complète filtrée
    });

    // Gestion clavier pour effacer la recherche avec la touche Enter ou Espace
    clearIcon.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            searchInput.value = '';  // Réinitialise le champ de recherche
            clearIcon.style.display = 'none';  // Cache l'icône de suppression

            let remainingItems;
            if (filterType === 'ingredient') {
                remainingItems = firstFilteredItems.ingredients;
            } else if (filterType === 'appliance') {
                remainingItems = firstFilteredItems.appliances;
            } else if (filterType === 'ustensil') {
                remainingItems = firstFilteredItems.ustensils;
            }

            displayList(listContainer, remainingItems, selectItem, filterType);  // Réaffiche la liste complète
            searchInput.focus();  // Redonne le focus au champ de recherche
        }
    });
}

/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   AFFICHAGE DES ÉLÉMENTS DANS LE MENU DÉROULANT EN FONCTION DE LA RECHERCHE FAITE DANS LA BARRE DE RECHERCHE DE CELUI-CI 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
// Fonction qui affiche les éléments dans la liste du menu déroulant
function displayList(listContainer, items, selectItem, filterType) {
    listContainer.innerHTML = '';  // Vide le conteneur avant d'ajouter les nouveaux éléments

    // Si la liste d'éléments n'est pas vide, on affiche chaque élément
    if (items.length > 0) {
        items.forEach(item => {
            const itemElement = createElement('div', { class: 'item', tabindex: '0' }, [document.createTextNode(item)]);  // Crée un élément pour chaque item

            // Si l'élément est déjà sélectionné, on ajoute la classe `choice-item`
            if (isItemSelected(filterType, item)) {
                itemElement.classList.add('choice-item');
                addRemoveIcon(itemElement, filterType, item);  // Ajoute l'icône de suppression
            }

            // Gestion de la sélection de l'élément au clic
            itemElement.addEventListener('click', () => selectItem(item));
            listContainer.appendChild(itemElement);  // Ajoute l'élément au conteneur de la liste
        });
    } else {
        // Si aucun résultat trouvé, affiche un message 'Aucun résultat trouvé'
        const noResults = document.createElement('div');
        noResults.className = 'item';
        noResults.textContent = 'Aucun résultat trouvé';
        listContainer.appendChild(noResults);
    }
}






