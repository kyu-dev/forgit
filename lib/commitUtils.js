import { execa } from 'execa';
import {
  parseISO,
  format,
  eachDayOfInterval,
  formatISO as formatISOInternal,
  differenceInDays,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns'; // format peut être utile pour l'affichage

export async function createDatedCommit(isoDateTime, commitMessage) {
  console.log(
    `\nTentative de création d'un commit à la date ${isoDateTime} avec le message: "${commitMessage}"`
  );
  console.log(
    "IMPORTANT: Assurez-vous d'avoir des fichiers stagés (avec 'git add')."
  );

  try {
    const { stdout, stderr } = await execa('git', [
      'commit',
      '-m',
      commitMessage,
      `--date=${isoDateTime}`,
    ]);

    if (stderr) {
      // Certaines commandes git (comme commit sur rien de stagé avec des versions plus anciennes de git)
      // peuvent écrire sur stderr même si elles réussissent avec un code 0 mais n'ont rien fait.
      // Cependant, execa lèvera une erreur pour les codes de sortie non nuls.
      console.warn(
        `Sortie d'erreur Git (peut être informatif même en cas de succès partiel):\n${stderr}`
      );
    }

    // stdout contient généralement le résumé du commit
    console.log('\nCommit créé avec succès !');
    console.log(stdout);
    console.log(
      "\nN'oubliez pas de faire un 'git push' pour envoyer ce commit sur votre dépôt distant."
    );
  } catch (error) {
    console.error('\nErreur lors de la création du commit:');
    if (error.stderr) {
      console.error('Erreur Git:', error.stderr);
    } else if (error.stdout) {
      // Si `git commit` n'a rien à commiter, il peut sortir avec un code 1 et un message sur stdout
      console.error('Message Git:', error.stdout);
    }
    if (error.shortMessage) {
      console.error(error.shortMessage);
    }
    if (error.message.includes('nothing to commit')) {
      console.warn(
        "Il semble qu'il n'y avait rien à commiter. Avez-vous utilisé 'git add' sur vos fichiers ?"
      );
    }
  }
}
// --- Logique pour les commits aléatoires sur une période ---

function getRandomCommitCount(maxCommits) {
  return Math.floor(Math.random() * maxCommits) + 1;
}

function getRandomTimeForCommit(date) {
  const hour = Math.floor(Math.random() * 18) + 8; // Entre 8h et 22h
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  return setSeconds(setMinutes(setHours(date, hour), minute), second);
}

export async function createRandomCommitsInPeriod(
  contributionData,
  startDateStr,
  endDateStr,
  maxCommitsPerDay
) {
  console.log('\nTraitement des commits rétroactifs aléatoires...');

  const startDate = parseISO(startDateStr);
  const endDate = parseISO(endDateStr);

  if (differenceInDays(endDate, startDate) < 0) {
    console.error(
      'Erreur : La date de fin ne peut pas être antérieure à la date de début.'
    );
    return;
  }

  const contributionDays = {};
  contributionData?.user?.contributionsCollection?.contributionCalendar?.weeks?.forEach(
    (week) => {
      week.contributionDays.forEach((day) => {
        contributionDays[day.date] = day.contributionCount;
      });
    }
  );

  const daysToProcess = eachDayOfInterval({ start: startDate, end: endDate });
  let commitsMadeCount = 0;

  for (const day of daysToProcess) {
    const dayStr = formatISOInternal(day, { representation: 'date' });
    const existingCommits = contributionDays[dayStr] || 0;

    if (existingCommits === 0) {
      const commitsToAdd = getRandomCommitCount(maxCommitsPerDay);
      console.log(
        `  Jour ${dayStr}: ${existingCommits} commits existants. Ajout de ${commitsToAdd} commit(s) (vides).`
      );

      for (let i = 0; i < commitsToAdd; i++) {
        const commitDate = getRandomTimeForCommit(day);
        const commitDateISO = formatISOInternal(commitDate);
        const commitMessage = 'feat: Forgit retroactive commit (random)';

        try {
          const { stdout } = await execa('git', [
            'commit',
            '-m',
            commitMessage,
            `--date=${commitDateISO}`,
          ]);
          console.log(
            `    Commit ${i + 1}/${commitsToAdd} créé pour la date ${dayStr}`
          );
          commitsMadeCount++;
        } catch (error) {
          console.error(
            `    Erreur lors de la création du commit pour ${dayStr}:`,
            error.stderr || error.message
          );
        }
      }
    } else {
      console.log(
        `  Jour ${dayStr}: ${existingCommits} commits existants. Aucun commit aléatoire ajouté.`
      );
    }
  }
  if (commitsMadeCount > 0) {
    console.log(
      `\n${commitsMadeCount} commits rétroactifs aléatoires ont été créés.`
    );
    console.log(
      "N'oubliez pas de faire un 'git push' pour les envoyer sur GitHub !"
    );
  } else {
    console.log("\nAucun nouveau commit rétroactif aléatoire n'a été créé.");
  }
}
