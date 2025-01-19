import inquirer from 'inquirer';
import { parseISO, isValid, formatISO } from 'date-fns';

export async function promptForCredentials(currentCredentials) {
  return inquirer.prompt([
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
}

export async function promptForRandomCommitPeriod(period) {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'startDate',
      message: 'Nouvelle date de début (YYYY-MM-DD) :',
      default: period?.startDate,
      validate: function (value) {
        const date = parseISO(value);
        if (isValid(date)) return true;
        return 'Veuillez entrer une date valide au format YYYY-MM-DD.';
      },
      filter: function (value) {
        return formatISO(parseISO(value), { representation: 'date' });
      },
    },
    {
      type: 'input',
      name: 'endDate',
      message: 'Nouvelle date de fin (YYYY-MM-DD) :',
      default: period?.endDate,
      validate: function (value) {
        const date = parseISO(value);
        if (isValid(date)) return true;
        return 'Veuillez entrer une date valide au format YYYY-MM-DD.';
      },
      filter: function (value) {
        return formatISO(parseISO(value), { representation: 'date' });
      },
    },
  ]);
}
