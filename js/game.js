import { timeout } from './utils.js';

class Game {
    constructor() {
        this.container = document.querySelector('.container');
        this.btn_start = document.querySelector('#btn_start');
        this.btn_nextStep = document.querySelector('#btn_nextStep');

        this.setSize(5);
        this.createEvents();
        this.started = false;
        this.playerTurn = false;

        this.activeDuration = 1000;
        this.intervalDuration = 300;
    }

    /**
     * Initialise la partie, utile si on veut relancer une partie
     */
    init() {
        this.step = 0;
        this.tabCasesToFind = [];
    }

    /**
     *
     * @param {Number} size Nombre de cases par ligne et colonne
     */
    setSize(size) {
        this.nbCol = size;
        this.nbRow = size;
        this.nbCases = size * size;
        this.setGrid();
    }

    /**
     * Met à jour le grid en fonction du nombre de lignes et colonnes souhaitées
     */
    setGrid() {
        document.documentElement.style.setProperty('--js-nbCol', this.nbCol);
        document.documentElement.style.setProperty('--js-nbRow', this.nbRow);
    }

    /**
     * Génère l'ensemble des cases
     */
    createGame() {
        for (let i = 0; i < this.nbCases; i++) {
            this.container.appendChild(this.createCase());
        }
        this.cases = document.querySelectorAll('.case');
        this.createCaseEvents();
    }

    /**
     * Retourne une case
     * @returns {HTMLDivElement}
     */
    createCase() {
        const uneCase = document.createElement('div');
        uneCase.classList.add('case');
        return uneCase;
    }

    /**
     * Génère l'ensemble des évents liés au jeu
     */
    createEvents() {
        this.btn_start.addEventListener('click', () => this.startGame());
        this.btn_nextStep.addEventListener('click', () => this.launchTurn());
    }

    /**
     * Génère les events liés aux cases (ne peut etre fait qu'une fois les cases générées)
     */
    createCaseEvents() {
        this.cases.forEach((uneCase) => uneCase.addEventListener('click', (e) => this.eventClickCase(e.target)));
    }

    /**
     * Actions effectuées lors d'une clic sur une case
     * @param {HTMLDivElement} uneCase
     */
    eventClickCase(uneCase) {
        if (this.playerTurn) {
            let caseClicked = [...this.cases].indexOf(uneCase);
            this.isCaseClickedIsGood(caseClicked,)
            this.nbCasesClicked;
        }
    }

    /**
     * Démarre la partie
     */
    startGame() {
        this.started = true;

        this.init();

        this.launchTurn();
    }

    /**
     * Lance un tour de jeu qui comprend le fait de montrer les cases à trouver et la sélection du joueur
     */
    async launchTurn() {
        await this.showCaseToFind();
        this.selectionPlayer();

        // Tour suivant
        this.step++;
        // this.launchTurn();
    }

    /**
     * Affiche les cases à trouver
     */
    async showCaseToFind() {
        this.playerTurn = false;
        this.setCasesClickable(false);
        this.btn_start.disabled = true;

        // Affiche toutes les cases précédentes
        for (const i in this.tabCasesToFind) {
            await this.activeCase(this.tabCasesToFind[i]);
        }

        // Affiche la nouvelle case
        await this.activeCase(this.addCaseToFind());

        this.btn_start.disabled = false;
    }

    /**
     * Ajoute une case à trouver
     * @returns {Number}
     */
    addCaseToFind() {
        let number = Math.floor(Math.random() * this.nbCases) + 1;
        this.tabCasesToFind.push(number);
        return number;
    }

    /**
     * Active une case en lui ajoutant la classe active temporairement
     * @param {Number} number Réprésente l'indice de la case (commence à 1)
     */
    async activeCase(number) {
        document.querySelector(`.case:nth-child(${number})`).classList.add('active');

        setTimeout(() => {
            document.querySelector(`.case:nth-child(${number})`).classList.remove('active');
        }, this.activeDuration);

        await timeout(this.activeDuration + this.intervalDuration);
    }

    /**
     * Tour du joueur
     */
    selectionPlayer() {
        this.setCasesClickable();
        this.playerTurn = true;
        this.nbCasesClicked = 0;
    }

    /**
     * Modifie l'état des cases : clickage ou pas
     * @param {boolean} clickable
     */
    setCasesClickable(clickable = true) {
        this.cases.forEach((uneCase) => {
            uneCase.classList.remove('clickable');
            if (clickable) uneCase.classList.add('clickable');
        });
    }

    /**
     *
     * @param {Number} caseRank Rang de la case sur la laquelle le joueur a cliqué
     * @param {Number} caseClickedRank Rang de la case parmis celle que le joueur a cliqué
     * @returns {boolean}
     */
    isCaseClickedIsGood(caseRank) {
        console.log(caseRank, this.tabCasesToFind[this.nbCasesClicked]);
        return caseRank === this.tabCasesToFind[this.nbCasesClicked];
    }
}

export default new Game();
