# Jenkins Pipeline Building Form Helper - Chrome Extension

This Chrome extension streamlines the workflow by populating Gerrit patch commit revisions within Jenkins pipeline building form. 
This reduces manual data entry and potential errors, improving developer efficiency.

## Features:

### 0.0.1
- Search for patches by topic/URL/CommitID on Gerrit.
  - Topic: expand-248-uk-address-lookup
  - URL: https://gerrit.dev.benon.com/c/admin-ui/+/124403
  - CommitID(SHA): 3c7a4f7054f73659595d8b974373352aba0a7d53
- Populate the "revisions" or "site/cluster" fields in the Cluster.pipeline page with the chosen build content.
- Remember the most recently used site and cluster as the default for the next session.

### 0.0.2
- Support query staging cluster status through service service-status

## Limitations:

- Requires manual Gerrit access token generation.
- Limited to Pipeline.cluster build form page.

## Installation:

- Download the extension or run `npm i; npm run build`.
- Go to chrome://extensions in your Chrome browser and enable "Developer mode" in the top-right corner.
![image](https://github.com/natezhengbne/staging-building-helper/assets/34373238/75136843-aa55-4459-a5a4-5ac647b7c028)
- Click the Load unpacked button and select the extension directory.
![image](https://github.com/natezhengbne/staging-building-helper/assets/34373238/b83c4bd5-cc6f-457d-948a-b98010466d34)
![image](https://github.com/natezhengbne/staging-building-helper/assets/34373238/fa54290c-7368-4bfd-9fe6-3b2dccd9280e)
![image](https://github.com/natezhengbne/staging-building-helper/assets/34373238/1ad601c2-f7db-4b51-9e89-cf3078b8c59f)

## Example:

Imagine you're building a pipeline and need to specify several image revisions based on Gerrit patches related to the topic "expand-248-uk-address-lookup"

- Refresh the gerrit page.
- Open the pipeline building page in Jenkins.
- Click the extension's action icon (toolbar icon) or right lick to open the context menu
- In the extension's search bar, type "expand-248-uk-address-lookup."
- Select the appropriate patches from the search results.
- Click the button to populate the content.
