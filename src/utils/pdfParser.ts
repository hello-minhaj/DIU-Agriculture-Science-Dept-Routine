import * as pdfjsLib from 'pdfjs-dist';
import {
  type ClassSession,
  DAYS_OF_WEEK,
  type DayOfWeek,
  type RoutineData,
  TIME_SLOTS,
  type Teacher,
  type TimeSlot,
} from '../types/routine';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface TextBox {
  str: string;
  x: number;
  /** Top-down Y coordinate (0 at top of page, increasing downward) */
  y: number;
  /** Raw PDF Y coordinate (0 at bottom of page, increasing upward) */
  rawY: number;
  w: number;
  h: number;
  page: number;
}

export interface UnparsedCell {
  day: DayOfWeek;
  slot: TimeSlot;
  rawText: string;
  reason: string;
}

export interface PdfParseResult {
  routineData: RoutineData;
  unparsedCells: UnparsedCell[];
}

const DAY_PATTERNS: { day: DayOfWeek; regex: RegExp }[] = [
  { day: 'Saturday', regex: /^\s*sat(?:urday)?\s*$/i },
  { day: 'Sunday', regex: /^\s*sun(?:day)?\s*$/i },
  { day: 'Monday', regex: /^\s*mon(?:day)?\s*$/i },
  { day: 'Tuesday', regex: /^\s*tue(?:sday)?\s*$/i },
  { day: 'Wednesday', regex: /^\s*wed(?:nesday)?\s*$/i },
  { day: 'Thursday', regex: /^\s*thu(?:rsday|rseday|rday)?\s*$/i },
];

const SLOT_START_PATTERNS: { slot: TimeSlot; regex: RegExp }[] = [
  { slot: '08:30-10:00', regex: /^\s*0?8[.:]30\b/ },
  { slot: '10:00-11:30', regex: /^\s*10[.:]00\b/ },
  { slot: '11:30-01:00', regex: /^\s*11[.:]30\b/ },
  { slot: '01:00-02:30', regex: /^\s*0?1[.:]00\b/ },
  { slot: '02:30-04:00', regex: /^\s*0?2[.:]30\b/ },
  { slot: '04:00-05:30', regex: /^\s*0?4[.:]00\b/ },
];

/** Normalize clipped DIU room names */
export const normalizeRoomName = (rawRoom: string): string => {
  let room = rawRoom.trim().replace(/\s+/g, ' ');
  room = room.replace(/\b(?:nnex|nex)\s*\(/gi, 'Annex (');
  room = room.replace(/\b(?:34|B4)\s*\(/gi, 'AB4 (');
  return room;
};

/** Extract effective date strictly up to the 4-digit year */
export const extractEffectiveDate = (text: string): string => {
  const dmyMatch = text.match(
    /Effective\s*(?:Date|from)?\s*[:\-]?\s*(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})/i
  );
  if (dmyMatch) return dmyMatch[1].trim();

  const mdyMatch = text.match(
    /Effective\s*(?:Date|from)?\s*[:\-]?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
  );
  if (mdyMatch) return mdyMatch[1].trim();

  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/** Parse teacher initial-to-name legend from footer boxes */
const parseTeachersLegendFromBoxes = (legendBoxes: TextBox[]): Teacher[] => {
  const rawEntries: { initial: string; name: string }[] = [];

  for (const box of legendBoxes) {
    const m = box.str.match(/^([A-Z]{2,5})\s*[:=\-–]\s*(.+)$/);
    if (!m) continue;
    const initial = m[1].trim();
    const name = m[2].trim().replace(/[.,;]+$/, '');
    if (
      initial === 'DIU' ||
      initial === 'AGS' ||
      initial === 'AB4' ||
      initial === 'TBA' ||
      name.length < 3
    ) {
      continue;
    }
    rawEntries.push({ initial, name });
  }

  const counts = new Map<string, number>();
  rawEntries.forEach((e) => {
    counts.set(e.initial, (counts.get(e.initial) ?? 0) + 1);
  });

  const teachers: Teacher[] = [];
  const seenIndex = new Map<string, number>();
  for (const entry of rawEntries) {
    const total = counts.get(entry.initial) ?? 1;
    if (total > 1) {
      const idx = (seenIndex.get(entry.initial) ?? 0) + 1;
      seenIndex.set(entry.initial, idx);
      teachers.push({
        id: `${entry.initial}_${idx}`,
        initial: entry.initial,
        name: entry.name,
      });
    } else {
      teachers.push({
        id: entry.initial,
        initial: entry.initial,
        name: entry.name,
      });
    }
  }

  return teachers;
};

/** Extract room string from a cell, normalizing clipped prefixes */
const extractRoomFromCell = (
  text: string
): { room: string | null; matchedText: string | null } => {
  const patterns = [
    /\b(?:AB4|AB1|Annex|nnex|nex|34|B4)\s*\(\s*\d{2,4}[A-Z]?\s*\)(?:\s+[A-Za-z]+)?/i,
    /\b(?:Falcon\s+Lab|Annex\s+Lab|Agri\s+Lab|Soil\s+Lab|Botany\s+Lab)\s*(?:-?\d+)?\b/i,
    /\bFL\s*\d{2}\b/i,
  ];

  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      return { room: normalizeRoomName(m[0]), matchedText: m[0] };
    }
  }
  return { room: null, matchedText: null };
};

