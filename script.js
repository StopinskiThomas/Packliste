// Supabase initialisieren
const supabase = window.supabase.createClient(
  'https://qbgbnuvsynirylpylevo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZ2JudXZzeW5pcnlscHlsZXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2Njk2OTYsImV4cCI6MjA2NjI0NTY5Nn0.DBrU6xd8oBVX1_yXC7wOkX1ZykK2gHhzdWPO9t58w5o'
);

// DOM-Elemente
const liste = document.getElementById('liste');
const form = document.getElementById('addForm');
const sortierung = document.getElementById('sortierung');

// Einträge laden & anzeigen
async function ladeListe() {
  const sortFeld = sortierung.value;

  const { data, error } = await supabase
    .from('packliste')
    .select('*');

  if (error) {
    console.error('Fehler beim Laden:', error.message || error);
    return;
  }

  const sortierteDaten = [...data];

  if (sortFeld === 'name') {
    sortierteDaten.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortFeld === 'kategorie') {
    sortierteDaten.sort((a, b) => {
      const katA = a.data?.kategorie?.toLowerCase() || '';
      const katB = b.data?.kategorie?.toLowerCase() || '';
      return katA.localeCompare(katB);
    });
  } else {
    sortierteDaten.sort((a, b) => new Date(a.inserted_at) - new Date(b.inserted_at));
  }

  liste.innerHTML = '';
  sortierteDaten.forEach(item => zeigeItem(item));
}

// Eintrag als Tabellenzeile anzeigen
function zeigeItem(item) {
  const tr = document.createElement('tr');
  const erledigt = item.data?.erledigt;

  // Checkbox
  const tdCheckbox = document.createElement('td');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = erledigt;
  checkbox.addEventListener('change', () => toggleErledigt(item, checkbox.checked));
  tdCheckbox.appendChild(checkbox);

  // Artikelname
  const tdName = document.createElement('td');
  tdName.textContent = item.name;

  // Kategorie
  const tdKategorie = document.createElement('td');
  tdKategorie.textContent = item.data?.kategorie ?? '';

  // Hinweis
  const tdHinweis = document.createElement('td');
  tdHinweis.textContent = item.data?.hinweis ?? '';

  // Anzahl
  const tdAnzahl = document.createElement('td');
  tdAnzahl.textContent = item.data?.anzahl ?? 1;

  // Löschen-Button
  const tdLoeschen = document.createElement('td');
  const loeschenBtn = document.createElement('button');
  loeschenBtn.textContent = '🗑️';
  loeschenBtn.className = 'loeschen-btn';
  loeschenBtn.title = 'Löschen';
  loeschenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    eintragLoeschen(item.id);
  });
  tdLoeschen.appendChild(loeschenBtn);

  if (erledigt) {
    tr.classList.add('erledigt');
  }

  tr.append(tdCheckbox, tdName, tdKategorie, tdHinweis, tdAnzahl, tdLoeschen);
  liste.appendChild(tr);
}

// Erledigt-Status toggeln
async function toggleErledigt(item, neuerStatus) {
  const neueDaten = { ...item.data, erledigt: neuerStatus };

  const { error } = await supabase
    .from('packliste')
    .update({ data: neueDaten })
    .eq('id', item.id);

  if (error) {
    console.error('Fehler beim Aktualisieren:', error.message || error);
  }

  ladeListe();
}

// Eintrag löschen
async function eintragLoeschen(id) {
  const { error } = await supabase
    .from('packliste')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Fehler beim Löschen:', error.message || error);
  }

  ladeListe();
}

// Neuer Eintrag
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const kategorie = document.getElementById('kategorie').value.trim();
  const hinweis = document.getElementById('hinweis').value.trim();
  const anzahl = parseInt(document.getElementById('anzahl').value, 10) || 1;

  if (!name) return;

  const daten = {
    kategorie: kategorie || '',
    hinweis: hinweis || '',
    anzahl,
    erledigt: false
  };

  const { error } = await supabase
    .from('packliste')
    .insert([{ name, data: daten }]);

  if (error) {
    console.error('Fehler beim Einfügen:', error.message || error);
    return;
  }

  form.reset();
  ladeListe();
});

// Sortierung ändern
sortierung.addEventListener('change', ladeListe);

// Initiales Laden
ladeListe();
