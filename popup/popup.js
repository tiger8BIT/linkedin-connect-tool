let connectingButton = document.getElementById('connectBtn');
let setDefaultButton = document.getElementById('setDefaultBtn');
let sectionHeaderInput = document.getElementById('sectionHeader');
let buttonTextInput = document.getElementById('buttonText');
let statusDiv = document.getElementById('status');

const defaultSectionText = "More suggestions for you"
const defaultButtonText = "Connect"
let defProps = {sectionText: defaultSectionText, buttonText: defaultButtonText};

chrome.storage.sync.get("isConnecting", ({ isConnecting }) => {
    setupConnectingButton(isConnecting);
});

chrome.storage.sync.get("error", ({ error }) => {
    if (error !== null) {
       showError(error.text)
    }
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === "isConnecting") {
            setupConnectingButton(newValue);
        }
        if (key === "error") {
            if (newValue !== null) {
                showError(newValue)
            } else {
                hideError()
                chrome.storage.sync.get("status", ({ status }) => {
                    statusDiv.innerText = status;
                })
            }
        }
        if (key === "status") {
            changeStatusIfErrorAbsent(newValue)
        }
    }
});

function changeStatusIfErrorAbsent(statusText) {
    chrome.storage.sync.get("error", ({ error }) => {
        if (error === null) {
           statusDiv.innerText = statusText;
        }
    })
}

function setupConnectingButton(isConnecting) {
    if (isConnecting) {
        setupStopConnectingButton();
    } else {
        setupStartConnectingButton();
    }
}

function showError(text) {
    statusDiv.innerText = text;
    statusDiv.classList.add("error")
}

function hideError() {
    statusDiv.classList.remove("error")
}

function setupStopConnectingButton() {
    connectingButton.innerText = "Stop";
    connectingButton.addEventListener('click', stopConnectingListener);
    connectingButton.removeEventListener('click', startConnectingListener);
}

function setupStartConnectingButton() {
    connectingButton.innerText = "Connect";
    connectingButton.addEventListener('click', startConnectingListener);
    connectingButton.removeEventListener('click', stopConnectingListener);
}

let stopConnectingListener = () => {
    chrome.runtime.sendMessage({ id: "stopConnecting" });
}
let startConnectingListener = () => {
    let props = getProps();
    chrome.runtime.sendMessage({ id: "runConnecting", props });
}

function getProps() {
    let props = {};
    props.sectionText = sectionHeaderInput.value;
    props.buttonText = buttonTextInput.value;
    return props;
}

chrome.storage.sync.get("props", ({ props }) => {
    setupPropsInputs(props);
});

chrome.storage.sync.get("status", ({ status }) => {
    changeStatusIfErrorAbsent(status)
});

setDefaultButton.addEventListener('click', () => {
    chrome.storage.local.set({props: defProps});
    setupPropsInputs(defProps);
});

function setupPropsInputs(props) {
    sectionHeaderInput.value = props.sectionText;
    buttonTextInput.value = props.buttonText;
}


