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
    .select('*')
    .order(sortFeld, { ascending: true });

  if (error) {
    console.error('Fehler beim Laden:', error);
    return;
  }

  liste.innerHTML = '';
  data.forEach(item => zeigeItem(item));
}

// Eintrag anzeigen als Tabellenzeile
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

  // Erledigt-Stil anwenden
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
    console.error('Fehler beim Aktualisieren:', error);
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
    console.error('Fehler beim Löschen:', error);
  }

  ladeListe();
}

// Eintrag hinzufügen
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const kategorie = document.getElementById('kategorie').value.trim();
  const hinweis = document.getElementById('hinweis').value.trim();
  const anzahl = parseInt(document.getElementById('anzahl').value, 10) || 1;

  if (!name) return;

  const daten = {
    kategorie: kategorie || undefined,
    hinweis: hinweis || undefined,
    anzahl,
    erledigt: false
  };

  const { error } = await supabase
    .from('packliste')
    .insert([{ name, data: daten }]);

  if (error) {
    console.error('Fehler beim Einfügen:', error);
    return;
  }

  form.reset();
  ladeListe();
});

// Sortierung ändern
sortierung.addEventListener('change', ladeListe);

// Initiales Laden
ladeListe();
