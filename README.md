# Adly Chess Academy

The complete static website is in `dist/`: HTML pages, CSS, JavaScript, product data and images.

## Run locally

From this folder, run:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Serve the site over HTTP rather than opening HTML files directly: page links and product requests use root-relative paths.

## Hosting

Upload the contents of `dist/` to the root of a static website host. No JavaScript build step is required. The academy page generator is `scripts/build-pages.py`, with source data in `content/`.

## Cart and order requests

`dist/cart.js` and `dist/cart.css` provide the shared cart and checkout. Cart item IDs and quantities are saved in browser localStorage; checkout contact details are not persisted there. Products and displayed prices come from `dist/products.json`.

Checkout sends an order request to `info@adlychess.com` using FormSubmit. The recipient must activate FormSubmit through the email sent to that inbox. Successful submission means the request was accepted by the form service, not that an order is confirmed, paid, or delivered. The academy must confirm stock, options, final prices, delivery costs and payment. Prices are from the existing catalogue snapshot and must be reviewed before confirming orders.

No payment gateway, authoritative inventory, shipping calculator or order-management backend is connected. Card payments require a backend and a merchant payment-provider integration; never collect card details through the email form. FormSubmit, Google Fonts and the embedded Google Map require internet access.

## GitHub Pages

This export includes an automatic deployment workflow at `.github/workflows/pages.yml`.

1. Push the complete project to the repository's `main` branch.
2. In GitHub, open the repository's Settings > Pages and select GitHub Actions as the source.
3. Run the Publish website to GitHub Pages workflow, or push a change to `main`.
4. Once deployment succeeds, use the website URL shown by GitHub Pages.

The workflow builds a separate `_site/` folder and adjusts links and asset paths for the repository's Pages URL. Keep `dist/` unchanged so the original site and local server still work. The workflow follows GitHub's official custom Pages workflow configuration: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

To test a project-path build locally:

```sh
PAGES_BASE_PATH=adly-chess-academy python3 scripts/build-github-pages.py
```

The GitHub repository and Pages deployment must still be created/enabled on your account. This package does not change the existing website's access settings.

## Image recovery

The first Pages workflow retrieves original images from the academy website, converts gallery images to the saved display dimensions, and commits the images to this repository. Later deployments use those committed local files. Original JPG/PNG checksums are validated; generated WebP files preserve the original image content and dimensions but are re-encoded. Publishing stops if a required image cannot be recovered.
