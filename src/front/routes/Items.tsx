import { useMemo } from "react"
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
const PRINCIPLES = [
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

type Principle = (typeof PRINCIPLES)[number]
type ItemFromQuery = types.ItemsQuery["item"][number]
type AspectFromQuery = ItemFromQuery["aspects"][number]

interface ItemsProps {
    filters?: {
        known?: boolean
        aspects?: AspectFromQuery[]
        principles?: Pick<types.Principle, "id">[]
    }
}

function filterItems(
    state: ItemFromQuery[],
    filters: ItemsProps["filters"],
): ItemFromQuery[] {
    let filtered_state = state
    if (filters?.known) {
        filtered_state = state.filter(({ known }) => known === true)
    }
    if (filters?.principles) {
        const filterPrinciples: Principle[] = filters.principles.map(
            (principle) => principle.id,
        ) as Principle[]
        for (const principle of filterPrinciples) {
            filtered_state = filtered_state
                .filter((item) => {
                    return item[principle] !== null
                })
                .toSorted((a, b) => {
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
    console.log(filtered_state)
    return filtered_state
}

function Item({ ...item }: ItemFromQuery) {
    return (
        <Card>
            <CardHeader title={item.id} />
            <Stack direction="row">
                {PRINCIPLES.map((principle) => {
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

    const state = useMemo(
        () => filterItems(data!.item, { known: true, ...filters }),
        [data, filters],
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
