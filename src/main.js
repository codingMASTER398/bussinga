let THEME;

window.dnsCache = {}

if(!localStorage.getItem(`dns`)) localStorage.setItem(`dns`, `https://api.buss.lol/domain`);

// Init window whatever
const appWindow = __TAURI__.window.appWindow,
      http = __TAURI__.http

window.http = http;
window.ffetch = http.fetch;

document
  .getElementById('titlebar-minimize')
  .addEventListener('click', () => appWindow.minimize())
document
  .getElementById('titlebar-maximize')
  .addEventListener('click', () => appWindow.toggleMaximize())
document
  .getElementById('titlebar-close')
  .addEventListener('click', () => appWindow.close());

function isFullScreen(){
  return appWindow.isMaximized() || appWindow.isFullScreen();
}

window.addEventListener(`resize`, ()=>{
  setTimeout(async()=>{
    if(await isFullScreen()){
      document.getElementById(`fullScreenIcon`).className = "bx bx-exit-fullscreen"
    }else document.getElementById(`fullScreenIcon`).className = "bx bx-fullscreen"
  },10)
})

// Init themes
let themeConfig;
async function paintTheme(reloadAll = true){
  if(!localStorage.getItem("theme")) localStorage.setItem("theme", "classic");
  THEME = localStorage.getItem("theme")

  themeConfig = window.themes[THEME]
  window.themeConfig = themeConfig;

  document.documentElement.style = ``
  for (const key in themeConfig) {
    document.documentElement.style.setProperty('--' + key, themeConfig[key])
  }

  if(!reloadAll) return;
  ;[...document.querySelectorAll(`iframe`)].reverse().forEach((i)=>{
    i.c.refresh();
  })
}
paintTheme(false);
window.paintTheme = paintTheme;

// alright actual website stuff now
function getRawGithubIndexUrl(githubUrl) {
  // Extract username and repo name from the URL
  const [username, repoName] = githubUrl.replace(`https://github.com/`, ``).split("/");

  // Return the transformed URL for raw content
  return `https://raw.githubusercontent.com/${username}/${repoName}/main/index.html`;
}

function traverse(o,func) {
  for (var i in o) {
      func.apply(this,[i,o[i]]);  
      if (o[i] !== null && typeof(o[i])=="object") {
          //going one step down in the object tree!!
          traverse(o[i],func);
      }
  }
}

let currentTabID = 0;
window.tabs = []

class dnsLooker {
  constructor(url){
    this.url = url;
  }

  lookup(siteName, tld){
    return new Promise((resolve, reject)=>{
      ffetch(`${this.url}/${siteName}/${tld}`).then((r)=>{
        switch(r.status){
          case 200:
            resolve(r.data)
            break;
          case 404:
            reject({
              title: `Not Found`,
              text: `${siteName}.${tld} doesn't exist.`
            })
            break;
          default:
            reject({
              title: `DNS Error`,
              text: `Returned ${r.status}, body ${r.data}`
            })
            break;
        }
      }).catch((e)=>{
        reject({
          title: `Internal DNS Error`,
          text: e
        })
      })
    })
  }
}

window.dnsLooker = dnsLooker;

