//On import fs pour pouvoir utiliser les fonctions présentes dans ce module
import fs from 'fs';
//Définition des chemins d'accès pour récupérer les fichiers
const dossierStores  = `${process.cwd()}/${process.argv[2] || 'stores'}`;
const dossierTotal = `${process.cwd()}/salesTotals`;
const fichierTotal = `${process.cwd()}/salesTotals/totals.txt`;
//Fonction permettant le calcul du montant total présent dans les fichiers json
async function calculeTotal() {
    let total = 0;
    //Fonction permettant de parcourir les répertoires et fichiers, si c'est un répertoire on continue de parcourir et si c'est un json on lit le fichier et ajoute le montant a total
    async function parcoursDossier(directory) {
        const files = await fs.promises.readdir(directory, { withFileTypes: true });
        for (let file of files) {
            let fullPath = `${directory}/${file.name}`;
            if (file.isDirectory()) {
                await parcoursDossier(fullPath);
            } else if (file.name.endsWith('.json')) {
                let data = await fs.promises.readFile(fullPath);
                let json = JSON.parse(data);
                total += json.total;
            }
        }
    }
    //On appel la fonction pour commencer le parcours des fichiers
    await parcoursDossier(dossierStores);
    let date = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
    let message = `Total at ${date} from ${process.argv[2] || 'stores'}: ${total}€\n`;
    let fileExists = false;
    try {
        fs.accessSync(fichierTotal);
        fileExists = true;
    } catch {}
    //On crée le répertoire "salesTotals" si besoin
    try {
        fs.mkdirSync(dossierTotal, { recursive: true });
    } catch (err) {
        console.error(err);
    }
    //On ajoute le total dans le fichier "totals.txt" et on affiche dans la console les messages attendus
    fs.appendFile(fichierTotal, message, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        if (fileExists) {
            console.log(`salesTotals already exists. Wrote sales totals ${total}€ to salesTotals`);
        } else {
            console.log(`Wrote sales totals ${total}€ to salesTotals`);
        }
    });
}
calculeTotal().catch(console.error);