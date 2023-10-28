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
interface VisibleItem extends ItemFromQuery {
    isVisible: boolean
}
type AspectFromQuery = ItemFromQuery["aspects"][number]

interface ItemsProps {
    filters?: {
        known?: boolean
        aspects?: AspectFromQuery[]
        principles?: Pick<types.Principle, "id">[]
    }
}

function setVisible(item: ItemFromQuery, visible: boolean): VisibleItem {
    return { ...item, isVisible: visible }
}

function filterItems(
    state: ItemFromQuery[],
    filters: ItemsProps["filters"],
): VisibleItem[] {
    let filteredState = state
    if (filters?.known) {
        filteredState = state.filter(({ known }) => known)
    }
    if (filters?.principles) {
        const filterPrinciples: Principle[] = filters.principles.map(
            (principle) => principle.id,
        ) as Principle[]
        const possiblities = []
        for (const principle of filterPrinciples) {
            possiblities.push(
                filteredState
                    .filter((item) => {
                        return item[principle] !== null
                    })
                    .toSorted((a, b) => {
                        return b[principle]! - a[principle]!
                    }), // NB: this doesn't work with principles.length > 1
            )
        }
        filteredState = possiblities.reduce((a, b) => a.concat(b), [])
    }
    if (filters?.aspects) {
        const aspects = filters.aspects.map((aspect) => aspect.id)
        filteredState = filteredState.filter((item) => {
            return item.aspects!.some(({ id }) => aspects.includes(id))
        })
    }
    // now we apply isVisible to all items which were filtered
    const filteredItems = filteredState.map(({ id }) => id)
    let finalState: VisibleItem[] = state.map((i) => setVisible(i, false))
    finalState = finalState.map((item) => {
        if (filteredItems.includes(item.id)) {
            return setVisible(item, true)
        }
        return item
    })
    return finalState
}

function Item({ ...item }: ItemFromQuery) {
    return (
        <Card>
            <CardHeader title={item.id} />
            <Stack direction="row" marginBottom={-5} marginTop={-2}>
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
            {state
                ?.filter(({ isVisible }) => isVisible)
                .map((item) => <Item key={item.id} {...item} />)}
        </Stack>
    )
}
export default ItemsView
