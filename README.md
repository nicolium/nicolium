# pl-fe

[![Codeberg Repo stars](https://img.shields.io/gitea/stars/mkljczk/pl-fe?gitea_url=https%3A%2F%2Fcodeberg.org&logo=Codeberg)](https://codeberg.org/mkljczk/pl-fe)
[![GitHub Repo stars](https://img.shields.io/github/stars/mkljczk/pl-fe)](https://github.com/mkljczk/pl-fe)
[![GitHub License](https://img.shields.io/github/license/mkljczk/pl-fe)](https://github.com/mkljczk/pl-fe?tab=AGPL-3.0-1-ov-file#readme)
[![Weblate project translated](https://img.shields.io/weblate/progress/pl-fe)](https://hosted.weblate.org/engage/pl-fe/)

`pl-fe` is a social networking client app. It works with any Mastodon API-compatible software, but it's focused on supporting alternative backends, like Pleroma or GoToSocial.

## Goals

- **Feature-rich**: `pl-fe` includes a wide range of features, such as a WYSIWYG text editor, draft posts, and more.
- **Compatibility**: `pl-fe` is compatible with any Mastodon API-compatible software, treating alternative backends as first-class citizens. Chats, emoji reactions, groups, interaction policies? We support them all. Thanks to `pl-api`, which provides a unified interface for interacting with Mastodon API-compatible servers, implementation differences do not affect the user experience.
- **Unopinionated**: `pl-fe` doesn't impose any arbitrary limitations on the user. We do not specify a limit of reactions you can use on a single post and try to implement every feature available in the API.
- **Stay private**: `pl-fe` includes features which help you maintain online privacy. This includes URL cleaning, which helps you remove unwanted parts of URLs used to mark your online activity.

## Try it out

Want to test `pl-fe` with **any existing MastoAPI-compatible server?** Try [pl.mkljczk.pl](https://pl.mkljczk.pl) — enter your server's domain name to use `pl-fe` on any server!

If you want to use `pl-fe` as the default frontend on your server, download the latest build from [pl.mkljczk.pl/pl-fe.zip](http://pl.mkljczk.pl/pl-fe.zip) and install it following the instructions for your backend. For example, on a standard Pleroma installation you can use:

```sh
curl -O https://pl.mkljczk.pl/pl-fe.zip
unzip pl-fe.zip -d /opt/pleroma/instance/static/
rm pl-fe.zip
```

**Note**: Some Fediverse software (Akkoma, Mitra) use Content Security Policy configuration which disallows the usage of inline styles, which are used by pl-fe for color schemes. [Mangane README](https://github.com/BDX-town/Mangane/) suggests using server configuration to override the default CSP header:
>
> Here is an example configuration for nginx:
> ```
> # add style-src for mangane
> proxy_hide_header Content-Security-Policy;
> add_header Content-Security-Policy "upgrade-insecure-requests;script-src 'self';connect-src 'self' blob: https://example.com wss://example.com;media-src 'self' https:;img-src 'self' data: blob: https:;default-src 'none';base-uri 'self';frame-ancestors 'none';style-src 'self' 'unsafe-inline';font-src 'self';manifest-src 'self';" always;
> ```
> *Please replace https://example.com with your own domain*

## Repository

The repository hosts `pl-fe`, but also libraries related to the project. This includes:

- [pl-fe](./packages/pl-fe/) itself — a social networking client app
- [pl-api](./packages/pl-api) — a library for interacting with Mastodon API-compatible servers, focused on support for projects extending the official Mastodon API. It is used by `pl-fe`.
- [pl-hooks](./packages/pl-hooks) — a library including hooks for integrating with Mastodon API, based on `pl-api` and TanStack Query. It is intended to be used within `pl-fe`. Work  in progress.

More projects to be announced.

## Contributing

This project is hosted on [Codeberg](https://codeberg.org/mkljczk/pl-fe) and [GitHub](https://github.com/mkljczk/pl-fe). You can open issues on Codeberg or create merge requests on both platforms.

Code contributions are welcome. I will provide contributing guidelines after I decide whether the current monorepo model is the correct approach.

[Weblate](https://hosted.weblate.org/projects/pl-fe/) is used for project translation.

<a href="https://hosted.weblate.org/engage/pl-fe/">
<img src="https://hosted.weblate.org/widget/pl-fe/287x66-grey.png" alt="Translation status" />
</a>

## FAQ / Common misconceptions

### What does the project name mean?

I named the project after my personal fork of Pleroma, called simply `pl`, which I don't really recommend running in production. They were meant to be recommended together. However, `pl-fe` evolved into something more serious than a little fork. This is a bad and confusing name, but I don't really care about branding.

I will bite people calling `pl-fe` *Polish front-end* or *Polish Soapbox*. And I don't mean sending them the [`Bite` activity](https://ns.mia.jetzt/as/) (which works in pl-fe on supported backends btw).

## License

`pl-fe` is a fork of [Soapbox](https://gitlab.com/soapbox-pub/soapbox/) and inherits a lot of code from [Mastodon](https://github.com/mastodon/mastodon/).

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

Follow [my Pleroma account](https://pl.fediverse.pl/@mkljczk) to stay up to date on `pl-fe` development.


This project is tested with BrowserStack.
