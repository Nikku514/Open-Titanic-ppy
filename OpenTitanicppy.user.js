// ==UserScript==
// @name        Open osu!titanic from ppy
// @namespace   Violentmonkey Scripts
// @author      Nikku
// @version     1.0
// @match       https://osu.ppy.sh/*
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// @grant GM_listValues
// ==/UserScript==
/**
* Most of the code is from RockRoller's osu-web enhanced extension, https://osu.ppy.sh/community/forums/topics/1361818?n=1
* All I did was add the titanic integration and try to make it not conflict with his extension.
*/

/**
 * Heroicons, used for CreateIcon
 * MIT licensed, https://github.com/tailwindlabs/heroicons/blob/master/LICENSE
 */
const link =`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>`;
///const titanic = `todo add`
var icons = Object.freeze({
    link: link,
///    titanic: titanic
});

function __rest(s, e) {
    var t = {};

    for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) {
            t[p] = s[p];
        }
    }

    if (s != null && typeof Object.getOwnPropertySymbols === "function") {
        var symbols = Object.getOwnPropertySymbols(s);
        for (var i = 0; i < symbols.length; i++) {
            if (
                e.indexOf(symbols[i]) < 0 &&
                Object.prototype.propertyIsEnumerable.call(s, symbols[i])
            ) {
                t[symbols[i]] = s[symbols[i]];
            }
        }
    }

    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 * waits for the supplied amount of time
 * @param ms time in miliseconds
 * @returns
 */
function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

/**
 * waits until the given element is found
 * @param query element to wait for
 * @param parent element/document to wait within
 * @returns the element
 */
function waitForElement(query, parent = document) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let tries = 0; tries < 200; tries++) {
            const element = parent.querySelector(query);
            if (element) {
                return element;
            }
            yield wait(100);
        }
        throw new MissingElementException(`waitForElement timed out for: ${query}`);
    });
}

/**
 * creates an icon, all icons are in icons.ts
 * @param name key of the icon in icons.ts
 * @param options @see CreateIconOptions
 * @returns icon element
 */
function createIcon(name, options = {}) {
    const { size = 16 } = options, rest = __rest(options, ["size"]);
    const element = createElementFromHTMLString(icons[name]);
    Object.assign(element.style, Object.assign({ width: `${size}px`, height: `${size}px` }, rest));
    return element;
}

/**
 * easy creation of html elements with styles and attributes
 * @param tagName HTML tag name of the element, e.g. "div"
 * @param options @see CreateElementOptions
 * @returns element
 */
function createElement(tagName, options = {}) {
    const { attributes = {}, style = {}, className = "", children = [], events = [] } = options;
    const element = document.createElement(tagName);
    Object.assign(element, Object.assign(Object.assign({}, attributes), { className: `rr-lib ${className}` }));
    Object.assign(element.style, style);
    element.append(...children);
    events.forEach((event) => element.addEventListener(event.type, event.handler));
    return element;
}

/**
 * ensures that an element exists in the document and returns this element
 * @param query any valid css selector, @see document.querySelector
 * @throws MissingElementError when element can not be found in document, aka is null or undefined
 * @returns selected element
 */
function ensuredSelector(query, parent = document) {
    const element = parent.querySelector(query);
    if (!element) {
        throw new MissingElementException(`No element found for query: "${query}"`);
    }
    return element;
}

/**
 * This functions intitialises all the beatmap related modifications.
 */
async function insertBeatmapModifications() {
    while (location.pathname.split("/")[1] === "beatmapsets") {
        try {
            await waitForElement(".beatmapset-header__buttons");

            const jsonEl = await waitForElement("#json-beatmapset");
            const apiData = JSON.parse(jsonEl.innerHTML);

            insertBeatmapInfoHeaderButton(
                "link",
                "Open in titanic",
                "open-titanic-button",
                () => window.open(`https://osu.titanic.sh/s/${apiData.id}`)
            );

        } catch (e) {
            console.warn("Beatmap button failed:", e);
        }

        await wait(2000);
    }
}

