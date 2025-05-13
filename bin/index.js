#!/usr/bin/env node

// inquirer, fs, path, os sont maintenant gérés par lib/auth.js
import { fetchGitHubContributions } from '../lib/github.js';
import { ensureCredentials } from '../lib/auth.js';

async function main() {
  const credentials = await ensureCredentials();

  if (credentials && credentials.username && credentials.token) {
    console.log(
      `Récupération des contributions GitHub pour ${credentials.username}...`
    );
    await fetchGitHubContributions(credentials.username, credentials.token);
  } else {
    console.log(
      "Impossible d'obtenir les identifiants. Vérifiez la configuration ou les permissions."
    );
  }
}

main().catch(console.error);
