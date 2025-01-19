import {
  parseISO,
  formatISO,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns';

export function getRandomTimeForCommit(date) {
  const hour = Math.floor(Math.random() * 18) + 8; // Entre 8h et 22h
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  return setSeconds(setMinutes(setHours(date, hour), minute), second);
}

export function getRandomCommitCount(maxCommitsPerDay) {
  return Math.floor(Math.random() * maxCommitsPerDay) + 1;
}
