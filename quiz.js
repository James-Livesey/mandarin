function shuffle(items) {
    return items
        .map((value) => ({value, position: Math.random()}))
        .sort((a, b) => a.position - b.position)
        .map((item) => item.value)
    ;
}

export class QuizPart {
    constructor() {
        this.parent = null;
        this.element = document.createElement("div");
    }

    get root() {
        return this.parent.root;
    }

    static parse(element) {
        return new this();
    }

    render(type = "div", classes = "") {
        var thisScope = this;

        var oldElement = this.element;

        this.element = document.createElement(type);

        oldElement.replaceWith(this.element);

        classes.split(" ").forEach(function(className) {
            if (className == "") {
                return;
            }

            thisScope.element.classList.add(className);
        });
    }
}

export class QuizSet extends QuizPart {
    constructor() {
        super();

        this.pages = [];
        this.selectedPage = 0;
    }

    get root() {
        return this;
    }

    static parse(element) {
        var instance = new this();

        element.querySelectorAll("quiz-page").forEach(function(pageElement) {
            var page = QuizPage.parseSpecialisedPage(pageElement);

            page.parent = instance;

            instance.pages.push(page);
        });

        return instance;
    }

    render() {
        super.render("div", "quizSet");

        var thisScope = this;
        var paginator = document.createElement("div");

        paginator.classList.add("quizPaginator");

        this.pages.forEach(function(page, i) {
            var pageButton = document.createElement("button");

            if (i == thisScope.selectedPage) {
                pageButton.classList.add("selected");
            }
            
            if (page.correct == true) {
                pageButton.classList.add("correct");
            } else if (page.correct == false) {
                pageButton.classList.add("incorrect");
            }

            pageButton.addEventListener("click", function() {
                thisScope.selectedPage = i;

                thisScope.render();
            });

            paginator.append(pageButton);
        });

        this.pages[this.selectedPage].render();

        this.element.append(paginator);
        this.element.append(this.pages[this.selectedPage].element);
    }
}

export class QuizPage extends QuizPart {
    static parseSpecialisedPage(element) {
        switch (element.getAttribute("type")) {
            case "arrange": return QuizArrangePage.parse(element);
            case "pinyin": return QuizPinyinPage.parse(element);
        }

        throw new TypeError("An improper specialised page type was given");
    }

    render() {
        super.render("div", "quizPage");
    }
}

export class QuizQuestionPage extends QuizPage {
    constructor() {
        super();

        this.questions = [];
        this.currentQuestion = 0;
    }

    get correct() {
        var finalResult = true;

        this.questions.map((question) => question.correct).forEach(function(result) {
            if (result == null && finalResult != false) {
                finalResult = null;
            }

            if (result == false) {
                finalResult = false;
            }
        });

        return finalResult;
    }

    render() {
        var thisScope = this;

        super.render();

        var navigationButtonsContainer = document.createElement("div");

        navigationButtonsContainer.classList.add("quizPageButtonsContainer");

        this.questions[this.currentQuestion].render();
        this.element.append(this.questions[this.currentQuestion].element);

        if (this.currentQuestion > 0) {
            var previousButton = document.createElement("button");

            previousButton.innerText = "🢐 Previous";

            previousButton.addEventListener("click", function() {
                thisScope.currentQuestion--;

                thisScope.render();
            });

            navigationButtonsContainer.append(previousButton);
        }

        if (this.currentQuestion < this.questions.length - 1) {
            var nextButton = document.createElement("button");

            nextButton.innerText = "Next 🢒";

            nextButton.addEventListener("click", function() {
                thisScope.currentQuestion++;

                thisScope.render();
            });

            navigationButtonsContainer.append(nextButton);
        }

        this.element.append(navigationButtonsContainer);
    }
}

export class QuizArrangePage extends QuizQuestionPage {
    static parse(element) {
        var instance = new this();

        element.querySelectorAll("quiz-question").forEach(function(questionElement) {
            var question = QuizArrangeQuestion.parse(questionElement);

            question.parent = instance;

            instance.questions.push(question);
        });

        instance.questions = shuffle(instance.questions);

        return instance;
    }
}

export class QuizPinyinPage extends QuizQuestionPage {
    static parse(element) {
        var instance = new this();

        element.querySelectorAll("quiz-question").forEach(function(questionElement) {
            var question = QuizPinyinQuestion.parse(questionElement);

            question.parent = instance;

            instance.questions.push(question);
        });

        instance.questions = shuffle(instance.questions);

        return instance;
    }
}

export class QuizQuestion extends QuizPart {
    constructor(question) {
        super();

        this.question = question;
    }

    get correct() {
        return null;
    }

    render() {
        super.render("div", "quizQuestion");
    }
}

export class QuizArrangeQuestion extends QuizQuestion {
    constructor(question, after = null) {
        super(question);

        this.after = after;

        this.correctBlocks = [];
        this.containerBlocks = [];
        this.answerBlocks = [];
    }

    get correct() {
        if (this.answerBlocks.length != this.correctBlocks.length) {
            return null;
        }

        for (var i = 0; i < this.answerBlocks.length; i++) {
            if (this.answerBlocks[i].contents != this.correctBlocks[i].contents) {
                return false;
            }
        }

        return true;
    }

