let newURL = 'https://www.linkedin.com/mynetwork/';
let networkTab = null;
const defaultSectionText = "More suggestions for you"
const defaultButtonText = "Connect"
let startStatus = "Please click Connect button for start";
let defProps = {sectionText: defaultSectionText, buttonText: defaultButtonText};


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (networkTab !== null && tab.id === networkTab.id && changeInfo.status === 'complete') {
        chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['connect.js']})
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, info) {
    if (tabId === networkTab.id) {
        chrome.storage.sync.set({ isConnecting: false });
    }
});

chrome.storage.sync.set({ isConnecting: false });
chrome.storage.sync.set({ props: defProps });
chrome.storage.sync.set({ error: null });
chrome.storage.sync.set({ status: startStatus });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.id === 'runConnecting') {
        chrome.storage.sync.set({ isConnecting: true });
        chrome.storage.sync.set({ props: message.props });
        chrome.storage.sync.set({ error: null });
        chrome.tabs.create({ url: newURL }, (tab) => {
            networkTab = tab;
        });
    }
    if (message.id === 'stopConnecting') {
        chrome.storage.sync.set({ status: startStatus });
        chrome.storage.sync.set({ isConnecting: false });
    }
    if (message.id === 'error') {
        chrome.storage.sync.set({ error: message.text });
    }
    if (message.id === 'status') {
        chrome.storage.sync.set({ status: message.text });
    }
});