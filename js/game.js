import { timeout } from './utils.js';

class Game {
    constructor() {
        this.container = document.querySelector('.container');
        this.btn_firstStart = document.querySelector('#btn_firstStart');
        this.btn_newStart = document.querySelector('#btn_newStart');
        this.btn_nextStep = document.querySelector('#btn_nextStep');
        this.firstGame = document.querySelector('#beforeGame');
        this.inputNbCases = document.querySelector('#nbCases');
        this.gameOver = document.querySelector('#gameOver');

        this.soundActive = new Audio('../sounds/active.mp3');
        this.soundRight = new Audio('../sounds/right.mp3');
        this.soundWrong = new Audio('../sounds/wrong.mp3');

        this.started = false;
        this.playerCanClick = false;

        this.activeDuration = 1000;
        this.intervalDuration = 300;

        this.container.innerHTML = '';

        this.createEvents();
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
        this.btn_firstStart.addEventListener('click', () => this.startFirstGame());
        this.btn_newStart.addEventListener('click', () => this.startNewGame());
    }

    deleteEvents() {
        this.deleteCaseEvents();
    }

    /**
     * Génère les events liés aux cases (ne peut etre fait qu'une fois les cases générées)
     */
    createCaseEvents() {
        this.cases.forEach((uneCase) => uneCase.addEventListener('click', (e) => this.eventClickCase(e.target)));
    }

    deleteCaseEvents() {
        this.cases.forEach((uneCase) => uneCase.removeEventListener('click', (e) => this.eventClickCase(e.target)));
    }

    /**
     * Actions effectuées lors d'une clic sur une case
     * @param {HTMLDivElement} uneCase
     */
    async eventClickCase(uneCase) {
        if (this.playerCanClick) {
            this.setCasesClickable(false);
            let caseClicked = [...this.cases].indexOf(uneCase);
            let isGood = this.isCaseClickedIsGood(caseClicked);

            isGood
                ? await this.showRightCase(caseClicked)
                : await this.showWrongCase(caseClicked);
            
            if (!isGood) {
                this.showGameOver();
                return;
            }

            if (this.nbCasesClicked < this.tabCasesToFind.length - 1) {
                this.nbCasesClicked++;
                this.setCasesClickable(true);
            } else {
                this.launchTurn();
            }
        }
        // this.setCasesClickable(true);
    }

    /**
     * Démarre la partie
     */
    async startGame() {
        await timeout(1000);
        this.started = true;

        this.init();

        this.launchTurn();
    }

    startFirstGame() {
        console.log('p',this.inputNbCases.value);
        this.setSize(+this.inputNbCases.value);
        this.createGame();
        this.firstGame.classList.add('hidden');
        this.startGame();
    }

    startNewGame() {
        this.gameOver.classList.add('hidden');
        this.startGame();
    }

    /**
     * Lance un tour de jeu qui comprend le fait de montrer les cases à trouver et la sélection du joueur
     */
    async launchTurn() {
        await this.showCasesToFind();
        this.selectionPlayer();

        // Tour suivant
        this.step++;
        // this.launchTurn();
    }

    /**
     * Affiche les cases à trouver
     */
    async showCasesToFind() {
        this.setCasesClickable(false);

        // Affiche toutes les cases précédentes
        for (const i in this.tabCasesToFind) {
            await this.activeCase(this.tabCasesToFind[i]);
        }

        // Affiche la nouvelle case
        await this.activeCase(this.addCaseToFind());
    }

    /**
     * Ajoute une case à trouver
     * @returns {Number}
     */
    addCaseToFind() {
        let number = Math.floor(Math.random() * this.nbCases);
        this.tabCasesToFind.push(number);
        return number;
    }

    /**
     * Active une case en lui ajoutant la classe active temporairement
     * @param {Number} number Réprésente l'indice de la case
     */
    async activeCase(number) {
        this.soundActive.play();
        await this.showStateCase(number, 'active');
    }

    async showRightCase(number) {
        this.soundRight.play();
        await this.showStateCase(number, 'right');
    }

    async showWrongCase(number) {
        this.soundWrong.play();
        await this.showStateCase(number, 'wrong');
    }

    /**
     * Met en surbrillance une classe temporairement
     * @param {Number} number Réprésente l'indice de la case
     * @param {String} state
     */
    async showStateCase(number, state) {
        document.querySelector(`.case:nth-child(${number + 1})`).classList.add(state);

        setTimeout(() => {
            document.querySelector(`.case:nth-child(${number + 1})`).classList.remove(state);
        }, this.activeDuration);

        await timeout(this.activeDuration + this.intervalDuration);
    }

    /**
     * Tour du joueur
     */
    selectionPlayer() {
        this.setCasesClickable(true);
        this.nbCasesClicked = 0;
    }

    /**
     * Modifie l'état des cases : clickage ou pas
     * @param {boolean} clickable
     */
    setCasesClickable(clickable = true) {
        this.playerCanClick = clickable;
        this.cases.forEach((uneCase) => {
            uneCase.classList.remove('clickable');
            if (clickable) uneCase.classList.add('clickable');
        });
    }

    /**
     *
     * @param {Number} caseRank Rang de la case sur la laquelle le joueur a cliqué
     * @returns {boolean}
     */
    isCaseClickedIsGood(caseRank) {
        return caseRank === this.tabCasesToFind[this.nbCasesClicked];
    }

    showGameOver() {
        this.deleteEvents();
        
        this.gameOver.classList.remove('hidden');
    }
}

export default new Game();
