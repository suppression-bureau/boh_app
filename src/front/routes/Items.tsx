import { useReducer } from "react"
import { useQuery } from "urql"

import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import Stack from "@mui/material/Stack"

import { graphql } from "../gql"
import * as types from "../gql/graphql"
import { Aspect } from "../routes/Aspects"
import { PrincipleCard } from "../routes/Principles"

const itemsQueryDocument = graphql(`
    query Items {
        item {
            id
            known
            edge
            forge
            grail
            heart
            knock
            lantern
            moon
            moth
            nectar
            rose
            scale
            sky
            winter
            aspects {
                id
            }
        }
    }
`)
const principles = [
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

type Principle = (typeof principles)[number]
type ItemFromQuery = types.ItemsQuery["item"][number]
type AspectFromQuery = ItemFromQuery["aspects"][number]

interface ItemsProps {
    filters?: {
        known?: boolean
        aspects?: AspectFromQuery[]
    } & Partial<{ [principle in Principle]: boolean }>
}
type ItemsAction = ItemsActionInner | ItemsActionOuter
type ItemsActionInner = never
type ItemsActionOuter = { type: "filter"; filters: ItemsProps["filters"] }

function filterItems(
    state: ItemFromQuery[],
    filters: ItemsProps["filters"],
): ItemFromQuery[] {
    let filtered_state = state
    if (filters?.known) {
        filtered_state = state.filter(({ known }) => known === true)
    }
    for (const principle of principles) {
        if (filters?.[principle]) {
            filtered_state = filtered_state.filter((item) => {
                return item[principle] !== null
            })
            filtered_state.sort((a, b) => {
                return b[principle]! - a[principle]!
            })
        }
    }
    if (filters?.aspects) {
        const aspects = filters.aspects.map((aspect) => aspect.id)
        filtered_state = filtered_state.filter((item) => {
            return item.aspects!.some(({ id }) => aspects.includes(id))
        })
    }
    return filtered_state
}

function itemsReducer(
    state: ItemFromQuery[],
    action: ItemsAction,
): ItemFromQuery[] {
    switch (action.type) {
        case "filter": {
            const { filters } = action
            return filterItems(state, filters)
        }
    }
}

function Item({ ...item }: ItemFromQuery) {
    return (
        <Card>
            <CardHeader title={item.id} />
            <Stack direction="row">
                {principles.map((principle) => {
                    if (item[principle] != null)
                        return (
                            <PrincipleCard
                                key={principle}
                                id={principle}
                                title={item[principle]!} // displays amount
                            />
                        )
                })}
                {item.aspects!.map(({ id }) => (
                    <Aspect key={id} id={id} nameAspect={false} />
                ))}
            </Stack>
        </Card>
    )
}
const ItemsView = ({ filters }: ItemsProps) => {
    const [{ data }] = useQuery({ query: itemsQueryDocument })

    const [state] = useReducer(
        itemsReducer,
        filterItems(data!.item, { known: true, ...filters }),
    )

    return (
        <Stack
            spacing={2}
            sx={{
                maxWidth: "sm",
                marginInline: "auto",
            }}
        >
            {state?.map((item) => <Item key={item.id} {...item} />)}
        </Stack>
    )
}
export default ItemsView
