# Grammers-Tools

This is a repository that will hold several ease-of-use tools and 'hacks'. These can be used by anyone who finds the tools useful, and new versions could be distributed easily if needed.

## How to install a script

Installing a script is done by adding said script to the desired website. If you are not the developer of that website, the easiest way is to install a Chrome extension called [CJS2](https://chrome.google.com/webstore/detail/custom-javascript-for-web/ddbjnfjiigjmcpcpkmhogomapikjbjdk?hl=nl).

After you have installed the extension, click the CJS icon to open the script editor. In this window, paste this code:

```javascript
var e=document.createElement('script');
e.src='https://cdn.jsdelivr.net/gh/bramkorsten/Grammers-Tools@latest/manage-import-export-adsets.js';
document.body.appendChild(e);
```

Note the second line, you can change the file name at the end to match the script you need.
Some scripts might also need JQuery to function. This can be added in the top right of the CJS window at 'external scripts'.
Here, select the latest version of JQuery.
After these steps, hit save in the top left of the CJS window.

### What scripts need JQuery

The list of scripts that need JQuery to function:

- Manage Import / Export Adsets
