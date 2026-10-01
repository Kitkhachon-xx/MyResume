# My Resume

Static resume site built with [Astro](https://astro.build).

```
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Deploy on Vercel

Import this GitHub repo in the Vercel dashboard. Astro is auto-detected (see `vercel.json`); every push to `main` redeploys.

## Download CV button

Put your CV at `public/cv.pdf`. Until the file exists, the button links to a missing file.
