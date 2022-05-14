// let changeColor = document.getElementById("changeColor");
let saveButton = document.getElementById("save-item");
let itemsList = document.getElementById("items-list");
let hostlist = ["www.amazon.com", "us.shein.com"]
// chrome.storage.sync.clear()
setOriginalItems()

// chrome.storage.sync.get("color", ({ color }) => {
//     changeColor.style.backgroundColor = color;
// });

// When the button is clicked, inject setPageBackgroundColor into current page
saveButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        var title = tab.title;
        var url = tab.url;
        var host = new URL(url).hostname;
        console.log(host)

        if (hostlist.includes(host)) {
            chrome.storage.sync.get(["items"], (savedItems) => {
                if (!checkIfItemExists(savedItems.items, url)) {
                    if (savedItems.items.length > 0) {
                        chrome.storage.sync.set({ "items": [...savedItems.items, { title, url }] }, () => {
                            createItem(title, url)
                        });
                    }
                    else {
                        chrome.storage.sync.set({ "items": [{ title, url }] }, () => {
                            createItem(title, url)
                        });
                    }
                }
            });
        }
        else {
            showError("This website is not supported")
        }
    });

    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     function: setPageBackgroundColor,
    // });
});


// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({ color }) => {
        document.body.style.backgroundColor = color;
    });
}

function setOriginalItems() {
    console.log("set original items")
    while (itemsList.firstChild) {
        itemsList.removeChild(itemsList.firstChild);
    }
    chrome.storage.sync.get(["items"], (items) => {
        for (let item of items.items) {
            createItem(item.title, item.url)
            console.log(item)
        }
        console.log(items)
    });
}

function checkIfItemExists(items, url) {
    var exists = false;
    if (items != undefined) {
        for (let item of items) {
            if (item.url == url) {
                exists = true;
                break
            }
        }
    }
    return exists;
}

function createItem(title, url) {
    let li = document.createElement("li");
    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Remove";
    li.innerText = title + ": " + url;
    li.dataset.url = url;
    li.appendChild(deleteButton);
    itemsList.appendChild(li);

    deleteButton.addEventListener("click", () => { deleteItem(url) });
}

function deleteItem(url) {
    chrome.storage.sync.get(["items"], (savedItems) => {
        let newItems = savedItems.items.filter(item => item.url != url);
        chrome.storage.sync.set({ "items": newItems });
    });
    let item = document.querySelector(`[data-url="${url}"]`);
    item.remove()

    console.log("item deleted")
}

function showError(message) {
    let error = document.getElementById("error");
    error.innerText = message;
    error.style.display = "block";
}