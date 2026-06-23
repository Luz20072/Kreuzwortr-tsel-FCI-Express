// Fragen laden
async function loadQuestions() {
  const response = await fetch('fragen.json');
  if (!response.ok) {
    throw new Error('Konnte fragen.json nicht laden: ' + response.status);
  }
  const data = await response.json();
  return data;
}

// Zufällige Teilmenge wählen
function getRandomSubset(array, count) {
  const shuffled = array.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Popup für das Geheimwort anzeigen
function showSecretPopup() {
  const popup = document.getElementById('secret-popup');
  const secretCodeElem = document.getElementById('secret-code');

  // Dein Lösungswort
  const codewort = 'Tastatur statt Papier';
  secretCodeElem.textContent = codewort;

  popup.style.display = 'flex';
}

// Info-Popup anzeigen (für Fehler oder „unfaire“ Rätsel)
function showInfoPopup(message) {
  const popup = document.getElementById('info-popup');
  const msgElem = document.getElementById('info-message');
  msgElem.textContent = message;
  popup.style.display = 'flex';
}

// Neues Kreuzworträtsel erzeugen
async function generateNewCrossword() {
  const allQuestions = await loadQuestions();

  const selectionCount = 10;
  if (allQuestions.length < selectionCount) {
    showInfoPopup('Es werden mindestens 10 Fragen im Pool benötigt, um ein Rätsel zu erzeugen.');
    return;
  }

  const randomQuestions = getRandomSubset(allQuestions, selectionCount);

  const words = randomQuestions.map(q => ({
    solution: q.solution.toUpperCase(),
    clue: q.clue
  }));

  // Layout mit Backtracking erzeugen
  const { grid, placedWords } = generateLayout(words);

  if (!placedWords || placedWords.length === 0) {
    showInfoPopup('Es konnte kein gültiges Kreuzworträtsel erzeugt werden. Bitte lade die Seite neu.');
    return;
  }

  console.log('Platziert wurden:', placedWords.map(w => w.solution));

  renderGrid(grid, placedWords);

  const checkBtn = document.getElementById('check-btn');
  checkBtn.onclick = () => {
    // Detailliert prüfen, welche Wörter noch Fehler enthalten
    const wrongWords = getIncorrectWords(grid, placedWords);

    if (wrongWords.length > 0) {
      const numbers = wrongWords
        .map(w => w.number)
        .sort((a, b) => a - b);

      const infoText =
        'Es sind noch Fehler im Rätsel.\n' +
        'Betroffen sind die Begriffe mit den Nummern: ' +
        numbers.join(', ') +
        '.';

      showInfoPopup(infoText);
      return;
    }

    // Fairness-Regel: fünf oder weniger Begriffe -> unfair
    if (placedWords.length <= 5) {
      showInfoPopup('Dieses Rätsel hat zu wenige Begriffe und ist laut Regeln unfair. Bitte lade die Seite mit F5 neu, um ein neues Rätsel zu erzeugen.');
      return;
    }

    // Alles korrekt UND genügend Begriffe
    showSecretPopup();
  };
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  generateNewCrossword().catch(err => {
    console.error(err);
    showInfoPopup('Fehler beim Erzeugen des Kreuzworträtsels.');
  });

  const closePopup = document.getElementById('close-popup');
  closePopup.addEventListener('click', () => {
    document.getElementById('secret-popup').style.display = 'none';
  });

  const closeInfoPopup = document.getElementById('close-info-popup');
  closeInfoPopup.addEventListener('click', () => {
    document.getElementById('info-popup').style.display = 'none';
  });
});
