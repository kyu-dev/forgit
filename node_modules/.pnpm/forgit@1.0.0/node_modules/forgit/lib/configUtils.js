import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const credentialsPath = path.join(os.homedir(), '.forgit-credentials');
const randomCommitDatesPath = path.join(
  os.homedir(),
  '.forgit-random-commit-dates.json'
);
const maxCommitsPerDayPath = path.join(
  os.homedir(),
  '.forgit-max-commits-per-day.json'
);

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
  console.log("Informations d'identification mises à jour avec succès !");
}

export async function getRandomCommitPeriod() {
  try {
    const data = await fs.readFile(randomCommitDatesPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

export async function saveRandomCommitPeriod(period) {
  await fs.writeFile(randomCommitDatesPath, JSON.stringify(period, null, 2));
  console.log(
    `Période de commit aléatoire mise à jour avec succès : ${period.startDate} - ${period.endDate}`
  );
}

export async function getMaxCommitsPerDay() {
  try {
    const data = await fs.readFile(maxCommitsPerDayPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { maxCommits: 3 }; // Valeur par défaut si le fichier n'existe pas
  }
}

export async function saveMaxCommitsPerDay(maxCommits) {
  await fs.writeFile(
    maxCommitsPerDayPath,
    JSON.stringify({ maxCommits }, null, 2)
  );
  console.log(
    `Nombre maximum de commits par jour mis à jour avec succès : ${maxCommits}`
  );
}
