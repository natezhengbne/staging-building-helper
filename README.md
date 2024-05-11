# Jenkins Pipeline Building Form Helper - Chrome Extension

This Chrome extension simplifies filling the image tag in Jenkins pipeline building forms by leveraging topic searches in Gerrit.

## Features:

- Search for patches by topic on Gerrit.
- Populate the "revisions" or "site/cluster" fields in the Cluster.pipeline page with the chosen build content.
- Remember the most recently used site and cluster as the default for the next session.

## Limitations:

- Requires manual Gerrit access token generation.
- Limited to Pipeline.cluster build form page.

## Installation:

- Download the extension.
- Go to chrome://extensions in your Chrome browser.
- Enable "Developer mode" in the top-right corner.
- Click the Load unpacked button and select the extension directory

## Example:

Imagine you're building a pipeline and need to specify several image revisions based on Gerrit patches related to the topic "expand-248-uk-address-lookup"

- Refresh the gerrit page.
- Open the pipeline building page in Jenkins.
- Click the extension's action icon (toolbar icon) or right lick to open the context menu
- In the extension's search bar, type "expand-248-uk-address-lookup."
- Select the appropriate patches from the search results.
- Click the button to populate the content.