var menuList;

downloadObjectAsJson = (exportObj, exportName) => {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

getAdsetName = () => $(".page-header__title").text();
  
getTimeStamp= () => new Date().toLocaleString().replace(", ","_");

getCurrentAdsetDetails = () => {
  var urlSegments = window.location.href.split("/");
  if (urlSegments[2] !== 'create.choreograph.com') return false;
  if (urlSegments[5] !== 'advertiser') return false;
  if (urlSegments[7] !== 'campaign') return false;
  if (urlSegments[9] !== 'adset') return false;
  return {
    agency: urlSegments[4],
    advertiser: urlSegments[6],
    campaign: urlSegments[8],
    adset: urlSegments[10],
  }
}
getCookie = (name) => {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
getAuthToken = () => {
  var sessionCookie = getCookie('session');
  if (sessionCookie) {
    sessionCookie = JSON.parse(sessionCookie);
  } else {
    console.warn('Could not get session details, are you logged in correctly?');
    return false;
  }
  return sessionCookie.token;
}
getContentFile = async () => {
  return new Promise((resolve) => {
    var input = document.createElement('input');
    input.type = 'file';
    
    input.onchange = e => { 
       var file = e.target.files[0];
       
       var reader = new FileReader();
       reader.readAsText(file,'UTF-8');
    
       // here we tell the reader what to do when it's done reading...
       reader.onload = readerEvent => {
          var content = readerEvent.target.result; // this is the content!
          $(input).remove();
          resolve(content);
       }
    }
    input.click();
  });
}
exportAdsetContent = () => {
  var adsetDetails = getCurrentAdsetDetails();
  if (!adsetDetails) {
    console.warn('failed to get adset details, are you on the correct page?');
    return;
  }
  var url = `https://manage.lemonpi.io/api/v0/adsets-2/${adsetDetails.adset}/content-function?stage=draft`;
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `lemonpi ${getAuthToken()}`,
    },
  })
  .then(response => response.json())
  .then(content => {
    console.log('Succesfully fetched content, downloading...');
    downloadObjectAsJson(content, `${getTimeStamp()}_${getAdsetName()}`);
  })
}

getFormData = (object) => {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
}

importAdsetContent = async () => {
  var content = await getContentFile();
  if (content) {
    try {
      content = JSON.parse(content);
    } catch (e) {
      console.error('Could not parse the content file, is it JSON?', e);
      return;
    }
    if (!content.meta || !content.data || !content.data.placeholders) {
      console.warn('This file appears to be incorrect. Are you sure this is a Manage Content file?');
      return;
    }
    var continueImport = confirm('Are you sure you want to import the provided file into this adset? THIS WILL OVERWRITE ALL CONTENT, AND THERE IS NO WAY BACK!');
    if (!continueImport) return;
    var adsetDetails = getCurrentAdsetDetails();
    if (!adsetDetails) {
      console.warn('failed to get adset details, are you on the correct page?');
      return;
    }
    content.meta['advertiser-id'] = adsetDetails.advertiser;
    var contentBody = {
      json: JSON.stringify(content),
    }
    var url = `https://manage.lemonpi.io/api/v0/adsets-2/${adsetDetails.adset}/content-function?stage=draft`;
    fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `lemonpi ${getAuthToken()}`,
      },
      body: getFormData(contentBody)
    })
    .then(response => {
      if (response.ok === true && response.status === 204) window.location.reload();
      else {
        console.error('Something went wrong while importing the adset. See the error:');
        console.error(response);
      }
    });
  }
  
}
createMenuItem = (title, icon, callback) => {
  var item = menuList.children().eq(0).clone();
  item.find('span').html(title);
  if (icon) item.find('i').html(icon);
  if (typeof callback === 'function') {
    item.click((e) => {
      e.stopPropagation();
      e.preventDefault();
      callback();
      return false;
    })
  }
  menuList.append(item);
}
appendMenuButtons = () => {
  menuList = $('[data-testid=page-header-container] ul');
  
  if (!menuList || menuList.length < 1) return;
  
  clearInterval(buttonInterval);
  
  console.log('Grammers Tools: Adset Import/Export Added to page!');
  
  createMenuItem('Import Adset', 'download', () => {
    console.log('Running Import Function');
    importAdsetContent();
  });
  createMenuItem('Export Adset', 'upload', () => {
    console.log('Running Export Function');
    exportAdsetContent();
  });
}

var buttonInterval = false;

checkUrl = () => {
  var currentUrl = window.location.href;
  var regex = new RegExp('https:\/\/manage.lemonpi.io\/r\/[0-9]+\/advertiser\/[0-9]+\/campaign\/[0-9]+\/adset\/[0-9]+', 'gmi');
  
  var isCorrectUrl = regex.test(currentUrl);
  
  if (isCorrectUrl) {
    buttonInterval = setInterval(() => {
      appendMenuButtons();
    }, 400);
  }
}
window.addEventListener('popstate', function (event) {
	checkUrl();
});

checkUrl();
