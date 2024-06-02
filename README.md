# Bussinga!
![Bussinga!](/src-tauri/icon.png)

A beta better browser for [WebX](https://github.com/face-hh/webx), traditionally browsed through Napture.

Currently, it supports styling most websites, lua that doesn't use `fetch` extensively, and the parsing of HTML++. It's written in [Tauri](https://tauri.app/), so HTML, CSS & JS. Don't worry though- webx sites will never be able to use JavaScript!

I'm probably gonna iron out a ton of issues tomorrow, but for now if you'd like to test the early beta you can head on over to **Releases**. The Windows version should probably work, not sure about the Linux one at the moment though. It's late, not enough time to build.

It has, like,
- Lua that doesn't hang the main thread & is lightning-fast
- Tabs
- Themes
- An easily swappable DNS
- Localhost testing with `localhost://3000`
- Sheldon cooper

### Messy code disclaimer
This is a weekend project that I'll probably forget about after a few days! It's purpose is to work, not be documented nor clean. Please be advised and look away at painful loops and stringged if/else statements.

## Implementing Bussinga in your WebX site
It should (hopefully) work out of the box. Some sites like **register.it** and **chat.it** have already proven to not work yet, and I'll iron out those soon.

You can take advantage of traditional CSS styling with everything from IDs to animations by including `/* bussinga! */` anywhere in your CSS.

The `fetch` API is clunky as of now, but should work for most use cases, especially in the top-level.