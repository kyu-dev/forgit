#!/usr/bin/env node

// inquirer, fs, path, os sont maintenant gérés par lib/auth.js
import inquirer from 'inquirer';
import { fetchGitHubContributions } from '../lib/github.js';
import { ensureCredentials } from '../lib/auth.js';
import { parse, isValid, formatISO, parseISO } from 'date-fns';
import {
  createDatedCommit,
  createRandomCommitsInPeriod,
} from '../lib/commitUtils.js';
import { execa } from 'execa';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { getRandomCommitPeriod } from '../lib/configUtils.js';
import { getRandomTimeForCommit } from '../lib/dateUtils.js';
import { checkStagedFiles, stageRandomFiles } from '../lib/gitUtils.js';

async function main() {
  const credentials = await ensureCredentials();

  if (!credentials || !credentials.username) {
    console.log(
      "Impossible de vérifier l'identité via Forgit. Assurez-vous d'être configuré."
    );
    return;
  }

  console.log(
    `Identité Git potentielle (via Forgit config): ${credentials.username}.`
  );
  console.log(
    'Assurez-vous que votre configuration Git locale (user.name, user.email) est correcte.'
  );

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: "Quel type d'opération souhaitez-vous effectuer ?",
      choices: [
        {
          name: 'Commit unique à une date précise (utilise les fichiers stagés)',
          value: 'single',
        },
        {
          name: 'Commit unique à une date aléatoire avec message personnalisé',
          value: 'randomDateMessage',
        },
      ],
    },
  ]);

  if (mode === 'single') {
    console.log('\nMode: Commit unique à une date précise.');
    console.log(
      "IMPORTANT: Vous devez avoir des fichiers préparés (stagés avec 'git add') pour que ce commit soit créé."
    );

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'commitDateTime',
        message: 'Date et heure du commit (ex: YYYY-MM-DD HH:MM:SS) :',
        validate: function (value) {
          const date = parse(value, 'yyyy-MM-dd HH:mm:ss', new Date());
          if (isValid(date)) return true;
          return 'Veuillez entrer une date et heure valides au format YYYY-MM-DD HH:MM:SS.';
        },
      },
      {
        type: 'input',
        name: 'commitMessage',
        message: 'Message de commit:',
        validate: function (value) {
          if (value.trim().length > 0) return true;
          return 'Le message de commit ne peut pas être vide.';
        },
      },
    ]);

    const targetDate = parse(
      answers.commitDateTime,
      'yyyy-MM-dd HH:mm:ss',
      new Date()
    );
    const isoCommitDateTime = formatISO(targetDate);

    const hasStagedFiles = await checkStagedFiles();
    if (!hasStagedFiles) {
      console.log(
        'Aucun fichier stagé. Veuillez utiliser "git add" pour stager des fichiers.'
      );
      return;
    }

    await createDatedCommit(isoCommitDateTime, answers.commitMessage);
  } else if (mode === 'randomDateMessage') {
    console.log(
      '\nMode: Commit unique à une date aléatoire avec message personnalisé.'
    );

    let period = await getRandomCommitPeriod();
    if (!period) {
      period = await inquirer.prompt([
        {
          type: 'input',
          name: 'startDate',
          message: 'Date de début (YYYY-MM-DD) pour la période aléatoire:',
          validate: function (value) {
            const date = parseISO(value);
            if (isValid(date)) return true;
            return 'Veuillez entrer une date valide au format YYYY-MM-DD.';
          },
          filter: function (value) {
            return formatISO(parseISO(value), {
              representation: 'date',
            });
          },
        },
        {
          type: 'input',
          name: 'endDate',
          message: 'Date de fin (YYYY-MM-DD) pour la période aléatoire:',
          validate: function (value) {
            const date = parseISO(value);
            if (isValid(date)) return true;
            return 'Veuillez entrer une date valide au format YYYY-MM-DD.';
          },
          filter: function (value) {
            return formatISO(parseISO(value), {
              representation: 'date',
            });
          },
        },
      ]);

      await saveRandomCommitPeriod(period);
    }

    const { commitMessage } = await inquirer.prompt([
      {
        type: 'input',
        name: 'commitMessage',
        message: 'Message de commit:',
        validate: function (value) {
          if (value.trim().length > 0) return true;
          return 'Le message de commit ne peut pas être vide.';
        },
      },
    ]);

    const startDate = parseISO(period.startDate);
    const endDate = parseISO(period.endDate);

    const randomDate = getRandomTimeForCommit(
      new Date(
        startDate.getTime() +
          Math.random() * (endDate.getTime() - startDate.getTime())
      )
    );
    const isoCommitDateTime = formatISO(randomDate);

    const hasStagedFiles = await checkStagedFiles();
    if (!hasStagedFiles) {
      console.log(
        'Aucun fichier stagé. Veuillez utiliser "git add" pour stager des fichiers.'
      );
      return;
    }

    await createDatedCommit(isoCommitDateTime, commitMessage);
  }
}

// Fonction pour sauvegarder la date du commit aléatoire
async function saveRandomCommitPeriod(period) {
  const randomCommitDatesPath = path.join(
    os.homedir(),
    '.forgit-random-commit-dates.json'
  );
  let dates = [];

  try {
    const data = await fs.readFile(randomCommitDatesPath, 'utf-8');
    dates = JSON.parse(data);
  } catch (error) {
    // Si le fichier n'existe pas, on initialise un tableau vide
  }

  dates.push(period);

  await fs.writeFile(randomCommitDatesPath, JSON.stringify(dates, null, 2));
  console.log(
    `Date du commit aléatoire sauvegardée : ${JSON.stringify(period)}`
  );
}

main().catch(console.error);
