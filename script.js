import * as quiz from "./quiz.js";

window.quiz = quiz;

export function parameter(parameter) {
    return decodeURIComponent((new RegExp("[?|&]" + parameter + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

export function getResourceLink(page) {
    return `index.html?page=${encodeURIComponent(page)}`;
}

export function setLink(element) {
    var url = element.getAttribute("href");

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return;
    }

    element.setAttribute("href", `index.html?page=${encodeURIComponent(url)}`);
}

export function parseHtml(html) {
    var rootElement = document.createElement("div");

    rootElement.innerHTML = html;

    rootElement.querySelectorAll("a").forEach(setLink);

    rootElement.querySelectorAll("quiz-set").forEach(function(setElement) {
        var set = quiz.QuizSet.parse(setElement);

        set.render();

        setElement.replaceWith(set.element);
    });

    return rootElement;
}

export function renderResource(resource) {
    return fetch(`resources/${resource}`).then(function(response) {
        return response.text();
    }).then(function(data) {
        var converter = new showdown.Converter({
            headingLevelStart: 2
        });

        document.querySelector("article").append(parseHtml(converter.makeHtml(data)));
    });
}

export function toggleNav() {
    document.querySelector("body").classList.toggle("showNav");
}

window.addEventListener("load", function() {
    if (parameter("page") != null) {
        renderResource(parameter("page"));
    } else {
        renderResource("introduction/welcome.md");
    }

    document.querySelectorAll("main nav a").forEach(function(element) {
        if (element.getAttribute("href") == (parameter("page") || "introduction/welcome.md")) {
            element.style.fontWeight = "bold";
        }

        setLink(element);
    });

    document.querySelector(".toggleNav").addEventListener("click", toggleNav);
});