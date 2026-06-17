async function loadQuestions() {
  const response = await fetch('fragen.json');
  if (!response.ok) {
    throw new Error('Konnte fragen.json nicht laden: ' + response.status);
  }
  const data = await response.json();
  return data;
}

function getRandomSubset(array, count) {
  // Array kopieren, damit das Original nicht verändert wird
  const shuffled = array.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function renderRandomQuestions() {
  const list = document.getElementById('fragen-liste');
  list.innerHTML = '<li>Lade zufällige Auswahl...</li>';

  try {
    const allQuestions = await loadQuestions();

    // Anzahl zufälliger Begriffe – kannst du anpassen
    const selectionCount = Math.min(5, allQuestions.length);
    const randomQuestions = getRandomSubset(allQuestions, selectionCount);

    list.innerHTML = '';
    randomQuestions.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.solution + ' – ' + item.clue;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = '<li>Fehler beim Laden der Fragen.</li>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderRandomQuestions();

  const btn = document.getElementById('neu-btn');
  btn.addEventListener('click', () => {
    renderRandomQuestions();
  });
});