/** Parse a single class block inside a (sub-row, time-column) cell */
const parseSingleClassBlock = (
  block: string,
  day: DayOfWeek,
  slot: TimeSlot,
  teachers: Teacher[],
  indexSuffix: number,
  rowRoom: string | null
): ClassSession | null => {
  // Separate glued tokens like "(P)MMI" -> "(P) MMI"
  const cleaned = block
    .replace(/\)\s*([A-Z]{2,5})\b/g, ') $1')
    .replace(/\b\d{1,2}[.:]\d{2}\s*(?:am|pm)?\s*[-–]\s*\d{1,2}[.:]\d{2}\s*(?:am|pm)?/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  if (!cleaned) return null;

  // Match batch + optional section letter + optional lab group digit (e.g., 241 A, 263 C1, 262_D, 252 AENT-I, 232-Soil -IV)
  const secMatch = cleaned.match(
    /^(\d{2,3})\s*(?:[_\-(\s]+([A-Z])(\d)?(?:\b|(?=[A-Z]{2,}[-–\s]))|[-–]\s*(?=[A-Z][a-z]))/
  );
  if (!secMatch) return null;

  const batch = secMatch[1];
  const section = secMatch[2] ?? '';
  const labDigit = secMatch[3] ?? null;
  const lab_group = section && labDigit ? `${section}${labDigit}` : null;
  const section_tag = section ? `${batch}_${section}` : batch;

  const isLab =
    /\(P\)/i.test(cleaned) ||
    /\bLab\b/i.test(cleaned) ||
    Boolean(lab_group);

  // Extract inline room if present, otherwise use rowRoom from left Room No column
  const { room: cellRoom, matchedText: roomMatched } = extractRoomFromCell(cleaned);
  const room = cellRoom ?? rowRoom ?? 'TBA';

  // Extract Teacher ID (match against trailing uppercase token or known teacher initials)
  let rest = cleaned.slice(secMatch[0].length).trim();
  if (roomMatched) {
    rest = rest.replace(roomMatched, ' ').trim();
  }

  let teacher_id = 'TBA';
  const ignoredTokens = new Set(['AGS', 'AB4', 'AB1', 'DIU', 'TBA', 'LAB', 'AM', 'PM', 'ENT', 'AGF', 'FPM', 'CT', 'III', 'IV', 'II', 'I', 'V']);

  // Prefer matching known teacher initials from the legend (usually at the end of the cell)
  const trailingInitialMatch = rest.match(/\b([A-Z]{2,5})\s*$/);
  if (trailingInitialMatch) {
    const tok = trailingInitialMatch[1];
    const found = teachers.find((t) => t.initial === tok);
    if (found) {
      teacher_id = found.id;
      rest = rest.slice(0, trailingInitialMatch.index).trim();
    } else if (!ignoredTokens.has(tok)) {
      teacher_id = tok;
      rest = rest.slice(0, trailingInitialMatch.index).trim();
    }
  }

  if (teacher_id === 'TBA') {
    const allCaps = rest.match(/\b[A-Z]{2,5}\b/g) ?? [];
    for (let i = allCaps.length - 1; i >= 0; i--) {
      const tok = allCaps[i];
      if (ignoredTokens.has(tok)) continue;
      const found = teachers.find((t) => t.initial === tok);
      if (found) {
        teacher_id = found.id;
        rest = rest.replace(new RegExp(`\\b${tok}\\b\\s*$`), '').trim();
        break;
      }
    }
  }

  let course_name = rest.replace(/^[-–:\s]+|[-–:\s]+$/g, '').trim();
  if (!course_name) {
    course_name = cleaned;
  }
  if (isLab && !/\(P\)/i.test(course_name)) {
    course_name = `${course_name} (P)`;
  }

  const [start_time, end_time] = slot.split('-');

  return {
    id: `${day.toLowerCase().slice(0, 3)}-${TIME_SLOTS.indexOf(slot) + 1}-${section_tag}-${indexSuffix}`,
    day,
    slot,
    start_time,
    end_time,
    batch,
    section: section || 'A',
    lab_group,
    section_tag,
    course_name,
    type: isLab ? 'Lab' : 'Theory',
    teacher_id,
    room,
  };
};

interface ColumnBoundary {
  slot: TimeSlot;
  xMin: number;
  xMax: number;
  xCenter: number;
}

/**
 * Pure coordinate-based parser operating on extracted PDF text boxes.
 * Exported so both the browser File uploader and Node verification scripts can invoke it.
 */
export const parseTextBoxesToRoutine = (boxes: TextBox[]): PdfParseResult => {
  const fullText = boxes.map((b) => b.str).join(' ');

  // 1. Metadata extraction (strictly up to 4-digit year for effective date)
  const semMatch = fullText.match(/\b((?:Fall|Spring|Summer)\s+\d{4})\b/i);
  const semester = semMatch ? semMatch[1] : 'Fall 2026';

  const verMatch = fullText.match(/\b(V-\d+)\b/i);
  const version = verMatch ? verMatch[1].toUpperCase() : 'V-1';

  const effective_date = extractEffectiveDate(fullText);

  // Locate footer teacher legend start Y (first box matching INITIAL-Name pattern)
  const legendBoxes = boxes.filter((b) =>
    /^[A-Z]{2,5}\s*[:=\-–]\s*[A-Za-z]/.test(b.str)
  );
  const legendStartY =
    legendBoxes.length > 0
      ? Math.min(...legendBoxes.map((b) => b.y))
      : Number.POSITIVE_INFINITY;

  const teachers = parseTeachersLegendFromBoxes(legendBoxes);

  const classes: ClassSession[] = [];
  const unparsedCells: UnparsedCell[] = [];

  const pages = Array.from(new Set(boxes.map((b) => b.page))).sort((a, b) => a - b);

  for (const pageNum of pages) {
    const pageBoxes = boxes.filter((b) => b.page === pageNum);

    // 2. Detect Header Row & Dynamic Column X-Boundaries
    const detectedHeaders: { slot: TimeSlot; box: TextBox }[] = [];
    for (const pat of SLOT_START_PATTERNS) {
      const candidate = pageBoxes.find((b) => pat.regex.test(b.str));
      if (candidate) {
        detectedHeaders.push({ slot: pat.slot, box: candidate });
      }
    }

    if (detectedHeaders.length < 3) continue;

    const sortedHeaderYs = [...detectedHeaders]
      .map((h) => h.box.y)
      .sort((a, b) => a - b);
    const headerTopY = sortedHeaderYs[Math.floor(sortedHeaderYs.length / 2)];

    detectedHeaders.sort((a, b) => a.box.x - b.box.x);

    const colCenters = detectedHeaders.map((h) => h.box.x + h.box.w / 2);
    const avgGap =
      colCenters.length > 1
        ? (colCenters[colCenters.length - 1] - colCenters[0]) /
          (colCenters.length - 1)
        : 100;

    const columns: ColumnBoundary[] = detectedHeaders.map((h, i) => {
      const xCenter = colCenters[i];
      const xMin =
        i === 0 ? xCenter - avgGap * 0.65 : (colCenters[i - 1] + xCenter) / 2;
      const xMax =
        i === detectedHeaders.length - 1
          ? xCenter + avgGap * 0.65
          : (xCenter + colCenters[i + 1]) / 2;
      return { slot: h.slot, xMin, xMax, xCenter };
    });

    const firstColMinX = columns[0].xMin;

    // Exclude all items at or above header row (y <= headerTopY + 6) and footer legend
    const pageLegendY =
      pageNum === pages[pages.length - 1] ? legendStartY : Number.POSITIVE_INFINITY;

    const bodyBoxes = pageBoxes.filter(
      (b) => b.y > headerTopY + 6 && b.y < pageLegendY - 4
    );

    // 3. Locate Day anchors (day labels sit centered or left-aligned above/inside their band)
    const dayAnchors: { day: DayOfWeek; y: number }[] = [];
    for (const b of bodyBoxes) {
      for (const pat of DAY_PATTERNS) {
        if (pat.regex.test(b.str)) {
          if (
            !dayAnchors.some((d) => d.day === pat.day && Math.abs(d.y - b.y) < 35)
          ) {
            dayAnchors.push({ day: pat.day, y: b.y });
          }
        }
      }
    }
    dayAnchors.sort((a, b) => a.y - b.y);
    if (dayAnchors.length === 0) continue;

    // Each Day label is a banner above its multi-row block; band runs from dayAnchor[i].y to dayAnchor[i+1].y
    for (let dIdx = 0; dIdx < dayAnchors.length; dIdx++) {
      const currentDay = dayAnchors[dIdx];
      const bandTopY = currentDay.y + 2;
      const bandBottomY =
        dIdx + 1 < dayAnchors.length
          ? dayAnchors[dIdx + 1].y - 2
          : pageLegendY - 4;

      const dayBoxes = bodyBoxes.filter(
        (b) => b.y >= bandTopY && b.y < bandBottomY
      );

      // Left column rooms (x < firstColMinX)
      const roomColumnBoxes = dayBoxes.filter(
        (b) =>
          b.x < firstColMinX &&
          !/^Room\s*No$/i.test(b.str)
      );
      const scheduleBoxes = dayBoxes.filter((b) => b.x >= firstColMinX);

      // Group into horizontal sub-rows using Y clustering (4.5pt tolerance handles slight 0.3pt baseline jitter)
      const subRows: { yCenter: number; boxes: TextBox[]; room: string | null }[] = [];

      if (roomColumnBoxes.length > 0) {
        roomColumnBoxes.sort((a, b) => a.y - b.y);
        for (const rb of roomColumnBoxes) {
          subRows.push({
            yCenter: rb.y,
            boxes: [],
            room: normalizeRoomName(rb.str),
          });
        }
        for (const sb of scheduleBoxes) {
          let bestIdx = 0;
          let bestDist = Number.POSITIVE_INFINITY;
          subRows.forEach((sr, idx) => {
            const dist = Math.abs(sb.y - sr.yCenter);
            if (dist < bestDist) {
              bestDist = dist;
              bestIdx = idx;
            }
          });
          subRows[bestIdx].boxes.push(sb);
        }
      } else {
        const sortedSched = [...scheduleBoxes].sort((a, b) => a.y - b.y);
        for (const sb of sortedSched) {
          const last = subRows[subRows.length - 1];
          if (!last || Math.abs(sb.y - last.yCenter) > 4.5) {
            subRows.push({ yCenter: sb.y, boxes: [sb], room: null });
          } else {
            last.boxes.push(sb);
          }
        }
      }

      // 4. Parse each (sub-row, time-column) cell
      for (const sr of subRows) {
        for (const col of columns) {
          const colBoxes = sr.boxes
            .filter((b) => {
              const cx = b.x + b.w / 2;
              return cx >= col.xMin && cx < col.xMax;
            })
            .sort((a, b) =>
              Math.abs(a.y - b.y) > 4 ? a.y - b.y : a.x - b.x
            );

          if (colBoxes.length === 0) continue;

          const rawText = colBoxes.map((b) => b.str).join(' ').trim();
          if (!rawText || /^(?:break|lunch|prayer|off|-|—)$/i.test(rawText)) {
            continue;
          }

          // Split stacked classes inside a single cell
          const splitPoints = rawText.split(/(?=\b\d{2,3}\s*[_\-(]?[A-Z]\d?\b)/);
          const blocks = splitPoints.filter((s) => s.trim().length > 0);

          let parsedAny = false;
          blocks.forEach((blk, idx) => {
            const parsed = parseSingleClassBlock(
              blk,
              currentDay.day,
              col.slot,
              teachers,
              classes.length + idx + 1,
              sr.room
            );
            if (parsed) {
              classes.push(parsed);
              parsedAny = true;
            }
          });

          if (!parsedAny && rawText.length > 3) {
            unparsedCells.push({
              day: currentDay.day,
              slot: col.slot,
              rawText,
              reason: 'Could not detect batch/section or course code',
            });
          }
        }
      }
    }
  }

  // Ensure every referenced teacher_id exists in teachers array
  const existingIds = new Set(teachers.map((t) => t.id));
  classes.forEach((c) => {
    if (c.teacher_id !== 'TBA' && !existingIds.has(c.teacher_id)) {
      existingIds.add(c.teacher_id);
      teachers.push({
        id: c.teacher_id,
        initial: c.teacher_id.replace(/_\d+$/, ''),
        name: `Faculty (${c.teacher_id})`,
      });
    }
  });

  classes.sort((a, b) => {
    const dDiff = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
    if (dDiff !== 0) return dDiff;
    return TIME_SLOTS.indexOf(a.slot) - TIME_SLOTS.indexOf(b.slot);
  });

  return {
    routineData: {
      semester,
      version,
      effective_date,
      department: 'Department of Agricultural Science',
      university: 'Daffodil International University',
      teachers,
      classes,
    },
    unparsedCells,
  };
};

export const parseRoutinePdf = async (file: File): Promise<PdfParseResult> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const boxes: TextBox[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();

    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const tx = item.transform;
      const x = tx[4];
      const rawY = tx[5];
      const y = viewport.height - rawY;
      boxes.push({
        str: item.str.trim(),
        x,
        y,
        rawY,
        w: item.width,
        h: item.height || 10,
        page: p,
      });
    }
  }

  return parseTextBoxesToRoutine(boxes);
};
