# Deployment checklist

## Local Windows check

- [ ] Node.js LTS installed.
- [ ] Project extracted to its own folder.
- [ ] `.env.local` created from `.env.example`.
- [ ] At least one provider API key added.
- [ ] `npm test` passes.
- [ ] `npm run check` passes.
- [ ] `npm start` opens the app at `http://localhost:3000`.
- [ ] `/api/health` shows the expected configured providers.
- [ ] A real question returns at least one answer.

## GitHub check

- [ ] Repository is private.
- [ ] `.env.local` is not present in the repository.
- [ ] All project files are committed to `main`.
- [ ] GitHub Actions workflow is green.

## Vercel check

- [ ] Correct GitHub repository imported.
- [ ] Framework preset is Other.
- [ ] Root directory is the repository root.
- [ ] No build command required.
- [ ] Provider keys added as Vercel environment variables.
- [ ] Strong `APP_ACCESS_CODE` added before sharing the address.
- [ ] Deployment succeeds without 404.
- [ ] `/api/health` works on the deployed address.
- [ ] Main page loads.
- [ ] Real question returns a final response.
- [ ] Browser developer console contains no unexpected errors.
