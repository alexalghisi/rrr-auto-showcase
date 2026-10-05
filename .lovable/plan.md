# Evaluări cu stele pentru mașini

## Rezultat
- Fiecare mașină va afișa un scor de la 1 la 5 stele, media și numărul evaluărilor.
- Vizitatorii vor putea acorda o singură evaluare per mașină și o vor putea modifica ulterior.
- Evaluarea va apărea atât pe cardurile din prima pagină și stoc, cât și pe pagina mașinii.

## Implementare
- Adaug o evidență separată și securizată pentru evaluări, legată de mașină, fără date personale afișate.
- Validez strict scorul 1–5 și limitez voturile duplicate printr-un identificator anonim salvat în browser.
- Adaug o funcție publică sigură pentru salvarea votului și calcularea mediei.
- Creez un control vizual inspirat de Google: cinci stele aurii, media zecimală și numărul de evaluări.
- Actualizez imediat scorul după vot și afișez confirmare sau eroarea reală.
- Verific pe desktop și telefon, apoi verific erorile aplicației.

## Detalii tehnice
- Scrierea nu va fi permisă direct în baza de date din browser; trece printr-un punct validat pe server.
- Evaluările individuale rămân private, iar public se expun doar media și numărul total.
- Nu voi adăuga evaluări inventate și nu voi declara aceste stele drept recenzii Google.
