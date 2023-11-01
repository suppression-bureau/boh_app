import * as types from "./gql/graphql"

export type Principle = Pick<types.Principle, "id">

export const PRINCIPLES = [
    "edge",
    "forge",
    "grail",
    "heart",
    "knock",
    "lantern",
    "moon",
    "moth",
    "nectar",
    "rose",
    "scale",
    "sky",
    "winter",
] as const

export type PrincipleString = (typeof PRINCIPLES)[number]