class site {
  constructor(url, id){
    this.iframe = document.createElement(`iframe`)
    this.iframe.setAttribute(`sandbox`, `allow-same-origin allow-scripts`)

    const tabID = id || ++currentTabID

    this.tabID = tabID
    this.iframe.c = this;
    this.iframe.style.display = "none"

    this.iframe.setAttribute(`tabID`, tabID)
    tabs.push(tabID)

    document.querySelector(`#contents`).appendChild(this.iframe);

    this.navigate(url);
  }
  navigate(url){
    this.iframe.contentWindow.document.close();
    this.iframe.setAttribute(`title`, "bussinga!")
    this.iframe.setAttribute(`image`, "")
    this.iframe.setAttribute(`location`, url)

    uiRefresh();
    if(selectedTab == this.tabID) document.querySelector(`#search`).value = url;

    // Get info about the domain
    this.urlParsed = new URL(url)
    this.tld = this.urlParsed.host.split(".")[this.urlParsed.host.split(".").length - 1];
    this.siteName = this.urlParsed.host.split(".")[0];
    this.protocol = this.urlParsed.protocol;

    // Init page
    this.doc = this.iframe.contentWindow.document;
    this.doc.open();

    // Init LUA
    this.lua = new luaEngine(this.iframe, url, Object.fromEntries(this.urlParsed.searchParams))

    // after DNS lookup
    let finishUp = ()=>{
      this.doc = this.iframe.contentWindow.document;

      let injected = `
      /* injected by bussinga */
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Varela+Round&display=swap');
      body{
        width:100vw;
        height:100vh;
        font-family: ${themeConfig["font"]};
      }
      img{
        width: fit-content;
      }
      *{flex-shrink:0;}
      hr{
        width:100%;
      } 
      h1,h2,h3,h4,h5,h6,p,a{
        margin: 3px;
      }
      a{
        color: ${themeConfig["link"]};
        text-decoration: none;
      }
      p, a, select{
        font-size: x-small;
      }
      button, input, select, option{
        background-color: ${themeConfig["button"]};
        font-family: ${themeConfig["font"]};
        transition: 0.2s;
        color: ${themeConfig["text1"]};
        border: none;
        border-radius: 6px;
        padding: 18px;
        padding-top: 12px;
        padding-bottom: 12px;
      }
      select{
        color:${themeConfig["text2"]};
        margin: 0;
        padding-top: 8px;
        padding-bottom: 8px;
        outline: none;
      }
      input{
        box-shadow: 0 0 3px black inset;
      }
      button:hover{
        background-color: ${themeConfig["highlight"]};
        transition: 0.2s;
      }
      hr{
        border: none;
        border-bottom: 1px solid ${themeConfig["text1"]};
      }
      body{
        background-color: ${themeConfig["background"]};
        color: ${themeConfig["text1"]};
      }`,
        injectedElement = document.createElement(`style`);
      
      injectedElement.innerHTML = injected

      this.doc.head.prepend(injectedElement)

      if(!this.doc.body.firstChild.tagName){
        this.doc.body.firstChild.remove();
      }

      this.iframe.contentWindow.addEventListener(`click`, (e)=>{
        if(e.target?.href?.startsWith("buss://")){
          this.navigate(e.target.href)
        }
      })

      uiRefresh();
    }

    let showError = (e)=>{
      this.doc.write(`<style>
        body{
            margin: 34px;
            font-family: "Monospace";
        }
    </style>
    <title>Error</title>
    
    <h1>${e.title}</h1>
    <p>${e.text}</p>`)
      finishUp();
      uiRefresh();
    }

    // DNS lookup
    console.log(`DNS lookup...`)

    this.iframe.setAttribute(`title`, `DNS lookup...`)
    uiRefresh()

    ;(async()=>{
      let IP;

      try{
        IP = await window.domains.lookup(this.siteName, this.tld, this.protocol);
        IP = IP.ip;
      }catch{
        showError({
          title: `Not Found`,
          text: `${url} doesn't exist.`
        })
        return;
      }

      if(IP.startsWith(`https://github.com/`)){
        IP = getRawGithubIndexUrl(IP)
      }

      console.log(`DNS lookup done`)

      this.iframe.setAttribute(`title`, "Loading...")
      uiRefresh()

      ffetch(IP, {
        method: "GET",
        responseType: http.ResponseType.Text
      }).then(async (r)=>{
        if(String(r.status).startsWith(`5`)){
          showError({
            title: `Website error`,
            text: `The WebX site you're navigating to returned a 5xx error code: ${r.status}. This is simply unacceptable, thus I refuse to render it.`
          })
          return;
        }
        
        console.log(`Website fetch done`)
        let parsedIP = new URL(IP),
          parsed = await parseHTMLPP(r.data, parsedIP.protocol + "//" + parsedIP.hostname + parsedIP.pathname + "/", parsedIP.port);
        
        this.doc.write(parsed.html)

        this.iframe.setAttribute(`title`, parsed.title)
        this.iframe.setAttribute(`image`, parsed.icon)

        finishUp();

        parsed.lua.forEach((l)=>{
          this.lua.run(l)
        })

        uiRefresh();
      })
    })()
  }
  refresh(){
    this.navigate(this.iframe.getAttribute(`location`))
  }
  close(){
    try{
      window.tabs = window.tabs.filter((i) => i != this.tabID);
      this.iframe.remove();
      uiRefresh()

    }catch(e){
      console.log(e)
    }
  }
}

window.site = site;

let dnsProviders = {
  "bussinga:": {
    lookup: (url, tld)=>{
      return new Promise((res,rej)=>{
        if(tld != "bang" || !["welcome"].includes(url)) rej();
        res({
          ip: `https://bussingah.pages.dev/${url}.html`
        })
      })
    }
  },
  "localhost:": {
    lookup: (url, tld)=>{
      return new Promise((res,rej)=>{
        res({
          ip: `http://127.0.0.1:${url}/index.html`
        })
      })
    }
  },
  "buss:": new dnsLooker(localStorage.getItem(`dns`))
}
window.dnsProviders = dnsProviders;

window.domains = {
  lookup: (url, tld, protocol)=>{
    return new Promise((res, rej)=>{
      if(window.dnsCache[`${url}|.|${tld}|.|${protocol}`]){
        res(window.dnsCache[`${url}|.|${tld}|.|${protocol}`]);
      }

      if(dnsProviders[protocol]){
        dnsProviders[protocol].lookup(url, tld).then((r)=>{
          window.dnsCache[`${url}|.|${tld}|.|${protocol}`] = r;
          res(r)
        }).catch(rej);
      }
      else rej();
    })

    return;
    return new Promise(async(res, rej)=>{
      for (let i = 0; i < dnsProviders.length; i++) {
        try{
          res(await dnsProviders[i].lookup(url, tld));
        }catch{}
      }

      rej()
    })
  }
}

uiRefresh();

//new site("buss://dnssearch.uwu")
//new site("buss://yap.yap?dingle=it")
//new site("buss://minesweeper.lol")
//new site("buss://blackjack.lol")
//new site("bussinga://welcome")