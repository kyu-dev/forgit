#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

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
          name: 'Modifier la date du commit aléatoire',
          value: 'randomCommitDate',
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
  } else if (action === 'randomCommitDate') {
    const randomCommitDatesPath = path.join(
      os.homedir(),
      '.forgit-random-commit-dates.json'
    );
    let dates = [];

    try {
      const data = await fs.readFile(randomCommitDatesPath, 'utf-8');
      dates = JSON.parse(data);
    } catch (error) {
      console.log('Aucune date de commit aléatoire trouvée.');
      return;
    }

    const { dateIndex } = await inquirer.prompt([
      {
        type: 'list',
        name: 'dateIndex',
        message: 'Choisissez la date à modifier :',
        choices: dates.map((date, index) => ({
          name: date,
          value: index,
        })),
      },
    ]);

    const { newDate } = await inquirer.prompt([
      {
        type: 'input',
        name: 'newDate',
        message: 'Nouvelle date (YYYY-MM-DDTHH:MM:SSZ) :',
        validate: function (value) {
          const date = new Date(value);
          if (isValid(date)) return true;
          return 'Veuillez entrer une date valide au format YYYY-MM-DDTHH:MM:SSZ.';
        },
      },
    ]);

    dates[dateIndex] = newDate;

    await fs.writeFile(randomCommitDatesPath, JSON.stringify(dates, null, 2));
    console.log(
      `Date du commit aléatoire mise à jour avec succès : ${newDate}`
    );
  }
}

main().catch(console.error);
