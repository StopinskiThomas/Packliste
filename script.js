// Supabase initialisieren
const supabase = supabase.createClient(
  'https://qbgbnuvsynirylpylevo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZ2JudXZzeW5pcnlscHlsZXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2Njk2OTYsImV4cCI6MjA2NjI0NTY5Nn0.DBrU6xd8oBVX1_yXC7wOkX1ZykK2gHhzdWPO9t58w5o-ÖFFENTLICHER-SCHLÜSSEL'
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

function zeigeItem(item) {
  const li = document.createElement('li');
  const erledigt = item.data?.erledigt;

  const info = `
    <div class="${erledigt ? 'erledigt' : ''}">
      <strong>${item.name}</strong> (${item.data?.anzahl ?? 1})<br>
      <em>${item.data?.kategorie ?? ''}</em> – ${item.data?.hinweis ?? ''}
    </div>
  `;

  li.innerHTML = info;

  // Klick zum Erledigt-Status toggeln
  li.addEventListener('click', () => toggleErledigt(item));

  // Entfernen-Button
  const loeschenBtn = document.createElement('button');
  loeschenBtn.textContent = '🗑️';
  loeschenBtn.className = 'loeschen-btn';
  loeschenBtn.title = 'Löschen';
  loeschenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    eintragLoeschen(item.id);
  });

  li.appendChild(loeschenBtn);
  liste.appendChild(li);
}

// Erledigt toggeln
async function toggleErledigt(item) {
  const erledigtNeu = !(item.data?.erledigt ?? false);
  const neueDaten = { ...item.data, erledigt: erledigtNeu };

  await supabase
    .from('packliste')
    .update({ data: neueDaten })
    .eq('id', item.id);

  ladeListe();
}

// Eintrag löschen
async function eintragLoeschen(id) {
  await supabase
    .from('packliste')
    .delete()
    .eq('id', id);

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

// Initial laden
ladeListe();
