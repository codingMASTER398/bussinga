const factory = new wasmoon.LuaFactory()

class luaEngine {
    constructor(frame, loc, q){
        const doc = frame.contentWindow.document

        factory.createEngine().then((r)=>{
            this.lua = r;
            const lua = this.lua;

            if(loc.startsWith("bussinga://")){
                this.lua.global.set('__bussinga', {
                    getItem: (t)=>{
                        return localStorage.getItem(t)
                    },
                    set_theme: (t)=>{
                        localStorage.setItem(`theme`, t)
                        window.paintTheme()
                    },
                    set_dns: (t)=>{
                        localStorage.setItem(`dns`, t)
                        window.dnsProviders["buss:"] = new window.dnsLooker(t)
                    },
                    flush_dns: ()=>{
                        window.dnsCache = {}
                    }
                })
            }

            this.lua.global.set('window', {
                location: loc,
                query: q,
                browser: "bussinga"
            })

            let fetchCache = [], waitingToCache = 0;

            function waitUntilCacheStored(){
                return new Promise((r)=>{
                    let i = setInterval(()=>{
                        if(waitingToCache <= 0){
                            r();
                            clearInterval(i)
                        }
                    },0)
                })
            }

            async function doSneaky(func, params){
                try{
                    func(params)
                }catch(e){
                    if(String(e).includes(`C-call boundary`)){
                        console.log(`Workarounding...`)
                        await waitUntilCacheStored()
                        console.log("Cache ready")
                        doSneaky(func, params)
                    }else console.log(e)
                }
            }

            function getElem(c, recursive) {
                if(!c.tagName){
                    if(recursive){
                        let cs = [...doc.querySelectorAll(c), ...doc.querySelectorAll(`.` + c)].map((a)=>getElem(a));
                          
                        return cs;
                    }

                    c = doc.querySelector(c) || doc.querySelector(`.` + c)
                    if(!c) return null;
                }

                return {
                    get_content: ()=>{
                        return c.value || c.checked || c.innerText
                    },
                    get_contents: ()=>{
                        return c.value || c.checked || c.innerText
                    },
                    get_href: ()=>{
                        return c.href
                    },
                    get_source: ()=>{
                        return c.src
                    },
                    get_opacity: ()=>{
                        return c.style.opacity
                    },
                    get_css_name: ()=>{
                        return c.className || c.tagName
                    },
                    set_content: (text)=>{
                        console.log(text)
                        c.innerHTML = text
                    },
                    set_contents: (text)=>{
                        console.log(text)
                        c.innerHTML = text
                    },
                    set_source: (src)=>{
                        c.src = src
                    },
                    set_href: (text)=>{
                        c.href = text
                    },
                    set_opacity: (text)=>{
                        c.style.opacity = text
                    },
                    set_value: (text)=>{
                        c.value = text
                    },
                    on_click: (f) => {
                        c.addEventListener("click", ()=>{
                            doSneaky(f)
                        })
                    },
                    on_submit: (f) => {
                        c.addEventListener(`submit`, async()=>{
                            //await lua.global.get("async")(f)(c.value || c.checked)
                            doSneaky(f, c.value || c.checked)
                        })
                        c.addEventListener(`change`, async()=>{
                            //await lua.global.get("async")(f)(c.value || c.checked)
                            doSneaky(f, c.value || c.checked)
                        })
                    },
                    on_input: (f) => {
                        c.addEventListener(`keyup`, ()=>{
                            f(c.value || c.checked)
                        })
                    }
                }
            }

            this.lua.global.set('__bussingaget', getElem)

            this.lua.global.set('print', (t)=>console.log(t))

            this.lua.global.set('__bussingafetch', (opts) => {
                let found = fetchCache.find((e)=>e.input == JSON.stringify(opts))

                if(found){
                    return {
                        ...found.output,
                        cached: true
                    };
                }

                return new Promise(async(res)=>{
                    try{
                        waitingToCache++;

                        //if(opts.body && !opts?.METHOD || opts?.METHOD != "GET") opts.body = undefined;

                        let out = await ffetch(opts.url, {
                            ...opts,
                            responseType: opts.headers?.["Content-Type"]?.includes("son") ? http.ResponseType.JSON : http.ResponseType.Text
                        })

                        let output = opts.headers?.["Content-Type"]?.includes("son") ? {
                            data: out.data,
                            tt: Array.isArray(out.data)
                        } : {
                            body: out.data,
                            content: out.data,
                            status: out.status,
                            json: ()=>{
                                return JSON.parse(out.content)
                            },
                            text: ()=>{
                                return out.data
                            }
                        }

                        waitingToCache--;
                        fetchCache.push({
                            input: JSON.stringify(opts),
                            output: output
                        })

                        res(output)
                    }catch(e){
                        console.error(e)
                        waitingToCache--;
                        res(null)
                    }
                })
            })
        })
    }
    run(text){
        this.lua.doString(`
function __is_array(table)
    if type(table) ~= 'table' then
        return false
    end

    -- objects always return empty size
    if #table > 0 then
        return true
    end

    -- only object can have empty length with elements inside
    for k, v in pairs(table) do
        return false
    end

    -- if no elements it can be array and not at same time
    return true
end
      

function fetch(...)
    print("HAHA")
    local got = __bussingafetch(...)
    if(got.cached == nil) then
        got = __bussingafetch(...):await()
    end
    
    if(got.tt == true) then
        local bards = {}
        for i = 1, got.data.length do
            table.insert(bards, got.data[i])
        end
        return bards
    end
    if(got.status == nil) then
        return got.data
    end

    return got
end
function get(...)
    local got = __bussingaget(...)
    if(got.length == nil) then
        return got
    end
    
    local bards = {}
    for i = 1, got.length do
        table.insert(bards, got[i])
    end

    return bards
end
${text}`)
    }
}