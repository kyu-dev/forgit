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
    // Si le fichier n'existe pas ou ne peut pas être lu, on retourne null
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
        type: 'password', // 'password' masquera l'entrée
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

  // Pour l'instant, affichons simplement les identifiants
  // Prochaine étape: utiliser ces identifiants pour appeler fetchGitHubContributions
  console.log('Username:', credentials.username);
  console.log('Token:', credentials.token ? '********' : 'Non défini'); // Masquer le token pour la sécurité

  // TODO: Appeler fetchGitHubContributions(credentials.username, credentials.token)
  // Assurez-vous que la fonction fetchGitHubContributions est importée et disponible ici.
}

main().catch(console.error);
