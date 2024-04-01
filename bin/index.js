#!/usr/bin/env node

// inquirer, fs, path, os sont maintenant gérés par lib/auth.js
import inquirer from 'inquirer';
import { fetchGitHubContributions } from '../lib/github.js';
import { ensureCredentials } from '../lib/auth.js';
import { parseISO, isValid, format } from 'date-fns';
import { processCommits } from '../lib/commitUtils.js';

async function main() {
  const credentials = await ensureCredentials();

  if (credentials && credentials.username && credentials.token) {
    console.log(`Connecté en tant que ${credentials.username}.`);

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'startDate',
        message: 'Date de début (YYYY-MM-DD) pour les commits rétroactifs:',
        validate: function (value) {
          const date = parseISO(value);
          if (isValid(date)) {
            return true;
          }
          return 'Veuillez entrer une date valide au format YYYY-MM-DD.';
        },
        filter: function (value) {
          return format(parseISO(value), 'yyyy-MM-dd');
        },
      },
      {
        type: 'input',
        name: 'endDate',
        message: 'Date de fin (YYYY-MM-DD) pour les commits rétroactifs:',
        validate: function (value) {
          const date = parseISO(value);
          if (isValid(date)) {
            return true;
          }
          return 'Veuillez entrer une date valide au format YYYY-MM-DD.';
        },
        filter: function (value) {
          return format(parseISO(value), 'yyyy-MM-dd');
        },
      },
      {
        type: 'number',
        name: 'maxCommitsPerDay',
        message: 'Nombre maximum de commits par jour (1-7):',
        default: 3,
        validate: function (value) {
          if (value >= 1 && value <= 7) {
            return true;
          }
          return 'Veuillez entrer un nombre entre 1 et 7.';
        },
      },
    ]);

    console.log("\nRécupération de l'historique des contributions GitHub...");
    const contributionData = await fetchGitHubContributions(
      credentials.username,
      credentials.token
    );

    await processCommits(
      contributionData,
      answers.startDate,
      answers.endDate,
      answers.maxCommitsPerDay
    );
  } else {
    console.log(
      "Impossible d'obtenir les identifiants. Vérifiez la configuration ou les permissions."
    );
  }
}

main().catch(console.error);
