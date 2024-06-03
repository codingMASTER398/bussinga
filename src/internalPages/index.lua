local themeSelect = get("theme")
local dns = get("dns")
local dnsFlush = get("dnsFlush")
local newTabPage = get("newTabPage")

themeSelect.set_value(__bussinga.getItem("theme"))
dns.set_value(__bussinga.getItem("dns"))
newTabPage.set_value(__bussinga.getItem("newTabPage"))

themeSelect.on_input(function(selected)
    __bussinga.set_theme(selected)
end)

dns.on_submit(function(selected)
    __bussinga.set_dns(selected)
    get("dnsOK").set_content("Updated to " .. selected)
end)

newTabPage.on_submit(function(selected)
    __bussinga.set_newtab(selected)
    get("newTabPageOK").set_content("Updated to " .. selected)
end)

dnsFlush.on_click(function()
    __bussinga.flush_dns()
    dnsFlush.set_content("Done!")
end)