# Railway Booking System — Hash Table Collision Resolution

Assignment: Implement and compare Linear Probing, Quadratic Probing, and Double
Hashing on a hash table storing railway booking IDs.

## Input
Booking IDs: `23, 43, 13, 33, 53, 63, 73`
Table size M = 10, h1(key) = key % 10, h2(key) = 7 - (key % 7)

## Repository structure
```
src/hashtable.c            Full C source (all 3 techniques + probe counting)
data/input.txt             Input booking IDs and search test set
output/execution_output.txt  Captured console output of a run
output/REPORT.docx / .pdf  Full written report: tables, load factor, complexity
                           analysis, comparison table, conclusion
```

## Build & run
```bash
gcc -Wall -o hashtable src/hashtable.c
./hashtable
```

## Summary of results
| Method            | Keys inserted | Load factor | Max probes (search) |
|-------------------|---------------|-------------|----------------------|
| Linear Probing    | 7/7           | 0.70        | 6                    |
| Quadratic Probing | 6/7 (1 overflow) | 0.60     | 6                    |
| Double Hashing    | 7/7           | 0.70        | 2                    |

**Conclusion:** Double Hashing is the most suitable technique for this dataset —
it inserted all records reliably and consistently needed the fewest probes,
because it avoids both primary clustering (linear probing's weakness) and
secondary clustering (quadratic probing's weakness). See `output/REPORT.docx`
for the full analysis.
