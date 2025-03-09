import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const credentialsPath = path.join(os.homedir(), '.forgit-credentials');

export async function getCredentials() {
  try {
    const credentialsData = await fs.readFile(credentialsPath, 'utf-8');
    return JSON.parse(credentialsData);
  } catch (error) {
    return null;
  }
}

export async function saveCredentials(username, token) {
  const credentials = JSON.stringify({ username, token });
  await fs.writeFile(credentialsPath, credentials, 'utf-8');
  // Pas de console.log ici, pour que le module soit plus réutilisable
  // Le message de succès sera géré par le script appelant si nécessaire
}

export async function ensureCredentials() {
  let credentials = await getCredentials();

  if (!credentials) {
    console.log(
      'Bienvenue ! Veuillez configurer vos identifiants GitHub pour Forgit.'
    );
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
    console.log('Identifiants sauvegardés avec succès !');
  }
  return credentials;
}
