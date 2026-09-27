/* ============================================================
   Railway Booking System - Hash Table with Collision Resolution
   Techniques implemented : Linear Probing, Quadratic Probing,
                             Double Hashing
   Language                : C
   ============================================================ */

#include <stdio.h>

#define M      10          /* Table size (suitable for 7 keys, load factor 0.7) */
#define R      7            /* Auxiliary prime used for double hashing (R < M) */
#define EMPTY  -1
#define N      7            /* Number of booking IDs */

int table[M];

/* ---------- Hash functions ---------- */
int h1(int key) { return key % M; }                 /* primary hash   */
int h2(int key) { return R - (key % R); }            /* secondary hash: range [1,R] */

/* mode: 0 = Linear, 1 = Quadratic, 2 = Double Hashing */
int probe_index(int key, int i, int mode) {
    if (mode == 0) return (h1(key) + i) % M;                    /* linear    */
    if (mode == 1) return (h1(key) + i*i) % M;                  /* quadratic */
    return (h1(key) + i * h2(key)) % M;                         /* double    */
}

void init_table(void) {
    for (int i = 0; i < M; i++) table[i] = EMPTY;
}

/* Returns number of probes used to insert; -1 if table overflow (no empty slot found) */
int insert_key(int key, int mode, int *slot_used) {
    for (int i = 0; i < M; i++) {
        int idx = probe_index(key, i, mode);
        if (table[idx] == EMPTY) {
            table[idx] = key;
            *slot_used = idx;
            return i + 1;               /* probe count */
        }
    }
    *slot_used = -1;
    return -1;                          /* overflow - could not insert */
}

/* Returns slot index if found, -1 if not found. probes = number of probes made */
int search_key(int key, int mode, int *probes) {
    for (int i = 0; i < M; i++) {
        int idx = probe_index(key, i, mode);
        *probes = i + 1;
        if (table[idx] == EMPTY) return -1;      /* empty slot => key cannot exist further (probing chain) */
        if (table[idx] == key)  return idx;
    }
    *probes = M;
    return -1;
}

void print_table(const char *title) {
    printf("\n----- Final Hash Table : %s -----\n", title);
    printf("Index : Booking ID\n");
    for (int i = 0; i < M; i++) {
        if (table[i] == EMPTY) printf("  %d   : ---- (empty)\n", i);
        else                   printf("  %d   : %d\n", i, table[i]);
    }
}

void run_method(const char *name, int mode, int keys[], int existing[], int n_exist,
                 int nonexist[], int n_nonexist) {

    printf("\n============================================================\n");
    printf(" METHOD : %s\n", name);
    printf("============================================================\n");

    init_table();
    int inserted = 0;

    printf("\n-- Insertion Log --\n");
    for (int k = 0; k < N; k++) {
        int slot;
        int probes = insert_key(keys[k], mode, &slot);
        if (probes == -1) {
            printf("Key %2d : INSERTION FAILED (table full along probe sequence / overflow)\n", keys[k]);
        } else {
            printf("Key %2d : inserted at index %d   (probes used = %d)\n", keys[k], slot, probes);
            inserted++;
        }
    }

    print_table(name);

    double load_factor = (double) inserted / M;
    printf("\nKeys successfully inserted : %d / %d\n", inserted, N);
    printf("Load Factor (n/m)          : %.2f\n", load_factor);

    printf("\n-- Search : Existing Booking IDs --\n");
    for (int i = 0; i < n_exist; i++) {
        int probes;
        int idx = search_key(existing[i], mode, &probes);
        if (idx != -1)
            printf("Search %2d : FOUND at index %d   (probes = %d)\n", existing[i], idx, probes);
        else
            printf("Search %2d : NOT FOUND            (probes = %d)\n", existing[i], probes);
    }

    printf("\n-- Search : Non-Existing Booking IDs --\n");
    for (int i = 0; i < n_nonexist; i++) {
        int probes;
        int idx = search_key(nonexist[i], mode, &probes);
        if (idx != -1)
            printf("Search %2d : FOUND at index %d   (probes = %d)  [unexpected]\n", nonexist[i], idx, probes);
        else
            printf("Search %2d : NOT FOUND             (probes = %d)\n", nonexist[i], probes);
    }
}

int main(void) {

    int keys[N] = {23, 43, 13, 33, 53, 63, 73};

    /* selected existing and non-existing booking IDs to search for */
    int existing[]    = {33, 63};
    int nonexisting[] = {14, 99};

    printf("Railway Booking Hash Table Simulation\n");
    printf("Booking IDs : ");
    for (int i = 0; i < N; i++) printf("%d ", keys[i]);
    printf("\nTable size M = %d , h1(key) = key %% %d , h2(key) = %d - (key %% %d)\n", M, M, R, R);

    run_method("LINEAR PROBING",    0, keys, existing, 2, nonexisting, 2);
    run_method("QUADRATIC PROBING", 1, keys, existing, 2, nonexisting, 2);
    run_method("DOUBLE HASHING",    2, keys, existing, 2, nonexisting, 2);

    printf("\n============================================================\n");
    printf(" END OF SIMULATION\n");
    printf("============================================================\n");

    return 0;
}
