#!/usr/bin/env node

import inquirer from 'inquirer';
import {
  getCredentials,
  saveCredentials,
  getRandomCommitPeriod,
  saveRandomCommitPeriod,
} from '../lib/configUtils.js';
import {
  promptForCredentials,
  promptForRandomCommitPeriod,
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
  }
}

main().catch(console.error);
