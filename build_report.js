const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, BorderStyle
} = require("docx");
const fs = require("fs");

const PAGE_W = 12240, PAGE_H = 15840; // US Letter

function h(text, level) {
  return new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } });
}
function p(text, opts = {}) {
  return new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 120 } });
}
function bullet(text) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 60 } });
}
function mono(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Consolas", size: 18 })],
    spacing: { after: 0 },
  });
}
function codeBlock(lines) {
  return lines.split("\n").map(mono);
}

function cell(text, opts = {}) {
  return new TableCell({
    width: { size: opts.width || 1000, type: WidthType.DXA },
    shading: opts.header ? { fill: "D9E2F3", type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, bold: !!opts.header, size: 20 })],
    })],
  });
}

function makeTable(headerRow, rows, widths) {
  const colWidths = widths;
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headerRow.map((t, i) => cell(t, { header: true, width: colWidths[i], center: true })),
      }),
      ...rows.map(r => new TableRow({
        children: r.map((t, i) => cell(String(t), { width: colWidths[i], center: true })),
      })),
    ],
  });
}

const doc = new Document({
  sections: [{
    properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    children: [

      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Railway Booking System — Hash Table with Collision Resolution", bold: true, size: 32 })],
        spacing: { after: 80 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Linear Probing, Quadratic Probing and Double Hashing — Design, Implementation, Execution and Analysis", italics: true, size: 22 })],
        spacing: { after: 300 },
      }),

      h("1. Problem Statement", HeadingLevel.HEADING_1),
      p("A railway booking system generates the following 7 booking IDs, which must be stored and searched using a hash table:"),
      mono("23, 43, 13, 33, 53, 63, 73"),
      p(""),
      p("The task requires implementing and comparing three collision-resolution techniques — Linear Probing, Quadratic Probing and Double Hashing — displaying the final hash table for each, searching for existing and non-existing IDs while recording probe counts, computing the load factor, and determining the most suitable technique."),

      h("2. Hash Table Design", HeadingLevel.HEADING_1),
      p("Table size (M): 10", { bold: true }),
      p("This size is chosen because it comfortably accommodates the 7 booking IDs at a load factor of 0.7 (a realistic, moderately loaded table), and — importantly — every supplied booking ID ends in the digit 3 (23, 43, 13, 33, 53, 63, 73), so with the natural hash function h1(key) = key % 10, all seven keys map to the SAME home address (index 3). This is intentional: it stress-tests every collision-resolution technique under the worst possible case (100% of keys colliding on first probe) and produces the clearest comparison."),
      p("Hash functions used:"),
      bullet("Primary hash:      h1(key) = key % 10"),
      bullet("Secondary hash (for double hashing only):  h2(key) = 7 − (key % 7), where 7 is a prime smaller than M. This keeps the step size in the range [1,7], so it is never zero and cannot get stuck."),
      bullet("Probe sequence — Linear:      index = ( h1(key) + i ) % M"),
      bullet("Probe sequence — Quadratic:   index = ( h1(key) + i² ) % M"),
      bullet("Probe sequence — Double Hash: index = ( h1(key) + i·h2(key) ) % M"),
      p("where i = 0, 1, 2, … is the probe number."),

      h("3. Source Code (C)", HeadingLevel.HEADING_1),
      p("Full source: src/hashtable.c (included in the submitted repository). Core probing logic:"),
      ...codeBlock(
`int probe_index(int key, int i, int mode) {
    if (mode == 0) return (h1(key) + i) % M;                 // linear
    if (mode == 1) return (h1(key) + i*i) % M;                // quadratic
    return (h1(key) + i * h2(key)) % M;                       // double hashing
}

int insert_key(int key, int mode, int *slot_used) {
    for (int i = 0; i < M; i++) {
        int idx = probe_index(key, i, mode);
        if (table[idx] == EMPTY) { table[idx] = key; *slot_used = idx; return i + 1; }
    }
    return -1;   // overflow: no empty slot reachable along the probe sequence
}

int search_key(int key, int mode, int *probes) {
    for (int i = 0; i < M; i++) {
        int idx = probe_index(key, i, mode);
        *probes = i + 1;
        if (table[idx] == EMPTY) return -1;   // guaranteed absent
        if (table[idx] == key)  return idx;
    }
    return -1;
}`
      ),
      p(""),

      h("4a. Insertion Log and Final Hash Tables", HeadingLevel.HEADING_1),

      h("Linear Probing", HeadingLevel.HEADING_2),
      makeTable(
        ["Key", "Home Index h1", "Probes to Insert", "Final Slot"],
        [
          [23, 3, 1, 3], [43, 3, 2, 4], [13, 3, 3, 5], [33, 3, 4, 6],
          [53, 3, 5, 7], [63, 3, 6, 8], [73, 3, 7, 9],
        ],
        [1800, 2600, 2800, 2200]
      ),
      p(""),
      p("Final Table (Linear Probing) — all 7 keys inserted, load factor 0.70:"),
      makeTable(
        ["Index", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        [["Booking ID", "-", "-", "-", "23", "43", "13", "33", "53", "63", "73"]],
        [1300, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900]
      ),
      p("Observation: Because every key collides at index 3, linear probing packs all 7 records into one unbroken block (indices 3–9) — a textbook case of primary clustering."),

      h("Quadratic Probing", HeadingLevel.HEADING_2),
      makeTable(
        ["Key", "Home Index h1", "Probes to Insert", "Final Slot"],
        [
          [23, 3, 1, 3], [43, 3, 2, 4], [13, 3, 3, 7], [33, 3, 4, 2],
          [53, 3, 5, 9], [63, 3, 6, 8], [73, 3, "10 (FAILED)", "—"],
        ],
        [1800, 2600, 2800, 2200]
      ),
      p(""),
      p("Final Table (Quadratic Probing) — only 6 of 7 keys inserted; key 73 OVERFLOWS:"),
      makeTable(
        ["Index", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        [["Booking ID", "-", "-", "33", "23", "43", "-", "-", "13", "63", "53"]],
        [1300, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900]
      ),
      p("Observation: Because M = 10 is not prime, the sequence (3 + i²) mod 10 only ever visits the 6 distinct slots {3,4,7,2,9,8} before repeating — slots 0,1,5,6 are unreachable from home address 3. With all 7 keys colliding on the same home address, the 7th key (73) cannot be placed at all — a real insertion failure caused by the interaction of quadratic probing with a non-prime table size and a poor key distribution. (With a prime table size, e.g. M = 17, and load factor kept ≤ 0.5, this failure mode is guaranteed not to occur.)", { italics: true }),

      h("Double Hashing", HeadingLevel.HEADING_2),
      makeTable(
        ["Key", "h1", "h2 = 7-(key%7)", "Probes to Insert", "Final Slot"],
        [
          [23, 3, 5, 1, 3], [43, 3, 6, 2, 9], [13, 3, 1, 2, 4], [33, 3, 2, 2, 5],
          [53, 3, 3, 2, 6], [63, 3, 7, 2, 0], [73, 3, 4, 2, 7],
        ],
        [1200, 900, 2200, 2600, 1900]
      ),
      p(""),
      p("Final Table (Double Hashing) — all 7 keys inserted, load factor 0.70:"),
      makeTable(
        ["Index", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        [["Booking ID", "63", "-", "-", "23", "13", "33", "53", "73", "-", "43"]],
        [1300, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900]
      ),
      p("Observation: Each key's secondary hash h2 differs, so once the initial collision at index 3 occurs, every key jumps by a different step size and spreads across the table in just 2 probes. No key needed more than 2 probes to insert — the best clustering behaviour of the three methods."),

      h("4b. Search Results (Existing and Non-Existing IDs)", HeadingLevel.HEADING_1),
      p("Existing IDs searched: 33, 63.   Non-existing IDs searched: 14, 99."),
      makeTable(
        ["Booking ID", "Status", "Linear Probes", "Quadratic Probes", "Double Hashing Probes"],
        [
          [33, "Existing", 4, 4, 2],
          [63, "Existing", 6, 6, 2],
          [14, "Non-existing", 7, 2, 2],
          [99, "Non-existing", 2, 2, 3],
        ],
        [1600, 2000, 1900, 2200, 2500]
      ),
      p(""),
      p("Key observations:"),
      bullet("Search 33 / 63 (existing): Linear and Quadratic need 4–6 probes because the searched key sits deep inside the long cluster built at index 3. Double hashing needs only 2 probes in both cases because its step size scatters keys immediately."),
      bullet("Search 14 (non-existing, home index 4): Linear probing performs worst here (7 probes) because index 4 lies inside the middle of the big linear cluster (3–9), so the search must walk almost the entire cluster before finding the empty slot 0 that proves absence. Quadratic and double hashing both stop in 2 probes, since their probe sequence from index 4 hits an empty slot immediately."),
      bullet("Search 99 (non-existing, home index 9): Here linear and quadratic are fast (2 probes) but double hashing needs 3 probes, since 99's step size (h2=6) revisits an occupied slot (index 5) before reaching empty index 1. This shows double hashing is usually best but not guaranteed best on every single query — its average performance is what matters."),

      h("4c. Load Factor and Performance Analysis", HeadingLevel.HEADING_1),
      p("Load factor α = n / M, where n = number of keys actually stored and M = table size (10)."),
      makeTable(
        ["Method", "Keys Inserted (n)", "Table Size (M)", "Load Factor (α)"],
        [
          ["Linear Probing", 7, 10, "0.70"],
          ["Quadratic Probing", 6, 10, "0.60 (1 key overflowed / could not be placed)"],
          ["Double Hashing", 7, 10, "0.70"],
        ],
        [2600, 2000, 1800, 3400]
      ),
      p(""),
      p("How load factor affects each technique:", { bold: true }),
      bullet("Linear Probing: Performance degrades rapidly as α increases because of primary clustering — once several keys share a home address, they form one long run, and every subsequent insertion/search must scan the whole run. Average successful-search cost is approximately ½(1 + 1/(1−α)); at α = 0.7 this is already ≈2.7 probes on average, and it grows sharply and non-linearly as α → 1. Our results (probe counts up to 7) confirm this clustering penalty directly."),
      bullet("Quadratic Probing: Avoids primary clustering (keys with different home addresses spread out quickly, as seen in the very fast 14/99 searches), but suffers from secondary clustering (keys with the SAME home address always follow the identical probe sequence) and — critically — cannot guarantee that every slot is reachable unless M is prime and α ≤ 0.5. Our run demonstrates this exact failure: at α = 0.7 with M = 10 (non-prime), one key could not be inserted at all."),
      bullet("Double Hashing: Because the step size itself depends on the key (via h2), keys sharing a home address almost never follow the same probe sequence, which eliminates both primary and secondary clustering. Its performance stays close to the theoretical ideal for open addressing — average probes ≈ 1/(1−α) — and it was the only method to insert all 7 keys with never more than 2 probes."),
      p("As α increases toward 1, all open-addressing schemes degrade, but linear probing degrades fastest (clustering), quadratic probing degrades unpredictably (can outright fail to find a slot), and double hashing degrades most gracefully."),

      h("5. Complexity Analysis", HeadingLevel.HEADING_1),
      makeTable(
        ["Operation", "Best Case", "Average Case", "Worst Case", "Space Complexity"],
        [
          ["Linear Probing — insert/search", "O(1)", "O(1) for small α; grows with α (clustering)", "O(n)", "O(M)"],
          ["Quadratic Probing — insert/search", "O(1)", "O(1), better than linear on average", "O(n) (or insertion failure if slot unreachable)", "O(M)"],
          ["Double Hashing — insert/search", "O(1)", "O(1), closest to ideal (≈ 1/(1−α))", "O(n)", "O(M)"],
        ],
        [3000, 1300, 2600, 2800, 1900]
      ),
      p(""),
      p("All three techniques use the same auxiliary space, O(M), i.e. one array of size M — no extra chaining structures are needed since this is open addressing. The difference between the three lies entirely in time complexity behaviour as α grows, driven by clustering."),

      h("6. Comparison Table", HeadingLevel.HEADING_1),
      makeTable(
        ["Criterion", "Linear Probing", "Quadratic Probing", "Double Hashing"],
        [
          ["Clustering", "Primary clustering (severe)", "Secondary clustering (moderate)", "Minimal / none"],
          ["All 7 keys inserted?", "Yes", "No — 1 key overflowed", "Yes"],
          ["Max probes (insert)", "7", "6 (+1 failure)", "2"],
          ["Max probes (search, existing)", "6", "6", "2"],
          ["Probe sequence depends on key?", "No (fixed step 1)", "No (fixed quadratic step)", "Yes (h2 varies per key)"],
          ["Sensitivity to table size being prime", "Low", "High (must be prime, α≤0.5 for guarantee)", "Low (only h2, M coprime needed)"],
          ["Implementation complexity", "Simplest", "Simple", "Slightly more complex (2 hash functions)"],
          ["Cache performance", "Best (sequential access)", "Good", "Slightly worse (scattered access)"],
        ],
        [2600, 2200, 2400, 2400]
      ),

      h("7. Conclusion", HeadingLevel.HEADING_1),
      p("For this dataset — 7 booking IDs that all collide on the same home address at a load factor of 0.7 — Double Hashing is the most suitable collision-resolution technique. It is the only method that successfully inserted every record, required at most 2 probes for every insertion and existing-key search, and it avoids both primary and secondary clustering by making the probe step itself a function of the key. Linear probing, while simple and cache-friendly, suffers badly from primary clustering under this heavily-colliding key set (up to 7 probes). Quadratic probing improves on linear probing's clustering behaviour but is unsafe here: with a non-prime table size and load factor above 0.5, it actually failed to insert one booking ID, which is unacceptable for a real railway reservation system where every booking must be stored reliably."),
      p("Recommendation: If the system anticipates keys that may share common trailing digits (as real booking/PNR numbers often do), double hashing should be used in production. Quadratic probing should only be used with a prime table size maintained at α ≤ 0.5 (e.g. by dynamic resizing/rehashing). Linear probing is acceptable only for low load factors (α < 0.5) or when simplicity and cache locality outweigh clustering risk."),

      h("8. Repository Contents", HeadingLevel.HEADING_1),
      bullet("src/hashtable.c — complete C source code (linear, quadratic, double hashing)"),
      bullet("data/input.txt — booking IDs and search test set used"),
      bullet("output/execution_output.txt — full console output from running the program"),
      bullet("REPORT.docx — this report (design, execution, analysis, comparison, conclusion)"),
      bullet("README.md — build/run instructions"),

    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/claude/railway_hash/output/REPORT.docx", buf);
  console.log("done");
});
