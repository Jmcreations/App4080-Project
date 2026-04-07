export interface ParsedEvent {
  title: string;
  desc: string;
  deadline: string;
}

export function parseICS(icsContent: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const lines = icsContent.split(/\r?\n/);
  
  let inEvent = false;
  let currentEvent: Partial<ParsedEvent> = {};
  
  const formatDate = (ds: string) => {
    if (ds.length >= 8) {
      const year = parseInt(ds.slice(0, 4), 10);
      const month = parseInt(ds.slice(4, 6), 10) - 1;
      const day = parseInt(ds.slice(6, 8), 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
    }
    return ds; 
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Unfold multi-line properties in ICS
    while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      i++;
      line += lines[i].substring(1);
    }

    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentEvent = { title: 'Untitled Assignment', desc: '', deadline: 'Unknown' };
    } else if (line.startsWith('END:VEVENT')) {
      inEvent = false;
      if (currentEvent.title) {
        events.push(currentEvent as ParsedEvent);
      }
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8).trim();
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.desc = line.substring(12).trim();
      } else if (line.startsWith('DTSTART:') || line.startsWith('DTSTART;')) {
        const valStart = line.indexOf(':');
        if (valStart !== -1) {
          currentEvent.deadline = formatDate(line.substring(valStart + 1).trim());
        }
      } else if (line.startsWith('DTEND:') || line.startsWith('DTEND;')) {
          // If deadline is already set by DTSTART, we can ignore or overwrite. DTSTART is usually fine.
      }
    }
  }
  
  return events;
}
