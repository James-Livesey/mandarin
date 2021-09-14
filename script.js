function parameter(parameter) {
    return decodeURIComponent((new RegExp("[?|&]" + parameter + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function getResourceLink(page) {
    return `index.html?page=${encodeURIComponent(page)}`;
}

function setLink(element) {
    var url = element.getAttribute("href");

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return;
    }

    element.setAttribute("href", `index.html?page=${encodeURIComponent(url)}`);
}

function parseHtml(html) {
    var rootElement = document.createElement("div");

    rootElement.innerHTML = html;

    rootElement.querySelectorAll("a").forEach(setLink);

    return rootElement.innerHTML;
}

function renderResource(resource) {
    return fetch(`resources/${resource}`).then(function(response) {
        return response.text();
    }).then(function(data) {
        var converter = new showdown.Converter({
            headingLevelStart: 2
        });

        document.querySelector("article").innerHTML = parseHtml(converter.makeHtml(data));
    });
}

function toggleNav() {
    document.querySelector("body").classList.toggle("showNav");
}

window.addEventListener("load", function() {
    if (parameter("page") != null) {
        renderResource(parameter("page"));
    } else {
        renderResource("introduction/welcome.md");
    }

    document.querySelectorAll("main nav a").forEach(function(element) {
        if (element.getAttribute("href") == parameter("page")) {
            element.style.fontWeight = "bold";
        }

        setLink(element);
    });
});