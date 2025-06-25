// Supabase initialisieren
const supabase = window.supabase.createClient(
  'https://qbgbnuvsynirylpylevo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZ2JudXZzeW5pcnlscHlsZXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2Njk2OTYsImV4cCI6MjA2NjI0NTY5Nn0.DBrU6xd8oBVX1_yXC7wOkX1ZykK2gHhzdWPO9t58w5o'
);

// DOM-Elemente
const liste = document.querySelector('#liste tbody');
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

// Einzelnen Eintrag anzeigen
function zeigeItem(item) {
  const tr = document.createElement('tr');
  const erledigt = item.data?.erledigt;

  tr.className = erledigt ? 'erledigt' : '';

  tr.innerHTML = `
    <td>${item.name}</td>
    <td>${item.data?.kategorie ?? ''}</td>
    <td>${item.data?.hinweis ?? ''}</td>
    <td>${item.data?.anzahl ?? 1}</td>
    <td>
      <button class="loeschen-btn" title="Löschen">🗑️</button>
    </td>
  `;

  // Klick auf Zeile = erledigt toggeln
  tr.addEventListener('click', (e) => {
    if (!e.target.classList.contains('loeschen-btn')) {
      toggleErledigt(item);
    }
  });

  // Löschen
  const loeschenBtn = tr.querySelector('.loeschen-btn');
  loeschenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    eintragLoeschen(item.id);
  });

  liste.appendChild(tr);
}

// Erledigt-Status umschalten
async function toggleErledigt(item) {
  const erledigtNeu = !(item.data?.erledigt ?? false);
  const neueDaten = { ...item.data, erledigt: erledigtNeu };

  const { error } = await supabase
    .from('packliste')
    .update({ data: neueDaten })
    .eq('id', item.id);

  if (error) console.error('Fehler beim Aktualisieren:', error);

  ladeListe();
}

// Eintrag löschen
async function eintragLoeschen(id) {
  const { error } = await supabase
    .from('packliste')
    .delete()
    .eq('id', id);

  if (error) console.error('Fehler beim Löschen:', error);

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

// Sortierwechsel neu laden
sortierung.addEventListener('change', ladeListe);

// Initialer Ladevorgang
ladeListe();
