import { ipcRenderer } from "electron";

// Trigger Crawling
async function crawlForums(urls: string[], maxPages: number) {
    const response = await ipcRenderer.invoke("crawl-forums", urls, maxPages);
    console.log(response);
}

// Build Vector Store
async function buildVectorStore() {
    const response = await ipcRenderer.invoke("build-vector-store");
    console.log(response);
}

// Ask a Question
async function askQuestion(question: string) {
    const response = await ipcRenderer.invoke("ask-question", question);
    console.log("Answer:", response.answer);
    console.log("Sources:", response.sources);
}

// Example Usage
document.getElementById("crawlBtn").addEventListener("click", () => {
    const urls = ["https://example.com/forum"];
    crawlForums(urls, 100);
});

document.getElementById("buildBtn").addEventListener("click", buildVectorStore);

document.getElementById("askBtn").addEventListener("click", () => {
    const question = "What does DTC code P0123 mean?";
    askQuestion(question);
});
