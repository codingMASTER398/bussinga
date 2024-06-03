# Bussinga!
![Bussinga!](/src-tauri/icon.png)

A beta better browser for [WebX](https://github.com/face-hh/webx), traditionally browsed through Napture.

Currently, it supports styling most websites, lua that doesn't use `fetch` extensively, and the parsing of HTML++. It's written in [Tauri](https://tauri.app/), so HTML, CSS & JS. Don't worry though- webx sites will never be able to use JavaScript!

Bussinga is still in an early beta, and some websites with scripts that fetch stuff a lot might not work. The majority of sites should work, even if they look a little off.

It has, like,
- Lua that doesn't hang the main thread & is lightning-fast
- Tabs
- Themes
- An easily swappable DNS
- Localhost testing with `localhost://3000`
- Sheldon cooper

### Messy code disclaimer
This is a weekend project that I'll probably forget about after a few days! It's purpose is to work, not be documented nor clean. Please be advised and look away at painful loops and stringged if/else statements.


### Look at how to make your site work as well as possible with bussinga in the settings page.