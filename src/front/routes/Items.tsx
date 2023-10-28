import { Typography } from "@mui/material"
import { Fragment, useMemo } from "react"
import { useQuery } from "urql"

import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import Stack from "@mui/material/Stack"

import { graphql } from "../gql"
import * as types from "../gql/graphql"
import { AspectIconGroup } from "../routes/Aspects"
import { PrincipleIcon } from "../routes/Principles"

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
        <ListItem>
            <ListItemButton>
                <ListItemText primary={item.id} />
                <Stack direction="row" alignItems="center">
                    {PRINCIPLES.map((principle) => {
                        if (item[principle] != null)
                            return (
                                <Fragment key={principle}>
                                    <PrincipleIcon id={principle} />
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            paddingInline: 1,
                                        }}
                                    >
                                        {item[principle]!}
                                    </Typography>
                                </Fragment>
                            )
                    })}
                    {<AspectIconGroup aspects={item.aspects!} />}
                </Stack>
            </ListItemButton>
        </ListItem>
    )
}
const ItemsView = ({ filters }: ItemsProps) => {
    const [{ data }] = useQuery({ query: itemsQueryDocument })

    const state = useMemo(
        () => filterItems(data!.item, { known: true, ...filters }),
        [data, filters],
    )

    return (
        <List
            sx={{
                maxWidth: "sm",
                marginInline: "auto",
            }}
        >
            {state
                ?.filter(({ isVisible }) => isVisible)
                .map((item) => <Item key={item.id} {...item} />)}
        </List>
    )
}
export default ItemsView
