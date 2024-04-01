import {
  eachDayOfInterval,
  formatISO,
  parseISO,
  differenceInDays,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns';
import { execa } from 'execa';

// Fonction pour choisir un nombre aléatoire de commits pour un jour donné
function getRandomCommitCount(maxCommits) {
  return Math.floor(Math.random() * maxCommits) + 1;
}

// Fonction pour générer une heure aléatoire dans la journée pour un commit
function getRandomTimeForCommit(date) {
  const hour = Math.floor(Math.random() * 18) + 8; // Entre 8h et 22h
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  return setSeconds(setMinutes(setHours(date, hour), minute), second);
}

export async function processCommits(
  contributionData,
  startDateStr,
  endDateStr,
  maxCommitsPerDay
) {
  console.log('\nTraitement des commits rétroactifs...');

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
    const dayStr = formatISO(day, { representation: 'date' });
    const existingCommits = contributionDays[dayStr] || 0;

    if (existingCommits === 0) {
      const commitsToAdd = getRandomCommitCount(maxCommitsPerDay);
      console.log(
        `  Jour ${dayStr}: ${existingCommits} commits existants. Ajout de ${commitsToAdd} commit(s).`
      );

      for (let i = 0; i < commitsToAdd; i++) {
        const commitDate = getRandomTimeForCommit(day);
        const commitDateISO = formatISO(commitDate);
        const commitMessage = 'feat: Forgit retroactive commit';

        try {
          // Attention : GIT_COMMITTER_DATE et GIT_AUTHOR_DATE doivent être au format 'RFC 2822' ou timestamp Unix.
          // formatISO donne YYYY-MM-DDTHH:mm:ss+ZZ:ZZ, ce qui est accepté par --date.
          // Pour plus de contrôle sur l'auteur et le committer, il faudrait configurer GIT_AUTHOR_NAME, etc.
          // et potentiellement utiliser un format de date différent pour les variables d'environnement.
          const { stdout } = await execa(
            'git',
            [
              'commit',
              '--allow-empty',
              '-m',
              commitMessage,
              `--date=${commitDateISO}`,
            ],
            {
              env: {
                // Pour s'assurer que la date de l'auteur et du committer est bien celle du commit
                // GIT_AUTHOR_DATE: commitDateISO,
                // GIT_COMMITTER_DATE: commitDateISO,
              },
            }
          );
          console.log(
            `    Commit ${
              i + 1
            }/${commitsToAdd} créé pour ${dayStr} à ${formatISO(commitDate, {
              format: 'extended',
            })}`
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
        `  Jour ${dayStr}: ${existingCommits} commits existants. Aucun commit ajouté.`
      );
    }
  }
  if (commitsMadeCount > 0) {
    console.log(`\n${commitsMadeCount} commits rétroactifs ont été créés.`);
    console.log(
      "N'oubliez pas de faire un 'git push' pour les envoyer sur GitHub !"
    );
  } else {
    console.log(
      "\nAucun nouveau commit rétroactif n'a été créé (soit des commits existaient déjà aux dates spécifiées, soit la plage de dates était invalide)."
    );
  }
}
