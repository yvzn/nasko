# abientotbebe.fr

Application de suivi de grossesse pour futur papa ou future maman, avec des conseils pour préparer la naissance : https://www.abientotbebe.fr

Simple tips to welcome your future baby — [demo website in french](https://www.abientotbebe.fr)

## Run locally

This project is a static website generated with [11ty](https://github.com/11ty/eleventy/)

To run the website locally

```bash
npm install
npm run dev
```

then open http://localhost:8080 in browser of choice

## Licensing

This open source software is distributed under MIT license, please refer to [LICENSE](LICENSE) file

### Third party licenses

This project uses open-source, third party software:

- [11ty](https://github.com/11ty/eleventy/): MIT license, Copyright (c) 2017–2023 Zach Leatherman @zachleat

This project takes inspiration from open-source, third party code:

- [MDN Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers): public domain CC0, Any copyright is dedicated to the Public Domain: https://creativecommons.org/publicdomain/zero/1.0/

This project uses graphics under _open_ or _permissive_ licences:

- Fav icon by [Joypixels](https://github.com/joypixels/emoji-toolkit/blob/master/LICENSE.md): [Free license](https://joypixels.com/licenses/free), "a limited personal use only license and is not permitted for business use"
- Illustrations generated by [Bing Creator](https://www.bing.com/create): [Proprietary license](https://www.bing.com/new/termsofuse), "use Creations outside of the Online Services for any legal personal, non-commercial purpose"
- Illustrations generated by [Paper Cut model V1](https://huggingface.co/Fictiverse/Stable_Diffusion_PaperCut_Model): [CreativeML Open RAIL-M license](https://huggingface.co/spaces/CompVis/stable-diffusion-license), "Licensor claims no rights in the Output You generate using the Model"

## Code snippets

Batch convert hi-res images to lo-res (using ImageMagick)

```bash
cd src/assets/hi-res
ls -1 *.png | xargs -I % sh -c 'convert % -resize 128x128 -filter Lanczos ../lo-res/%'
```

Optimize PNGs (using pngquant)

```bash
cd src/assets/hi-res
ls -1 *.png | xargs pngquant --force --strip --speed 1
```
