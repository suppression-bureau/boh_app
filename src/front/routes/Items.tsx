import { CardContent } from "@mui/material"
import { useReducer, useState } from "react"
import { useQuery } from "urql"

import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
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
]
type ItemsFromQuery = types.ItemsQuery["item"]
type ItemFromQuery = ItemsFromQuery[number]

interface ItemsProps {
    filters?: {
        known?: boolean
        edge?: boolean
        forge?: boolean
        grail?: boolean
        heart?: boolean
        knock?: boolean
        lantern?: boolean
        moon?: boolean
        moth?: boolean
        nectar?: boolean
        rose?: boolean
        scale?: boolean
        sky?: boolean
        winter?: boolean
        aspect?: string
    }
}
type ItemsAction = ItemsActionInner | ItemsActionOuter
type ItemsActionInner = never
type ItemsActionOuter = { type: "filter"; filters: ItemsProps["filters"] }

function filterItems(
    filters: ItemsProps["filters"],
    state: ItemsFromQuery[],
): ItemsFromQuery[] {
    let filtered_state = state
    if (filters?.known) {
        filtered_state = state.filter(({ known }) => known === true)
    }
    principles.forEach((principle) => {
        if (filters?.[principle]) {
            filtered_state = filtered_state.filter((item) => {
                return item[principle] !== null
            })
        }
    })
    if (filters?.aspect) {
        filtered_state = filtered_state.filter((item) => {
            return item.aspects!.some(({ id }) => id === filters.aspect)
        })
    }
    return filtered_state
}

function ItemsReducer(
    state: ItemsFromQuery[],
    action: ItemsAction,
): ItemsFromQuery[] {
    switch (action.type) {
        case "filter": {
            const { filters } = action
            return filterItems(filters, state)
        }
    }
}

function Item({ ...item }: ItemFromQuery) {
    return (
        <Card key={item.id}>
            <CardHeader title={item.id} />
            <Stack direction={"row"} sx={{ maxWidth: "auto" }}>
                {principles.map((principle) => {
                    if (item[principle] !== null)
                        return (
                            <PrincipleCard
                                key={principle}
                                id={principle}
                                title={item[principle]} // displays amount
                            />
                        )
                })}
                {item.aspects!.map(({ id }) => (
                    <Aspect key={id} id={id} />
                ))}
            </Stack>
        </Card>
    )
}
const ItemsView = ({ filters }: ItemsProps) => {
    const [{ data }] = useQuery({ query: itemsQueryDocument })

    const [state, dispatch] = useReducer(
        ItemsReducer,
        filterItems({ known: true, ...filters }, data!.item),
    )

    return (
        <Stack
            spacing={2}
            sx={{
                maxWidth: "auto",
                marginBlock: 1,
                marginInline: "auto",
            }}
        >
            {state?.map((item) => <Item key={item.id} {...item} />)}
        </Stack>
    )
}
export default ItemsView
