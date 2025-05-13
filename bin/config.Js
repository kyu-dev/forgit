#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { parseISO, formatISO, isValid } from 'date-fns';

const credentialsPath = path.join(os.homedir(), '.forgit-credentials');

async function getCredentials() {
  try {
    const credentialsData = await fs.readFile(credentialsPath, 'utf-8');
    return JSON.parse(credentialsData);
  } catch (error) {
    // Si le fichier n'existe pas ou ne peut être lu, retourne null
    return null;
  }
}

async function saveCredentials(username, token) {
  const credentials = JSON.stringify({ username, token });
  await fs.writeFile(credentialsPath, credentials, 'utf-8');
  console.log("Informations d'identification mises à jour avec succès !");
}

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
    const newCredentials = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: "Nouveau nom d'utilisateur GitHub :",
        default: currentCredentials?.username,
      },
      {
        type: 'password',
        name: 'token',
        message: "Nouveau token d'accès personnel GitHub :",
      },
    ]);
    await saveCredentials(newCredentials.username, newCredentials.token);
  } else if (action === 'randomCommitPeriod') {
    const randomCommitDatesPath = path.join(
      os.homedir(),
      '.forgit-random-commit-dates.json'
    );
    let period = null;

    try {
      const data = await fs.readFile(randomCommitDatesPath, 'utf-8');
      period = JSON.parse(data);
    } catch (error) {
      console.log('Aucune période de commit aléatoire trouvée.');
    }

    if (!period) {
      period = {
        startDate: '',
        endDate: '',
      };
    }

    const newPeriod = await inquirer.prompt([
      {
        type: 'input',
        name: 'startDate',
        message: 'Nouvelle date de début (YYYY-MM-DD) :',
        default: period.startDate,
        validate: function (value) {
          const date = parseISO(value);
          if (isValid(date)) return true;
          return 'Veuillez entrer une date valide au format YYYY-MM-DD.';
        },
        filter: function (value) {
          return formatISO(parseISO(value), { representation: 'date' });
        },
      },
      {
        type: 'input',
        name: 'endDate',
        message: 'Nouvelle date de fin (YYYY-MM-DD) :',
        default: period.endDate,
        validate: function (value) {
          const date = parseISO(value);
          if (isValid(date)) return true;
          return 'Veuillez entrer une date valide au format YYYY-MM-DD.';
        },
        filter: function (value) {
          return formatISO(parseISO(value), { representation: 'date' });
        },
      },
    ]);

    await fs.writeFile(
      randomCommitDatesPath,
      JSON.stringify(newPeriod, null, 2)
    );
    console.log(
      `Période de commit aléatoire mise à jour avec succès : ${newPeriod.startDate} - ${newPeriod.endDate}`
    );
  }
}

main().catch(console.error);
