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
  console.log('Gestion de la configuration de Forgit...');
  let currentCredentials = await getCredentials();

  if (currentCredentials) {
    console.log('\nInformations actuelles :');
    console.log(`  Nom d'utilisateur GitHub : ${currentCredentials.username}`);
    console.log(
      `  Token GitHub : ${
        currentCredentials.token ? '******** (enregistré)' : 'Non défini'
      }`
    );
  } else {
    console.log(
      "\nAucune information d'identification n'est actuellement sauvegardée."
    );
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '\nQue souhaitez-vous faire ?',
      choices: [
        { name: 'Mettre à jour les informations', value: 'update' },
        { name: 'Ne rien changer', value: 'exit' },
      ],
    },
  ]);

  if (action === 'update') {
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
  } else {
    console.log('Aucune modification apportée.');
  }
}

main().catch(console.error);
