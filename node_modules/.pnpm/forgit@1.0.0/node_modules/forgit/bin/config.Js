#!/usr/bin/env node

import inquirer from 'inquirer';
import {
  getCredentials,
  saveCredentials,
  getRandomCommitPeriod,
  saveRandomCommitPeriod,
  getMaxCommitsPerDay,
  saveMaxCommitsPerDay,
} from '../lib/configUtils.js';
import {
  promptForCredentials,
  promptForRandomCommitPeriod,
  promptForMaxCommitsPerDay,
} from '../lib/cliUtils.js';

async function main() {
  const currentCredentials = await getCredentials();

  console.log('Configuration actuelle :');
  console.log(currentCredentials || 'Aucune configuration trouvée.');

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Que souhaitez-vous faire ?',
      choices: [
        { name: 'Modifier les identifiants GitHub', value: 'credentials' },
        {
          name: 'Modifier la période de commit aléatoire',
          value: 'randomCommitPeriod',
        },
        {
          name: 'Modifier le nombre maximum de commits par jour',
          value: 'maxCommitsPerDay',
        },
      ],
    },
  ]);

  if (action === 'credentials') {
    const newCredentials = await promptForCredentials(currentCredentials);
    await saveCredentials(newCredentials.username, newCredentials.token);
  } else if (action === 'randomCommitPeriod') {
    const period = await getRandomCommitPeriod();
    const newPeriod = await promptForRandomCommitPeriod(period);
    await saveRandomCommitPeriod(newPeriod);
  } else if (action === 'maxCommitsPerDay') {
    const maxCommits = await getMaxCommitsPerDay();
    const newMaxCommits = await promptForMaxCommitsPerDay();
    await saveMaxCommitsPerDay(newMaxCommits.maxCommits);
  }
}

main().catch(console.error);
