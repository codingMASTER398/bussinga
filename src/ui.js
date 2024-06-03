let selectedTab = 1;
window.selectedTab = selectedTab

function uiRefresh(){
    let tabIsSelected = false;

    document.querySelector(`.leftActions`).innerHTML = `<div class="newTab">
        <i class='bx bx-plus'></i>
    </div>`

    ;[...document.querySelectorAll(`iframe`)].reverse().forEach((i)=>{
        let tabElement = document.createElement(`div`)
        tabElement.classList.add(`tab`)

        let image = document.createElement(`div`)
        image.classList.add(`image`)
        image.style = "background-image: url("+i.getAttribute("image")+");"

        let title = document.createElement(`p`)
        title.innerText = i.getAttribute("title")

        let closeBtn = document.createElement(`button`)
        closeBtn.innerHTML = `<i class="bx bx-x"></i>`

        tabElement.appendChild(image)
        tabElement.appendChild(title)
        tabElement.appendChild(closeBtn)
        document.querySelector(`.leftActions`).appendChild(tabElement)

        if(i.getAttribute("tabID") == selectedTab) {
            i.style.display = "block"
            tabIsSelected = true
            tabElement.classList.add(`selected`)
        } else i.style.display = "none";

        tabElement.addEventListener(`click`, ()=>{
            selectedTab = i.getAttribute("tabID")
            document.querySelector(`#search`).value = i.getAttribute("location")
            uiRefresh();
        })
        closeBtn.addEventListener(`click`, ()=>{
            i.c.close();
        })
    })

    document.querySelector(`.newTab`).addEventListener("click", ()=>{
        selectedTab = window.currentTabID + 1;
        new site(localStorage.getItem(`newTabPage`));
    })

    if(!tabIsSelected){
        if(tabs.length > 0){
            selectedTab = tabs[tabs.length - 1];
            let sel = [...document.querySelectorAll(`iframe`)].find((t)=>t.getAttribute(`tabID`) == selectedTab);
            document.querySelector(`#search`).value = sel.getAttribute("location")
        }
        else new site("bussinga://settings.bang");
        uiRefresh();
    }
}

document.querySelector(`#search`).addEventListener('keydown',(e)=>{
    if(e.key == "Enter"){
        let sel = [...document.querySelectorAll(`iframe`)].find((t)=>t.getAttribute(`tabID`) == selectedTab);
        let val = document.querySelector(`#search`).value;
        if(!val.includes("://")) val = "buss://" + val;
        sel.c.navigate(val)
    }
})

function refreshCurrentSite(){
    let sel = [...document.querySelectorAll(`iframe`)].find((t)=>t.getAttribute(`tabID`) == window.selectedTab);
    sel.c.refresh();
}
document.querySelector(`#refreshPage`).addEventListener(`click`, refreshCurrentSite)
document.querySelector(`#settings`).addEventListener(`click`, ()=>{
    selectedTab = window.currentTabID + 1;
    new site(`bussinga://settings.bang`);
})