import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { parseISO, formatISO, isValid } from 'date-fns';

const credentialsPath = path.join(os.homedir(), '.forgit-credentials');
const randomCommitDatesPath = path.join(
  os.homedir(),
  '.forgit-random-commit-dates.json'
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
