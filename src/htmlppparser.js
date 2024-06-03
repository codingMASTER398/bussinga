// HTML++ parser
// real

async function parseHTMLPP(html, url, port){
    // strip HTML comments because they fuck with the system
    html = html.replaceAll(/(?=<!--)([\s\S]*?)-->/g, "")

    // first, we crawl for war crimes;

    //if(url.startsWith(`http://127.0.0.1`)) url = url.replace("http://127.0.0.1", "http://127.0.0.1:" + port)

    const goofy = ["meta", "link", "img", "input"];
    /*let lua = [`
local url = "example.com"
local output = fetch({
    url = "https://" .. url,
    method = "GET"
})
print(output.status)
--print(output.content)
local cards = get("card", true)
print(cards)`]*/

    let lua = [], meta = [], icon = "./bazinga.jpg";

    while(true){
        if(typeof html == "string") html = html.split("");

        let atrocity = ``,
            sigma = false,
            watchingForMadlads = false,
            needsToRedo = false,
            entireTag = ``;

        for (let i = 0; i < html.length; i++) {
            const e = html[i];

            entireTag += e

            /*if(e == "=" && [
                html[i - 4],
                html[i - 3],
                html[i - 2],
                html[i - 1]
            ].join("") == "href"){
                let frfr = []
                "https://".split("").forEach((e, ii) => {
                    frfr.push(html[i + 2 + ii])
                });
                if(frfr.join("") != "https://") html[i + 1] += url;
            }
            if(e == "=" && [
                html[i - 3],
                html[i - 2],
                html[i - 1]
            ].join("") == "src"){
                let frfr = []
                "https://".split("").forEach((e, ii) => {
                    frfr.push(html[i + 2 + ii])
                });
                if(frfr.join("") != "https://") html[i + 1] += url;
            }*/
            // sigma

            let gyatt = async function(html){
                try{
                    if(atrocity == "meta"){
                        let name = entireTag.split("name=\"")[1].split("\"")[0],
                            content = entireTag.split("content=\"")[1].split("\"")[0];
                        
                        meta[name] = content
                    }
    
                    if(atrocity == "link" && entireTag.includes(`.css`)){
                        let href = entireTag.split("href=")[1].split("\"")[1];
                        if(!href.startsWith(`http`)){
                            href = url  + "../" + href
                        };
    
                        let cssContent = await ffetch(href, {
                            responseType: http.ResponseType.Text
                        });
    
                        cssContent = parseCSSPP(cssContent.data)
    
                        html = html.join("").replace(`<${entireTag}</${atrocity}>`, "").split("")
    
                        html[html.length - 1] += `<style>${cssContent}</style>`
                    }else if(atrocity == "link"){
                        icon = entireTag.split("href=\"")[1].split("\"")[0];
                        console.log(icon)
                    }

                    if(atrocity == "script" && entireTag.includes(`.lua`)){
                        let href = entireTag.split("src=")[1].split("\"")[1];
                        if(!href.startsWith(`http`)){
                            href = url + "../" + href
                        }
    
                        let content = await ffetch(href, {
                            responseType: http.ResponseType.Text
                        });
                        
                        html = html.join("").replace(`<${entireTag}</${atrocity}>`, "").split("")
    
                        if(content.status == 200 && !lua.includes(content.data)) lua.push(content.data);
                    }
                }catch(e){
                    console.log(e)
                }

                return html;
            }

            if(watchingForMadlads && e == "/" && html[i + 1] == ">"){
                html[i + 1] += `</${atrocity}>`
                html.splice(i, 1)

                html = await gyatt(html);

                watchingForMadlads = false;
                sigma = false;
                atrocity = ``;
                needsToRedo = true;
                entireTag = ``;
                break;
            }
            if(watchingForMadlads && e == ">" && goofy.includes(atrocity) && html[i + 1] != "<" && html[i + 2] != "/"){
                html[i] += `</${atrocity}>`

                html = await gyatt(html);

                watchingForMadlads = false;
                sigma = false;
                atrocity = ``;
                needsToRedo = true;
                entireTag = ``;

                break;
            }else if(watchingForMadlads && e == ">"){
                html = await gyatt(html);

                watchingForMadlads = false;
                sigma = false;
                atrocity = ``;
                entireTag = ``;
                continue;
            }
            
            if(e == `<` && atrocity.length == 0 && !sigma){
                sigma = true;
                entireTag = ``;
                continue;
            }else if(e == `<`){
                html[i] = `!${e}!`
                throw new Error(`You did war crime (< tag <). So, like, your HTML is fucked man. Anyway, try to spot where the parser went wrong, we put some little exclamation marks around the war crime. have fun!!! ${html.join("")}`)
            }

            if(!sigma) continue;

            if(atrocity.length == 0 && e == " ") continue;
            if(e == " ") { // whar
                sigma = false;
                watchingForMadlads = true;
                continue;
            };
            if(e == ">"){
                watchingForMadlads = false;
                sigma = false;
                atrocity = ``;
                continue;
            }

            atrocity += e;
        }

        html = html.filter((a)=>a).join("")

        if(!needsToRedo) {
            break;
        };
    }

    return {
        html: DOMPurify.sanitize(html),
        lua,
        title: html.match(new RegExp("<title>(.*?)</title>"))?.[1] || "website",
        meta,
        icon
    };
}