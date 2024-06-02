// css plus plus
const notClasses = [`body`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `div`, `p`, `ul`, `ol`, `li`, `div`, `button`, `hr`, `img`, `input`, `textarea`, `button`, `select`, `option`]

function parseCSSPP(p){
    if(p.includes(`/* bussinga! */`)) return p;

    p = CSSJSON.toJSON(p)

    console.log(p)

    for (const key in p.children) {
        if(!notClasses.includes(key)){
            p.children["." + key] = p.children[key];
            delete p.children[key];
        }
    }

    let loop = (a)=>{
        for (const key in a) {
            if(Object.keys(a[key].children).length > 0) loop(a[key].children);

            if(Object.keys(a[key].attributes).find((a)=>{
                return ["direction", "gap", "align-items", "justify-content"].includes(a)
            })){
                a[key].attributes["display"] = "flex"
            }else{
                a[key].attributes["height"] = "fit-content"
                //a[key].attributes["display"] = "inline-block"
            }

            if(!isNaN(Number(a[key].attributes["gap"]))) a[key].attributes["gap"] += "px"
            a[key].attributes["margin"] ??= "3px"
            a[key].attributes["flex-direction"] = a[key].attributes["direction"]
            a[key].attributes["justify-content"] ??= a[key].attributes["align-items"]
        }
    }
    loop(p.children)

    p = CSSJSON.toCSS(p)
    return p;
}