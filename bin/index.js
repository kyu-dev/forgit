#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fetchGitHubContributions } from '../lib/github.js'; // Assurer la minuscule .js

const credentialsPath = path.join(os.homedir(), '.forgit-credentials');

// ... reste du code ...
async function getCredentials() {
  try {
    const credentialsData = await fs.readFile(credentialsPath, 'utf-8');
    return JSON.parse(credentialsData);
  } catch (error) {
    return null;
  }
}

async function saveCredentials(username, token) {
  const credentials = JSON.stringify({ username, token });
  await fs.writeFile(credentialsPath, credentials, 'utf-8');
}

async function main() {
  let credentials = await getCredentials();

  if (!credentials) {
    console.log('Bienvenue ! Veuillez configurer vos identifiants GitHub.');
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: "Quel est votre nom d'utilisateur GitHub ?",
      },
      {
        type: 'password',
        name: 'token',
        message: "Quel est votre token d'accès personnel GitHub ?",
      },
    ]);
    await saveCredentials(answers.username, answers.token);
    credentials = answers;
    console.log('Identifiants sauvegardés !');
  } else {
    console.log(`Bienvenue ${credentials.username} ! Identifiants chargés.`);
  }

  if (credentials && credentials.username && credentials.token) {
    console.log('Récupération des contributions GitHub...');
    await fetchGitHubContributions(credentials.username, credentials.token);
  } else {
    console.log(
      "Nom d'utilisateur ou token manquant. Impossible de récupérer les contributions."
    );
  }
}

main().catch(console.error);
