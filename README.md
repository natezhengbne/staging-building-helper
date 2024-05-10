# Jenkins Pipeline Building Form Helper - Chrome Extension

This Chrome extension simplifies filling the image tag in Jenkins pipeline building forms by leveraging topic searches in Gerrit.

## Features:

- Input a topic in the search bar.
- Select the desired patch from the search results.
- Click a button to automatically populate the image revision field in the Jenkins page with the selected patch's image revision.

## Installation:

Download the extension.
Go to chrome://extensions in your Chrome browser.
Enable "Developer mode" in the top-right corner.
Load the unpacked extension.

## Example:

Imagine you're building a pipeline and need to specify several image revisions based on Gerrit patches related to the topic "expand-248-uk-address-lookup"

- Open the gerrit page.
- Open the Jenkins pipeline building page.
- In the extension's search bar, type "expand-248-uk-address-lookup."
- Select the appropriate patch from the search results.
- Click the extension button.