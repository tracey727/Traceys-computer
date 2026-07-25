# Security guidance

- Never place API keys in `index.html`, `app.js`, screenshots, GitHub issues or source control.
- Use `.env.local` only on the local computer.
- Use Vercel Environment Variables for deployment.
- Keep the GitHub repository private unless the owner deliberately decides otherwise.
- Set `APP_ACCESS_CODE` on Vercel before sharing the deployed address.
- Rotate a key immediately if it is exposed.
- Review provider usage dashboards and set spending limits where available.
- This starter does not include user accounts or public-use rate limiting. Add authentication and rate limiting before offering unrestricted access to other people.
