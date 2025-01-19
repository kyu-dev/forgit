import { execa } from 'execa';

export async function checkStagedFiles() {
  try {
    const { stdout } = await execa('git', ['diff', '--cached', '--name-only']);
    return stdout.trim().length > 0;
  } catch (error) {
    console.error(
      'Erreur lors de la vérification des fichiers stagés:',
      error.stderr || error.message
    );
    return false;
  }
}

export async function stageRandomFiles() {
  try {
    // Récupère la liste des fichiers modifiés ou non suivis
    const { stdout } = await execa('git', ['status', '--porcelain']);
    const files = stdout
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.substring(3)); // Supprime le statut (ex: " M ")

    if (files.length === 0) {
      console.log('Aucun fichier disponible pour le staging.');
      return false;
    }

    // Choisit un fichier aléatoire
    const randomFile = files[Math.floor(Math.random() * files.length)];
    await execa('git', ['add', randomFile]);
    console.log(`  Fichier "${randomFile}" stagé aléatoirement.`);
    return true;
  } catch (error) {
    console.error(
      'Erreur lors du staging aléatoire:',
      error.stderr || error.message
    );
    return false;
  }
}
