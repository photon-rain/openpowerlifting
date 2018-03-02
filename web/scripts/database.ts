// vim: set ts=4 sts=4 sw=4 et:
'use strict';

// Appease TypeScript compiler.
declare const opldb;
declare const meetdb;


// Interface declarations for the opldb and meetdb.
// TODO: This should be auto-generated by the script that compiles the database.
export const enum OplDBColumn {
    MeetID,
    Name,
    Sex,
    Equipment,
    Age,
    Division,
    BodyweightKg,
    WeightClassKg,
    SquatKg,
    BenchKg,
    DeadliftKg,
    TotalKg,
    Place,
    Wilks,
}

export const enum MeetDBColumn {
    MeetID,
    MeetPath,
    Federation,
    Date,
    MeetCountry,
    MeetState,
    MeetTown,
    MeetName,
}


export function db_make_indices_list(): number[] {
    let indices = Array(opldb.data.length);
    for (let i = 0; i < opldb.data.length; ++i) {
        indices[i] = i;
    }
    return indices;
}


export function db_filter(indices: number[], rowcmpfn): number[] {
    return indices.filter(function (e) {
        let row = opldb.data[e];
        return rowcmpfn(row);
    });
}


export function db_sort_numeric(indices: number[], colidx: number, minFirst: boolean): number[] {
    indices.sort(function (a, b) {
        let av = Number(opldb.data[a][colidx]);
        let bv = Number(opldb.data[b][colidx]);

        let extreme = minFirst ? Number.MAX_VALUE : Number.MIN_VALUE;
        if (isNaN(av))
            av = extreme;
        if (isNaN(bv))
            bv = extreme;

        let comparison = minFirst ? (av - bv) : (bv - av);

        return comparison;
    });
    return indices;
}


export function db_multicol_sort_numeric(indices: number[], col1idx: number, col2idx: number, minFirst: boolean): number[] {
    indices.sort(function (a, b) {
        let av1 = Number(opldb.data[a][col1idx]);
        let bv1 = Number(opldb.data[b][col1idx]);

        let extreme = minFirst ? Number.MAX_VALUE : Number.MIN_VALUE;
        if (isNaN(av1))
            av1 = extreme;
        if (isNaN(bv1))
            bv1 = extreme;


        // If the first column is equal, compare the second
        if (av1 === bv1) {
            let av2 = Number(opldb.data[a][col2idx]);
            let bv2 = Number(opldb.data[b][col2idx]);

            if (isNaN(av2))
                av2 = extreme;
            if (isNaN(bv2))
                bv2 = extreme;

            return minFirst ? (av2 - bv2) : (bv2 - av2);
        }

        // Otherwise, use default comparison from the single-col sort
        return minFirst ? (av1 - bv1) : (bv1 - av1);
    });
    return indices;
}


// Keep only the first occurrence of NAME. The indices list should already be sorted.
export function db_uniq_lifter(indices: number[]): number[] {
    let seen = {};

    return indices.filter(function (e) {
        let name = opldb.data[e][OplDBColumn.Name];
        if (seen[name])
            return false;
        seen[name] = true;
        return true;
    });
}


// Look up a meet by information.
// MeetID is not suitable for URLs since it may change on recompilation.
export function db_get_meetid(fed: string, date: string, meetname: string): number {
    for (let i = 0; i < meetdb.data.length; ++i) {
        let row = meetdb.data[i];
        if (row[MeetDBColumn.Federation] === fed &&
            row[MeetDBColumn.Date] === date &&
            row[MeetDBColumn.MeetName] === meetname)
        {
            return i;
        }
    }
    return -1;
}


// Look up a meet by meetpath.
export function db_get_meetid_by_meetpath(meetpath: string): number {
    for (let i = 0; i < meetdb.data.length; ++i) {
        let row = meetdb.data[i];
        if (row[MeetDBColumn.MeetPath] === meetpath) {
            return i;
        }
    }
    return -1;
}