    static parse(element) {
        var instance = new this(element.getAttribute("question"), element.getAttribute("after"));

        element.querySelectorAll("quiz-block").forEach(function(blockElement) {
            var block = QuizArrangeBlock.parse(blockElement);

            block.parent = instance;

            instance.correctBlocks.push(block);
            instance.containerBlocks.push(block);
        });

        instance.containerBlocks = shuffle(instance.containerBlocks);

        return instance;
    }

    render() {
        var thisScope = this;

        super.render();

        var questionText = document.createElement("p");
        var answerContainer = document.createElement("div");
        var blocksContainer = document.createElement("div");
        var resultText = document.createElement("p");

        answerContainer.classList.add("quizArrangeAnswerContainer");
        blocksContainer.classList.add("quizArrangeBlocksContainer");

        questionText.textContent = this.question;

        this.containerBlocks.forEach(function(block, i) {
            block.render();

            block.element.addEventListener("click", function() {
                thisScope.answerBlocks.push(thisScope.containerBlocks.splice(i, 1)[0]);

                thisScope.root.render();
            });

            block.element.addEventListener("dragstart", function(event) {
                event.dataTransfer.setData("text", JSON.stringify({index: i, container: "blocks"}));
            });

            blocksContainer.append(block.element);
        });

        this.answerBlocks.forEach(function(block, i) {
            block.render();

            block.element.addEventListener("click", function() {
                thisScope.containerBlocks.push(thisScope.answerBlocks.splice(i, 1)[0]);

                thisScope.root.render();
            });

            block.element.addEventListener("dragstart", function(event) {
                event.dataTransfer.setData("text", JSON.stringify({index: i, container: "answer"}));
            });

            answerContainer.append(block.element);
        });

        blocksContainer.addEventListener("dragover", function(event) {
            event.preventDefault();
        });

        blocksContainer.addEventListener("drop", function(event) {
            event.preventDefault();

            var blockData = JSON.parse(event.dataTransfer.getData("text"));

            if (blockData.container != "answer") {
                return;
            }

            if (blockData.index < 0 || blockData.index > thisScope.answerBlocks.length) {
                return;
            }

            thisScope.containerBlocks.push(thisScope.answerBlocks.splice(blockData.index, 1)[0]);

            thisScope.root.render();
        });

        answerContainer.addEventListener("dragover", function(event) {
            event.preventDefault();
        });

        answerContainer.addEventListener("drop", function(event) {
            event.preventDefault();

            var blockData = JSON.parse(event.dataTransfer.getData("text"));

            if (blockData.container != "blocks") {
                return;
            }

            event.preventDefault();

            if (blockData.index < 0 || blockData.index > thisScope.containerBlocks.length) {
                return;
            }

            thisScope.answerBlocks.push(thisScope.containerBlocks.splice(blockData.index, 1)[0]);

            thisScope.root.render();
        });

        if (this.correct == true) {
            answerContainer.innerText = this.after || answerContainer.innerText;
            resultText.innerText = "Correct; well done!";
        } else if (this.correct == false) {
            resultText.innerText = "Not quite — drag the characters back into the bank and try again.";
        } else {
            resultText.innerText = "Read the question and then drag the characters into the answer box.";
        }

        this.element.append(questionText, answerContainer, blocksContainer, resultText);
    }
}

export class QuizPinyinQuestion extends QuizQuestion {
    constructor(question, answer) {
        super(question);

        this.answer = answer;
        this.givenAnswer = "";
    }

    static parse(element) {
        return new this(element.getAttribute("question"), element.textContent);
    }

    static normalise(pinyin) {
        return pinyin.normalize("NFD").replace(/[\u0300-\u036f\s·?!.,]/g, "").toLocaleLowerCase();
    }

    get correct() {
        if (this.constructor.normalise(this.givenAnswer) == this.constructor.normalise(this.answer)) {
            return true;
        }

        return null;
    }

    render() {
        var thisScope = this;

        super.render();

        var questionText = document.createElement("p");
        var answerInput = document.createElement("input");
        var resultText = document.createElement("p");

        questionText.textContent = this.question;
        answerInput.placeholder = "Type the answer using pinyin";

        answerInput.addEventListener("keyup", function() {
            thisScope.givenAnswer = answerInput.value;

            if (thisScope.correct == true) {
                thisScope.root.render();
            }
        });

        if (this.correct == true) {
            answerInput.value = thisScope.answer;
            answerInput.disabled = true;
            resultText.innerText = "Correct; well done!";
        } else if (this.correct == false) {
            resultText.innerText = "Not quite — take another look and try again. Make sure your answer's in pinyin.";
        } else {
            resultText.innerText = "Read the question and then type in the answer in pinyin. You don't need to write the diacritics.";
        }

        this.element.append(questionText, answerInput, resultText);
    }
}

export class QuizBlock extends QuizPart {
    constructor(contents) {
        super();

        this.contents = contents;
    }

    render() {
        super.render("div", "quizBlock");

        this.element.innerHTML = this.contents;
        this.element.draggable = true;
    }
}

export class QuizArrangeBlock extends QuizBlock {
    static parse(element) {
        var instance = new this(element.textContent);

        return instance;
    }
}