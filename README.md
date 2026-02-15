# Nicolium (formerly `pl-fe`)

[![Codeberg Repo stars](https://img.shields.io/gitea/stars/mkljczk/nicolium?gitea_url=https%3A%2F%2Fcodeberg.org&logo=Codeberg)](https://codeberg.org/mkljczk/nicolium)
[![GitHub Repo stars](https://img.shields.io/github/stars/mkljczk/nicolium)](https://github.com/mkljczk/nicolium)
[![GitHub License](https://img.shields.io/github/license/mkljczk/nicolium)](https://github.com/mkljczk/nicolium?tab=AGPL-3.0-1-ov-file#readme)
[![Weblate project translated](https://img.shields.io/weblate/progress/pl-fe)](https://hosted.weblate.org/engage/pl-fe/)
![trans rights btw](https://img.shields.io/badge/-rights_btw-wtf?style=flat&label=trans&labelColor=5BCEFA&color=F5A9B8)

Nicolium is a social networking client app. It works with any Mastodon API-compatible software, but it's focused on supporting alternative backends, like Pleroma or GoToSocial.

## Goals

- **Feature-rich**: Nicolium includes a wide range of features, such as a WYSIWYG text editor, draft posts, and more.
- **Compatibility**: Nicolium is compatible with any Mastodon API-compatible software, treating alternative backends as first-class citizens. Chats, emoji reactions, groups, interaction policies? We support them all. Thanks to `pl-api`, which provides a unified interface for interacting with Mastodon API-compatible servers, implementation differences do not affect the user experience.
- **Unopinionated**: Nicolium doesn't impose any arbitrary limitations on the user. We do not specify a limit of reactions you can use on a single post and try to implement every feature available in the API.
- **Stay private**: Nicolium includes features which help you maintain online privacy. This includes URL cleaning, which helps you remove unwanted parts of URLs used to mark your online activity.

## Try it out

Want to test Nicolium with **any existing MastoAPI-compatible server?** Try [web.nicolium.app](https://web.nicolium.app) — enter your server's domain name to use Nicolium on any server!

If you want to use Nicolium on your server, follow the installation instructions in the documentation. We offer guides for [Pleroma/Akkoma](https://pl.mkljczk.pl/docs/installing/pleroma/), [Iceshrimp.NET](https://pl.mkljczk.pl/docs/installing/iceshrimp/), [Mitra](https://pl.mkljczk.pl/docs/installing/mitra/), and [standalone installations](https://pl.mkljczk.pl/docs/installing/standalone/).

## Repository

The repository hosts Nicolium, but also libraries related to the project. Currently, this includes:
- [Nicolium](./packages/pl-fe/) itself — a social networking client app
- [pl-api](./packages/pl-api) — a library for interacting with Mastodon API-compatible servers, focused on support for projects extending the official Mastodon API. It is used by Nicolium.
- [pl-hooks](./packages/pl-hooks) — a library including hooks for integrating with Mastodon API, based on `pl-api` and TanStack Query. It is intended to be used within Nicolium. Work  in progress.

## Contributing

This project is hosted on [Codeberg](https://codeberg.org/mkljczk/nicolium) and [GitHub](https://github.com/mkljczk/nicolium). You can open issues on Codeberg or create pull requests on both platforms.

You can find more information about setting up the development environment in [the documentation](https://pl.mkljczk.pl/docs/contributing/nicolium/).

## ~~FAQ / Common misconceptions~~

### ~~What does the project name mean?~~

~~I named the project after my now-deprecated personal fork of Pleroma, called simply `pl`. They were meant to be recommended together. However, `pl-fe` evolved into something more serious than a little fork. This is a bad and confusing name, but I don't really care about branding.~~

> For a maintained fork of Pleroma focused on Nicolium compatibility, check out my new project, [Nicolex](https://codeberg.org/mkljczk/nicolex).

~~I will bite people calling `pl-fe` *Polish front-end* or *Polish Soapbox*. And I don't mean sending them the [`Bite` activity](https://ns.mia.jetzt/as/) (which works in pl-fe on supported backends btw).~~

## License

Nicolium is a fork of [Soapbox](https://gitlab.com/soapbox-pub/soapbox/) and inherits a lot of code from [Mastodon](https://github.com/mastodon/mastodon/).

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

---

Follow [my Pleroma account](https://pl.fediverse.pl/@mkljczk) to stay up to date on Nicolium development.


This project is tested with BrowserStack.
