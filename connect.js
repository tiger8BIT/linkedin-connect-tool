const SLOW_TIME_SECONDS = 3;
let PROPS;
let targetSection;

chrome.storage.sync.get("props", async ({props}) => {
    PROPS = props;
    setTimeout(() => startParsing());
});

async function startParsing() {
    try {
        targetSection = await getTargetSection();
        chrome.runtime.sendMessage({ id: "status", text: "Connecting..." });
        await clickTargetButtonsIfIsConnecting();
    } catch (errorText) {
        chrome.runtime.sendMessage({ id: "error", text: errorText });
    }
}

async function clickTargetButtonsIfIsConnecting() {
    runIfIsConnecting(async () => {
        let connectButtons = getConnectButtons();
        for (const button of connectButtons) {
            await slowClickIdIsConnecting(button);
        }
        await sleep(SLOW_TIME_SECONDS);
        await clickTargetButtonsIfIsConnecting();
    })
}

async function getTargetSection() {
    await waitPageIsLoadedOrThrow();
    let targetSections = await getTargetSectionsOrThrow();
    return targetSections[0];
}

async function waitPageIsLoadedOrThrow() {
    chrome.runtime.sendMessage({ id: "status", text: "Waiting page is loaded..." });
    let sections = await getElementsWithTimeout(() => document.querySelectorAll("section"));
    if (sections.length === 0) {
        throw "Can't found base page elements. Are you authorized?"
    }
}

async function getTargetSectionsOrThrow() {
    chrome.runtime.sendMessage({ id: "status", text: "Getting target section..." });
    let targetSections = await getElementsWithTimeout(() => {
        let sections = document.querySelectorAll("section");
        return Array.from(sections).filter(section => section.innerHTML.includes(PROPS.sectionText));
    });
    if (targetSections.length === 0) {
        throw "Invalid section header."
    }
    return targetSections;
}

async function getElementsWithTimeout(getElementsFunction,timeout = 10) {
    if (timeout === 0) return [];
    let elements = getElementsFunction();
    if (elements.length === 0) {
        await sleep(1);
        return getElementsWithTimeout(getElementsFunction, timeout - 1)
    }
    return elements;
}

function getConnectButtons() {
    let buttons = getButtonsOrThrow();
    return getConnectButtonsOrThrow(buttons);
}

function getButtonsOrThrow() {
    let buttons = targetSection.querySelectorAll("button[id^='ember']");
    if (buttons.length === 0) {
        throw "Can't query any buttons. Is internal error. We'll fix it soon."
    }
    return buttons;
}

function getConnectButtonsOrThrow(buttons) {
    let connectButtons = Array.from(buttons).filter(button => button.innerText.trim() === PROPS.buttonText);
    if (connectButtons.length === 0) {
        throw "Invalid button text."
    }
    return connectButtons;
}

async function slowClickIdIsConnecting(button) {
    runIfIsConnecting(async () => {
        button.scrollIntoView({block: "center", behavior: "smooth"});
        button.click();
        await sleep(SLOW_TIME_SECONDS);
    })
}

function runIfIsConnecting(asyncFunctionForRun) {
    chrome.storage.sync.get("isConnecting", async ({isConnecting}) => {
        if (isConnecting) {
            await asyncFunctionForRun();
        }
    });
}

function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}
