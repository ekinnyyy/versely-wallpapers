VERSELY ADMIN SETUP

You will only do the technical setup once.

1) Create a GitHub repository named: versely-wallpapers
2) Upload ALL files from this folder to that repository.
3) Open admin/config.yml on GitHub.
4) Replace:
   YOUR_GITHUB_USERNAME/versely-wallpapers
   with your actual GitHub username/repository.
5) Create a NEW Cloudflare Pages project:
   Workers & Pages > Create > Pages > Connect to Git
   Select the versely-wallpapers GitHub repository.
6) No build command is needed for this static site.
   Root/build output directory should be the repository root.
7) After deployment, open:
   https://YOUR-NEW-PAGES-DOMAIN.pages.dev/admin/

Sveltia CMS will show a login screen. For the simplest single-user setup,
use its GitHub access-token login option.

After that, daily usage is:
Admin > Wallpapers > Wallpaper Library > Add item
Upload image
Enter title/category/credit
Save/Publish

Cloudflare will automatically redeploy after the CMS commits the change to GitHub.

IMPORTANT:
Your existing Cloudflare Direct Upload project cannot be converted to Git integration.
Create a new Pages project connected to GitHub.