function insertBeatmapInfoHeaderButton(icon, tooltip, className, eventHandler) {
    if (document.querySelector(`.${className}`) != null) {
        return;
    }
    const moreButton = document.querySelector(".beatmapset-header__more");
    const container = ensuredSelector(".beatmapset-header__buttons");
    const button = createElement("button", {
        className: `${className} btn-osu-big btn-osu-big--beatmapset-header-square`,
        children: [
            createElement("span", {
                className: "btn-osu-big__content btn-osu-big__content--center",
                children: [
                    createElement("span", {
                        className: "btn-osu-big__icon",
                        children: [
                            createElement("span", {
                                className: "fa fa-fw",
                                children: [
                                    createElement("span", {
                                        className: `fa fa-${icon}`,
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ],
        attributes: {
            onclick: () => eventHandler(),
            title: tooltip,
        },
    });
    moreButton != null ? moreButton.before(button) : container.append(button);
}

class OsuInputLabel extends HTMLLabelElement {
    /**
     *
     * @param id ID to connect input and label
     * @param input Input connected to this label.
     * @param label Label of the label
     */
    constructor(id, input, label, extraInfo) {
        super();
        input.id = id;
        this.htmlFor = id;
        this.innerText = label;
        this.style.display = "flex";
        this.style.alignItems = "center";
        this.style.justifyContent = "space-between";
        this.style.minWidth = "72px";
        this.style.padding = "0px";
        this.style.color = osuTheme.normalTextColor;
        this.style.fontSize = "14px";
        this.style.textTransform = "unset";
        this.style.lineHeight = "unset";
        this.style.fontWeight = "400";
        this.style.marginBottom = "0";
        this.style.gap = "8px";
        if (extraInfo) {
            this.append(createElement("span", {
                children: [createIcon("info")],
                attributes: {
                    title: extraInfo,
                },
                style: {
                    color: "rgba(255, 255, 255, 0.5)",
                    marginRight: "auto",
                    display: "flex",
                },
            }));
        }
        this.append(input);
    }
}

    let externalLinksInterval = null;

    const routes = [
        {
            match: ["beatmapsets"],
            render: () => insertBeatmapModifications(),
        },
    ];

    function determineOsuRoute() {
        for (const route of routes) {
            const splitURL = location.pathname.split("/");
            const matches = splitURL.some((u) => route.match.includes(u));
            if (matches) {
                return route.render();
            }
        }
    }

    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            // functions registered in this section will only run once per tab
            initComponents();
            let previousUrl = "";
            const observer = new MutationObserver(() => {
                if (document.URL !== previousUrl) {
                    previousUrl = document.URL;
                    handleNavigationChange();
                }
            });
            observer.observe(document, { subtree: true, childList: false, attributes: true, characterData: false });
        });
    }
    main();

// functions registered in this section will run on every navigation
function handleNavigationChange() {
    openExternalLinksInNewTab(); // run immediately

    if (externalLinksInterval === null) {
        externalLinksInterval = setInterval(openExternalLinksInNewTab, 2500);
    }

    determineOsuRoute();
}

/**
 * This function registers all components, must be called before using the components
 */
function initComponents() {
    customElements.define("osu-input-label-tit", OsuInputLabel, { extends: "label" });
}

function openExternalLinksInNewTab() {
    document.querySelectorAll("a").forEach((a) => {
        const href = a.getAttribute("href");

        if (!href || href.trim() === "" || href.startsWith("#")) {
            return;
        }

        let url;
        try {
            url = new URL(href, window.location.href);
        } catch (e) {
            return; // malformed href, ignore
        }

        const isHttp = url.protocol === "http:" || url.protocol === "https:";
        const isInternal =
            url.hostname === "ppy.sh" || url.hostname.endsWith(".ppy.sh");

        if (isHttp && !isInternal) {
            a.target = "_blank";
            a.rel = "noopener noreferrer";
        }
    });
}
