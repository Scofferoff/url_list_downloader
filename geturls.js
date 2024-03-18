
browser.tabs.query({}, tabs => {
    tabs.forEach(tab => {
        browser.tabs.executeScript(tab.id, {code: "window.location.href"})
        .then(result => {
            const tabUrl = result[0]; // URL of the tab
            console.log(tabUrl);
        })
        .catch(error => {
            console.error(`Failed to retrive Tab URL of ${tab.id}: ${error}`);
        });
    });
});