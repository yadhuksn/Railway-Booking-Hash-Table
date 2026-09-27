# Railway Booking System using Hash Table

## Objective

To implement and compare different collision resolution techniques
in a hash table for a railway booking system.

## Collision Resolution Techniques

1. Linear Probing
2. Quadratic Probing
3. Double Hashing

## Input

Booking IDs:

23, 43, 13, 33, 53, 63, 73

Existing IDs:

33, 63

Non-existing IDs:

14, 99

## Hash Functions

Primary hash:

h1(key) = key % 10

Secondary hash:

h2(key) = 7 - (key % 7)

## Results

| Method | Keys Inserted |
|---|---:|
| Linear Probing | 7/7 |
| Quadratic Probing | 6/7 |
| Double Hashing | 7/7 |

## Complexity

Average insertion/search: O(1)

Worst-case insertion/search: O(m)

Space complexity: O(m)

## Conclusion

The three collision resolution techniques were implemented and
compared. Linear probing successfully inserted all seven keys but
produced clustering. Quadratic probing reduced clustering but failed
to insert one key for the given input and table size. Double hashing
successfully inserted all seven keys and provided better distribution
for this particular input.
