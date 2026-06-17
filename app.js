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

// Popup anzeigen
function showSecretPopup() {
  const popup = document.getElementById('secret-popup');
  const secretCodeElem = document.getElementById('secret-code');

  // Hier dein gewünschtes Codewort setzen:
  const codewort = 'KEHRWERT'; // kannst du später beliebig ändern
  secretCodeElem.textContent = codewort;

  popup.style.display = 'flex';
}

// Neues Kreuzworträtsel erzeugen
async function generateNewCrossword() {
  const allQuestions = await loadQuestions();

  const selectionCount = 10;
  if (allQuestions.length < selectionCount) {
    alert('Es werden mindestens 10 Fragen im Pool benötigt.');
    return;
  }

  // Wie viele Wörter sollen MINDESTENS im Rätsel landen?
  const minPlaced = 8;          // kannst du bei Bedarf auf 7 oder 9 ändern
  const maxTries = 10;          // wie oft darf neu versucht werden?

  let bestResult = null;
  let bestPlacedCount = 0;

  for (let attempt = 0; attempt < maxTries; attempt++) {
    const randomQuestions = getRandomSubset(allQuestions, selectionCount);

    const words = randomQuestions.map(q => ({
      solution: q.solution.toUpperCase(),
      clue: q.clue
    }));

    // Primäres Ziel: 5 waagerecht, 5 senkrecht
    let result = placeWords(words, 5, 5);

    // Falls sehr wenige Wörter platziert wurden, Fallback: 4/6
    if (result.placedWords.length < minPlaced) {
      result = placeWords(words, 4, 6);
    }

    const placedCount = result.placedWords.length;

    if (placedCount > bestPlacedCount) {
      bestPlacedCount = placedCount;
      bestResult = result;
    }

    // Wenn das Ergebnis gut genug ist, direkt nehmen
    if (placedCount >= minPlaced) {
      break;
    }
  }

  if (!bestResult || bestPlacedCount === 0) {
    alert('Es konnte kein brauchbares Kreuzworträtsel erzeugt werden. Versuche es nochmal.');
    return;
  }

  const { grid, placedWords } = bestResult;

  console.log('Tatsächlich platzierte Wörter:', placedWords.map(w => w.solution));

  renderGrid(grid, placedWords);

  const checkBtn = document.getElementById('check-btn');
  checkBtn.onclick = () => {
    const ok = checkSolution(grid);
    if (ok) {
      showSecretPopup();
    } else {
      alert('Es sind noch Fehler im Rätsel. Schau nochmal drüber.');
    }
  };
}


// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  generateNewCrossword().catch(err => {
    console.error(err);
    alert('Fehler beim Erzeugen des Kreuzworträtsels.');
  });

  const neuBtn = document.getElementById('neu-btn');
  neuBtn.addEventListener('click', () => {
    generateNewCrossword().catch(err => {
      console.error(err);
      alert('Fehler beim Erzeugen eines neuen Rätsels.');
    });
  });

  const closePopup = document.getElementById('close-popup');
  closePopup.addEventListener('click', () => {
    document.getElementById('secret-popup').style.display = 'none';
  });
});
